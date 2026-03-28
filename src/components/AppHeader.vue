<template>
  <header class="header">
    <div class="container">
      <router-link to="/" class="logo">noobyangzzz</router-link>
      <nav class="nav">
        <router-link to="/" class="nav-link" :class="{ active: isHome }">首页</router-link>
        <router-link
          v-for="section in sections"
          :key="section.id"
          :to="`/section/${section.id}`"
          class="nav-link section-link"
          :class="{ active: isSection(section.id) }"
        >
          {{ section.name }}
        </router-link>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { api } from '../services/api'

const route = useRoute()
const sections = ref([])

const isHome = computed(() => route.name === 'home')
const isSection = (slug) => route.params.slug === slug

onMounted(async () => {
  try {
    sections.value = await api.getSections()
  } catch (e) {
    console.error('Failed to load sections:', e)
  }
})
</script>
