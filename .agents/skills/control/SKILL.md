---
name: control
description: >-
  Use this skill when the user invokes `/control` or asks to create, configure,
  or update the Inflight-style Prototype Control floating toolkit (triggered via
  Cmd+K at the bottom-right of the screen) for toggling design approaches,
  inspecting Figma-style design system tokens, adding custom interactive levers,
  or leaving review notes.
---

# Prototype Control Skill (`/control`)

This skill manages the **Inflight-inspired Prototype Control** — a sleek, matte-black floating design review and token toolkit anchored at the bottom-right of the prototype and toggled via `⌘K` (`Cmd+K` / `Ctrl+K`).

---

## Core Architecture & Files

In this workspace, the Prototype Control lives in:
- **Context & State**: `src/components/prototype-control/PrototypeControlContext.tsx`
- **Floating UI Widget**: `src/components/prototype-control/PrototypeControl.tsx`
- **Design System Tokens**: `src/design-system/tokens.ts` & `src/app/globals.css`

---

## Visual & Interaction Specification (Inflight Style)

1. **Position & Trigger**:
   - Anchored at `fixed bottom-5 right-5 z-50`.
   - Toggled open/closed via keyboard shortcut `⌘K` (`(e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k"`).
   - When collapsed, displays a compact floating black pill (`Prototype Control · ⌘K`) so it can also be opened by click.
2. **Matte-Black Shell & Stacked Inner Cards**:
   - Outer container: `bg-[#0a0a0c]`, `rounded-[22px]`, `p-2.5`, `border border-white/[0.09]`, deep ambient shadow.
   - Top chrome header: Leading Lucide icon (`SlidersHorizontal`) + `"Prototype Control"` on the left, theme toggle + `⌘K` collapse button on the right.
   - Inner stacked cards: `bg-[#161618]`, `rounded-[15px]`, `border border-white/[0.06]`, stacked vertically with `space-y-2`.
3. **Built-in Capabilities**:
   - **Design System (`Portfolio > Color & Font`)**:
     - **Color**: Organized into `Global` (`Surface > Content > Stroke`), `Project` (`Float > 7shifts > Sonnet > Teck > WillowTree > Visier > Gojek`), and `Scales` (hidden by default under progressive disclosure). Never use the word "Atoms".
     - **Font**: Typography design system extracted from `filbert.design` (`Plus Jakarta Sans` & `Inter`, weights `500`/`600`/`700`, and full type scale across `Display & Headings`, `Body & Navigation`, and `Labels & Badges`).
   - **Design Options Switcher**: Segmented control (`Approach A` vs `Approach B`, or custom variants) with `framer-motion` spring pill indicator.
   - **Review Notes**: Persistent scratchpad (`localStorage`) tagged to the active design approach.
   - **Custom Prototype Controls**: Any custom sliders, toggles, or state levers needed for the current experiment.

---

## Workflow When Invoked

### Case 1: Updating or Adding Controls to an Existing Prototype
1. Inspect `src/components/prototype-control/PrototypeControlContext.tsx` and `src/components/prototype-control/PrototypeControl.tsx`.
2. If the user wants to compare multiple design explorations (e.g., `Approach A` vs `Approach B`):
   - Register the options in `PrototypeControlContext.tsx` (or dynamically via `setOptions`).
   - Consume `const { activeApproach, toggles } = usePrototypeControl()` in the target page or component (`src/app/page.tsx` or feature component) so switching options in the control updates the live UI immediately.
3. If the user asks to add new panels, levers, or token categories to the control:
   - Add a new inner card (`rounded-[15px] bg-[#161618] border border-white/[0.06] p-3`) inside `PrototypeControl.tsx`.

### Case 2: Scaffolding in a New Project
1. Create `src/components/prototype-control/PrototypeControlContext.tsx` and `src/components/prototype-control/PrototypeControl.tsx`.
2. Wrap the root layout in `<PrototypeControlProvider>` and mount `<PrototypeControl />`.
3. Ensure `Cmd+K` is bound to toggle the control without conflicting with other listeners.

---

## Validation Checklist

- Verify `npx tsc --noEmit` or `npm run build` succeeds cleanly.
- Confirm pressing `⌘K` smoothly animates the black floating box open and closed at the bottom-right corner.
- Confirm switching design options (`Approach A` / `Approach B`) or clicking token swatches works interactively.
