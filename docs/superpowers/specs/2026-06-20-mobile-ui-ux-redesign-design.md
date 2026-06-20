# Mobile UI/UX Redesign Design

Date: 2026-06-20

## Goal

Redesign the Navi mobile app as one coherent product experience, with special attention to the chat screen. The new interface should feel less generic than common AI chat apps while staying compatible with Navi's current design language: dark, sober, financial, typographic, and restrained.

This work also includes a structural frontend refactor to reduce coupling, improve maintainability, and introduce reusable design patterns where they fit naturally.

## Scope

In scope:

- Apply a new `Warm Graphite` visual foundation across the mobile app.
- Replace the current chat presentation with a `Refined Thread` experience.
- Generate a new bitmap logo/image asset in the app's style.
- Refactor shared UI primitives and feature-specific components.
- Reduce coupling in the most overloaded frontend areas, especially chat and finances.
- Preserve existing product behavior unless a UI change requires a small interaction adjustment.

Out of scope:

- Replacing the current tab system with a navigation library.
- Changing backend APIs.
- Reworking authentication rules or financial domain behavior.
- Adding new major product capabilities beyond the redesigned UI and structural cleanup.

## Visual Direction

The approved visual direction is `Warm Graphite + Refined Thread`.

The app should move away from the current near-black background (`#0A0A0A`) toward a warm graphite foundation. The interface remains dark, but it should have more depth, readability, and breathing room.

The visual system should keep:

- Playfair for primary display headings.
- Inter for operational text.
- Small-radius cards and controls.
- Thin borders.
- Uppercase, letter-spaced section labels.
- Quiet, financial-product tone.

The visual system should avoid:

- Chatbot avatar/persona conventions.
- Emoji as product identity.
- Purple/blue AI gradients.
- Rounded pill-heavy UI where rectangular financial controls fit better.
- Decorative visuals that do not serve the financial/product context.

## Chat Experience

The chat should not look like a generic assistant UI with a bot name, bot photo, and standard bubble stream. It should feel like a financial conversation surface.

The approved structure is `Refined Thread`:

- The header presents Navi as a product mark, not as a bot identity.
- The generated logo/image replaces the current text-plus-emoji title treatment.
- AI output appears as editorial financial blocks with labels such as `ANALISE`, `BUSCA`, `RESULTADO`, `CONFIRMACAO`, or similarly concise labels.
- User messages are compact and visually secondary.
- Streaming/searching state appears as a discreet status row or labeled block, not as a generic typing indicator.
- The composer stays fixed and uses the shared text input/button primitives.
- Empty state provides useful financial prompts and quick-start suggestions instead of generic chatbot examples.

Disabled actions should communicate state clearly. For example, sending is disabled when the input is empty or when the app cannot safely submit another request. The input itself should be evaluated during implementation: keeping it editable during streaming may be preferable if only sending is blocked.

## Logo And Asset Direction

Create a new bitmap logo/image asset that fits the app's style.

Direction:

- Premium, sober, warm graphite financial identity.
- Abstract navigation/ledger symbol.
- No mascot.
- No literal space theme.
- No emoji.
- Should work at small sizes in the chat header and auth screen.
- If practical, also evaluate whether it can inform app icon or splash assets.

The first generated asset is allowed to be a draft. The implementation plan should include review and iteration if the asset reads as generic.

## App-Wide UX

All main mobile screens should align to the same system:

- Auth: keep the simple login/register flow, but use shared text fields, buttons, surface styles, and logo treatment.
- Chat: implement the `Refined Thread` model.
- Finances: preserve features while organizing content into scannable sections such as summary, categories/metas, expenses, and actions.
- Routines: align progress and budget cards with shared card/metric patterns.
- Settings: simplify around account information and clearly separated destructive/logout action.
- Bottom tab bar: keep the existing tab model, but align active/inactive states, spacing, and colors with the new tokens.

Loading, empty, error, and submit states should use shared components where possible.

## Architecture

Introduce a clearer frontend structure in `apps/mobile/src`.

Target structure:

```text
src/
  features/
    auth/
    chat/
    finances/
    routines/
    settings/
  ui/
  styles/
  services/
```

`src/ui` contains reusable visual primitives with no business logic:

- `Screen`
- `ScreenHeader`
- `Surface`
- `Button`
- `TextField`
- `SectionLabel`
- `EmptyState`
- `LoadingState`
- `IconButton`
- `MetricCard`

Feature directories contain feature-specific components and hooks. They can compose UI primitives but should avoid duplicating global styling rules.

`App.tsx` remains the app shell for now. It should manage session state, active tab state, and screen composition, but should not absorb feature rendering details.

## Refactor Targets

### Chat

Current `Chat.tsx` mixes data hook usage, input state, header, empty state, message list, streaming state, message rendering, and composer behavior.

Refactor into:

- `ChatScreen`
- `ChatThread`
- `ChatMessageBlock`
- `ChatComposer`
- `ChatEmptyState`
- `StreamingStatus`
- chat feature styles or themed component composition

`useChatStream` can remain as the stream/data hook, but should move under the chat feature if the new structure is adopted.

### Finances

Current `Finances.tsx` is heavily coupled: fetching, calculations, modal state, form state, mutation handlers, and rendering live in one component.

Refactor into:

- `useFinanceData` for loading categories, expenses, budgets, and category budgets.
- focused mutation helpers or hooks for category, budget, category budget, and expense actions.
- pure helpers for calculations and formatting.
- presentational sections/cards for summary, categories, budgets, expenses, and modals.

The first pass should reduce coupling without changing backend contracts or removing existing capabilities.

### Other Screens

`AuthForm`, `Routines`, `Settings`, and `BottomTabBar` should be migrated to shared UI primitives and the `Warm Graphite` tokens. Their refactor should be proportional: improve consistency and clarity without creating unnecessary abstraction.

## Design Patterns

Use these patterns where they reduce coupling:

- Container/presentational split for feature screens.
- Custom hooks for data loading and mutations.
- Small reusable UI primitives for repeated visual patterns.
- Pure utility functions for formatting and financial calculations.
- Central semantic tokens instead of repeated hex values.
- Feature-local types unless a type is shared across features or packages.

Avoid adding abstractions only for symmetry. A component or hook should exist because it reduces meaningful duplication or isolates a real responsibility.

## Error And State Handling

Expected shared states:

- Loading state for full-screen or section-level loads.
- Empty state for missing data.
- Inline error state for failed section loads where retry is possible.
- `Alert` remains acceptable for destructive confirmations and form submission failures.
- Disabled controls must visually communicate why interaction is unavailable.

## Verification

Before implementation changes in `apps/mobile`, consult the Expo v56 docs as required by `apps/mobile/AGENTS.md`.

Verification commands:

```bash
pnpm --filter @navi/mobile typecheck
pnpm typecheck
```

Manual verification:

- Auth login/register screen still renders and submits.
- Bottom tabs switch correctly.
- Chat empty state renders.
- Chat send and streaming behavior still work.
- Chat disabled/send states are understandable.
- Finances data loads.
- Main finances modals still open, submit, close, and refresh data.
- Routines and settings render with the new visual system.

## Implementation Notes

Because the user selected the broad redesign approach, expect a larger diff. Keep changes reviewable by sequencing the implementation:

1. Theme tokens and UI primitives.
2. Chat redesign/refactor.
3. Auth, routines, settings, and tab bar migration.
4. Finances refactor/redesign.
5. Logo asset generation and integration.
6. Verification and cleanup.

This sequence may be adjusted during planning if dependencies make a different order safer.
