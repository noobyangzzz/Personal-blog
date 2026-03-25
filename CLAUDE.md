# noobyangzzz Blog

个人博客项目，基于原生 HTML/CSS/JavaScript 构建，无框架依赖。

## 项目结构

```
blog/
├── index.html          # 主页
├── CLAUDE.md           # 本文档
├── css/
│   └── style.css       # 样式文件
├── js/
│   └── main.js         # 核心逻辑 (BlogApp 类)
├── config/
│   ├── sections.json   # 板块配置 (tech/movie/music)
│   ├── articles_tech.json
│   ├── articles_movie.json
│   └── articles_music.json
├── article/            # 文章详情页 HTML
│   ├── tech-1.html, tech-2.html, tech-3.html
│   ├── movie-1.html, movie-2.html
│   └── music-1.html, music-2.html
├── sections/            # 板块页面 (静态 HTML)
│   ├── tech.html, movie.html, music.html
├── log_tail.py         # 日志监控脚本
├── blog_visitor_log.txt     # 主访问日志 (自动生成)
└── article_visitor_log.txt # 文章访问日志 (自动生成)
```

## 技术栈

- **前端**: 原生 HTML5 + CSS3 + JavaScript (ES6+)
- **服务器**: Nginx 1.16.1
- **端口**: 30000
- **日志**: Python 3 日志监控脚本

## 配置说明

### 板块配置 (config/sections.json)
```json
{
  "sections": [
    { "id": "tech", "name": "技术", "icon": "💻", "color": "#3498db" },
    { "id": "movie", "name": "电影", "icon": "🎬", "color": "#e74c3c" },
    { "id": "music", "name": "音乐", "icon": "🎵", "color": "#9b59b6" }
  ]
}
```

### 文章命名规范
- 文件名格式: `{section}-{id}.html` (如 `tech-1.html`, `movie-2.html`)
- section: tech | movie | music
- id: 数字序号

## 日志系统

### Nginx 配置
- 主日志: `/home/yang/nginx-1.16.1/logs/blog_access.log`
- 文章访问日志 (JS): `/home/yang/nginx-1.16.1/logs/article_access.log`
- 文章页面日志 (直接访问): `/home/yang/nginx-1.16.1/logs/article_page.log`

### 日志监控脚本
```bash
python3 /home/yang/blog/log_tail.py
```
- 解析文章访问，区分 JS_LOG 和 PAGE 两种类型
- 主日志超过 2MB 自动删除

### 文章访问记录格式
```
[时间] IP: xxx | Type: JS_LOG | Article: xxx | Section: xxx
[时间] IP: xxx | Type: PAGE | Section: xxx | ArticleID: xxx
```

## 常用命令

```bash
# 重启 Nginx
kill -HUP $(cat /home/yang/nginx-1.16.1/logs/nginx.pid)

# 重启日志监控
pkill -f log_tail.py && python3 /home/yang/blog/log_tail.py &

# 测试日志
curl "http://localhost:30000/log?article=tech-1&section=tech"
```

## 扩展说明

### 添加新文章
1. 在 `config/articles_{section}.json` 中添加文章条目
2. 可选：创建对应的 `article/{section}-{id}.html` 静态页面

### 添加新板块
1. 在 `config/sections.json` 中添加板块配置
2. 创建 `config/articles_{new_section}.json`
3. 可选：创建 `sections/{new_section}.html` 和对应文章 HTML

## API 端点

| 端点 | 用途 |
|------|------|
| `GET /` | 首页 |
| `GET /index.html` | 主页 |
| `GET /config/sections.json` | 板块配置 |
| `GET /config/articles_{section}.json` | 文章列表 |
| `POST /log?article=xxx&section=xxx` | 记录文章访问 |
| `GET /article/{section}-{id}.html` | 文章详情页 |
