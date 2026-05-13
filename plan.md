# PrettyPicker
## Contentful App – Implementation Plan for Claude Code

---

## Context

Build a Contentful App called **PrettyPicker** that renders a dropdown field editor where:
- Label → camelCase value pairs are configured in the App Config screen
- The field editor reads those pairs and renders a styled dropdown
- Contentful Delivery API returns only the camelCase value

**Architectural decision — installation vs. instance parameters:**
Pairs are stored as **installation parameters** (space-wide). Every Symbol field assigned
to this app in a given space shares the same set of pairs. If per-field options are needed
in the future, migrate to instance parameters. Document this constraint clearly in the UI.

---

## Stack

- `create-contentful-app` (React + Vite)
- `@contentful/app-sdk`
- `@contentful/react-apps-toolkit`
- `@contentful/f36-components` (Contentful's Forma 36 UI library)
- TypeScript
- Vitest + `@testing-library/react` (included in scaffold)

---

## Phases

### Phase 1 — Scaffold + Config screen
### Phase 2 — Field editor
### Phase 3 — Edge cases & validation polish
### Phase 4 — Hardening, deploy, CI

---

## Phase 1 — Scaffold + Config screen

### Step 1 — Scaffold the app

```bash
npx create-contentful-app@latest pretty-picker --typescript
# Select locations: App Config, Entry Field
```

### Step 2 — Environment setup

Create `.env` (gitignored):

```
CONTENTFUL_ORG_ID=<your-org-id>
CONTENTFUL_APP_DEF_ID=<your-app-def-id>
CONTENTFUL_ACCESS_TOKEN=<management-token-with-manage-apps-permission>
```

Register the app definition in your Contentful org:

```bash
npm run create-app-definition
```

Start local dev (Contentful will proxy iframe from localhost):

```bash
npm run start
```

Then in Contentful: Apps → Manage apps → set localhost URL for dev.

### Step 3 — File structure

```
src/
  locations/
    ConfigScreen.tsx     # App Config UI – manage label/value pairs
    Field.tsx            # Field editor – dropdown rendered in entry editor
  types.ts               # Shared types
  utils.ts               # toLabel() helper + validation
  __tests__/
    utils.test.ts
    ConfigScreen.test.tsx
    Field.test.tsx
```

### Step 4 — Wire up `index.tsx` routing (do this before implementing locations)

```tsx
switch (sdk.location.is(locations.LOCATION_APP_CONFIG)) → <ConfigScreen />
switch (sdk.location.is(locations.LOCATION_ENTRY_FIELD)) → <Field />
```

This lets both screens render locally as you build them.

### Step 5 — `types.ts`

```ts
export interface Pair {
  label: string;
  value: string;
}

export interface InstallationParameters {
  pairs: Pair[];
}
```

### Step 6 — `utils.ts`

```ts
// Fallback: auto-format camelCase → "Camel Case"
export function toLabel(camel: string): string {
  return camel
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, s => s.toUpperCase())
    .trim();
}

// camelCase: starts with lowercase letter, then letters/digits only
export const CAMEL_CASE_RE = /^[a-z][a-zA-Z0-9]*$/;

export function isValidCamelCase(value: string): boolean {
  return CAMEL_CASE_RE.test(value);
}
```

### Step 7 — `contentful-app-manifest.json` (register locations + parameters)

Update BEFORE implementing ConfigScreen/Field so the contract is locked.

```json
{
  "locations": [
    { "location": "app-config" },
    {
      "location": "entry-field",
      "fieldTypes": [{ "name": "Symbol" }]
    }
  ],
  "parameters": {
    "installation": [
      {
        "id": "pairs",
        "name": "Label → Value pairs",
        "type": "Object",
        "required": false,
        "default": []
      }
    ]
  }
}
```

> `fieldTypes: [{ "name": "Symbol" }]` restricts PrettyPicker to short-text fields only.

### Step 8 — `ConfigScreen.tsx`

Requirements:
- On mount: load existing pairs from `sdk.app.getParameters()` — **handle `null` (first install)**
- Register `sdk.app.onConfigure(() => ({ parameters: { pairs } }))` to save on Install/Save
- `sdk.app.setReady()` after init
- UI: two `TextInput` fields (Label, camelCaseValue) + Add button
- Validate before adding:
  - `label` must not be empty (trim before check)
  - `value` must match `CAMEL_CASE_RE` — show inline `ValidationMessage` if not
  - `value` must not already exist in the list (no duplicates)
- Render saved pairs as rows (use `Flex`/`Table` rather than `Pill` so the value is always visible) with a trash `IconButton` to remove
- Show empty-state text if no pairs added yet
- Note in the UI: *"These options are shared across all fields using PrettyPicker in this space."*

```tsx
// Key sdk calls:
const params = await sdk.app.getParameters<InstallationParameters>();
const pairs = params?.pairs ?? [];   // null-safe — first install returns null

sdk.app.onConfigure(() => ({ parameters: { pairs } }))
sdk.app.setReady()
```

---

## Phase 2 — Field editor

### Step 9 — `Field.tsx`

Requirements:
- Read pairs from `sdk.parameters.installation` typed as `InstallationParameters`; default to `[]` if absent
- Read and write the current field value via the SDK directly (**`useFieldValue` is not exported by `@contentful/react-apps-toolkit`**):

```tsx
const sdk = useSDK<FieldAppSDK>();
const [value, setValue] = useState<string>(() => sdk.field.getValue() ?? '');
useEffect(() => sdk.field.onValueChanged(setValue), [sdk]);

function handleChange(newVal: string) {
  setValue(newVal);
  sdk.field.setValue(newVal);
}
```

- Use `useAutoResizer()` hook (not imperative `sdk.window.startAutoResizer()`) to avoid observer leaks
- Render Forma 36 `<Select>` with a leading placeholder `<option value="">— select —</option>` followed by native `<option>` children for each pair
- On change: call `handleChange(selectedValue)`
- If `pairs` is empty: render a `Note` component — *"No options configured. Go to App Config."*
- **Orphaned value handling**: if the stored `value` is not found in `pairs`, show a `Note` warning: *"Saved value \"{value}\" is no longer in the configured options."* — also inject it as a `disabled` `<option>` in the Select so it remains visible as the selected item; this prevents the Select from silently jumping to a different value while keeping CDA data intact

```tsx
// Key sdk calls:
const sdk = useSDK<FieldAppSDK>();
const pairs = (sdk.parameters.installation as InstallationParameters)?.pairs ?? [];
useAutoResizer();
```

---

## Phase 3 — Edge cases & validation polish

### Step 10 — Validation hardening (ConfigScreen)

- Trim whitespace from label and value inputs before validation and storage
- Max label length: 256 characters (Contentful Symbol field cap; enforce for consistency)
- On duplicate value: show inline error *"This value already exists"*
- On empty label: show inline error *"Label is required"*

### Step 11 — Orphaned value handling (Field)

Covered in Step 9. Add unit test specifically for this branch.

---

## Phase 4 — Hardening, deploy, CI

### Step 12 — Tests

All tests use Vitest + `@testing-library/react`. Mock the Contentful SDK using the
`mockSdk` factory from `@contentful/app-sdk/mock` if the subpath export exists in the
installed version; otherwise write a manual mock object that implements the required
SDK surface (`sdk.app`, `sdk.field`, `sdk.parameters`, `sdk.window`).

**`utils.test.ts`**
- `toLabel` converts various camelCase strings correctly
- `isValidCamelCase` passes valid identifiers and rejects invalid ones

**`ConfigScreen.test.tsx`**
- Loads existing pairs on mount (mocked `getParameters`)
- Renders empty state when no pairs
- Rejects empty label and shows error
- Rejects non-camelCase value and shows error
- Rejects duplicate value and shows error
- Adds valid pair to list
- Removes pair via trash button
- `onConfigure` returns current pairs

**`Field.test.tsx`**
- Renders all configured options
- Shows empty-state `Note` when pairs is empty
- Calls `sdk.field.setValue` on selection change
- Renders orphaned-value warning when stored value is not in pairs

Coverage target: **≥ 80%**

### Step 13 — TypeScript check + lint

Add to CI (and run locally before upload):

```bash
tsc --noEmit
npm run lint
```

### Step 14 — Build, upload, activate

```bash
npm run build

# Upload bundle to Contentful
npm run upload

# Activate the bundle via Contentful UI or CLI:
# Apps → <your app> → Bundles → select latest → Activate
```

Required env vars for upload: `CONTENTFUL_ORG_ID`, `CONTENTFUL_APP_DEF_ID`, `CONTENTFUL_ACCESS_TOKEN`.

### Step 15 — Connect in Contentful

1. Apps → Manage apps → install your app in a sandbox space
2. Go to App Config → add label/value pairs → Save
3. Content Model → target field (Symbol) → Appearance → select PrettyPicker
4. Open an entry, change the field, save
5. Fetch via CDA and verify the raw string value is returned

---

## Acceptance criteria

| # | Criteria |
|---|---|
| 1 | Config screen loads existing pairs on mount |
| 2 | Config screen initialises to empty list (no crash) on first install (`null` parameters) |
| 3 | Adding a pair with invalid camelCase shows inline validation error |
| 4 | Adding a pair with an empty label shows inline validation error |
| 5 | Adding a duplicate value shows inline validation error |
| 6 | Pairs persist after Save/Install |
| 7 | Field dropdown shows labels, saves camelCase value |
| 8 | CDA returns plain string: `"pageType": "b2cContentPage"` |
| 9 | Empty pairs state shows a warning `Note` in the field editor |
| 10 | Orphaned value (pair removed after entry saved) shows a warning; value is not silently cleared |
| 11 | App is only offered as editor for Symbol fields, not other field types |
| 12 | App auto-resizes in the entry editor |
| 13 | Unit + component tests pass with ≥ 80% coverage |
| 14 | `tsc --noEmit` reports zero errors |

---

## Prompt for Claude Code

```
Implement a Contentful App called PrettyPicker following the plan in plan.md.

Work in phase order:
Phase 1: Scaffold → env setup → file structure → index.tsx routing → types.ts → utils.ts → manifest → ConfigScreen.tsx
Phase 2: Field.tsx
Phase 3: Validation edge cases
Phase 4: Tests, tsc check, build + upload

Rules:
- Use @contentful/f36-components for all UI — no custom CSS files
- All components must be typed with TypeScript (no `any`)
- Validate camelCase with CAMEL_CASE_RE from utils.ts in ConfigScreen
- sdk.app.getParameters() returns null on first install — always use `params?.pairs ?? []`
- Do NOT use useFieldValue() — use useSDK<FieldAppSDK>() + sdk.field.onValueChanged()
- Use useAutoResizer() hook, not sdk.window.startAutoResizer()
- Write tests before or alongside each component (TDD)
- Run tsc --noEmit after each file to confirm it compiles
```
