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

    // Turn each file into a clickable link to the /read/ page
    const items = mdFiles.map(file => {
      const slug = file.name.replace(".md", "");
      return `<li><a href="/read/?file=${file.name}">${slug.replace(/-/g, " ")}</a></li>`;
    });

    list.innerHTML = `<ul>${items.join("")}</ul>`;
  } catch (e) {
    console.error("Error loading article list:", e);
    list.innerHTML = `<p style="color:red;">Error loading articles: ${e.message}</p>`;
  }
}
