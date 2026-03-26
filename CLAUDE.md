# noobyangzzz Blog

个人博客项目，基于原生 HTML/CSS/JavaScript 构建，后端采用 C++ + MySQL。

## 项目结构

```
blog/
├── index.html          # 主页
├── README.md           # 项目说明
├── CLAUDE.md           # 本文档
├── .gitignore          # Git 忽略配置
├── css/
│   └── style.css       # 样式文件
├── js/
│   └── main.js         # 核心逻辑 (BlogApp 类，从 API 读取数据)
├── article/            # 文章详情页 HTML（静态内容）
│   ├── tech-1.html ~ tech-6.html
│   ├── movie-1.html ~ movie-2.html
│   └── music-1.html ~ music-2.html
├── drafts/              # 草稿目录 (Markdown/PDF 文档)
├── log_tail.py          # 日志监控脚本
├── backend/             # C++ 后端 API
│   ├── main.cpp         # Crow HTTP 框架 + MySQL Connector
│   └── CMakeLists.txt   # 构建配置
└── config/              # 配置文件备份 (已迁移到 MySQL)
```

**Git 仓库**: https://github.com/noobyangzzz/Personal-blog

## 技术栈

- **前端**: 原生 HTML5 + CSS3 + JavaScript (ES6+)
- **后端**: C++ (Crow HTTP framework)
- **数据库**: MySQL 8.0
- **服务器**: Nginx 1.16.1
- **端口**: 30000 (前端), 8080 (后端 API)

## 数据库

### 表结构

**sections** - 板块配置
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键 |
| slug | VARCHAR(50) | URL标识 (tech/movie/music) |
| name | VARCHAR(100) | 板块名称 |
| icon | VARCHAR(10) | emoji图标 |
| description | TEXT | 描述 |
| color | VARCHAR(7) | 主题色 |

**articles** - 文章表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键 |
| section_id | INT | 关联 sections.id |
| article_key | VARCHAR(50) | URL标识 (tech-1) |
| title | VARCHAR(255) | 标题 |
| excerpt | TEXT | 摘要 |
| content_path | VARCHAR(255) | 静态HTML路径 |
| author | VARCHAR(100) | 作者 |
| views | INT | 阅读数 |
| is_hidden | TINYINT | 0=公开, 1=隐藏 |
| created_at | DATETIME | 发布时间 |

**article_views** - 阅读记录表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键 |
| article_id | INT | 关联 articles.id |
| ip_address | VARCHAR(45) | 访客IP |
| user_agent | VARCHAR(500) | 浏览器标识 |
| visited_at | DATETIME | 访问时间 |

### 数据库连接

```
Host: 127.0.0.1:3306
User: root
Password: 123456
Database: blog_db
```

## API 端点

| 端点 | 用途 |
|------|------|
| `GET /api/sections` | 获取板块列表 |
| `GET /api/articles?section=xxx` | 获取文章列表（可按板块过滤，已过滤隐藏文章） |
| `GET /api/article?id=xxx` | 获取文章详情（已过滤隐藏文章） |
| `POST /api/visit?article=xxx&section=xxx` | 记录文章访问，自动更新阅读数 |

**注意**：访问记录通过 Nginx 的 `X-Real-IP` 头获取真实客户端 IP。

## 日志系统

### Nginx 配置
- 主日志: `/home/yang/nginx-1.16.1/logs/blog_access.log`
- 文章访问日志 (JS): `/home/yang/nginx-1.16.1/logs/article_access.log`
- 文章页面日志 (直接访问): `/home/yang/nginx-1.16.1/logs/article_page.log`

### 日志监控脚本
```bash
python3 /home/yang/blog/log_tail.py
```

## 常用命令

```bash
# 编译后端 API
cd /home/yang/blog/backend
mkdir -p build && cd build
cmake ..
make -j4

# 启动后端 API
./blog_api

# 重启 Nginx
kill -HUP $(cat /home/yang/nginx-1.16.1/logs/nginx.pid)

# 重启日志监控
pkill -f log_tail.py && python3 /home/yang/blog/log_tail.py &
```

## 扩展说明

### 添加新文章
1. 将静态 HTML 内容放到 `article/{section}-{id}.html`
2. 在 MySQL articles 表中插入记录（注意 section_id 对应 sections 表）

### 隐藏文章
设置 `articles.is_hidden = 1`，文章将不会在列表显示，API 也会过滤掉。

### 文章内容加载
文章内容（HTML）通过 `content_path` 字段指定的静态文件路径直接加载，不存储在数据库中。

### 文章内容懒加载
文章详情页使用渐进式渲染策略，避免大型文章（如 tech-6.html）加载时阻塞浏览器：

1. **实现位置**: `js/main.js` 的 `renderContentProgressive()` 方法
2. **工作原理**: 按 `<h1>` 标签分割内容，使用 `requestAnimationFrame` 分帧逐步渲染
3. **特点**:
   - 通用策略，适用于所有文章
   - 无需修改文章 HTML 结构
   - 未来发布的任何大型文章都会自动受益于此策略
4. **触发条件**: 文章内容通过 `showArticle()` 加载时自动启用

### 文章发布流程
项目使用 `blog-publish` skill 将 Markdown 发布为博客文章：

1. **编写 Markdown**: 在 `drafts/` 目录编写 .md 文件
2. **运行发布命令**: `/blog-publish drafts_filename.md`
3. **自动生成**:
   - HTML 文件 → `article/{section}-{id}.html`
   - SQL INSERT 语句 → 用于插入数据库
4. **执行 SQL**: 将文章元数据写入 MySQL

**注意**: `blog-publish.py` 脚本待实现，当前发布流程为手动。
