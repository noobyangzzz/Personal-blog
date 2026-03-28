import { ref } from 'vue'

export function useProgressiveLoader() {
  const isLoading = ref(false)
  const progress = ref(0)

  async function renderContentProgressive(container, contentHtml) {
    if (!container) return

    isLoading.value = true
    progress.value = 0

    const sections = contentHtml.split(/(?=<h1>)/)

    for (let i = 0; i < sections.length; i++) {
      await new Promise(resolve => {
        requestAnimationFrame(() => {
          container.innerHTML += sections[i]
          progress.value = Math.round(((i + 1) / sections.length) * 100)
          resolve()
        })
      })

      if (i < sections.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 16))
      }
    }

    isLoading.value = false
  }

  return {
    isLoading,
    progress,
    renderContentProgressive
  }
}
