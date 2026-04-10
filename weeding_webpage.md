# Building a bilingual, password-protected wedding website for zero dollars

**The optimal stack is Astro + Cloudflare Pages + Google Sheets via Apps Script + StatiCrypt**, delivering a bilingual Croatian/English wedding site with RSVP functionality, password protection, and "coming soon" placeholders — all completely free. This combination provides genuine AES-256 encryption, unlimited hosting bandwidth, a familiar Google Sheets dashboard for managing RSVPs, and built-in i18n routing with zero JavaScript shipped to guests' browsers.

The rest of this report walks through every architectural decision, compares the alternatives, and ends with a step-by-step build plan.

---

## What the best wedding platforms do (and how to replicate it)

Joy (WithJoy), Zola, and The Knot dominate the wedding website market, and all three are free. Their RSVP systems share a common flow: guests visit the site, navigate to the RSVP page, type their name, get matched against a pre-loaded guest list, and then see only the events they're invited to. **Joy's "Smart RSVP" system** is the gold standard — it supports conditional event visibility, household grouping (one person RSVPs for their family), selective plus-one controls, and real-time notifications.

Standard sections across all major platforms include Home, Our Story, Details/Schedule, RSVP, Travel & Accommodations, Registry, Wedding Party, Photos, and FAQ. The reason to build custom rather than use these platforms is twofold: none offer native bilingual support with a language toggle, and all constrain design freedom within their template systems.

Analysis of **70,000+ real wedding RSVP questions** reveals a clear hierarchy. Nearly 48% of questions relate to catering (meal selection, allergies, dietary restrictions). The six most common questions are attendance confirmation (98% marked required), food allergies, dietary requirements, accessibility needs, transportation needs, and a message for the couple. **The minimum effective RSVP form needs just four questions**: attendance, dietary requirements, allergies, and a message. Song requests and plus-one details round out the top additions.

For handling plus-ones, the industry standard is a **closed-list / invite-only model** where only pre-authorized guests can RSVP. Guests granted a plus-one see an additional name field; others see "We have reserved _X_ seat(s) in your honor." For a custom-built site targeting ~100–200 guests, an open form with manual review works well enough — the password gate already filters out strangers.

---

## Hosting: Cloudflare Pages wins on every metric

Four platforms offer genuinely free static hosting, but they differ significantly in what matters for a wedding site:

| Platform | Bandwidth | Forms | Functions | Password protection |
|---|---|---|---|---|
| **Cloudflare Pages** | **Unlimited** | ❌ | 100K req/day | Via Workers (free) |
| Netlify | 100 GB/mo | 100 submissions/mo | 125K invocations/mo | Pro only ($19/mo) |
| Vercel | 100 GB/mo | ❌ | Limited | Enterprise only |
| GitHub Pages | 100 GB/mo (soft) | ❌ | ❌ | ❌ |

**Cloudflare Pages is the clear winner.** Unlimited bandwidth means a photo-heavy wedding site costs nothing regardless of traffic. The **500 free builds per month** and 100,000 daily function requests far exceed what any wedding site needs. Custom domains with automatic HTTPS are included. Global CDN with 300+ edge locations ensures fast loading for guests anywhere — relevant for a Croatian/English bilingual audience that likely spans countries.

Netlify's free tier is the runner-up, particularly attractive for its built-in form handling (100 submissions/month, zero-config). But its password protection requires the $19/month Pro plan, and its post-September 2025 credit-based pricing muddies the free tier story. GitHub Pages works but offers no server-side capabilities — no functions, no forms, no middleware.

---

## Password protection: StatiCrypt provides real encryption for free

For a wedding site, the threat model is simple: prevent random internet visitors from seeing wedding details. You're not protecting state secrets. With that context, here are the viable free approaches ranked:

**StatiCrypt (recommended)** uses AES-256 encryption with PBKDF2 key stretching (600,000 iterations per OWASP guidelines) to encrypt entire HTML files client-side. The output is a self-contained HTML page containing only the encrypted ciphertext and a password prompt. Without the correct password, the content literally does not exist in readable form — it's not "hidden behind JavaScript" but genuinely encrypted. Key features include recursive directory encryption for multi-page sites, a customizable password page that can match your wedding theme, a "Remember me" checkbox using localStorage, and "magic links" that embed the password in the URL fragment (never sent over the network). Setup is one CLI command: `staticrypt index.html -p "your-password"`.

The main limitation is that **CSS, JavaScript, and images are not encrypted** unless inlined into the HTML. For a wedding site, this is acceptable — venue photos without context aren't sensitive. If full protection is needed, Cloudflare Pages Functions middleware provides true server-side authentication at the edge for free (100K requests/day), but requires writing ~30 lines of middleware code and restricts you to Cloudflare hosting.

Simple client-side JavaScript checks (comparing against a hardcoded password) are trivially bypassable via View Source and offer no real security. Netlify's built-in password protection is server-side and polished but costs $19/month. **StatiCrypt on Cloudflare Pages** is the sweet spot: genuine encryption, zero cost, works on any host.

---

## RSVP data collection: Google Sheets via Apps Script is unbeatable

The core requirement is simple: guests submit a form, and the couple sees responses in an easy-to-use dashboard. Here's how the options stack up for ~100–200 expected guests:

**Google Sheets via Apps Script** is the top recommendation for several reasons. It's completely free with no submission limits. The couple manages RSVPs in Google Sheets — a tool most people already know — with full sorting, filtering, and formula support. The setup involves writing a small `doPost()` function in Google Apps Script that accepts form data and appends rows to a sheet, then deploying it as a web app. Email notifications can be coded directly into the script via `MailApp.sendEmail()`. Duplicate prevention can be implemented by checking for existing names before inserting. Multiple open-source templates exist on GitHub (notably `nequals30/googleAppsScriptRSVP` with invite-code validation and `MrHasuu/google-sheets-rsvp`).

The core Apps Script code is minimal:

```javascript
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSheet();
  sheet.appendRow([
    e.parameter.name, e.parameter.attending,
    e.parameter.guests, e.parameter.dietary,
    e.parameter.message, new Date()
  ]);
  MailApp.sendEmail("you@email.com", "New RSVP!", 
    e.parameter.name + " responded: " + e.parameter.attending);
  return ContentService.createTextOutput(
    JSON.stringify({status: "success"})
  ).setMimeType(ContentService.MimeType.JSON);
}
```

The tradeoff is a ~30–60 minute setup requiring basic JavaScript comfort. For couples already building a custom site, this is trivial.

**Formspree** (50 submissions/month free) and **Netlify Forms** (100 submissions/month free) are simpler alternatives but impose limits that could be constraining. **Google Forms** works instantly but looks distinctly like a Google product when embedded — undermining the custom design. **Firebase and Supabase** are overkill: Firebase's console is developer-oriented and unfriendly for non-technical RSVP review, while Supabase's free-tier projects pause after 7 days of inactivity — a critical problem if RSVPs trickle in over weeks.

---

## The bilingual challenge: Croatian and English on a static site

Building a Croatian/English toggle requires two decisions: where translations live and how they're served. For a password-protected wedding site, SEO is irrelevant (add `<meta name="robots" content="noindex">`), which simplifies the architecture considerably.

**With Astro (recommended stack)**, i18n is built-in since version 4.0. Configure `locales: ['en', 'hr']` in `astro.config.mjs`, and Astro automatically generates `/en/` and `/hr/` URL prefixes. Translation strings live in a typed `src/i18n/ui.ts` file, and helper functions (`getLangFromUrl`, `useTranslations`) are provided. Each page exists once per language in `src/pages/en/` and `src/pages/hr/`, sharing layouts and components. The language toggle links between `/en/rsvp` and `/hr/rsvp`.

**With plain HTML/CSS/JS**, the `data-i18n` attribute pattern works cleanly. Store translations in `en.json` and `hr.json`, tag elements with `data-i18n="section.key"`, and use a ~30-line script to swap text on toggle. Default-language text lives directly in the HTML as a fallback. localStorage remembers the guest's preference.

**Croatian-specific requirements** are straightforward but easy to overlook. UTF-8 encoding is mandatory (`<meta charset="UTF-8">`). Croatian uses five special characters — **č, ć, đ, š, ž** — from the Latin Extended-A Unicode block. When choosing decorative wedding fonts, always verify they include this block. Safe choices from Google Fonts include Playfair Display, Cormorant Garamond, Lora, and Montserrat (all support Latin Extended). Test by rendering "Čćđšž ČĆĐŠŽ" in every font before committing. Set `lang="hr"` on Croatian content for proper text rendering and hyphenation.

For the **language toggle UX**, place an "EN | HR" text toggle in the top-right corner of the navigation. Text labels are preferred over flag icons — flag-to-language mapping is ambiguous (UK vs US flag for English? Croatian flag for the Croatian language specifically?). Store the preference in localStorage so returning guests see their chosen language immediately.

---

## Why Astro is the right framework

The site needs component reuse (shared nav, footer, layout), bilingual routing, form handling, password protection compatibility, and zero unnecessary complexity. Here's how the contenders compare:

**Astro** outputs pure static HTML with **zero JavaScript by default**. Its `.astro` component format is essentially HTML with a frontmatter block for logic — the learning curve is minimal for anyone who knows HTML. Built-in i18n routing, one-command Tailwind integration (`npx astro add tailwind`), and deployment to any static host via a simple `astro build` command make it the ideal middle ground between plain HTML (too repetitive) and React/Vue (too heavy). Astro has **55,000+ GitHub stars** and 800K+ weekly npm downloads — it's mature, well-documented, and actively maintained.

**Plain HTML/CSS/JS** is the minimal alternative. Zero tooling, zero build step, deploy anywhere. But for a bilingual 5–7 page site, the lack of layouts and partials means duplicating the navigation, footer, and head across every page and language. Manageable but tedious.

**React, Vue, and Svelte** are all overkill. React ships ~40KB gzipped of runtime JavaScript for a site that needs none. Next.js adds build complexity, routing abstractions, and framework opinions that provide no value for a content-focused wedding site. Hugo has excellent i18n but Go template syntax (`{{ if eq .PageNumber 1 }}`) is unintuitive for most web developers.

---

## Recommended RSVP form questions

Based on analysis of real wedding RSVP data and platform best practices, here's the recommended form structure for a ~100–200 guest wedding:

- **Full name** (text input, required) — identifies the guest
- **Attendance** (radio: Yes / No, required) — the core question
- **Number of guests** (number input, shown only if attending) — for plus-ones
- **Guest names** (text input, shown if guests > 1) — for seating and place cards
- **Dietary restrictions** (text input, optional) — allergies, vegetarian, halal, etc.
- **Song request** (text input, optional) — fun engagement question that guests enjoy
- **Message for the couple** (textarea, optional) — personal touch

Keep the form to **5–7 fields maximum**. Use progressive disclosure: meal choice, guest names, and dietary fields only appear after selecting "Yes" for attendance. Design mobile-first with single-column layout, large tap targets for radio buttons, and minimal free-text typing (use dropdowns where possible). Match the form's visual design to the rest of the site — this is where Google Forms falls short and a custom form excels.

---

## Complete architecture and build plan

### Architecture overview

```
┌─────────────────────────────────────────────┐
│                 Guests                       │
│          (mobile + desktop)                  │
└──────────────┬──────────────────────────────┘
               │ HTTPS
┌──────────────▼──────────────────────────────┐
│         Cloudflare Pages CDN                 │
│    (unlimited bandwidth, global edge)        │
│                                              │
│  StatiCrypt-encrypted HTML files             │
│  ├── /en/index.html (encrypted)              │
│  ├── /hr/index.html (encrypted)              │
│  ├── /en/rsvp.html  (encrypted)              │
│  └── ...                                     │
└──────────────┬──────────────────────────────┘
               │ fetch() POST on form submit
┌──────────────▼──────────────────────────────┐
│       Google Apps Script Web App             │
│   (doPost → append row → send email)         │
└──────────────┬──────────────────────────────┘
               │
┌──────────────▼──────────────────────────────┐
│          Google Sheets                       │
│  (RSVP dashboard for the couple)             │
│  Name | Attending | Guests | Diet | Song     │
└─────────────────────────────────────────────┘
```

### Project structure

```
wedding-site/
├── astro.config.mjs          # i18n config, Tailwind
├── src/
│   ├── i18n/
│   │   ├── ui.ts             # All translation strings (EN + HR)
│   │   └── utils.ts          # getLangFromUrl, useTranslations
│   ├── layouts/
│   │   └── Layout.astro      # Base HTML, nav, footer, meta
│   ├── components/
│   │   ├── Nav.astro          # Navigation with language toggle
│   │   ├── LanguageToggle.astro
│   │   ├── RsvpForm.astro     # RSVP form with client-side JS
│   │   ├── ComingSoon.astro   # Placeholder for unreleased sections
│   │   └── Countdown.astro    # Optional wedding countdown
│   └── pages/
│       ├── en/
│       │   ├── index.astro    # Home
│       │   ├── our-story.astro
│       │   ├── details.astro  # Venue, schedule, map
│       │   ├── rsvp.astro
│       │   ├── travel.astro   # Coming soon placeholder
│       │   └── registry.astro # Coming soon placeholder
│       └── hr/
│           ├── index.astro
│           ├── nasa-prica.astro
│           ├── detalji.astro
│           ├── rsvp.astro
│           ├── putovanje.astro
│           └── registar.astro
├── public/
│   └── images/
├── tailwind.config.mjs
├── package.json
└── staticrypt.config.json     # StatiCrypt settings
```

### Step-by-step build plan

**Phase 1: Foundation (Day 1–2)**

1. Scaffold the project: `npm create astro@latest wedding-site` → select empty template, add Tailwind via `npx astro add tailwind`
2. Configure i18n in `astro.config.mjs`: set `locales: ['en', 'hr']`, `defaultLocale: 'en'`, `routing: { prefixDefaultLocale: false }`
3. Create `src/i18n/ui.ts` with all translation strings organized by section (nav, home, story, details, rsvp, travel, registry)
4. Build `Layout.astro` with responsive HTML skeleton, meta tags, font imports (verify Croatian character support), and `lang` attribute from Astro's locale
5. Build `Nav.astro` with section links and `LanguageToggle.astro` ("EN | HR" in header)
6. Create all page files in both `/en/` and `/hr/` directories, initially with placeholder content

**Phase 2: Content & design (Day 3–5)**

7. Design the visual theme — typography (Playfair Display for headings, Lora for body — both support Latin Extended-A), color palette, photo treatments
8. Build each section: Home (hero image, names, date, countdown), Our Story (timeline), Details (venue info, Google Maps embed, schedule)
9. Implement `ComingSoon.astro` component for Travel and Registry sections — config-driven with a boolean flag in `ui.ts` so these can be "turned on" later by changing one value
10. Ensure full mobile responsiveness: single-column layout below 768px, hamburger nav, touch-friendly tap targets

**Phase 3: RSVP system (Day 5–6)**

11. Create a Google Sheet with columns: Timestamp, Name, Attending, NumberOfGuests, GuestNames, DietaryRestrictions, SongRequest, Message
12. Write the Apps Script `doPost()` function (see code above), add email notification via `MailApp.sendEmail()`
13. Deploy the script as a web app (Execute as: Me, Access: Anyone)
14. Build `RsvpForm.astro` with bilingual labels, progressive disclosure (show guest details only when "Yes" is selected), and `fetch()` POST to the Apps Script URL
15. Add client-side validation, submit button disable on click (prevent double submissions), and a success/error message in the current language
16. Test the complete flow: fill form → data appears in Google Sheet → email notification arrives

**Phase 4: Password protection (Day 6–7)**

17. Install StatiCrypt: `npm install -g staticrypt`
18. Run `astro build` to generate static files in `dist/`
19. Run `staticrypt dist/**/*.html -r -p "your-wedding-password"` to recursively encrypt all HTML files
20. Customize the StatiCrypt password page template to match the wedding theme (wedding colors, couple's names, a brief "Enter the password from your invitation" message in both languages)
21. Enable "Remember me" so guests don't re-enter the password on return visits
22. Add the StatiCrypt step to a build script in `package.json`: `"build": "astro build && staticrypt dist/**/*.html -r -p $PASSWORD --template-title 'Wedding' --template-instructions 'Enter the password from your invitation'"`

**Phase 5: Deploy (Day 7)**

23. Create a Cloudflare Pages project connected to the GitHub repository
24. Set the build command to `npm run build` and output directory to `dist/`
25. Store the password as an environment variable in Cloudflare's dashboard
26. Configure the custom domain (if purchased — optional, the `*.pages.dev` subdomain works fine)
27. Deploy and test the full flow: visit site → see password prompt → enter password → browse bilingual site → submit RSVP → verify data in Google Sheet

**Phase 6: Pre-wedding updates**

28. When Travel and Registry content is ready, flip the config flags in `ui.ts` from `enabled: false` to `enabled: true` and push — Cloudflare auto-deploys
29. Include the site URL and password on printed invitations, optionally as a QR code
30. Monitor RSVPs in Google Sheets; send reminders to non-responders 2–3 weeks before the deadline

### Total cost: $0

Every component of this stack is free. Cloudflare Pages has unlimited bandwidth. Google Sheets and Apps Script are free. Astro and StatiCrypt are open-source. The only optional cost is a custom domain (~$10–15/year), which is not required — the `your-site.pages.dev` URL works perfectly and can be printed on invitations. This architecture will comfortably handle a wedding site for 12+ months with zero ongoing costs.