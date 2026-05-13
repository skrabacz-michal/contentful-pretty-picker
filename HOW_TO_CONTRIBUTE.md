# Contributing to contentful-pretty-picker

## Getting started

```bash
git clone <repo-url>
cd contentful-pretty-picker
npm install
```

Run the test suite to make sure everything is green before you start:

```bash
npm test
```

## Development workflow

```bash
npm start   # starts the dev server on localhost:3000
npm test    # runs vitest in watch mode
```

The dev server proxies app requests through Contentful's app framework. You need a Contentful space with the app installed (or use `npm run create-app-definition` to create one).

## Adding a new transformation

This is the most common contribution. The extension point is intentionally small:

1. **Add the type** — open `src/types.ts` and add a new literal to `TransformationType`:
   ```ts
   export type TransformationType = 'titleCase' | 'uppercase' | 'none' | 'yourNew';
   ```

2. **Register the option** — add an entry to `TRANSFORMATION_OPTIONS` in the same file:
   ```ts
   { value: 'yourNew', label: 'Your Label', example: 'do-it → your result' }
   ```

3. **Implement it** — add a `case` in `applyTransformation` in `src/utils.ts`:
   ```ts
   case 'yourNew':
     return words.map(/* ... */).join(' ');
   ```

4. **Test it** — add cases to the `applyTransformation` describe block in `src/utils.test.ts`:
   ```ts
   describe('yourNew', () => {
     it('converts kebab-case', () => {
       expect(applyTransformation('do-it', 'yourNew')).toBe('your result');
     });
   });
   ```

No other files need to change. The ConfigScreen and Field pick up new entries from `TRANSFORMATION_OPTIONS` automatically.

## Running tests

```bash
npm test           # watch mode
npm run test:ci    # single run (used in CI)
```

All tests must pass before opening a PR. Add or update tests for any behaviour you change.

## Pull request checklist

- [ ] `npm test` passes with no failures
- [ ] New transformations have tests in `src/utils.test.ts`
- [ ] `TRANSFORMATION_OPTIONS` entry includes a realistic `example` string
- [ ] No `console.log` left in source files
- [ ] Commit message follows the format: `type: short description` (e.g. `feat: add sentence case transformation`)

## Commit types

| Type | When to use |
|------|-------------|
| `feat` | New transformation or feature |
| `fix` | Bug fix |
| `refactor` | Code change with no behaviour change |
| `test` | Adding or fixing tests only |
| `docs` | Documentation only |
| `chore` | Dependency updates, config changes |
