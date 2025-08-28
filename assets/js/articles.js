async function loadArticles() {
  const list = document.getElementById("articles-list");

  try {
    // Fetch the list of markdown files in the /articles folder of your repo
    const response = await fetch(
      "https://api.github.com/repos/TedOctaviusGreene/jesusrest/contents/articles"
    );

    if (!response.ok) throw new Error("GitHub API failed");
    const files = await response.json();

    // Filter for .md files only
    const mdFiles = files.filter(file => file.name.endsWith(".md"));

    // Turn each file into a clickable link to read.html
    const items = mdFiles.map(file => {
      const slug = file.name.replace(".md", "");
      return `<li><a href="read.html?file=${file.name}">${slug.replace(/-/g, " ")}</a></li>`;
    });

    list.innerHTML = `<ul>${items.join("")}</ul>`;
  } catch (e) {
    list.innerHTML = `<p>Error loading articles: ${e.message}</p>`;
  }
}
