# Design System Document: The Neon Pulse

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Kinetic Stage."** 

Unlike traditional streaming platforms that feel like static libraries, this system treats the interface as a living, breathing performance. We break the "template" look by rejecting the rigid grid in favor of **Intentional Overlap**. Elements do not simply sit next to each other; they float, stack, and bleed, creating a sense of deep immersion. By utilizing high-contrast typography scales and glassmorphic depth, we ensure the content—the video stream—is never fully obscured, even when the UI is at its most active.

## 2. Colors & Surface Philosophy
The palette is rooted in an ultra-deep obsidian base, punctuated by high-frequency electric accents that mimic the glow of a live concert or a high-end gaming rig.

### The "No-Line" Rule
**Borders are prohibited for sectioning.** To define a sidebar or a chat container, use a background shift. For example, a chat window should use `surface_container_low` sitting on the `background` (#0b0e14). Boundaries must be felt, not seen.

### Surface Hierarchy & Nesting
We create depth through "Tonal Stacking." Avoid flat layouts by nesting containers using the following logic:
*   **Base Layer:** `surface` (#0b0e14) – The infinite void of the background.
*   **Secondary Layer:** `surface_container` (#161a21) – Main content areas (e.g., Video Feed).
*   **Tertiary Layer:** `surface_container_high` (#1c2028) – Interactive panels (e.g., Chat, Playlist).
*   **Floating Layer:** `surface_container_highest` (#22262f) – Modals and pop-overs.

### The "Glass & Gradient" Rule
To achieve a signature high-end feel, all overlays (video controls, chat bubbles, avatar pickers) must use **Glassmorphism**. Combine `surface_variant` (#22262f) at 60% opacity with a `backdrop-filter: blur(24px)`. 

For Primary CTAs, use a **Signature Texture**: A linear gradient from `primary_dim` (#9146ff) to `primary` (#c19cff) at a 135-degree angle. This provides a "liquid light" effect that flat colors cannot replicate.

## 3. Typography: The Editorial Voice
We utilize a high-contrast pairing: **Space Grotesk** for high-energy branding/headlines and **Manrope** for rapid-fire readability.

*   **The Power Scale:** Use `display-lg` (3.5rem) for stream titles or major event announcements. The tight tracking of Space Grotesk creates an authoritative, editorial "poster" feel.
*   **The Utility Scale:** Use `body-md` (0.875rem) for chat messages. Manrope’s generous x-height ensures legibility even when the chat is scrolling at high speeds on mobile devices.
*   **Hierarchy Note:** Always lead with `headline-lg` for section headers, but keep `label-sm` in `secondary` (#00e3fd) for metadata (e.g., "LIVE," "10.2k Viewers") to provide a "heads-up display" (HUD) aesthetic.

## 4. Elevation & Depth
We reject the standard Material shadow. Depth is organic and atmospheric.

*   **The Layering Principle:** Achieve lift by placing a `surface_container_lowest` (#000000) card inside a `surface_container_high` (#1c2028) area. This "inverted lift" creates a sophisticated, recessed look for input fields.
*   **Ambient Shadows:** For floating elements like Avatar Selectors, use a shadow with a 40px blur, 4% opacity, using the `primary` (#c19cff) color as the shadow tint. This mimics the glow of a neon light reflecting off a dark surface.
*   **The "Ghost Border" Fallback:** If a separator is required for accessibility, use the `outline_variant` (#45484f) at 15% opacity. Never use a 100% opaque border.

## 5. Components

### Sleek Video Player Controls
*   **Track:** Use `surface_variant` for the rail and a gradient of `secondary` to `secondary_dim` for the progress bar.
*   **Knobs:** Should be `primary_fixed`, appearing as glowing orbs that expand slightly on hover/touch.
*   **Overlays:** Use the Glassmorphism rule. The control bar should not have a hard edge; use a `linear-gradient(to top, surface, transparent)` to fade the controls into the video.

### Interactive Chat Elements
*   **Messages:** No containers for standard messages. Use `body-md` on `on_surface`. 
*   **Highlighted Messages (Donations/Subs):** Use `tertiary_container` (#ff097d) with 20% opacity and a `tertiary` left-accent bar (4px width).
*   **Input:** Use `surface_container_lowest` with a "Ghost Border" and `label-md` for placeholder text.

### Playful Avatar Selectors
*   **States:** Unselected avatars use `outline`. The active selection must have a 2px "Ghost Border" and an outer glow using `secondary` (#00e3fd) with a 12px blur.
*   **Shape:** Use the `xl` roundedness (1.5rem) for a "squircle" look that feels more custom than a standard circle.

### Buttons & Chips
*   **Primary Button:** Gradient fill (`primary_dim` to `primary`). No border. `md` roundedness (0.75rem).
*   **Secondary Button:** Ghost style. No fill, `outline` border at 30% opacity, `on_surface` text.
*   **Chips:** Use `surface_container_highest` for the background. On selection, transition the background to `secondary_container` and the text to `on_secondary_container`.

## 6. Do’s and Don’ts

### Do:
*   **Do** use asymmetrical layouts. Let the chat panel be slightly narrower than the video or offset the headers to create a "custom build" feel.
*   **Do** lean into the `tertiary` (#ff6b99) palette for "High Energy" moments (alerts, errors, live pulses).
*   **Do** use the Spacing Scale religiously. Use `16` (4rem) for major section breathing room and `2` (0.5rem) for tight component grouping.

### Don't:
*   **Don't** use dividers (`<hr>`). If content needs separation, use a `12` (3rem) vertical gap or a slight surface color shift.
*   **Don't** use pure white (#ffffff). Always use `on_surface` (#ecedf6) to avoid harsh eye strain in dark environments.
*   **Don't** use standard "drop shadows." If it doesn't look like an ambient glow, it doesn't belong in this system.