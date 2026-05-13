# contentful-pretty-picker

A Contentful UI app that replaces the default short-text dropdown with a richer picker that automatically transforms raw field values into human-readable labels.

## How it works

- **Values** are defined in the content type field's **Accepted values** (`in`) validation — the same place you'd configure a standard dropdown. No duplication in the app.
- **Labels** are generated on the fly by applying a transformation rule configured once in the App Config screen.

```
Content type field validation:  ["do-it", "hero-block", "cta"]
Transformation:                  Title Case
Displayed in the editor:         Do It  |  Hero Block  |  Cta
```

## Available transformations

| Name | Example input | Example output |
|------|---------------|----------------|
| Title Case | `do-it` / `heroBlock` / `do_it` | `Do It` |
| UPPERCASE | `do-it` / `heroBlock` / `do_it` | `DO IT` |
| None (raw) | `do-it` | `do-it` |

The splitter handles kebab-case, snake_case, and camelCase inputs — any of those formats produce the same result for a given transformation.

## Setup

### 1. Install the app in your Contentful space

```bash
npm install
npm start   # opens the Contentful app definition wizard
```

### 2. Configure the transformation

Open the app in **Apps → PrettyPicker → Configuration**, choose the transformation that fits your naming convention, and click **Save**.

### 3. Set up a content type field

1. Open the content type in the Contentful web app.
2. Add or edit a **Short text** field.
3. Under **Validations**, enable **Accept only specified values** and add your raw values (e.g. `do-it`, `hero-block`).
4. Under **Appearance**, select **PrettyPicker** as the field editor.

That's it. The field will now show a dropdown with transformed labels while storing the raw values.

### Orphaned values

If a value was previously saved but its raw string is later removed from the field's `in` validation, the field shows a warning and keeps the old value selectable (marked as removed) until it is replaced.

## Development

```bash
npm install
npm start          # run locally against a Contentful space
npm test           # run unit tests (watch mode)
npm run test:ci    # run once (CI)
npm run build      # production bundle → ./build
npm run upload     # deploy bundle to Contentful
```

### Project structure

```
src/
  locations/
    ConfigScreen.tsx   # app config — transformation selector
    Field.tsx          # field editor — reads in-validation + applies transformation
  types.ts             # TransformationType, InstallationParameters, TRANSFORMATION_OPTIONS
  utils.ts             # splitWords, applyTransformation
test/
  mocks/               # shared SDK and CMA mocks for unit tests
```

### Adding a new transformation

1. Add a new literal to `TransformationType` in `src/types.ts`.
2. Add an entry to `TRANSFORMATION_OPTIONS` with `value`, `label`, and `example`.
3. Add a `case` for it in `applyTransformation` in `src/utils.ts`.
4. Add tests in `src/utils.test.ts`.

No other files need to change.

## License

MIT — see [LICENSE](./LICENSE).
