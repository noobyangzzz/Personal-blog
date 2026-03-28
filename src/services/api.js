const API_BASE = ''

export const api = {
  async getSections() {
    const response = await fetch(`/api/sections`)
    if (!response.ok) {
      throw new Error(`Failed to load sections: ${response.status}`)
    }
    return response.json()
  },

  async getArticles(slug) {
    const url = slug
      ? `/api/articles?section=${slug}`
      : `/api/articles`
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to load articles: ${response.status}`)
    }
    return response.json()
  },

  async getArticle(id) {
    const response = await fetch(`/api/article?id=${id}`)
    if (!response.ok) {
      throw new Error(`Failed to load article: ${response.status}`)
    }
    return response.json()
  },

  async logVisit(id, section) {
    try {
      await fetch(`/api/visit?article=${id}&section=${section}`, {
        method: 'POST',
        keepalive: true
      })
    } catch (error) {
      console.error('Failed to log visit:', error)
    }
  }
}
