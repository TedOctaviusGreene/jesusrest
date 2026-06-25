# Jesus Rest — project notes for Claude

## Share cards & all public copy — WRITING RULES (locked by Charles)

These govern the share-card studio (`share-card.html`) and any public-facing copy.

1. **No fragments. Full sentences, full thoughts.** Humans dislike fragments — they
   read and sound strange. Every line should be a complete, concrete thought.
2. **Context is everything.** Never let a word or idea float without having been
   introduced. If something hasn't been set up earlier in the piece, don't reference
   it as if it has. (Example of what NOT to do: ending a card with the bare word
   "free" hanging with no sentence around it.)
3. **Concrete, not abstract.** If it sounds too abstract or "trying to be clever,"
   it loses credibility. Plain and clear beats cool every time.
4. **Let the Bible carry its own weight, clearly.** The aim is to let Scripture speak
   plainly and forcefully — not to sound poetic or vague. Sharp truth that makes the
   reader curious enough to go read the full article. Never platitudes.
5. **Cards are a progressive timeline / argument.** Order the slides so each one is
   set up by the one before it; reveal things in the order they actually happen or
   make logical sense. Don't mention a consequence (e.g. the fire) before its setup
   (e.g. the fair chance to learn).
6. **Name the subject; don't lean on pronouns.** Say "God," "Christ," "the gospel,"
   "the gatekeepers" — not a vague "He," "it," "they" that the reader has to resolve.
   Redundancy is fine. The goal is teaching, so clarity beats elegance every time.
7. **Self-edit on every pass.** After writing each line, ask: "Can this be clearer?
   Can it sound better?" Rewrite until it does. Then read the whole card top to
   bottom and ask: "Does this make sense as one piece?" Charles writes well and has
   a sharp ear — match it; make the copy sound genuinely good, not just correct.

## Share-card studio style specs (current)
- Headline (`.big`) animates in FIRST, then kicker, sub, reference cascade.
- Headline is the largest; the **kicker (top)** and **Scripture reference (bottom)**
  are sized up for readability — keep the bottom reference comfortably large.
- `.big.link` is a smaller size so URLs (e.g. JesusRest.com/die) never clip.
- Pace ~5.4s per slide so each line can be read.
- Slide 1 kicker = `JesusRest.com`. Last slide shows a real, clean article link
  (e.g. `JesusRest.com/die`) wired via a redirect in `_redirects` (placed ABOVE the
  `/* /:splat 200!` catch-all).
- Workflow: build one card at a time, send Charles a standalone preview HTML to
  watch, get approval, THEN lock into `share-card.html`.

## Theology / standards (already applied site-wide)
- Capitalize divine pronouns (He, Him, His). Never name specific churches/denominations.
- Salvation is a free gift that cannot be lost; reward/inheritance (reigning in the
  thousand-year Kingdom — throne, crown, new name) is conditioned and can be missed.
- The Great White Throne comes AFTER the thousand-year reign; that judgment is a
  period of time in which the dead are raised, taught, and offered Christ — a fair
  chance by grace; the Book of Life stays open. Only those who refuse Christ after
  the truth is fully revealed face the second death (a final death/annihilation,
  not endless torture). No one is condemned without a full, fair offer.
- Say "person," not "soul." Bible-only method: Scripture interprets Scripture.

## Publishing
- GitHub app is read-only on the repo; Charles publishes by uploading the
  whole-site ZIP to GitHub (Netlify auto-deploys). Build packages accordingly.
