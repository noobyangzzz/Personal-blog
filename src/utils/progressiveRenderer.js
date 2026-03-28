export async function renderContentProgressive(container, contentHtml) {
  if (!container) return

  const sections = contentHtml.split(/(?=<h1>)/)

  for (let i = 0; i < sections.length; i++) {
    await new Promise(resolve => {
      requestAnimationFrame(() => {
        container.innerHTML += sections[i]
        resolve()
      })
    })

    if (i < sections.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 16))
    }
  }
}
