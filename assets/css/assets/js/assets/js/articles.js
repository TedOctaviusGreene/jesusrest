async function loadArticles() {
  const list = document.getElementById("articles-list");

  try {
    // Test: just confirm script runs
    list.innerHTML = "<p>Fetching articles…</p>";

    const response = await fetch(
      "https://api.github.com/repos/TedOctaviusGreene/jesusrest/contents/articles?ref=main"
    );

    if (!response.ok) throw new Error("GitHub API failed");
    const files = await response.json();

    list.innerHTML = "<pre>" + JSON.stringify(files, null, 2) + "</pre>";
  } catch (e) {
    console.error(e);
    list.innerHTML = "<p>Error: " + e.message + "</p>";
  }
}

document.addEventListener("DOMContentLoaded", loadArticles);


