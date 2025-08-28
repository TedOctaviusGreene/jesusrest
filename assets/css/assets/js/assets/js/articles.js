async function loadArticles() {
  const list = document.getElementById("articles-list");

  try {
    // Fetch list of Markdown files from the repo's /articles folder
    const response = await fetch(
      "https://api.github.com/repos/TedOctaviusGreene/jesusrest/contents/articles"
    );
    if (!response.ok) throw new Error("Failed to fetch articles list");
    const files = await response.json();

    // Only keep .md files
    const markdownFiles = files.filter(file => file.name.endsWith(".md"));

    let html = "";
    for (const file of markdownFiles) {
      const rawResponse = await fetch(file.download_url);
      const text = await rawResponse.text();

      // Convert Markdown to simple HTML
      let content = text
        .replace(/^# (.*$)/gim, "<h1>$1</h1>")
        .replace(/^## (.*$)/gim, "<h2>$1</h2>")
        .replace(/^### (.*$)/gim, "<h3>$1</h3>")
        .replace(/\*\*(.*)\*\*/gim, "<strong>$1</strong>")
        .replace(/\*(.*)\*/gim, "<em>$1</em>")
        .replace(/\n$/gim, "<br />");

      html += `
        <article style="margin-bottom:40px;">
          <h2>${file.name.replace(".md", "").replace(/-/g, " ")}</h2>
          <div>${content}</div>
        </article>
      `;
    }

    list.innerHTML = html || "<p>No articles yet.</p>";
  } catch (e) {
    console.error(e);
    list.innerHTML = "<p>Error loading articles.</p>";
  }
}

document.addEventListener("DOMContentLoaded", loadArticles);

