/* =============================================================
   Jesus Rest — Comments & Testimonies widget
   Requires: jr-config.js  and  supabase-js (loaded on the page).
   Mount by placing an element like:
     <div id="jr-comments" data-type="comment" data-slug="my-article.md"></div>
     <div id="jr-comments" data-type="testimony"></div>
   ============================================================= */
(function () {
  var mount = document.getElementById('jr-comments');
  if (!mount) return;

  var cfg = window.JR_CONFIG || {};
  var TYPE = mount.getAttribute('data-type') === 'testimony' ? 'testimony' : 'comment';
  var SLUG = mount.getAttribute('data-slug') || null;
  var NOUN = TYPE === 'testimony' ? 'testimony' : 'comment';

  function esc(s) {
    return (s || '').replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function fmt(ts) {
    try { return new Date(ts).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }); }
    catch (e) { return ''; }
  }

  // --- not configured yet: fail gently, don't break the page ---
  if (!cfg.SUPABASE_URL || !cfg.SUPABASE_ANON_KEY || !window.supabase) {
    mount.innerHTML = '<div class="jr-c-wrap"><p class="jr-c-soft">Comments are being set up and will be here soon.</p></div>';
    return;
  }

  var sb = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
  var session = null;

  mount.innerHTML =
    '<div class="jr-c-wrap">' +
      '<div class="jr-c-auth" id="jr-c-auth"></div>' +
      '<form class="jr-c-form" id="jr-c-form" hidden>' +
        '<textarea id="jr-c-body" rows="4" maxlength="5000" placeholder="' +
          (TYPE === 'testimony'
            ? 'Share what Christ has done — your testimony…'
            : 'Share a thought, a question, or respectful disagreement…') +
        '"></textarea>' +
        '<div class="jr-c-row">' +
          '<span class="jr-c-note" id="jr-c-note"></span>' +
          '<button type="submit" class="btn btn-primary" id="jr-c-send">Post ' + NOUN + '</button>' +
        '</div>' +
      '</form>' +
      '<div class="jr-c-list" id="jr-c-list"><p class="jr-c-soft">Loading…</p></div>' +
    '</div>';

  var authEl = document.getElementById('jr-c-auth');
  var formEl = document.getElementById('jr-c-form');
  var bodyEl = document.getElementById('jr-c-body');
  var noteEl = document.getElementById('jr-c-note');
  var sendEl = document.getElementById('jr-c-send');
  var listEl = document.getElementById('jr-c-list');

  function note(msg, kind) {
    noteEl.textContent = msg || '';
    noteEl.className = 'jr-c-note' + (kind ? ' ' + kind : '');
  }

  function renderAuth() {
    if (session && session.user) {
      var who = (session.user.user_metadata && (session.user.user_metadata.full_name || session.user.user_metadata.name)) ||
                (session.user.email ? session.user.email.split('@')[0] : 'Friend');
      authEl.innerHTML =
        '<div class="jr-c-signed">Posting as <strong>' + esc(who) + '</strong> · ' +
        '<button type="button" class="jr-c-link" id="jr-c-out">Sign out</button></div>';
      document.getElementById('jr-c-out').addEventListener('click', function () {
        sb.auth.signOut().then(function () { session = null; renderAuth(); });
      });
      formEl.hidden = false;
    } else {
      authEl.innerHTML =
        '<div class="jr-c-signin">' +
          '<p class="jr-c-soft">Sign in to post — we’ll email you a one-tap sign-in link. No password.</p>' +
          '<div class="jr-c-row">' +
            '<input type="email" id="jr-c-email" placeholder="you@email.com" aria-label="Email address">' +
            '<button type="button" class="btn btn-ghost" id="jr-c-link">Email me a link</button>' +
          '</div>' +
          '<span class="jr-c-note" id="jr-c-msg"></span>' +
        '</div>';
      formEl.hidden = true;
      document.getElementById('jr-c-link').addEventListener('click', function () {
        var email = (document.getElementById('jr-c-email').value || '').trim();
        var msg = document.getElementById('jr-c-msg');
        if (!email) { msg.textContent = 'Please enter your email.'; return; }
        msg.textContent = 'Sending…';
        sb.auth.signInWithOtp({
          email: email,
          options: { emailRedirectTo: window.location.href }
        }).then(function (r) {
          msg.textContent = r.error ? ('Hmm: ' + r.error.message) : 'Check your inbox for the sign-in link ✉️';
        });
      });
    }
  }

  function renderList(rows) {
    if (!rows || !rows.length) {
      listEl.innerHTML = '<p class="jr-c-soft">' +
        (TYPE === 'testimony' ? 'Be the first to share what Christ has done.' : 'No comments yet — be the first.') +
        '</p>';
      return;
    }
    listEl.innerHTML = rows.map(function (e) {
      return '<div class="jr-c-item">' +
        '<div class="jr-c-head"><span class="jr-c-name">' + esc(e.author_name) + '</span>' +
        '<span class="jr-c-date">' + fmt(e.created_at) + '</span></div>' +
        '<p class="jr-c-text">' + esc(e.body).replace(/\n/g, '<br>') + '</p></div>';
    }).join('');
  }

  function load() {
    var q = sb.from('entries').select('author_name,body,created_at')
      .eq('type', TYPE).eq('status', 'approved').order('created_at', { ascending: false }).limit(200);
    if (TYPE === 'comment') q = q.eq('article_slug', SLUG);
    q.then(function (r) {
      if (r.error) { listEl.innerHTML = '<p class="jr-c-soft">Couldn’t load just now.</p>'; return; }
      renderList(r.data);
    });
  }

  formEl.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var text = (bodyEl.value || '').trim();
    if (!text) { note('Please write something first.'); return; }
    if (!session) { note('Please sign in first.'); return; }
    sendEl.disabled = true; note('Checking & posting…');
    fetch('/.netlify/functions/post-comment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: session.access_token, type: TYPE, article_slug: SLUG, body: text
      })
    }).then(function (r) { return r.json().then(function (j) { return { status: r.status, j: j }; }); })
      .then(function (res) {
        sendEl.disabled = false;
        var j = res.j || {};
        if (j.ok) {
          bodyEl.value = '';
          note(TYPE === 'testimony' ? 'Thank you — your testimony is posted 🙏' : 'Posted — thank you!', 'ok');
          load();
        } else if (j.blocked) {
          note(j.message || 'That didn’t pass our kindness check. Please reword and try again.', 'warn');
        } else {
          note(j.error || 'Something went wrong. Please try again.', 'warn');
        }
      }).catch(function () { sendEl.disabled = false; note('Network hiccup. Please try again.', 'warn'); });
  });

  // init: pick up any session (incl. one just created from a magic-link click)
  sb.auth.getSession().then(function (r) { session = r.data.session; renderAuth(); });
  sb.auth.onAuthStateChange(function (_e, s) { session = s; renderAuth(); });
  load();
})();
