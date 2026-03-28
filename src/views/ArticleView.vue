<template>
  <div class="container">
    <button class="back-btn" @click="goBack">← 返回</button>

    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <template v-else-if="article">
      <div class="article-detail">
        <div class="article-detail-header">
          <h1 class="article-detail-title">{{ article.title }}</h1>
          <div class="article-detail-meta">
            <span>发布于 {{ article.date }}</span> |
            <span>作者: {{ article.author }}</span> |
            <span>阅读: <span id="article-views">{{ article.views }}</span></span>
          </div>
        </div>
        <ArticleContent :content-path="article.content_path" />
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '../services/api'
import ArticleContent from '../components/ArticleContent.vue'

const route = useRoute()
const router = useRouter()

const article = ref(null)
const sections = ref([])
const articles = ref([])
const loading = ref(true)
const error = ref(null)

const sectionSlug = computed(() => route.params.sectionSlug)
const articleId = computed(() => route.params.id)

function findArticleAndSection(id) {
  for (const sec of sections.value) {
    const found = articles.value.find(a => a.id === id)
    if (found) {
      return { article: found, section: sec }
    }
  }
  return null
}

async function loadData() {
  loading.value = true
  error.value = null

  try {
    const [sectionsData, articlesData] = await Promise.all([
      api.getSections(),
      api.getArticles()
    ])
    sections.value = sectionsData
    articles.value = articlesData

    const result = findArticleAndSection(articleId.value)
    if (result) {
      article.value = result.article
      api.logVisit(articleId.value, result.section.id)
    } else {
      error.value = '文章未找到'
    }
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

function goBack() {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}

onMounted(loadData)
watch(() => route.params.id, loadData)
</script>
