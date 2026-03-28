<template>
  <div class="article-content-wrapper">
    <div v-if="isLoading" class="loading-indicator">加载中...</div>
    <div ref="contentContainer" class="article-detail-content"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { renderContentProgressive } from '../utils/progressiveRenderer'

const props = defineProps({
  contentPath: {
    type: String,
    required: true
  }
})

const contentContainer = ref(null)
const isLoading = ref(false)

async function loadContent() {
  if (!contentContainer.value) return

  isLoading.value = true
  contentContainer.value.innerHTML = ''

  try {
    const response = await fetch(`/${props.contentPath}`)
    if (response.ok) {
      const contentHtml = await response.text()
      // 解析 HTML 并提取 article-detail-content 部分
      const parser = new DOMParser()
      const doc = parser.parseFromString(contentHtml, 'text/html')
      const articleContent = doc.querySelector('.article-detail-content')

      if (articleContent) {
        const extractedHtml = articleContent.innerHTML
        await renderContentProgressive(contentContainer.value, extractedHtml)
      } else {
        contentContainer.value.innerHTML = '<p>内容加载失败</p>'
      }
    } else {
      contentContainer.value.innerHTML = '<p>内容加载失败</p>'
    }
  } catch (error) {
    console.error('Failed to load article content:', error)
    contentContainer.value.innerHTML = '<p>内容加载失败</p>'
  } finally {
    isLoading.value = false
  }
}

onMounted(loadContent)

watch(() => props.contentPath, loadContent)
</script>
