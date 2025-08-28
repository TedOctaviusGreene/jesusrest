async function loadArticle() {
  const params = new URLSearchParams(window.location.search);
  const file = params.get("file");
  const contentEl = document.getElementById("article-content");

  if (!file) {
    contentEl.innerHTML = "<p style='color:red;'>No article specified.</p>";
    return;
  }

  try {
    console.log("Fetching article:", file); // debug
    const url = `https://raw.githubusercontent.com/TedOctaviusGreene/jesusrest/main/articles/${file}`;
    console.log("Fetch URL:", url); // debug

    const response = await fetch(url);
    if (!response.ok) throw new Error("GitHub fetch failed: " + response.status);

    const text = await response.text();

    if (typeof marked !== "undefined") {
      contentEl.innerHTML = marked.parse(text);
    } else {
      contentEl.textContent = text;
    }
  } catch (err) {
    console.error("Article load failed:", err); // debug
    contentEl.innerHTML = `<p style="color:red;">Error loading article: ${err.message}</p>`;
  }
}

document.addEventListener("DOMContentLoaded", loadArticle);

