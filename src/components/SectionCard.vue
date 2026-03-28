<template>
  <div class="section-card" :style="{ '--section-color': section.color }" @click="navigate">
    <div class="section-icon">{{ section.icon }}</div>
    <h3 class="section-title">{{ section.name }}</h3>
    <p class="section-desc">{{ section.description }}</p>
    <div class="section-count">{{ articleCount }} 篇文章</div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const props = defineProps({
  section: {
    type: Object,
    required: true
  },
  articleCount: {
    type: Number,
    default: 0
  }
})

const router = useRouter()

function navigate() {
  router.push(`/section/${props.section.id}`)
}
</script>
