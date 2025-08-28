async function loadArticle() {
  const params = new URLSearchParams(window.location.search);
  const file = params.get("file");
  const contentEl = document.getElementById("article-content");

  if (!file) {
    contentEl.innerHTML = "<p>No article specified.</p>";
    return;
  }

  try {
    const response = await fetch(`https://raw.githubusercontent.com/TedOctaviusGreene/jesusrest/main/articles/${file}`);
    if (!response.ok) throw new Error("GitHub fetch failed");
    const text = await response.text();
    contentEl.innerHTML = marked.parse(text);
  } catch (err) {
    contentEl.innerHTML = `<p>Error loading article: ${err.message}</p>`;
  }
}

document.addEventListener("DOMContentLoaded", loadArticle);
