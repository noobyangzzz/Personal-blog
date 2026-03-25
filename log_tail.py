#!/usr/bin/env python3
"""
Blog Access Log Tailer
Real-time monitoring with 1-second polling
Outputs to both terminal (stdout) and visitor log file
"""

import os
import sys
import time
import re

LOG_DIR = "/home/yang/nginx-1.16.1/logs"
LOG_FILES = {
    'main': 'blog_access.log',
    'article_log': 'article_access.log',
    'article_page': 'article_page.log'
}
VISITOR_LOG = "/home/yang/blog/blog_visitor_log.txt"
ARTICLE_LOG = "/home/yang/blog/article_visitor_log.txt"
MAX_LOG_SIZE = 2 * 1024 * 1024  # 2MB

def parse_log_line(line):
    """Parse nginx log line and extract key info"""
    # Pattern: [time_local] | IP: xxx | Method: xxx | Path: xxx | Status: xxx | Size: xxx | ...
    pattern = r'\[([^\]]+)\] \| IP: (\S+) \| Method: (\w+) \| Path: (\S+) \| Status: (\d+)'
    match = re.search(pattern, line)
    if match:
        return {
            'time': match.group(1),
            'ip': match.group(2),
            'method': match.group(3),
            'path': match.group(4),
            'status': match.group(5)
        }
    return None

def parse_article_access(path):
    """Parse article access from /log?article=xxx&section=xxx path"""
    pattern = r'/log\?article=([^&]+)&section=([^&]+)'
    match = re.search(pattern, path)
    if match:
        return {'article': match.group(1), 'section': match.group(2)}
    return None

def parse_article_page(path):
    """Parse article page access from /article/xxx.html path"""
    pattern = r'/article/([^-]+)-(\d+)\.html'
    match = re.search(pattern, path)
    if match:
        return {'section': match.group(1), 'article_id': match.group(2)}
    return None

def format_visitor_log(info):
    """Format visitor info for the txt log"""
    return f"[{info['time']}] IP: {info['ip']} | Path: {info['path']} | Status: {info['status']}\n"

def format_article_log(info, access_type):
    """Format article access info for the article log"""
    if access_type == 'js_log':
        return f"[{info['time']}] IP: {info['ip']} | Type: JS_LOG | Article: {info.get('article', 'N/A')} | Section: {info.get('section', 'N/A')}\n"
    elif access_type == 'page':
        return f"[{info['time']}] IP: {info['ip']} | Type: PAGE | Section: {info.get('section', 'N/A')} | ArticleID: {info.get('article_id', 'N/A')}\n"
    return f"[{info['time']}] IP: {info['ip']} | Path: {info['path']}\n"

def check_log_rotation(filepath, max_size):
    """Check if log file exceeds max size, delete if so"""
    if os.path.exists(filepath):
        size = os.path.getsize(filepath)
        if size > max_size:
            os.remove(filepath)
            print(f"[ROTATE] {filepath} exceeded {max_size} bytes, deleted")
            return True
    return False

def main():
    print(f"[*] Blog Log Monitor Started")
    print(f"[*] Log Directory: {LOG_DIR}")
    print(f"[*] Main Log: {LOG_FILES['main']}")
    print(f"[*] Article JS Log: {LOG_FILES['article_log']}")
    print(f"[*] Article Page Log: {LOG_FILES['article_page']}")
    print(f"[*] Output: {VISITOR_LOG}")
    print(f"[*] Article Log: {ARTICLE_LOG}")
    print(f"[*] Polling interval: 1 second")
    print("-" * 60)

    # Check and create log files if needed
    for key, filename in LOG_FILES.items():
        filepath = os.path.join(LOG_DIR, filename)
        if not os.path.exists(filepath):
            with open(filepath, 'a') as f:
                pass
            print(f"[+] Created: {filepath}")

    # Track file positions
    file_positions = {}
    for key, filename in LOG_FILES.items():
        filepath = os.path.join(LOG_DIR, filename)
        if os.path.exists(filepath):
            file_positions[key] = os.path.getsize(filepath)
        else:
            file_positions[key] = 0

    while True:
        try:
            # Check log rotation for visitor log
            check_log_rotation(VISITOR_LOG, MAX_LOG_SIZE)

            for key, filename in LOG_FILES.items():
                filepath = os.path.join(LOG_DIR, filename)
                if not os.path.exists(filepath):
                    continue

                current_size = os.path.getsize(filepath)

                if current_size > file_positions[key]:
                    # New data available
                    with open(filepath, 'r') as f:
                        f.seek(file_positions[key])
                        new_lines = f.readlines()
                        file_positions[key] = current_size

                    for line in new_lines:
                        line = line.strip()
                        if not line:
                            continue

                        info = parse_log_line(line)
                        if info:
                            # Determine log type and parse accordingly
                            if key == 'article_log':
                                article_info = parse_article_access(info['path'])
                                if article_info:
                                    info.update(article_info)
                                    log_entry = format_article_log(info, 'js_log')
                                    print(f"[ARTICLE-JS] {info['ip']} | {info['time']} | article={info.get('article')} section={info.get('section')}")
                                else:
                                    log_entry = format_visitor_log(info)
                                    print(f"[VISITOR] {info['ip']} | {info['time']} | {info['path']}")
                                with open(ARTICLE_LOG, 'a') as vf:
                                    vf.write(log_entry)
                                    vf.flush()
                            elif key == 'article_page':
                                page_info = parse_article_page(info['path'])
                                if page_info:
                                    info.update(page_info)
                                    log_entry = format_article_log(info, 'page')
                                    print(f"[ARTICLE-PAGE] {info['ip']} | {info['time']} | section={info.get('section')} article_id={info.get('article_id')}")
                                else:
                                    log_entry = format_visitor_log(info)
                                    print(f"[VISITOR] {info['ip']} | {info['time']} | {info['path']}")
                                with open(ARTICLE_LOG, 'a') as vf:
                                    vf.write(log_entry)
                                    vf.flush()
                            else:
                                # Main blog access log
                                log_entry = format_visitor_log(info)
                                print(f"[VISITOR] {info['ip']} | {info['time']} | {info['path']}")
                                with open(VISITOR_LOG, 'a') as vf:
                                    vf.write(log_entry)
                                    vf.flush()

                            sys.stdout.flush()

            time.sleep(1)  # 1 second polling

        except KeyboardInterrupt:
            print("\n[*] Log monitor stopped")
            break
        except Exception as e:
            print(f"[!] Error: {e}")
            time.sleep(1)

if __name__ == "__main__":
    main()
