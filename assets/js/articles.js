console.log("✅ articles.js is running");

async function loadArticles() {
  const list = document.getElementById("articles-list");
  console.log("Looking for #articles-list element:", list);

  try {
    console.log("Fetching from GitHub API...");
    const response = await fetch(
      "https://api.github.com/repos/TedOctaviusGreene/jesusrest/contents/articles"
    );
    console.log("Response status:", response.status);

    if (!response.ok) throw new Error("GitHub API failed");
    const files = await response.json();
    console.log("Files received:", files);

    const mdFiles = files.filter(file => file.name.endsWith(".md"));
    console.log("Markdown files:", mdFiles);

    const items = mdFiles.map(file => {
      const slug = file.name.replace(".md", "");
      return `<li><a href="read.html?file=${file.name}">${slug.replace(/-/g, " ")}</a></li>`;
    });

    list.innerHTML = `<ul>${items.join("")}</ul>`;
  } catch (e) {
    console.error("Error loading articles:", e);
    list.innerHTML = `<p>Error loading articles: ${e.message}</p>`;
  }
}

document.addEventListener("DOMContentLoaded", loadArticles);
