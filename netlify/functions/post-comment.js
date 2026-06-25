// =============================================================
//  Jesus Rest — post-comment function
//  Receives a comment/testimony, runs it through AI moderation,
//  and (if it passes) stores it. Testimonies also notify by email.
//
//  Required environment variables (set in Netlify dashboard):
//    SUPABASE_URL                your project URL
//    SUPABASE_ANON_KEY           anon/public key (verifies the user)
//    SUPABASE_SERVICE_ROLE_KEY   service role key (writes the row)
//    ANTHROPIC_API_KEY           powers the AI moderation
//  Optional:
//    SITE_URL                    e.g. https://jesusrest.com (for email notify)
// =============================================================

const Anthropic = require('@anthropic-ai/sdk');
const { createClient } = require('@supabase/supabase-js');

const MAX_LEN = 5000;

const MODERATION_SYSTEM = `You are the moderator for a warm Christian website's comment and testimony section.
Your ONLY job is to decide whether a submission may be posted publicly.

ALLOW (return "allow"):
- Respectful comments, encouragement, questions, and personal testimonies.
- Sincere, objective theological disagreement and debate — even strong, pointed disagreement
  about ideas, doctrines, interpretations, or the article itself. Robust debate is welcome.
- Honest doubt, lament, or hard questions about God, suffering, or faith.

BLOCK (return "block"):
- Profanity, vulgarity, crude or sexual content.
- Hatred, slurs, bigotry, or attacks on people or groups (race, religion, ethnicity, gender, etc.).
- Personal insults, mockery, name-calling, rudeness, nastiness, or contempt aimed at a person.
- Threats, harassment, or calls for harm.
- Spam, advertising, links to unrelated products, scams, or gibberish.

The line is simple: attack IDEAS freely and respectfully; never attack PEOPLE.
Disagreeing with the website's theology is fine. Being cruel, crude, or hateful is not.

Respond with ONLY a compact JSON object, no other text:
{"decision":"allow"} or {"decision":"block","reason":"<short, kind, specific reason>"}`;

function json(status, obj) {
  return {
    statusCode: status,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(obj),
  };
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });

  // --- env ---
  const { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, ANTHROPIC_API_KEY } = process.env;
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY || !ANTHROPIC_API_KEY) {
    return json(500, { error: 'Server is not configured yet. Missing keys.' });
  }

  // --- parse ---
  let payload;
  try { payload = JSON.parse(event.body || '{}'); }
  catch { return json(400, { error: 'Bad request.' }); }

  const token = (payload.token || '').trim();
  const type = payload.type === 'testimony' ? 'testimony' : 'comment';
  const article_slug = (payload.article_slug || '').toString().slice(0, 300) || null;
  const body = (payload.body || '').toString().trim();

  if (!token) return json(401, { error: 'Please sign in before posting.' });
  if (!body) return json(400, { error: 'Please write something first.' });
  if (body.length > MAX_LEN) return json(400, { error: 'That’s a bit long — please shorten it.' });

  // --- verify the user from their token ---
  const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { data: userData, error: userErr } = await authClient.auth.getUser(token);
  if (userErr || !userData || !userData.user) {
    return json(401, { error: 'Your sign-in expired. Please sign in again.' });
  }
  const user = userData.user;
  const author_name =
    (payload.author_name || '').toString().trim().slice(0, 80) ||
    (user.user_metadata && (user.user_metadata.full_name || user.user_metadata.name)) ||
    (user.email ? user.email.split('@')[0] : 'Friend');

  // --- AI moderation gate ---
  let decision = 'block', reason = 'Could not be checked. Please try again.';
  try {
    const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });
    const msg = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 200,
      system: MODERATION_SYSTEM,
      messages: [{ role: 'user', content: `Submission type: ${type}\n\n"""${body}"""` }],
    });
    const text = (msg.content || []).map((b) => b.text || '').join('').trim();
    const start = text.indexOf('{'), end = text.lastIndexOf('}');
    const parsed = JSON.parse(start >= 0 ? text.slice(start, end + 1) : text);
    decision = parsed.decision === 'allow' ? 'allow' : 'block';
    reason = parsed.reason || 'It didn’t pass our kindness check.';
  } catch (e) {
    return json(502, { error: 'Moderation is briefly unavailable. Please try again in a moment.' });
  }

  if (decision !== 'allow') {
    return json(200, {
      ok: false,
      blocked: true,
      message:
        'We welcome honest, even strong disagreement — but this didn’t pass our check for respect and kindness. ' +
        (reason ? 'Reason: ' + reason.replace(/[.!?]?\s*$/, '') + '. ' : '') +
        'Please reword it and try again.',
    });
  }

  // --- store it ---
  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const row = { type, article_slug, author_id: user.id, author_name, body, status: 'approved' };
  const { data: inserted, error: insErr } = await admin
    .from('entries').insert(row).select().single();
  if (insErr) return json(500, { error: 'Could not save your post. Please try again.' });

  // --- testimonies: notify by email via Netlify Forms (best-effort) ---
  if (type === 'testimony') {
    try {
      const site = (process.env.SITE_URL || `https://${event.headers.host}`).replace(/\/$/, '');
      const form = new URLSearchParams({
        'form-name': 'testimony',
        name: author_name,
        email: user.email || '',
        testimony: body,
      });
      await fetch(site + '/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: form.toString(),
      });
    } catch (_) { /* email is best-effort; the testimony is already saved */ }
  }

  return json(200, { ok: true, entry: { ...row, id: inserted.id, created_at: inserted.created_at } });
};
