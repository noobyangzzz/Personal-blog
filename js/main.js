// Blog App - Data loaded from MySQL via API

class BlogApp {
    constructor() {
        this.sections = [];
        this.articles = {};  // sectionSlug -> array of articles
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
            const response = await fetch('/api/sections');
            if (response.ok) {
                this.sections = await response.json();
            } else {
                console.error('Failed to load sections:', response.status);
                this.sections = [];
            }
        } catch (error) {
            console.error('Failed to load sections:', error);
            this.sections = [];
        }
    }

    async loadAllArticles() {
        try {
            const response = await fetch('/api/articles');
            if (response.ok) {
                const articles = await response.json();
                // Group articles by section
                this.articles = {};
                for (const article of articles) {
                    if (!this.articles[article.section]) {
                        this.articles[article.section] = [];
                    }
                    this.articles[article.section].push(article);
                }
            } else {
                console.error('Failed to load articles:', response.status);
                this.articles = {};
            }
        } catch (error) {
            console.error('Failed to load articles:', error);
            this.articles = {};
        }
    }

    async loadArticleDetail(articleKey) {
        try {
            const response = await fetch(`/api/article?id=${articleKey}`);
            if (response.ok) {
                return await response.json();
            }
            return null;
        } catch (error) {
            console.error('Failed to load article detail:', error);
            return null;
        }
    }

    setupEventListeners() {
        document.addEventListener('click', (e) => {
            const articleItem = e.target.closest('.article-item');
            if (articleItem && articleItem.dataset.articleId) {
                e.preventDefault();
                this.showArticle(articleItem.dataset.articleId);
            }
        });

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

        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.dataset.section === sectionId) {
                link.classList.add('active');
            }
        });

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

    async showArticle(articleId) {
        console.log('showArticle called:', articleId);

        // Find article from cached data
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

        if (!article || !section) {
            console.error('Article not found:', articleId);
            return;
        }

        this.currentArticle = article;

        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });

        document.getElementById('home-section').style.display = 'none';
        document.getElementById('sections-container').style.display = 'none';
        document.getElementById('content-section').style.display = 'none';
        document.getElementById('article-section').style.display = 'block';

        document.getElementById('back-to-section').onclick = () => {
            history.back();
        };

        // Render article with cached data first
        const articleWrapper = document.getElementById('article-wrapper');
        articleWrapper.innerHTML = `
            <div class="article-detail">
                <div class="article-detail-header">
                    <h1 class="article-detail-title">${article.title}</h1>
                    <div class="article-detail-meta">
                        <span>发布于 ${article.date}</span> |
                        <span>作者: ${article.author}</span> |
                        <span>阅读: <span id="article-views">${article.views}</span></span>
                    </div>
                </div>
                <div class="article-detail-content" id="article-content-loading">加载中...</div>
            </div>
        `;

        // Load article content from static HTML file
        try {
            const contentResponse = await fetch(`/${article.content_path}`);
            if (contentResponse.ok) {
                const contentHtml = await contentResponse.text();
                document.getElementById('article-content-loading').innerHTML = contentHtml;
            } else {
                document.getElementById('article-content-loading').innerHTML = '<p>内容加载失败</p>';
            }
        } catch (error) {
            console.error('Failed to load article content:', error);
            document.getElementById('article-content-loading').innerHTML = '<p>内容加载失败</p>';
        }

        // Log the visit via API
        this.logVisit(articleId, section.id);

        history.pushState({page: 'article', articleId, sectionId: section.id}, '', `#article-${articleId}`);
    }

    async logVisit(articleId, sectionId) {
        try {
            await fetch(`/api/visit?article=${articleId}&section=${sectionId}`, {
                method: 'POST',
                keepalive: true
            });
            // Update view count in UI
            const viewsEl = document.getElementById('article-views');
            if (viewsEl) {
                const currentViews = parseInt(viewsEl.textContent) || 0;
                viewsEl.textContent = currentViews + 1;
            }
        } catch (error) {
            console.error('Failed to log visit:', error);
        }
    }

    showHome() {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            const homeLink = document.querySelector('.nav-link[data-section="home"]');
            if (homeLink) homeLink.classList.add('active');
        });

        document.getElementById('home-section').style.display = 'block';
        document.getElementById('sections-container').style.display = 'block';
        document.getElementById('content-section').style.display = 'none';
        document.getElementById('article-section').style.display = 'none';
        this.currentSection = null;
        this.currentArticle = null;

        history.pushState({page: 'home'}, '', '#home');
    }
}

window.showHome = () => window.blogApp?.showHome();
window.blogApp = new BlogApp();
