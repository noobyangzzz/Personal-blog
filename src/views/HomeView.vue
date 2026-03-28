<template>
  <div class="container">
    <section class="hero">
      <h2>欢迎来到 noobyangzzz 的博客</h2>
      <p>记录生活，分享感悟</p>
    </section>

    <section class="sections-grid">
      <div v-if="loading" class="loading">加载中...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <template v-else>
        <SectionCard
          v-for="section in sections"
          :key="section.id"
          :section="section"
          :article-count="getArticleCount(section.id)"
        />
      </template>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { api } from '../services/api'
import SectionCard from '../components/SectionCard.vue'

const sections = ref([])
const articles = ref([])
const loading = ref(true)
const error = ref(null)

const articlesBySection = computed(() => {
  const grouped = {}
  for (const article of articles.value) {
    if (!grouped[article.section]) {
      grouped[article.section] = []
    }
    grouped[article.section].push(article)
  }
  return grouped
})

function getArticleCount(sectionId) {
  return articlesBySection.value[sectionId]?.length || 0
}

onMounted(async () => {
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
})
</script>
