async function loadArticles() {
  const list = document.getElementById("articles-list");
  try {
    const res = await fetch("https://api.github.com/repos/TedOctaviusGreene/jesusrest/contents/articles");
    const files = await res.json();

    let html = "";
    for (const file of files) {
      if (file.name.endsWith(".md")) {
        html += `<li><a href="https://jesusrest.com/articles/${file.name}">${file.name.replace(/-/g, " ").replace(".md", "")}</a></li>`;
      }
    }

    list.innerHTML = `<ul>${html}</ul>`;
  } catch (e) {
    list.innerHTML = "<p>Error loading articles.</p>";
  }
}

document.addEventListener("DOMContentLoaded", loadArticles);

