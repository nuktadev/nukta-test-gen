# nukta-test-gen

[![npm version](https://img.shields.io/npm/v/nukta-test-gen.svg)](https://www.npmjs.com/package/nukta-test-gen)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

> 🚀 **Auto-generate Jest test cases for your Express.js APIs in seconds!**

---

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Options](#options)
- [How It Works](#how-it-works)
- [Example](#example)
- [FAQ](#faq)
- [Contributing](#contributing)
- [Publishing](#publishing)
- [License](#license)

---

## Features

- 🔍 **Scans your Express.js routes** (`app.get`, `router.post`, etc.)
- 📝 **Generates Jest test files** for each route
- ✅ **Status code and response shape checks**
- 🧪 **Supports `.test.js` or `.spec.js`** file extensions
- 🗂️ **Outputs to a `tests/` directory** (customizable)
- 🔒 **Never executes code**—parses only for security
- ⚡ **Fast, developer-friendly, and extensible**

---

## Installation

### Global (Recommended)

```sh
npm install -g nukta-test-gen
```

### Local (as a dev dependency)

```sh
npm install --save-dev nukta-test-gen
```

---

## Usage

Navigate to your Express.js project root and run:

```sh
nukta-test-gen [options]
```

Or, if installed locally:

```sh
npx nukta-test-gen [options]
```

---

## Options

| Option      | Description                                     | Default   |
| ----------- | ----------------------------------------------- | --------- |
| `--src, -s` | Source directory to scan                        | `src`     |
| `--out, -o` | Output directory for test files                 | `tests`   |
| `--ext, -e` | Test file extension (`test.js` or `spec.js`)    | `test.js` |
| `--mock`    | Include mock data in tests                      | `false`   |
| `--dry-run` | Show what would be generated, don’t write files | `false`   |
| `--verbose` | Enable verbose logging                          | `false`   |

---

## How It Works

1. **Scans all `.js` and `.ts` files** in your source directory (default: `src/`).
2. **Finds Express route definitions** (e.g., `app.get('/api', ...)`, `router.post(...)`).
3. **Generates Jest test files** for each route in your output directory (default: `tests/`).
4. **Each test checks:**
   - Status codes (200, 201, 400, 404)
   - Response shape (object/array)
   - Optionally includes mock data

---

## Example

```sh
nukta-test-gen --src api --out tests --ext spec.js --mock --verbose
```

---

## FAQ

**Q: Does it scan all files?**

- It scans all `.js` and `.ts` files in the directory you specify, but only generates tests for files with Express route definitions.

**Q: Does it execute my code?**

- No. It only parses files for route definitions—never executes or requires them.

**Q: Can I use it with TypeScript projects?**

- Yes! It supports both `.js` and `.ts` files.

**Q: How do I run the generated tests?**

- Use [Jest](https://jestjs.io/):
  ```sh
  npx jest
  ```

---

## Contributing

1. Fork this repo and clone it.
2. Install dependencies:
   ```sh
   npm install
   ```
3. Make your changes in `src/`.
4. Build the project:
   ```sh
   npm run build
   ```
5. Test your changes.
6. Submit a pull request!

---

## Publishing

1. Make sure you are [logged in to npm](https://docs.npmjs.com/cli/v10/commands/npm-login):
   ```sh
   npm adduser
   ```
2. Build the project:
   ```sh
   npm run build
   ```
3. Publish:
   ```sh
   npm publish --access public
   ```

---

## License

[MIT](LICENSE)
