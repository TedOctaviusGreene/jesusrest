console.log("✅ read.js is running");

async function loadArticle() {
  const params = new URLSearchParams(window.location.search);
  const file = params.get("file");
  const contentEl = document.getElementById("article-content");

  if (!file) {
    contentEl.innerHTML = "<p>No article specified.</p>";
    return;
  }

  try {
    console.log("Fetching:", file);

    const response = await fetch(
      `https://raw.githubusercontent.com/TedOctaviusGreene/jesusrest/main/articles/${file}`
    );

    console.log("Response status:", response.status);

    if (!response.ok) throw new Error("GitHub fetch failed");

    const text = await response.text();

    // Parse markdown into HTML
    contentEl.innerHTML = marked.parse(text);
    console.log("✅ Article loaded successfully");
  } catch (err) {
    console.error("Error loading article:", err);
    contentEl.innerHTML = `<p>Error loading article: ${err.message}</p>`;
  }
}

document.addEventListener("DOMContentLoaded", loadArticle);
