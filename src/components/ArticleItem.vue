<template>
  <div class="article-item" @click="navigate">
    <h3 class="article-title">{{ article.title }}</h3>
    <p class="article-excerpt">{{ article.excerpt }}</p>
    <div class="article-meta">发布于 {{ article.date }} | 作者: {{ article.author }} | 阅读: {{ article.views }}</div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const props = defineProps({
  article: {
    type: Object,
    required: true
  }
})

const router = useRouter()

function navigate() {
  router.push(`/article/${props.article.id}`)
}
</script>
