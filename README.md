# noobyangzzz's Blog

个人博客，基于原生 HTML/CSS/JavaScript 构建，后端采用 C++ + MySQL。

## 功能特点

- **三个板块**：技术💻、电影🎬、音乐🎵
- **SPA 体验**：单页面应用，流畅的页面切换
- **响应式设计**：适配不同屏幕尺寸
- **真实阅读统计**：MySQL 记录每次访问，区分真实 IP
- **文章隐藏功能**：可隐藏指定文章，不在列表展示
- **大型文章懒加载**：渐进式渲染，避免长文章阻塞浏览器

## 技术栈

- **前端**：原生 HTML5 + CSS3 + JavaScript (ES6+)
- **后端**：C++ (Crow HTTP framework)
- **数据库**：MySQL 8.0
- **服务器**：Nginx 1.16.1

## 项目结构

```
blog/
├── index.html          # 主页
├── README.md           # 说明文档
├── CLAUDE.md           # AI 助手指南
├── css/
│   └── style.css       # 样式文件
├── js/
│   └── main.js         # 前端逻辑 (从 API 读取数据)
├── article/            # 文章静态 HTML 内容
│   ├── tech-1.html ~ tech-6.html
│   ├── movie-1.html ~ movie-2.html
│   └── music-1.html ~ music-2.html
├── drafts/             # 草稿目录 (Markdown/PDF)
├── backend/            # C++ 后端 API
│   ├── main.cpp        # API 源码
│   └── CMakeLists.txt  # 构建配置
└── config/             # 配置文件 (已迁移到 MySQL，保留备份)
```

## 快速部署

### 1. 配置 MySQL

```sql
CREATE DATABASE blog_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- 创建表和导入数据（参考 backend/main.cpp 中的建表语句）
```

### 2. 编译后端

```bash
cd backend
mkdir build && cd build
cmake ..
make -j4
```

### 3. 启动服务

```bash
# 启动后端 API (端口 8080)
./blog_api

# 启动 Nginx (端口 30000)
nginx -c /path/to/blog.conf
```

### 4. 访问

http://localhost:30000

## API 端点

| 端点 | 用途 |
|------|------|
| `GET /api/sections` | 获取板块列表 |
| `GET /api/articles?section=xxx` | 获取文章列表 |
| `GET /api/article?id=xxx` | 获取文章详情 |
| `POST /api/visit?article=xxx&section=xxx` | 记录访问 |

## License

MIT
