// Blog App - Modular JavaScript
// Sections and articles loaded from config files

class BlogApp {
    constructor() {
        this.sections = [];
        this.articles = {};
        this.currentSection = null;
        this.currentArticle = null;
        this.init();
    }

    async init() {
        await this.loadSections();
        await this.loadAllArticles();
        this.renderNav();
        this.renderSections();
        this.setupEventListeners();
    }

    async loadSections() {
        try {
            const response = await fetch('config/sections.json');
            const data = await response.json();
            this.sections = data.sections;
        } catch (error) {
            console.error('Failed to load sections:', error);
            this.sections = [];
        }
    }

    async loadAllArticles() {
        // Load articles for each section
        for (const section of this.sections) {
            try {
                const response = await fetch(`config/articles_${section.id}.json`);
                if (response.ok) {
                    const data = await response.json();
                    this.articles[section.id] = data.articles || [];
                } else {
                    this.articles[section.id] = this.getDefaultArticles(section.id);
                }
            } catch (error) {
                this.articles[section.id] = this.getDefaultArticles(section.id);
            }
        }
        console.log('Articles loaded:', this.articles);
    }

    getDefaultArticles(sectionId) {
        const defaultArticles = {
            tech: [
                { id: 'tech-1', title: 'C++ muduo 网络库源码解析', excerpt: '深入分析 muduo 库的 Reactor 模式实现，了解事件循环、连接管理等核心机制。', content: '<p>muduo 是一个基于 Reactor 模式的 C++ 网络库。</p><p>Reactor 模式是一种事件驱动编程模型，核心是将 IO 操作和业务逻辑分离。</p>', date: '2026-03-20', author: 'noobyangzzz', views: 128 },
                { id: 'tech-2', title: 'Nginx 反向代理实战', excerpt: '如何使用 Nginx 配置反向代理，实现负载均衡和动静分离。', content: '<p>Nginx 是高性能的 HTTP 服务器和反向代理服务器。</p>', date: '2026-03-15', author: 'noobyangzzz', views: 256 },
                { id: 'tech-3', title: 'Redis 缓存设计模式', excerpt: '探讨常见的缓存穿透、缓存雪崩问题及其解决方案。', content: '<p>Redis 是高性能的键值存储数据库，广泛用于缓存场景。</p>', date: '2026-03-10', author: 'noobyangzzz', views: 189 }
            ],
            movie: [
                { id: 'movie-1', title: '《盗梦空间》- 诺兰的梦境哲学', excerpt: '一层又一层的梦境，究竟什么是真实？', content: '<p>《盗梦空间》是克里斯托弗·诺兰于2010年执导的科幻电影。</p>', date: '2026-03-18', author: 'noobyangzzz', views: 342 },
                { id: 'movie-2', title: '《星际穿越》- 科学与情感的交织', excerpt: '当星际旅行遇上父女情感', content: '<p>《星际穿越》是诺兰导演的另一部科幻巨作。</p>', date: '2026-03-12', author: 'noobyangzzz', views: 289 }
            ],
            music: [
                { id: 'music-1', title: '久石让 - 天空之城钢琴曲', excerpt: '细腻的旋律，如同在云端漫步', content: '<p>《天空之城》是宫崎骏1986年的动画电影，久石让为其创作了经典配乐。</p>', date: '2026-03-16', author: 'noobyangzzz', views: 156 },
                { id: 'music-2', title: '周杰伦 - 范特西时期的创新精神', excerpt: '回顾周杰伦如何用融合曲风重新定义了华语流行音乐', content: '<p>2001年，周杰伦发行了第二张专辑《范特西》，彻底改变了华语流行音乐的走向。</p>', date: '2026-03-08', author: 'noobyangzzz', views: 203 }
            ]
        };
        return defaultArticles[sectionId] || [];
    }

    setupEventListeners() {
        // Use event delegation for article clicks
        document.addEventListener('click', (e) => {
            const articleItem = e.target.closest('.article-item');
            if (articleItem && articleItem.dataset.articleId) {
                e.preventDefault();
                this.showArticle(articleItem.dataset.articleId);
            }
        });

        // Handle browser back/forward
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.page) {
                if (e.state.page === 'article' && e.state.articleId) {
                    this.showArticle(e.state.articleId);
                } else if (e.state.page === 'section' && e.state.sectionId) {
                    this.showSection(e.state.sectionId);
                } else {
                    this.showHome();
                }
            }
        });
    }

    renderNav() {
        const dynamicNav = document.getElementById('dynamic-nav');
        dynamicNav.innerHTML = this.sections.map(section => `
            <a class="nav-link section-link" data-section="${section.id}">${section.name}</a>
        `).join('');

        // Add click handlers
        dynamicNav.querySelectorAll('.section-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const sectionId = e.target.dataset.section;
                this.showSection(sectionId);
                history.pushState({page: 'section', sectionId}, '', `#${sectionId}`);
            });
        });
    }

    renderSections() {
        const wrapper = document.getElementById('sections-wrapper');
        wrapper.innerHTML = this.sections.map(section => `
            <div class="section-card" style="--section-color: ${section.color}" data-section-id="${section.id}">
                <div class="section-icon">${section.icon}</div>
                <h3 class="section-title">${section.name}</h3>
                <p class="section-desc">${section.description}</p>
                <div class="section-count">${this.articles[section.id]?.length || 0} 篇文章</div>
            </div>
        `).join('');

        // Add click handlers to section cards
        wrapper.querySelectorAll('.section-card').forEach(card => {
            card.addEventListener('click', () => {
                const sectionId = card.dataset.sectionId;
                this.showSection(sectionId);
                history.pushState({page: 'section', sectionId}, '', `#${sectionId}`);
            });
        });
    }

    showSection(sectionId) {
        const section = this.sections.find(s => s.id === sectionId);
        if (!section) return;

        this.currentSection = section;

        // Update nav active state
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.dataset.section === sectionId) {
                link.classList.add('active');
            }
        });

        // Show content section, hide home and article
        document.getElementById('home-section').style.display = 'none';
        document.getElementById('sections-container').style.display = 'none';
        document.getElementById('content-section').style.display = 'block';
        document.getElementById('article-section').style.display = 'none';

        this.renderSectionContent(section);
    }

    renderSectionContent(section) {
        const contentWrapper = document.getElementById('content-wrapper');
        const articles = this.articles[section.id] || [];

        contentWrapper.innerHTML = `
            <div class="content-header">
                <div class="content-icon">${section.icon}</div>
                <div>
                    <h2 class="content-title">${section.name}</h2>
                    <p class="content-desc">${section.description}</p>
                </div>
            </div>
            <div class="article-list">
                ${articles.length > 0 ? articles.map(article => `
                    <div class="article-item" data-article-id="${article.id}">
                        <h3 class="article-title">${article.title}</h3>
                        <p class="article-excerpt">${article.excerpt}</p>
                        <div class="article-meta">发布于 ${article.date} | 作者: ${article.author} | 阅读: ${article.views}</div>
                    </div>
                `).join('') : `
                    <div class="empty-state">
                        <div class="empty-state-icon">📝</div>
                        <p>暂无文章</p>
                    </div>
                `}
            </div>
        `;
    }

    showArticle(articleId) {
        console.log('showArticle called:', articleId);
        console.log('Available articles:', this.articles);

        // Find article in all sections
        let article = null;
        let section = null;
        for (const sec of this.sections) {
            const found = (this.articles[sec.id] || []).find(a => a.id === articleId);
            if (found) {
                article = found;
                section = sec;
                break;
            }
        }

        console.log('Found article:', article, 'section:', section);

        if (!article || !section) {
            console.error('Article not found:', articleId);
            return;
        }

        this.currentArticle = article;

        // Update nav
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });

        // Show article section
        document.getElementById('home-section').style.display = 'none';
        document.getElementById('sections-container').style.display = 'none';
        document.getElementById('content-section').style.display = 'none';
        document.getElementById('article-section').style.display = 'block';

        // Update back button
        document.getElementById('back-to-section').onclick = () => {
            history.back();
        };

        // Render article
        const articleWrapper = document.getElementById('article-wrapper');
        articleWrapper.innerHTML = `
            <div class="article-detail">
                <div class="article-detail-header">
                    <h1 class="article-detail-title">${article.title}</h1>
                    <div class="article-detail-meta">
                        <span>发布于 ${article.date}</span> |
                        <span>作者: ${article.author}</span> |
                        <span>阅读: ${article.views}</span>
                    </div>
                </div>
                <div class="article-detail-content">
                    ${article.content}
                </div>
            </div>
        `;

        // Log the visit
        this.logVisit(articleId, section.id);

        history.pushState({page: 'article', articleId, sectionId: section.id}, '', `#article-${articleId}`);
    }

    logVisit(articleId, sectionId) {
        // Send log request to server
        fetch(`/log?article=${articleId}&section=${sectionId}&t=${Date.now()}`, {
            method: 'POST',
            keepalive: true
        }).catch(() => {});
    }

    showHome() {
        // Update nav active state
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            const homeLink = document.querySelector('.nav-link[data-section="home"]');
            if (homeLink) homeLink.classList.add('active');
        });

        // Show home section
        document.getElementById('home-section').style.display = 'block';
        document.getElementById('sections-container').style.display = 'block';
        document.getElementById('content-section').style.display = 'none';
        document.getElementById('article-section').style.display = 'none';
        this.currentSection = null;
        this.currentArticle = null;

        history.pushState({page: 'home'}, '', '#home');
    }
}

// Make showHome globally accessible
window.showHome = () => window.blogApp?.showHome();

// Initialize app
window.blogApp = new BlogApp();
