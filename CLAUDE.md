# Blog Vue 3 项目

基于 Vue 3 + Composition API 的博客前端重构项目，使用 Vue Router 实现路由导航。

## 技术栈

- **前端框架**: Vue 3.4 + Composition API
- **路由**: Vue Router 4.2
- **构建工具**: Vite 5.0
- **样式**: 原生 CSS（保留原有深色主题）

## 项目结构

```
blog-vue3/
├── index.html                 # Vue 入口 HTML
├── package.json              # 项目依赖
├── vite.config.js           # Vite 构建配置
├── dist/                    # 生产构建输出
├── public/article/           # 静态文章内容副本
└── src/
    ├── main.js               # Vue 应用入口
    ├── App.vue               # 根组件
    ├── style.css             # 深色主题样式
    ├── router/
    │   └── index.js         # Vue Router 配置
    ├── services/
    │   └── api.js            # API 服务层
    ├── utils/
    │   └── progressiveRenderer.js  # 渐进式内容渲染
    ├── components/
    │   ├── AppHeader.vue     # 顶部导航栏
    │   ├── AppFooter.vue     # 底部
    │   ├── SectionCard.vue   # 板块卡片
    │   ├── ArticleItem.vue   # 文章列表项
    │   └── ArticleContent.vue # 文章内容（渐进式加载）
    └── views/
        ├── HomeView.vue      # 首页（板块列表）
        ├── SectionView.vue   # 板块详情（文章列表）
        └── ArticleView.vue   # 文章详情
```

## 路由配置

| URL | 视图 | 说明 |
|-----|------|------|
| `/` | HomeView | 首页展示所有板块及文章数量 |
| `/section/:slug` | SectionView | 按 slug 过滤展示文章列表 |
| `/article/:id` | ArticleView | 展示文章详情 |

**注意**: slug 和 id 的值相同（如 `tech`, `movie`, `tech-1` 等）

## API 接口

所有 API 通过 nginx 代理到后端 `http://127.0.0.1:8080`

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/sections` | GET | 获取板块列表 |
| `/api/articles` | GET | 获取全部文章列表 |
| `/api/articles?section=xxx` | GET | 按板块 slug 过滤文章 |
| `/api/article?id=xxx` | GET | 获取文章详情 |
| `/api/visit?article=xxx&section=xxx` | POST | 记录文章访问 |

### API 返回数据示例

**GET /api/sections**
```json
[{"color":"#3498db","description":"分享技术心得与编程经验","icon":"💻","name":"技术","id":"tech"}]
```

**GET /api/articles**
```json
[{"id":"tech-1","title":"C++ muduo 网络库源码解析","section":"tech","content_path":"article/tech-1.html","views":13}]
```

## 渐进式内容加载

文章详情页采用渐进式渲染策略，按 `<h1>` 标签分割内容，使用 `requestAnimationFrame` 分帧逐步渲染，避免大型文章（tech-6.html 约 478KB）阻塞浏览器。

## 开发命令

```bash
cd /home/yang/blog-vue3

# 安装依赖
npm install

# 开发服务器（端口 3000，API 代理到 8080）
npm run dev

# 生产构建
npm run build

# 预览生产构建
npm run preview
```

## Nginx 配置

项目部署在端口 30000，通过 nginx 提供服务：

```nginx
server {
    listen 30000;
    root /home/yang/blog-vue3/dist;
    index index.html;

    # API 代理
    location /api/ {
        proxy_pass http://127.0.0.1:8080/api/;
    }

    # 静态文章内容
    location /article/ {
        alias /home/yang/blog/article/;
    }

    # Vue Router History 模式
    location / {
        try_files $uri $uri/ @fallback;
    }
    location @fallback {
        rewrite ^(.+)$ /index.html last;
    }
}
```

## 相关项目

- **原项目**: `/home/yang/blog/` - 原生 JavaScript SPA
- **后端 API**: `/home/yang/blog/backend/` - C++ + Crow + MySQL
- **Nginx 配置**: `/home/yang/nginx-1.16.1/conf/blog.conf`

## 数据库（后端）

**sections 表**
| 字段 | 说明 |
|------|------|
| id/slug | 板块标识（tech/movie/music） |
| name | 板块名称 |
| icon | emoji 图标 |
| description | 描述 |
| color | 主题色 |

**articles 表**
| 字段 | 说明 |
|------|------|
| id | 主键 |
| article_key | URL 标识（如 tech-1） |
| title | 标题 |
| excerpt | 摘要 |
| content_path | 静态 HTML 路径 |
| views | 阅读数 |

## 文章发布流程

1. 在 `/home/yang/blog/drafts/` 编写 Markdown
2. 运行 `/blog-publish` skill 发布
3. HTML 文件生成到 `article/{section}-{id}.html`
4. 元数据写入 MySQL articles 表
