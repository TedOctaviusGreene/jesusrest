async function loadArticles() {
  const list = document.getElementById("articles-list");

  try {
    // Fetch the list of files from your GitHub repo
    const response = await fetch(
      "https://api.github.com/repos/TedOctaviusGreene/jesusrest/contents/articles"
    );

    if (!response.ok) throw new Error("Failed to fetch articles list");
    const files = await response.json();

    // Only use Markdown files
    const markdownFiles = files.filter(file => file.name.endsWith(".md"));

    // Build HTML for each article
    const links = markdownFiles.map(file => {
      const title = file.name.replace(".md", "").replace(/-/g, " ");
      return `<li><a href="https://jesusrest.com/articles/${file.name}" target="_blank">${title}</a></li>`;
    });

    list.innerHTML = `<ul>${links.join("")}</ul>`;
  } catch (e) {
    console.error(e);
    list.innerHTML = "<p>Error loading articles.</p>";
  }
}

// Run the loader after page content loads
document.addEventListener("DOMContentLoaded", loadArticles);
