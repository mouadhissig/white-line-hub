

# Redesigned Ramadan Theme

## Overview

Two main changes: (1) Move the navbar ornaments to hang from the top-right corner in an elegant cluster (like the reference image), and (2) add subtle, transparent Ramadan decorations to white background sections throughout the page.

---

## 1. Navbar Ornaments -- Right-Side Cluster

**Current problem:** Ornaments are spread evenly across the full width of the navbar bottom, looking cluttered and unpolished.

**New design:** A small cluster of 4-5 ornaments hanging from the right side of the navbar, positioned between the nav links and the right edge. The arrangement matches the reference image:
- A lantern (center-right)
- A crescent moon
- Two small stars (different sizes)
- Connected by thin wires hanging from a short horizontal line

The ornaments will be positioned using `absolute` inside the navbar container, anchored to the right. They will still swing gently and glow on hover. The horizontal wire spanning the full width will be removed.

**Responsive:** On mobile, the ornaments will be hidden (or reduced to 2-3 smaller ones) to avoid interfering with the hamburger menu.

| File | Change |
|------|--------|
| `src/components/Navbar.tsx` | Replace the full-width wire + 10 ornaments with a compact right-side cluster of ~4-5 ornaments hanging from a short decorative line |

---

## 2. Ramadan Background Decorations on White Sections

Add subtle, semi-transparent Ramadan motifs (crescents, stars, lantern silhouettes) as background decorations on sections with white backgrounds: About, Goals, and Contact.

These will be rendered as absolutely-positioned SVGs with very low opacity (0.03-0.06) placed in corners or edges of each section, giving an elegant, muted Ramadan atmosphere without distracting from content.

| File | Change |
|------|--------|
| `src/components/RamadanDecor.tsx` | New component: reusable background decoration layer with positioned Ramadan SVG motifs |
| `src/components/About.tsx` | Wrap section content with `relative` positioning and add `RamadanDecor` |
| `src/components/Goals.tsx` | Same treatment |
| `src/components/Contact.tsx` | Same treatment |

---

## Technical Details

### Navbar changes (`src/components/Navbar.tsx`)

- Remove the full-width bottom wire and the 10-ornament spread
- Add a new `div` positioned `absolute right-4 top-full` (or similar) containing 4-5 ornaments
- Each ornament hangs from a vertical wire of varying length, arranged in a small cluster spanning roughly 120-150px wide
- Keep the existing SVG components (Lantern, Crescent, Star) -- they look good
- Layout: star -- crescent -- lantern -- star (left to right), with the lantern being the tallest/most prominent
- Keep swing animation and hover glow
- Hide on mobile menu open

### RamadanDecor component (`src/components/RamadanDecor.tsx`)

- Renders 3-5 absolutely-positioned SVG elements (crescents, stars, lanterns) at various corners
- All elements have opacity between 0.03 and 0.06 (very subtle)
- Uses the same gold color `#D4A84B` to maintain thematic consistency
- Sizes range from 80px to 200px for visual variety
- Accepts a `variant` prop to slightly vary placement per section so decorations don't repeat identically
- `pointer-events-none` to avoid interfering with content

### CSS changes (`src/index.css`)

- Keep existing `ramadan-swing` and `ramadan-glow` animations (no changes needed)

