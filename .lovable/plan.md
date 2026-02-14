
# Ramadan Decorative Wire with Dangling Ornaments

Replace the current falling snowflakes with a decorative wire/string of lights hanging from the bottom edge of the navbar, with small Ramadan lanterns, crescent moons, and stars dangling from it.

## Visual Concept

The navbar will have a thin, curved wire (SVG path) running along its bottom edge. From this wire, small ornaments dangle at varying heights with a gentle swinging animation:
- **Lanterns** (stylized Ramadan fanous shapes via SVG)
- **Crescent moons** (☪ or SVG crescents)
- **Stars** (small star shapes)

All in warm gold tones. On hover, individual ornaments glow brighter. The wire itself has small dots of light along it.

## Files to Edit

| File | Change |
|------|--------|
| `src/components/Navbar.tsx` | Remove snowflake system; add a new `RamadanWire` decoration rendered below the navbar content |
| `src/index.css` | Remove snowflake animation; add `ramadan-swing` keyframe for the gentle pendulum sway, and a `ramadan-glow` keyframe for hover glow effect |

## Technical Details

### New CSS animations (`src/index.css`)

- **`ramadan-swing`**: A gentle pendulum-like sway animation (`rotate(-5deg)` to `rotate(5deg)`) applied to each dangling ornament, with staggered delays for natural movement
- **`ramadan-glow`**: A subtle pulsing glow (box-shadow / text-shadow) that activates on hover for interactivity
- Remove the existing `snowfall` keyframe and `.snowflake` class entirely

### Navbar changes (`src/components/Navbar.tsx`)

1. **Remove** the `snowflakes` useMemo and the snow overlay div
2. **Remove** `overflow-hidden` from the nav element (the ornaments need to hang below the navbar)
3. **Add** a new decorative section positioned at the bottom of the navbar, using `absolute bottom-0 left-0 right-0` with `translate-y` to push ornaments below the navbar edge
4. **Ornaments array** defined via `useMemo` with ~8-10 items, each having:
   - A type (lantern, crescent, or star)
   - A horizontal position (spread evenly)
   - A wire length (varying heights)
   - An animation delay (staggered swing)
5. **Each ornament** is rendered as:
   - A thin vertical line (the wire/string) hanging down
   - An SVG or styled div at the bottom representing the ornament shape
   - `transform-origin: top center` so the swing pivots from the wire attachment point
6. **Interactivity**: On hover, ornaments scale up slightly and glow brighter
7. **Color adaptation**: Gold color (`#D4A84B`) when navbar is transparent; slightly darker gold when scrolled (white background) for contrast
8. **A horizontal wire**: A thin line (`border-bottom` or SVG) running across the bottom of the navbar connecting all the hanging points
9. **Hidden on mobile** when the mobile menu is open to avoid visual clutter
10. **Responsive**: Fewer ornaments on smaller screens using responsive classes

### Ornament shapes (inline SVG)
- **Lantern**: A small dome-top rectangle shape with a tiny handle, filled with gold
- **Crescent**: A simple crescent moon path
- **Star**: A 5-point or 4-point star

All rendered as small inline SVGs (roughly 16-24px) for crisp rendering at any size.
