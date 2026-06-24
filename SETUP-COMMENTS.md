# Setting up Comments & Testimonies (one-time, ~15 minutes)

Everything is already built into your site. To turn it on, you create **two free
accounts** and paste a few keys. Follow these in order. Anywhere you get stuck,
send me a screenshot and I'll walk you through it.

There are **two kinds of keys**:
- **Public keys** — safe to be on the website. You'll paste these into one file.
- **Secret keys** — must stay private. You'll paste these into Netlify only.
  ⚠️ Never put a secret key in a website file, and never paste a secret key into a chat.

---

## STEP 1 — Create a free Supabase account (this is the login + storage)

1. Go to **https://supabase.com** → **Start your project** → sign in with Google or email.
2. Click **New project**. Name it `jesusrest`. Pick any database password (save it
   somewhere). Choose the region closest to you. Click **Create new project** and
   wait ~2 minutes while it sets up.

## STEP 2 — Create the comments table

1. In your new project, click **SQL Editor** (left sidebar) → **New query**.
2. Open the file **`supabase-schema.sql`** (it's in your site files), copy ALL of it,
   paste into the box, and click **Run**. You should see "Success."

## STEP 3 — Turn on email sign-in

1. Left sidebar → **Authentication** → **Providers** → make sure **Email** is enabled.
   (It usually is by default. No password setup needed — visitors get a one-tap link.)
2. Left sidebar → **Authentication** → **URL Configuration**:
   - **Site URL**: `https://jesusrest.com`
   - Under **Redirect URLs**, add `https://jesusrest.com/**` and click **Save**.

## STEP 4 — Copy your Supabase keys

1. Left sidebar → **Project Settings** (gear) → **API**.
2. You'll see (newer projects name them "publishable" / "secret"):
   - **Project URL** — *public* (looks like `https://abcd1234.supabase.co`)
   - **anon / public** (a.k.a. **publishable**, starts `sb_publishable_...`) — *public*
   - **service_role** (a.k.a. **secret**, starts `sb_secret_...`) — **SECRET**
     (click "reveal"; keep this private)

---

## STEP 5 — Create a free Anthropic key (this powers the AI moderation)

1. Go to **https://console.anthropic.com** → sign up / sign in.
2. Left sidebar → **API Keys** → **Create Key**. Name it `jesusrest-moderation`.
3. Copy the key (starts with `sk-ant-...`). This is **SECRET**.
   - New accounts come with free trial credit. Moderation uses the small, cheap model,
     and only logged-in people can post — so usage stays tiny (fractions of a cent each).

---

## STEP 6 — Put the PUBLIC keys on the site

Open **`assets/js/jr-config.js`** and paste your two **public** values between the quotes:

```js
window.JR_CONFIG = {
  SUPABASE_URL: "https://abcd1234.supabase.co",   // your Project URL
  SUPABASE_ANON_KEY: "eyJhbGci...your anon key..." // your anon/public key
};
```

Save the file. (You can send me these two **public** values and I'll do this for you —
they're safe to share. Do NOT send the secret keys.)

## STEP 7 — Put the SECRET keys in Netlify

1. Go to your site on **https://app.netlify.com** → **Site configuration** →
   **Environment variables** → **Add a variable** (add each one):

   | Key | Value |
   |-----|-------|
   | `SUPABASE_URL` | your Project URL (same as above) |
   | `SUPABASE_ANON_KEY` | your **publishable** key (`sb_publishable_...`) |
   | `SUPABASE_SERVICE_ROLE_KEY` | your **secret** key (`sb_secret_...`) |
   | `ANTHROPIC_API_KEY` | your **sk-ant-...** secret key |

2. Click **Save**.

## STEP 8 — Publish the updated site

Upload the whole site (with the new `netlify/` folder and `netlify.toml`) to GitHub the
same way you did last time. Netlify will rebuild and switch the comments on automatically.

## STEP 9 — Send testimonies to your inbox

1. After the site rebuilds, in Netlify go to **Forms**. You'll see a form named
   **`testimony`**.
2. Open it → **Settings & notifications** → **Add notification** → **Email notification**
   → enter **jesusrest101@gmail.com** → save.
   Now every testimony that passes moderation also lands in your inbox.

---

## How it works once it's on

- A visitor clicks into a comment box, enters their email, and gets a one-tap sign-in
  link — no password. (Works for all ages.)
- When they post, the words are checked by AI **first**. Respectful comments and even
  strong, honest disagreement go through. Profanity, hatred, insults, and nastiness are
  blocked with a kind "please reword" message.
- Approved posts appear instantly under the article, and testimonies also show on the
  **Testimonies** page and email you.
- You can always open Supabase → **Table Editor** → `entries` to read or delete anything
  by hand.

That's it. If anything looks off, screenshot it and I'll fix it.
