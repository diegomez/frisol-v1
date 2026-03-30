# Design System Document: Precision & Depth

## 1. Overview & Creative North Star
**Creative North Star: "The Architectural Lens"**

This design system moves beyond the standard B2B "SaaS template" to create an environment of extreme clarity and authoritative calm. We are not just building a dashboard; we are building a high-precision diagnostic instrument. 

To achieve this, the system rejects the "box-within-a-box" mentality of traditional enterprise UI. Instead, we utilize **Architectural Layering**: a method where hierarchy is defined by light, tonal shifts, and intentional negative space. By removing rigid 1px borders and replacing them with subtle background elevations (Surface Tiers), we create a UI that feels expansive and breathable, even when displaying dense diagnostic data. The result is a "Digital Curator" experience—professional, structured, and unfailingly reliable.

---

## 2. Colors & Tonal Architecture
The palette is rooted in `primary` (#004253), a deep, intellectual teal that commands trust. We use Material-based tonal mapping to ensure every element has a logical relationship to its background.

### The "No-Line" Rule
Explicitly prohibited: 1px solid borders for sectioning or container definition. Boundaries must be defined through:
- **Background Color Shifts:** Placing a `surface_container_low` element against a `surface` background.
- **Tonal Transitions:** Using the `surface_container` tiers to denote nesting.

### Surface Hierarchy & Nesting
Treat the interface as a physical stack of premium materials. 
1.  **Base Layer:** `surface` (#f7f9ff) – The expansive canvas.
2.  **Sectional Layer:** `surface_container_low` (#f1f4fa) – Used for large sidebar or navigation areas.
3.  **Content Layer:** `surface_container_highest` (#dfe3e8) – For primary data tables or diagnostic modules.
4.  **Action Layer:** `surface_container_lowest` (#ffffff) – Reserved for cards that require the most "lift" and attention.

### The "Glass & Gradient" Rule
To elevate the "Login Card" and high-level summaries, use **Glassmorphism**. Combine `surface_container_lowest` at 60% opacity with a `backdrop-blur` of 20px. 
*   **Signature Texture:** Use a subtle linear gradient on primary CTAs (from `primary` #004253 to `primary_container` #005b71 at 135°) to give buttons a "milled" metallic feel rather than a flat plastic look.

---

## 3. Typography: The Editorial Scale
We employ a dual-type strategy to balance high-end brand authority with clinical data readability.

*   **The Authority (Display & Headline):** **Manrope.** Its geometric yet warm construction provides a modern, architectural feel. 
    *   *Headline-lg (2rem):* Use for page titles to ground the user in the diagnostic context.
*   **The Precision (Title, Body, Labels):** **Inter.** A high-legibility sans-serif designed for complex interfaces. 
    *   *Body-md (0.875rem):* The workhorse for data tables.
    *   *Label-sm (0.6875rem):* Used for micro-data points and metadata, ensuring no loss of clarity at small scales.

Typography hierarchy must be aggressive. Do not fear using `display-md` next to `body-sm`; the high contrast in scale signals importance more effectively than bold colors ever could.

---

## 4. Elevation & Depth
Depth in this system is a result of light physics, not CSS defaults.

*   **The Layering Principle:** Depth is achieved by stacking. A `surface_container_lowest` card sitting on a `surface_container_high` section creates a natural "step up" without the need for visual noise.
*   **Ambient Shadows:** For floating elements (Modals/Popovers), use "Atmospheric Shadows."
    *   *Value:* `0px 12px 32px rgba(24, 28, 32, 0.06)`
    *   Shadows must never be pure black; they must be a tinted version of `on_surface` to simulate natural light refraction.
*   **The "Ghost Border" Fallback:** If a divider is functionally required for accessibility, use the `outline_variant` token at **15% opacity**. It should be felt, not seen.

---

## 5. Components & Interface Elements

### Buttons: High-Contrast Actions
*   **Primary:** Gradient (`primary` to `primary_container`), `round-md` (0.375rem). Use `on_primary` text.
*   **Secondary:** `surface_container_high` background with `primary` text. No border.
*   **Tertiary:** Ghost style. `on_surface_variant` text, shifting to a subtle `surface_variant` background on hover.

### Structured Tables & Lists
*   **The "No-Divider" Rule:** Rows must not be separated by lines. Use vertical white space (`spacing-3`) and a subtle background hover state (`surface_container_low`) to guide the eye.
*   **Header:** Use `label-md` in `primary` color, uppercase with 0.05em letter spacing for an editorial feel.

### Form Fields & Inputs
*   **Container:** `surface_container_lowest`.
*   **Border:** Use the "Ghost Border" (15% `outline_variant`). 
*   **Focus State:** A 2px solid `primary` bottom-border only, or a subtle `surface_tint` glow. Avoid the heavy four-sided focus box.

### Step-by-Step Steppers
*   Utilize `tertiary_fixed` for completed steps to provide a calming, successful teal "check." 
*   Inactive steps should remain in `outline_variant` to recede into the background.

### Diagnostic Chips
*   **Action Chips:** `secondary_container` background with `on_secondary_container` text.
*   **Status:** Use `error_container`/`on_error_container` for critical diagnostics. These must be the only high-chroma elements on the page to ensure they act as visual beacons.

---

## 6. Do’s and Don’ts

### Do
*   **Do** use `spacing-16` and `spacing-24` for major section padding. Large-scale data needs room to breathe to avoid user fatigue.
*   **Do** use "Asymmetric Balance." For example, a heavy diagnostic table on the left can be balanced by a large, light `display-sm` headline on the right.
*   **Do** utilize `backdrop-blur` on navigation bars to maintain a sense of context as the user scrolls through long diagnostic reports.

### Don’t
*   **Don’t** use 100% opaque borders. They create "visual cages" that make enterprise software feel dated.
*   **Don’t** use standard "Drop Shadows." Use tonal layering first; use Ambient Shadows only when an element is physically "floating" over others.
*   **Don’t** use pure black (#000) for text. Always use `on_surface` (#181c20) to maintain a premium, soft-contrast editorial feel.