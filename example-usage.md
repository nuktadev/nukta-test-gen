# nuktatestify Enhanced Usage Guide

## Overview

This guide demonstrates how to use the enhanced nuktatestify CLI to generate comprehensive, production-ready, error-free TypeScript tests for your PassPE backend project (or any Node/Express/Mongo project).

---

## 🚀 Quick Start (Recommended)

1. **Install globally:**

   ```bash
   npm install -g nuktatestify
   ```

2. **In your project root, run:**

   ```bash
   nuktatestify --init --src src --out tests --modular --auth-tests --validation-tests --error-tests --integration-tests --ext test.ts
   ```

   - This will:
     - Install all required dev dependencies
     - Create `jest.config.js`, `tests/setup.ts`, `.env.test`, and update `package.json` scripts
     - Generate error-free `.test.ts` files for all routes
     - Print next steps

3. **Run your tests:**
   ```bash
   npm test
   ```

---

## What Gets Set Up Automatically

- Jest + ts-jest for TypeScript testing
- In-memory MongoDB for fast, isolated tests
- Global test helpers (user creation, auth, etc.)
- Modular, error-free `.test.ts` files for all routes
- All scripts/configs for a ready-to-run test environment

---

## Example Usage Scenarios

### 1. **Comprehensive Test Generation**

```bash
nuktatestify \
  --init \
  --src src/app \
  --out tests \
  --modular \
  --auth-tests \
  --validation-tests \
  --error-tests \
  --integration-tests \
  --performance-tests \
  --database-type mongodb \
  --generate-fixtures \
  --generate-helpers \
  --coverage-threshold 85 \
  --ext test.ts \
  --verbose
```

### 2. **Module-Specific Testing**

```bash
nuktatestify \
  --init \
  --src src/app/modules/auth \
  --out tests/auth \
  --modular \
  --auth-tests \
  --validation-tests \
  --ext test.ts \
  --verbose
```

### 3. **Dry Run (Preview Mode)**

```bash
nuktatestify \
  --src src/app \
  --out tests \
  --modular \
  --auth-tests \
  --validation-tests \
  --error-tests \
  --integration-tests \
  --dry-run \
  --ext test.ts \
  --verbose
```

---

## Generated Test Structure

```
passpe-backend/
├── tests/
│   ├── setup.ts                # Global test setup (TypeScript)
│   ├── jest.config.js          # Jest configuration
│   ├── modules/
│   │   ├── auth/
│   │   │   └── auth.route.test.ts
│   │   ├── user/
│   │   │   └── user.route.test.ts
│   │   └── ... (other modules)
│   └── ...
```

---

## Example Generated Test File (TypeScript)

```typescript
// tests/modules/auth/auth.route.test.ts
import request from "supertest";

describe("Auth Module", () => {
  let app: any;
  beforeAll(() => {
    app = (global as any).testUtils.createTestApp();
  });

  it("should return 401 for unauthenticated", async () => {
    const res = await request(app).get("/api/v1/auth/me");
    expect(res.status).toBe(401);
  });
});
```

---

## Running the Generated Tests

```bash
npm test
```

Or run a specific module:

```bash
npm test -- tests/modules/auth/auth.route.test.ts
```

---

## Best Practices

- Use only `.ts` files for tests and helpers
- Use `tests/setup.ts` for all global test utilities
- Never connect to MongoDB in individual test files—use the global setup
- Add/extend test cases in `tests/modules/` as needed
- Use only test credentials in `.env.test`
- Integrate with CI for automated quality

---

## Troubleshooting

- **TypeScript errors?**
  - Run `npx tsc --noEmit` to check for type issues
  - Ensure your `tsconfig.json` includes `tests/` and has `esModuleInterop: true`
- **MongoDB connection issues?**
  - Use the in-memory server provided in `tests/setup.ts`
- **Test failures?**
  - Use helpers to create users and tokens for protected routes
- **npm/npx not found?**
  - Ensure Node.js and npm are installed and in your PATH

---

## CI/CD Integration

Add this to your `.github/workflows/ci.yml`:

```yaml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "18"
      - run: npm install
      - run: npm test
```

---

This enhanced CLI will generate production-ready, comprehensive, error-free TypeScript tests that follow senior QA best practices for your PassPE backend project!
