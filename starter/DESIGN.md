---
name: Sky Dance Academy — /profil
description: Bold, conventional dance-studio marketing world for the public Sky Dance Academy profile page, sourced from the studio's logo palette.
colors:
  sky-bg: "#ffffff"
  sky-surface: "#f8f5fc"
  sky-ink: "#1c1440"
  sky-body: "#4b3f73"
  sky-primary: "#b0529c"
  sky-primary-deep: "#8a3b83"
  sky-violet: "#4a3b7a"
  sky-navy: "#16204a"
typography:
  display:
    fontFamily: "Baloo 2, sans-serif"
    fontSize: "clamp(1.5rem, 3.5vw, 3rem)"
    fontWeight: 800
    lineHeight: 1.15
    letterSpacing: "normal"
  body:
    fontFamily: "Plus Jakarta Sans, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
rounded:
  pill: "9999px"
  card: "16px"
spacing:
  sm: "12px"
  md: "24px"
  lg: "48px"
  section-y: "80px"
  section-y-sm: "64px"
components:
  button-primary:
    backgroundColor: "{colors.sky-primary}"
    textColor: "#ffffff"
    rounded: "{rounded.pill}"
    padding: "12px 24px"
  button-primary-hover:
    backgroundColor: "{colors.sky-primary-deep}"
    textColor: "#ffffff"
    rounded: "{rounded.pill}"
    padding: "12px 24px"
  button-outline:
    backgroundColor: "transparent"
    textColor: "#ffffff"
    rounded: "{rounded.pill}"
    padding: "12px 24px"
  card-panel:
    backgroundColor: "{colors.sky-surface}"
    textColor: "{colors.sky-body}"
    rounded: "{rounded.card}"
    padding: "32px 24px"
---

# Design System: Sky Dance Academy — /profil

> **Scope.** This system covers only the public `/profil` route and its component folder `src/components/profil-sky-dance/`. It does not apply to the authenticated HR/Payroll SaaS application, which has its own Ecme-template design language. Do not import these tokens or class patterns into `(protected-pages)`.
>
> **Prior world, explicitly rejected.** An earlier build of this same route used a night-sky / star-chart world (dark ink ground, gold constellation motifs, italic Cormorant serif). The user said they disliked it ("kurang suka dengan design itu") and chose a conventional "standar kategori" direction instead. That world has been fully removed from the codebase (`StarField.tsx`, `SkyDivider.tsx`, and the gold constellation hero graphic are deleted). Do not reintroduce night-sky, constellation, gold-accent, or italic-serif language into this system — it describes a rejected direction, not a fallback.

## Overview

**Creative North Star: "Standar Kategori" (Category-Standard Dance Studio)**

The page renders Sky Dance Academy as a bold, immediately-legible conventional dance-studio marketing site: a white/light-lavender base carries the content, a purple-to-magenta gradient marks the hero and final CTA band, and a solid navy carries the navbar, a mid-page statement band, and the footer. Baloo 2 — a bold, rounded display face — sets every heading; Plus Jakarta Sans carries all body copy. There is no abstract or artistic motif; the world reads as "recognizable dance-studio template," which was the user's explicit, second-round direction after rejecting a more artistic night-sky concept. The palette is not a free choice — purple, magenta/pink, and navy are drawn directly from the Sky Dance logo per PRODUCT.md's binding brand commitment.

The page's information architecture — navbar → hero with dual CTA → wave divider → highlight strip → about → program grid → why-us grid → statement/quote band → CTA banner → 3-column footer — is a deliberately borrowed structural convention from a sibling business site (sulita.ideora-tech.com), carried over unchanged from the prior visual world. It is not part of this palette's identity and could reasonably be swapped later without that being a brand violation.

**Verification note.** This palette swap has been checked with `tsc --noEmit`, `eslint`, and a static-source detector pass (all clean), plus manual screenshot inspection at desktop (1440×900) and mobile (390×844). No adversarial finish-review agent round has run against this exact reskin — only against the structural/IA layer before it. Treat this DESIGN.md as accurate to the shipped code, but a full finish-review of the palette/contrast/interaction layer is still outstanding.

**Key Characteristics:**
- White (`#ffffff`) and pale lavender-white (`#f8f5fc`) sections carry the page; three sections break to solid dark navy (`#16204a`) for contrast: navbar, statement band, footer
- One purple-to-magenta gradient (`#4a3b7a` → `#b0529c` → `#8a3b83`) marks exactly two moments — the hero and the final CTA banner — never used as a flat fill anywhere else
- Magenta/pink (`#b0529c`) is the single interactive accent: every CTA, icon badge, focus ring, and price/duration label reuses it
- Cards are opaque white/surface panels with soft shadow and circular tinted icon badges — the opposite of the prior world's translucent, borderless-fill panels
- No kicker/eyebrow lines above any heading; sections lead directly with the Baloo 2 title
- No hard-offset (neobrutalist) shadows anywhere; the only shadow vocabulary is soft, blurred, and color-matched to its element

## Colors

Warm purple-to-magenta identity color against a light, mostly-white ground, with solid navy reserved for high-contrast band sections.

### Primary
- **Sky Magenta** (`#b0529c`): the single interactive/accent color. Used for the solid WhatsApp CTA fill, every icon-badge glyph and its tint, focus ring, text-selection background, scrollbar thumb, program-card "Pemula" tier accent, and duration/price label text. Reserved for action and emphasis — never used as a full-section background outside the two gradient moments below.
- **Sky Magenta Deep** (`#8a3b83`): the hover state of the solid CTA and the end stop of both gradients (hero, CTA banner).
- **Sky Violet** (`#4a3b7a`): the start stop of both gradients and the "Menengah" tier's accent color on program cards.

### Neutral
- **Sky Navy** (`#16204a`): solid fill for exactly three sections — sticky navbar, the mid-page quote/statement band, and the footer — plus the "Mahir" tier's accent color. Never used as a gradient stop or a body-text color.
- **Sky Ink** (`#1c1440`): heading/title text color on light sections (H2/H3, highlight-strip labels).
- **Sky Body** (`#4b3f73`): default paragraph/body-copy color on light sections.
- **Sky Bg** (`#ffffff`): the page base background and icon-badge base.
- **Sky Surface** (`#f8f5fc`): the alternating pale-lavender section background (highlight strip, program cards, "Kenapa Sky Dance") that differentiates a section from pure white without introducing a new hue.

### Named Rules
**The One Accent Rule.** Magenta (`#b0529c`) is the only interactive/emphasis color in the system. A new CTA, icon fill, or emphasis mark reuses it — it never gets a second accent hue.

**The Two-Gradient Rule.** The violet→magenta→magenta-deep gradient appears in exactly two places: the hero and the CTA banner. It marks "this is a major decision point," not a general decorative background; it is never applied to a card, a strip, or the navbar.

## Typography

**Display Font:** Baloo 2 (weights 600/700/800; bold and rounded)
**Body Font:** Plus Jakarta Sans (weights 400–700)

**Character:** A confident, rounded, extrabold display face against a clean geometric sans — the pairing reads as "friendly but assertive template," matching the THESIS of a page that has to be understood at a glance rather than savored.

### Hierarchy
- **Display / H1** (Baloo 2, 800/`font-extrabold`, `text-4xl`→`text-5xl`, tight leading, white): hero headline only, two-line, no italic, no kicker above it.
- **Headline / H2** (Baloo 2, 800/`font-extrabold`, `text-3xl`): every section title ("Tentang Kami", "Program & Tingkat", "Kenapa Sky Dance", CTA banner headline) — color follows the section (`sky-ink` on light sections, white on gradient/navy sections).
- **Title / H3** (Baloo 2, 700/`font-bold`, `text-2xl`): program-tier card titles (e.g. "Kelas Pemula").
- **Statement** (Baloo 2, 700/`font-bold`, `text-2xl`→`text-3xl`, white): the single mid-page quote in the navy statement band.
- **Body** (Plus Jakarta Sans, 400, `text-sm`–`text-base`, relaxed leading): all paragraph copy, `sky-body` on light sections / white-at-80–85% on gradient and navy sections.
- **Label** (Plus Jakarta Sans, 600–700, `text-xs`–`text-sm`, uppercase, `tracking-wide`/`tracking-[0.15em]`–`[0.2em]`): highlight-strip captions, hero sorotan chips, program duration tags, "Kenapa Sky Dance" item titles, footer column headers.

### Named Rules
**The No-Kicker Rule.** No section or hero heading is preceded by an eyebrow/kicker line. Every H1/H2 leads directly with the Baloo 2 title; this was true in the prior world and remains true after the reskin.

## Layout

Single-column, center-anchored marketing page. Sections alternate between a `max-w-6xl` container (navbar, hero, highlight strip, footer) and a narrower `max-w-5xl`/`max-w-2xl` container (program grid, why-us grid, about) for reading-width text blocks. Vertical rhythm: `py-20` (80px) for major sections (program grid, why-us grid, CTA banner, statement band), `py-16` (64px) for hero/footer-top, `py-12` for the about section, `py-8` (32px) for the highlight strip — all with a consistent `px-6` (24px) horizontal gutter.

The hero is the only two-column layout (`lg:grid-cols-[1.1fr_0.9fr]`, collapsing to one column below `lg`), pairing headline+CTA with a circular logo roundel and a soft organic blob shape behind it. A single SVG `WaveDivider` transitions the gradient hero into the white body below it. Every section past the hero is single-column with internal grids: highlight strip is `grid-cols-2 sm:grid-cols-4`, the program-tier grid is `grid-cols-1 sm:grid-cols-3`, "Kenapa Sky Dance" is `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`, and the footer is `grid-cols-1 sm:grid-cols-3`.

This section sequence — navbar, hero, wave divider, highlight strip, about, program grid, why-us grid, statement band, CTA banner, footer — is the borrowed structural convention referenced from the sibling site sulita.ideora-tech.com. It predates and is independent of the palette described here; treat it as swappable IA.

## Elevation & Depth

Mostly flat. Light-section cards (program tiers) get a single soft `shadow-sm` plus a hairline `border-black/5` — the only ambient elevation in the system. The signature depth device is the **colored button shadow**: every WhatsApp CTA carries a soft, blurred shadow tinted to match its own fill color rather than a generic black shadow (magenta-tinted on the solid/navy-context variant, black-tinted on the white "light" variant used against the gradient). The hero's circular logo roundel gets a plain `shadow-2xl` for lift against the gradient. There is no hard-offset/neobrutalist shadow vocabulary anywhere in the build.

### Shadow Vocabulary
- **Solid CTA glow** (`box-shadow: 0 10px 25px -8px rgba(176,82,156,0.6)`): the default/navy-context WhatsApp button, tinting the shadow to the button's own magenta fill.
- **Light CTA glow** (`box-shadow: 0 10px 25px -8px rgba(0,0,0,0.35)`): the white "light" WhatsApp button variant used on the magenta CTA banner, where a magenta-tinted shadow would disappear into the background.
- **Card shadow** (`shadow-sm`): program-tier cards only, paired with a `border-black/5` hairline.
- **Hero roundel** (`shadow-2xl`): the circular logo frame in the hero.

### Named Rules
**The Color-Matched Shadow Rule.** A button's shadow always echoes its own fill (or, when its fill is white, a plain dark shadow) — never a generic unrelated shadow color. This keeps every CTA's glow legible against whatever section background it sits on.

## Shapes

Two form languages by role: **pill** (`rounded-full`) for every clickable CTA, chip, and icon badge, and **soft rectangle** (`rounded-2xl`, 16px) for card panels. Logo roundels (navbar, footer, hero) are fully circular. Borders are thin (1px) and low-opacity (`border-black/5` on cards, `border-white/10` on footer/nav dividers) — never heavy or high-contrast. There is no hard-offset outline/neobrutalist shape language anywhere in the build; corners are soft and shadows are soft-blurred, not sharp-edged.

## Components

### Buttons
- **Shape:** full pill (`rounded-full`, 9999px), `px-6 py-3` default padding (navbar compresses to `px-5 py-2`).
- **Primary (`WhatsAppCta` solid variant):** solid magenta background (`#b0529c`) with white text, `FaWhatsapp` icon + "Hubungi via WhatsApp" label, magenta-tinted glow shadow, hover shifts to `#8a3b83`.
- **Light (`WhatsAppCta` light variant, used on the CTA banner):** white fill, magenta-deep text, black-tinted glow shadow — used specifically where a magenta-tinted shadow would vanish against the magenta gradient background.
- **Outline (hero "Lihat Program" and navbar/mobile menu context):** transparent fill, 2px white border, white text, `hover:bg-white/10`.
- **Hover / Focus:** `hover:scale-[1.03]` transform on all WhatsApp CTAs; `:focus-visible` gets a 2px magenta outline with 2px offset, defined globally on `.sky-profile`.

### Cards / Containers
- **Corner Style:** `rounded-2xl` (16px) on program-tier cards.
- **Background:** opaque pale-surface fill (`--sky-surface`, `#f8f5fc`) — a deliberate reversal of the prior world's translucent panels.
- **Shadow Strategy:** `shadow-sm`, per Elevation & Depth.
- **Border:** 1px near-black at 5% opacity (`border-black/5`).
- **Internal Padding:** `px-6 py-8`, center-aligned content, topped by a circular tier-colored icon badge.

### Navigation
- **Style:** sticky top navbar, solid `bg-[var(--sky-navy)]` (no blur/transparency). Logo is the Sky Dance roundel + bold Baloo 2 wordmark.
- **Typography:** links in body font, white at 80% opacity by default, full white on hover; no underline treatment.
- **Mobile treatment:** hamburger (`HiOutlineMenu`/`HiOutlineX`) toggles a stacked link list plus a centered WhatsApp CTA, sharing the same navy surface as desktop.

### Signature Component: Tier-Colored Icon Badge
Both `ProgramTingkat.tsx` and `KenapaKami.tsx` use the same pattern: a circular badge (`h-11 w-11`/`h-12 w-12`, `rounded-full`) filled with a low-opacity tint of an assigned color (`bg-[var(--sky-primary)]/10` for the generic "why us" grid; a `color-mix(in srgb, {tier-color} 12%, white)` tint keyed per tier — magenta for Pemula, violet for Menengah, navy for Mahir — on the program grid), containing a single Heroicons-outline glyph in the same full-strength color. This is the page's one recurring signature device tying the icon system to the three-tier palette.

## Do's and Don'ts

### Do:
- **Do** keep magenta (`#b0529c`) as the only interactive accent color; every new CTA, icon-fill, or emphasis mark reuses it rather than introducing a new hue.
- **Do** keep the violet→magenta gradient reserved for exactly the hero and the CTA banner — it signals "major decision point," not general decoration.
- **Do** keep Baloo 2 reserved for headings/titles at bold-to-extrabold weight; body copy stays in Plus Jakarta Sans.
- **Do** color-match every button shadow to its own fill (or use a dark shadow for white-fill buttons), matching the existing CTA shadow pattern.
- **Do** treat the section order (navbar → hero → divider → highlight → about → program → why-us → statement → CTA → footer) as a swappable structural convention borrowed from a sibling site, not sacred brand geometry.

### Don't:
- **Don't** reintroduce the night-sky / star-chart / constellation / gold-accent / italic-serif world from the prior build — it was explicitly rejected by the user and fully deleted from the codebase; documenting it here would risk a future session bringing it back.
- **Don't** put a kicker/eyebrow line above section or hero headlines — none exist in the current build; headings lead directly with the Baloo 2 title.
- **Don't** use hard-offset (neobrutalist) shadows or heavy high-contrast outlines anywhere — the system's only shadow vocabulary is soft and blurred, and its only borders are thin, low-opacity hairlines.
- **Don't** use translucent/low-opacity card fills — cards are opaque `--sky-surface` panels in this build, the deliberate opposite of the prior world's translucent panels.
- **Don't** treat the contact details (WhatsApp number, address, hours, email in `data.ts`) or the three program cards' copy as finalized — every value is an explicit `// TODO` placeholder pending real data from the Kursus module.
- **Don't** reuse these `sky-*` tokens or classes inside `(protected-pages)` or anywhere in the authenticated app — this is a self-contained visual world for `/profil` only.
