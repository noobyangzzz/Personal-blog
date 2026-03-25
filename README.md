# noobyangzzz's Blog

一个简单的个人博客，基于原生 HTML/CSS/JavaScript 构建，无需任何框架依赖。

## 功能特点

- **三个板块**：技术💻、电影🎬、音乐🎵
- **SPA 体验**：单页面应用，流畅的页面切换
- **响应式设计**：适配不同屏幕尺寸
- **访问日志**：记录文章阅读情况

## 技术栈

- HTML5 + CSS3 + JavaScript (ES6+)
- Nginx
- Python3 (日志监控)

## 本地运行

```bash
# 克隆仓库
git clone https://github.com/noobyangzzz/Personal-blog.git
cd Personal-blog

# 启动 Nginx（需要配置好 nginx）
nginx -c /path/to/blog.conf

# 启动日志监控
python3 log_tail.py
```

访问 http://localhost:30000

## 项目结构

```
blog/
├── index.html          # 主页
├── README.md           # 说明文档
├── CLAUDE.md           # AI 助手指南
├── css/
│   └── style.css       # 样式文件
├── js/
│   └── main.js         # 核心逻辑
├── config/
│   ├── sections.json   # 板块配置
│   └── articles_*.json # 各板块文章
└── article/             # 文章详情页
```

## License

MIT
