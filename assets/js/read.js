async function loadArticle() {
  const params = new URLSearchParams(window.location.search);
  const file = params.get("file");
  const contentEl = document.getElementById("article-content");

  if (!file) {
    contentEl.innerHTML = "<p>No article specified.</p>";
    return;
  }

  try {
    console.log("Fetching article:", file);

    const response = await fetch(
      `https://raw.githubusercontent.com/TedOctaviusGreene/jesusrest/main/articles/${file}`
    );

    if (!response.ok) throw new Error("GitHub fetch failed: " + response.status);

    const text = await response.text();

    if (typeof marked !== "undefined") {
      contentEl.innerHTML = marked.parse(text);
    } else {
      contentEl.textContent = text; // fallback
    }
  } catch (err) {
    console.error("Article load failed:", err);
    contentEl.innerHTML = `<p style="color:red;">Error loading article: ${err.message}</p>`;
  }
}

document.addEventListener("DOMContentLoaded", loadArticle);
