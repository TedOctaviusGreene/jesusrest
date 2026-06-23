/* ============================================================
   Jesus Rest — Site Search  (Google-class, client-side)
   Typo-tolerant full-text search over every article.
   Depends on: articles-data.js (window.JR_ARTICLES) + Fuse.js (CDN)
   Drop-in: include this script + a trigger with [data-search-open].
   ============================================================ */
(function () {
  var REPO = "TedOctaviusGreene/jesusrest";
  var RAW  = "https://raw.githubusercontent.com/" + REPO + "/main/articles/";
  var fuse = null, docs = [], built = false, building = false;

  /* ---------- inject modal + styles ---------- */
  function injectUI() {
    if (document.getElementById("jr-search")) return;
    var css = document.createElement("style");
    css.textContent = `
      #jr-search{position:fixed;inset:0;z-index:1000;display:none;}
      #jr-search.open{display:block;}
      #jr-search .ovl{position:absolute;inset:0;background:rgba(43,39,34,.55);backdrop-filter:blur(3px);}
      #jr-search .box{position:relative;max-width:640px;margin:8vh auto 0;background:var(--paper,#FBF7F1);
        border-radius:18px;box-shadow:0 30px 80px rgba(0,0,0,.35);overflow:hidden;
        animation:jrPop .18s ease;}
      @keyframes jrPop{from{transform:translateY(-8px);opacity:0}to{transform:none;opacity:1}}
      #jr-search .top{display:flex;align-items:center;gap:.7rem;padding:1rem 1.2rem;border-bottom:1px solid var(--line,#E7DBCB);}
      #jr-search .top svg{width:22px;height:22px;color:var(--clay,#C0603A);flex:0 0 auto;}
      #jr-search input{flex:1;border:0;background:transparent;font:500 1.2rem/1.4 var(--body,system-ui);
        color:var(--ink,#2B2722);outline:none;}
      #jr-search .esc{font:700 .7rem/1 var(--body,system-ui);letter-spacing:.08em;color:#9A9082;
        border:1px solid var(--line,#E7DBCB);border-radius:6px;padding:.35rem .5rem;cursor:pointer;}
      #jr-search .results{max-height:62vh;overflow:auto;padding:.5rem;}
      #jr-search .hit{display:block;text-decoration:none;color:inherit;padding:.85rem 1rem;border-radius:12px;}
      #jr-search .hit:hover,#jr-search .hit.active{background:#fff;box-shadow:0 6px 18px rgba(43,39,34,.08);}
      #jr-search .hit .cat{font:700 .66rem/1 var(--body,system-ui);text-transform:uppercase;letter-spacing:.16em;
        color:var(--clay,#C0603A);}
      #jr-search .hit h4{font:500 1.18rem/1.25 var(--display,Georgia,serif);color:var(--ink,#2B2722);margin:.3rem 0 .2rem;}
      #jr-search .hit p{font:400 .92rem/1.45 var(--body,system-ui);color:var(--ink-soft,#5E574E);margin:0;}
      #jr-search .hit mark{background:#F6E2C6;color:inherit;padding:0 .1em;border-radius:3px;}
      #jr-search .empty{padding:2.2rem 1rem;text-align:center;color:var(--ink-soft,#5E574E);font-family:var(--body,system-ui);}
      #jr-search .foot{padding:.6rem 1.2rem;border-top:1px solid var(--line,#E7DBCB);
        font:600 .76rem/1 var(--body,system-ui);color:#9A9082;display:flex;gap:1.2rem;}
      #jr-search .foot kbd{font:inherit;background:#fff;border:1px solid var(--line,#E7DBCB);border-radius:4px;padding:.2rem .4rem;}
    `;
    document.head.appendChild(css);

    var el = document.createElement("div");
    el.id = "jr-search";
    el.innerHTML =
      '<div class="ovl" data-search-close></div>' +
      '<div class="box" role="dialog" aria-modal="true" aria-label="Search articles">' +
        '<div class="top">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>' +
          '<input type="search" id="jr-q" placeholder="Search every article…" autocomplete="off" spellcheck="false" aria-label="Search">' +
          '<span class="esc" data-search-close>ESC</span>' +
        '</div>' +
        '<div class="results" id="jr-results"></div>' +
        '<div class="foot"><span><kbd>↑</kbd><kbd>↓</kbd> to navigate</span><span><kbd>↵</kbd> to open</span><span>Search by Jesus Rest</span></div>' +
      '</div>';
    document.body.appendChild(el);

    el.querySelectorAll("[data-search-close]").forEach(function (c) {
      c.addEventListener("click", close);
    });
    document.getElementById("jr-q").addEventListener("input", function (e) { run(e.target.value); });
    el.addEventListener("keydown", keyNav);
  }

  /* ---------- build index (manifest + live full text) ---------- */
  function build() {
    if (built || building) return Promise.resolve();
    building = true;
    var list = (window.JR_ARTICLES || []).slice();
    // seed docs from manifest immediately (search works even before bodies load)
    docs = list.map(function (a) {
      return { file: a.file, title: a.title, category: a.category || "Articles", blurb: a.blurb || "", body: "" };
    });
    makeFuse();
    // enrich with full text in the background
    return Promise.all(list.map(function (a, i) {
      return fetch(RAW + encodeURIComponent(a.file))
        .then(function (r) { return r.ok ? r.text() : ""; })
        .then(function (t) {
          docs[i].body = t.replace(/[#*_>`\[\]]/g, " ").replace(/\s+/g, " ").slice(0, 6000);
        })
        .catch(function () {});
    })).then(function () { makeFuse(); built = true; building = false; });
  }

  function makeFuse() {
    if (!window.Fuse) return;
    fuse = new Fuse(docs, {
      includeMatches: true, threshold: 0.38, ignoreLocation: true, minMatchCharLength: 2,
      keys: [
        { name: "title", weight: 0.6 },
        { name: "category", weight: 0.15 },
        { name: "blurb", weight: 0.15 },
        { name: "body", weight: 0.25 }
      ]
    });
  }

  function snippet(doc, matches) {
    var bodyM = (matches || []).find(function (m) { return m.key === "body"; });
    if (bodyM && bodyM.indices && bodyM.indices.length) {
      var idx = bodyM.indices.sort(function (a, b) { return (b[1]-b[0])-(a[1]-a[0]); })[0];
      var s = Math.max(0, idx[0] - 50), e = Math.min(doc.body.length, idx[1] + 90);
      var pre = (s > 0 ? "…" : "") + doc.body.slice(s, idx[0]);
      var hit = doc.body.slice(idx[0], idx[1] + 1);
      var post = doc.body.slice(idx[1] + 1, e) + (e < doc.body.length ? "…" : "");
      return esc(pre) + "<mark>" + esc(hit) + "</mark>" + esc(post);
    }
    return esc(doc.blurb || "");
  }
  function esc(s){return (s||"").replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];});}

  /* ---------- run a query ---------- */
  function run(q) {
    var box = document.getElementById("jr-results");
    q = (q || "").trim();
    if (!q) {
      box.innerHTML = featuredList();
      mark(0); return;
    }
    if (!fuse) { box.innerHTML = '<p class="empty">Loading search…</p>'; return; }
    var res = fuse.search(q).slice(0, 12);
    if (!res.length) { box.innerHTML = '<p class="empty">No articles found for “' + esc(q) + '”.</p>'; return; }
    box.innerHTML = res.map(function (r) {
      var d = r.item;
      return '<a class="hit" href="read.html?file=' + encodeURIComponent(d.file) + '">' +
        '<span class="cat">' + esc(d.category) + '</span>' +
        '<h4>' + esc(d.title) + '</h4>' +
        '<p>' + snippet(d, r.matches) + '</p></a>';
    }).join("");
    mark(0);
  }

  function featuredList() {
    var feat = (window.JR_ARTICLES || []).filter(function (a) { return a.featured; });
    if (!feat.length) feat = (window.JR_ARTICLES || []).slice(0, 4);
    return '<p class="empty" style="padding:1rem 1rem .4rem;text-align:left;font-weight:700;letter-spacing:.04em;text-transform:uppercase;font-size:.72rem;color:#9A9082;">Suggested reading</p>' +
      feat.map(function (a) {
        return '<a class="hit" href="read.html?file=' + encodeURIComponent(a.file) + '">' +
          '<span class="cat">' + esc(a.category) + '</span>' +
          '<h4>' + esc(a.title) + '</h4>' +
          '<p>' + esc(a.blurb || "") + '</p></a>';
      }).join("");
  }

  /* ---------- keyboard nav ---------- */
  function mark(i) {
    var hits = document.querySelectorAll("#jr-results .hit");
    hits.forEach(function (h, n) { h.classList.toggle("active", n === i); });
    if (hits[i]) hits[i].scrollIntoView({ block: "nearest" });
  }
  function keyNav(e) {
    var hits = document.querySelectorAll("#jr-results .hit");
    var cur = Array.prototype.findIndex.call(hits, function (h) { return h.classList.contains("active"); });
    if (e.key === "ArrowDown") { e.preventDefault(); mark(Math.min(hits.length - 1, cur + 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); mark(Math.max(0, cur - 1)); }
    else if (e.key === "Enter" && hits[cur]) { window.location.href = hits[cur].getAttribute("href"); }
    else if (e.key === "Escape") { close(); }
  }

  /* ---------- open / close ---------- */
  function open() {
    injectUI();
    document.getElementById("jr-search").classList.add("open");
    document.body.style.overflow = "hidden";
    var q = document.getElementById("jr-q"); q.value = ""; q.focus();
    run("");
    ensureFuse().then(build);
  }
  function close() {
    var s = document.getElementById("jr-search");
    if (s) s.classList.remove("open");
    document.body.style.overflow = "";
  }

  function ensureFuse() {
    if (window.Fuse) return Promise.resolve();
    return new Promise(function (res) {
      var s = document.createElement("script");
      s.src = "https://cdn.jsdelivr.net/npm/fuse.js@7.0.0/dist/fuse.min.js";
      s.onload = function () { makeFuse(); res(); };
      s.onerror = function () { res(); };
      document.head.appendChild(s);
    });
  }

  /* ---------- global triggers ---------- */
  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-search-open]");
    if (t) { e.preventDefault(); open(); }
  });
  document.addEventListener("keydown", function (e) {
    if ((e.key === "k" && (e.metaKey || e.ctrlKey)) ||
        (e.key === "/" && !/INPUT|TEXTAREA/.test((e.target.tagName||"")))) {
      e.preventDefault(); open();
    }
  });

  // Deep-link: open search prefilled from ?q= (powers the SearchAction schema)
  document.addEventListener('DOMContentLoaded', function () {
    var q = new URLSearchParams(location.search).get('q');
    if (!q) return;
    open();
    var i = document.getElementById('jr-q');
    if (i) i.value = q;
    ensureFuse().then(build).then(function () { run(q); });
  });

  window.JRSearch = { open: open, close: close };
})();
