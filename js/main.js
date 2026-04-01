// Blog App - Vue 3 + Vue Router

// HomeView Component
const HomeView = {
    template: `
        <section class="section hero">
            <div class="container">
                <h2>欢迎来到 noobyangzzz 的博客</h2>
                <p>记录生活，分享感悟</p>
            </div>
        </section>
        <section class="section sections-grid">
            <div class="container">
                <div class="sections-wrapper">
                    <div v-for="section in sections" :key="section.id"
                         class="section-card"
                         :style="{ '--section-color': section.color }"
                         @click="goToSection(section.id)">
                        <div class="section-icon">{{ section.icon }}</div>
                        <h3 class="section-title">{{ section.name }}</h3>
                        <p class="section-desc">{{ section.description }}</p>
                        <div class="section-count">{{ getArticleCount(section.id) }} 篇文章</div>
                    </div>
                </div>
            </div>
        </section>
    `,
    data() {
        return {
            sections: [],
            articles: {}
        };
    },
    created() {
        this.loadData();
    },
    methods: {
        async loadData() {
            await Promise.all([this.loadSections(), this.loadArticles()]);
        },
        async loadSections() {
            try {
                const response = await fetch('/api/sections');
                if (response.ok) {
                    this.sections = await response.json();
                }
            } catch (error) {
                console.error('Failed to load sections:', error);
            }
        },
        async loadArticles() {
            try {
                const response = await fetch('/api/articles');
                if (response.ok) {
                    const articles = await response.json();
                    this.articles = {};
                    for (const article of articles) {
                        if (!this.articles[article.section]) {
                            this.articles[article.section] = [];
                        }
                        this.articles[article.section].push(article);
                    }
                }
            } catch (error) {
                console.error('Failed to load articles:', error);
            }
        },
        getArticleCount(sectionId) {
            return this.articles[sectionId]?.length || 0;
        },
        goToSection(sectionId) {
            this.$router.push('/section/' + sectionId);
        }
    }
};

// SectionView Component
const SectionView = {
    template: `
        <section class="section content-section">
            <div class="container">
                <button class="back-btn" @click="$router.push('/')">← 返回首页</button>
                <div class="content-wrapper">
                    <div class="content-header">
                        <div class="content-icon">{{ section?.icon }}</div>
                        <div>
                            <h2 class="content-title">{{ section?.name }}</h2>
                            <p class="content-desc">{{ section?.description }}</p>
                        </div>
                    </div>
                    <div class="article-list">
                        <div v-if="sectionArticles.length === 0" class="empty-state">
                            <div class="empty-state-icon">📝</div>
                            <p>暂无文章</p>
                        </div>
                        <div v-else v-for="article in sectionArticles" :key="article.id"
                             class="article-item"
                             @click="goToArticle(article.id)">
                            <h3 class="article-title">{{ article.title }}</h3>
                            <p class="article-excerpt">{{ article.excerpt }}</p>
                            <div class="article-meta">发布于 {{ article.date }} | 作者: {{ article.author }} | 阅读: {{ article.views }}</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    `,
    data() {
        return {
            sections: [],
            articles: {}
        };
    },
    computed: {
        sectionId() {
            return this.$route.params.sectionId;
        },
        section() {
            return this.sections.find(s => s.id == this.sectionId);
        },
        sectionArticles() {
            return this.articles[this.sectionId] || [];
        }
    },
    created() {
        this.loadData();
    },
    methods: {
        async loadData() {
            await Promise.all([this.loadSections(), this.loadArticles()]);
        },
        async loadSections() {
            try {
                const response = await fetch('/api/sections');
                if (response.ok) {
                    this.sections = await response.json();
                }
            } catch (error) {
                console.error('Failed to load sections:', error);
            }
        },
        async loadArticles() {
            try {
                const response = await fetch('/api/articles');
                if (response.ok) {
                    const articles = await response.json();
                    this.articles = {};
                    for (const article of articles) {
                        if (!this.articles[article.section]) {
                            this.articles[article.section] = [];
                        }
                        this.articles[article.section].push(article);
                    }
                }
            } catch (error) {
                console.error('Failed to load articles:', error);
            }
        },
        goToArticle(articleId) {
            this.$router.push('/article/' + articleId);
        }
    }
};

// ArticleView Component
const ArticleView = {
    template: `
        <section class="section content-section">
            <div class="container">
                <button class="back-btn" @click="goBack">← 返回</button>
                <div class="article-wrapper">
                    <div class="article-detail">
                        <div class="article-detail-header">
                            <h1 class="article-detail-title">{{ article?.title }}</h1>
                            <div class="article-detail-meta">
                                <span>发布于 {{ article?.date }}</span> |
                                <span>作者: {{ article?.author }}</span> |
                                <span>阅读: <span id="article-views">{{ article?.views }}</span></span>
                            </div>
                        </div>
                        <div class="article-detail-content" id="article-content-loading" v-html="renderedContent"></div>
                    </div>
                </div>
            </div>
        </section>
    `,
    data() {
        return {
            sections: [],
            articles: {},
            article: null,
            renderedContent: '加载中...'
        };
    },
    computed: {
        articleId() {
            return this.$route.params.articleId;
        }
    },
    mounted() {
        this.loadData().then(() => {
            return this.loadArticleContent();
        }).then(() => {
            this.logVisit();
        });
    },
    watch: {
        async $route(to, from) {
            if (to.params.articleId !== from.params.articleId) {
                this.article = null;
                this.renderedContent = '加载中...';
                await this.loadData();
                await this.loadArticleContent();
                this.logVisit();
            }
        }
    },
    methods: {
        async loadData() {
            await Promise.all([this.loadSections(), this.loadArticles()]);
            this.findArticle();
        },
        async loadSections() {
            try {
                const response = await fetch('/api/sections');
                if (response.ok) {
                    this.sections = await response.json();
                }
            } catch (error) {
                console.error('Failed to load sections:', error);
            }
        },
        async loadArticles() {
            try {
                const response = await fetch('/api/articles');
                if (response.ok) {
                    const articles = await response.json();
                    this.articles = {};
                    for (const article of articles) {
                        if (!this.articles[article.section]) {
                            this.articles[article.section] = [];
                        }
                        this.articles[article.section].push(article);
                    }
                }
            } catch (error) {
                console.error('Failed to load articles:', error);
            }
        },
        findArticle() {
            for (const sec of this.sections) {
                const found = (this.articles[sec.id] || []).find(a => a.id == this.articleId);
                if (found) {
                    this.article = found;
                    this.currentSection = sec;
                    break;
                }
            }
        },
        async loadArticleContent() {
            if (!this.article?.content_path) {
                this.renderedContent = '<p>文章未找到</p>';
                return;
            }

            try {
                const url = '/' + this.article.content_path;
                const contentResponse = await fetch(url);
                if (contentResponse.ok) {
                    const contentHtml = await contentResponse.text();
                    // Extract only .article-detail-content from the full HTML page
                    const contentMatch = contentHtml.match(/<div class="article-detail-content">([\s\S]*?)<\/div>\s*<\/div>\s*<\/section>\s*<\/main>/);
                    const extractedContent = contentMatch ? contentMatch[1] : contentHtml;
                    await this.renderContentProgressive(extractedContent);
                } else {
                    this.renderedContent = '<p>内容加载失败</p>';
                }
            } catch (error) {
                console.error('Failed to load article content:', error);
                this.renderedContent = '<p>内容加载失败</p>';
            }
        },
        async renderContentProgressive(contentHtml) {
            // Split content by h1 sections for progressive loading
            const sections = contentHtml.split(/(?=<h1>)/);
            const container = document.getElementById('article-content-loading');
            if (!container) return;

            container.innerHTML = '';

            for (let i = 0; i < sections.length; i++) {
                await new Promise(resolve => {
                    requestAnimationFrame(() => {
                        container.innerHTML += sections[i];
                        resolve();
                    });
                });
            }
        },
        async logVisit() {
            if (!this.article || !this.currentSection) return;

            try {
                await fetch(`/api/visit?article=${this.article.id}&section=${this.currentSection.id}`, {
                    method: 'POST',
                    keepalive: true
                });
                // Increment view count in UI
                if (this.article) {
                    this.article.views = (this.article.views || 0) + 1;
                }
            } catch (error) {
                console.error('Failed to log visit:', error);
            }
        },
        goBack() {
            if (window.history.length > 1) {
                this.$router.back();
            } else {
                this.$router.push('/');
            }
        }
    }
};

// Vue Router Configuration
const routes = [
    { path: '/', component: HomeView },
    { path: '/section/:sectionId', component: SectionView },
    { path: '/article/:articleId', component: ArticleView }
];

const router = VueRouter.createRouter({
    history: VueRouter.createWebHashHistory(),
    routes: routes
});

// Create and mount Vue App
const app = Vue.createApp({});
app.use(router);
app.mount('#app');
