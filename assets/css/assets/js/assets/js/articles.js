// assets/js/articles.js
async function loadArticles() {
  const list = document.getElementById("articles-list");
  list.innerHTML = "<p class='small'>Loading…</p>";

  try {
    const res = await fetch("https://api.github.com/repos/TedOctaviusGreene/jesusrest/contents/articles");
    const files = await res.json();

    let html = "";
    for (let file of files) {
      if (file.name.endsWith(".md")) {
        const title = file.name.replace(".md", "").replace(/-/g, " ");
        html += `<div><a href="/articles/${file.name}">${title}</a></div>`;
      }
    }
    list.innerHTML = html || "<p>No articles yet.</p>";
  } catch (e) {
    list.innerHTML = "<p>Error loading articles.</p>";
  }
}
document.addEventListener("DOMContentLoaded", loadArticles);
