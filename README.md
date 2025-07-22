# nuktatestify

[![npm version](https://img.shields.io/npm/v/nuktatestify.svg)](https://www.npmjs.com/package/nuktatestify)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

> 🚀 **Production-grade, error-free TypeScript test automation for Express.js APIs with MongoDB, in one command!**

---

## Table of Contents

- [Features](#features)
- [Quick Start](#quick-start)
- [How It Works](#how-it-works)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)
- [CI/CD Integration](#cicd-integration)
- [FAQ](#faq)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- 🏁 **One-command setup**: Instantly configures Jest, ts-jest, in-memory MongoDB, helpers, scripts, and more
- 🟦 **TypeScript-first**: All test files, configs, and helpers are TypeScript by default
- 🧑‍💻 **Zero manual steps**: No more copying configs or fixing imports—everything just works
- 🧪 **Comprehensive test generation**: Auth, validation, error, integration, and more
- 🗂️ **Modular structure**: Tests mirror your codebase for easy navigation
- 🛡️ **Security & validation**: Auth, permissions, and input validation tests included
- 🧰 **Reusable helpers**: Global test utilities for user creation, tokens, and more
- 🏎️ **CI-ready**: Out-of-the-box support for GitHub Actions and other CI tools

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

## How It Works

- **Auto-setup:**
  - Installs Jest, ts-jest, @types/jest, supertest, @types/supertest, mongodb-memory-server, dotenv, etc.
  - Creates all config files and scripts for you
  - Generates a global `tests/setup.ts` for DB, helpers, and utilities
  - Ensures all generated test files are valid TypeScript and error-free
- **Test Generation:**
  - Scans your Express routes and middleware
  - Creates modular `.test.ts` files for each module
  - Includes authentication, validation, error, and integration tests
  - Uses helpers for user creation, tokens, and DB cleanup
- **CI/CD Ready:**
  - All scripts and configs are compatible with GitHub Actions, GitLab CI, etc.

---

## Best Practices

- **Use TypeScript everywhere:** All test files, helpers, and configs are `.ts` by default
- **Global setup:** Use `tests/setup.ts` for DB, helpers, and global utilities
- **No duplicate DB logic:** Never connect to MongoDB in individual test files—use the global setup
- **Extend tests:** Add/extend test cases in `tests/modules/` as needed
- **Keep `.env.test` safe:** Use only test credentials and mock keys
- **Integrate with CI:** Add `npm test` to your CI pipeline for automated quality

---

## Troubleshooting

- **TypeScript errors?**
  - Run `npx tsc --noEmit` to check for type issues
  - Ensure your `tsconfig.json` includes `tests/` and has `esModuleInterop: true`
- **MongoDB connection issues?**
  - Make sure no other MongoDB instance is running on the same port
  - Use the in-memory server provided in `tests/setup.ts`
- **Test failures?**
  - Check if your routes require authentication—use the helpers to create users and tokens
  - Review the generated test files for correct endpoint paths
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

## FAQ

**Q: Does it work with TypeScript projects?**

- Yes! All files and configs are TypeScript by default.

**Q: Can I customize the generated tests?**

- Absolutely! Edit any `.test.ts` file or helper as needed.

**Q: How do I add authentication to my tests?**

- Use `testUtils.createTestUser()` and `testUtils.generateAuthToken()` from `tests/setup.ts`.

**Q: How do I mock external services?**

- Use Jest mocks in `tests/setup.ts` or in your test files.

**Q: How do I run only a specific module’s tests?**

- Use Jest’s pattern: `npm test -- tests/modules/auth/auth.route.test.ts`

**Q: How do I add this to CI?**

- See the [CI/CD Integration](#cicd-integration) section above.

---

## Contributing

1. Fork this repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Support

- 📧 **Email**: support@nukta.dev
- 🐛 **Issues**: [GitHub Issues](https://github.com/nuktadev/nuktatestify/issues)

---

**Made with ❤️ by the Nukta Nur**
