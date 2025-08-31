console.log("✅ articles.js is running");

async function loadArticles() {
  const list = document.getElementById("articles-list");

  try {
    // Fetch the list of markdown files in the /articles folder of your repo
    console.log("Fetching from GitHub API...");
    const response = await fetch(
      "https://api.github.com/repos/TedOctaviusGreene/jesusrest/contents/articles"
    );

    console.log("Response status:", response.status);
    if (!response.ok) throw new Error("GitHub API failed");

    const files = await response.json();
    console.log("Files received:", files);

    // Filter for .md files only
    const mdFiles = files.filter(file => file.name.endsWith(".md"));
    console.log("Markdown files:", mdFiles);

    // Turn each file into a clickable link that loads read.html with the file
    const items = mdFiles.map(file => {
      return `<li><a href="read.html?file=${file.name}">${file.name
        .replace(".md", "")
        .replace(/-/g, " ")}</a></li>`;
    });

    list.innerHTML = `<ul>${items.join("")}</ul>`;
  } catch (e) {
    console.error("Error loading articles:", e);
    list.innerHTML = `<p>Error loading articles: ${e.message}</p>`;
  }
}

// Run when DOM is ready
document.addEventListener("DOMContentLoaded", loadArticles);

