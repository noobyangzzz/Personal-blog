<template>
  <div class="container">
    <button class="back-btn" @click="$router.push('/')">← 返回首页</button>

    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <template v-else>
      <div class="content-wrapper">
        <div class="content-header">
          <div class="content-icon">{{ section?.icon }}</div>
          <div>
            <h2 class="content-title">{{ section?.name }}</h2>
            <p class="content-desc">{{ section?.description }}</p>
          </div>
        </div>

        <div class="article-list">
          <ArticleItem
            v-for="article in filteredArticles"
            :key="article.id"
            :article="article"
          />
          <div v-if="filteredArticles.length === 0" class="empty-state">
            <div class="empty-state-icon">📝</div>
            <p>暂无文章</p>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { api } from '../services/api'
import ArticleItem from '../components/ArticleItem.vue'

const route = useRoute()
const sections = ref([])
const articles = ref([])
const loading = ref(true)
const error = ref(null)

const slug = computed(() => route.params.slug)

const section = computed(() => {
  return sections.value.find(s => s.id === slug.value)
})

const filteredArticles = computed(() => {
  return articles.value.filter(a => a.section === section.value?.id)
})

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
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

onMounted(loadData)
watch(slug, loadData)
</script>
