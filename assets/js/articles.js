async function loadArticles() {
  const list = document.getElementById("articles-list");

  try {
    const response = await fetch(
      "https://api.github.com/repos/TedOctaviusGreene/jesusrest/contents/articles"
    );

    if (!response.ok) throw new Error("GitHub API failed");
    const files = await response.json();

    // Filter for markdown files
    const mdFiles = files.filter(file => file.name.endsWith(".md"));

    // Build links pointing to read.html with file param
    const items = mdFiles.map(file => {
      return `<li><a href="read.html?file=${file.name}">${file.name.replace(/-/g, " ").replace(".md","")}</a></li>`;
    });

    list.innerHTML = `<ul>${items.join("")}</ul>`;
  } catch (e) {
    list.innerHTML = `<p>Error loading articles: ${e.message}</p>`;
  }
}

