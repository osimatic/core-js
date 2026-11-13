# Claude Development Guidelines - core-js

This file contains the development guidelines for the core-js project. Claude will automatically follow these rules when working on this codebase.

## 🗣️ Language Requirements

- **Communication:** French (je te parle en français, parle-moi en français)
- **Code:** English only (code, variables, functions, classes, comments, documentation)

## 📝 Documentation Standards

- All code must have JSDoc documentation in English
- Include reference links when relevant (MDN, Wikipedia, standards, etc.)
- Format: No line breaks in the middle of sentences
- Comments should be in English and added when necessary

Example:
```js
/**
 * Retrieves detailed information about a specific reservation.
 * Returns comprehensive data including guest info and pricing.
 *
 * @param {number} reservationId The unique identifier of the reservation
 * @see https://docs.example.com/reservations Reservation API documentation
 * @returns {Object|null} The reservation details if successful, null on failure
 */
```

## 🏗️ Code Organization

- Classes are organized in sections (Constants, Properties, Constructor, Methods by category, etc.)
- Add new code to the appropriate section, **not at the end**
- Follow existing code conventions (tabs for indentation, single quotes, semicolons)
- Keep related methods together
- Each module is an ES module (`import` / `export`); keep the existing import style of the file you edit
- Native prototype extensions (`utils/array.js`, `utils/string.js`, `utils/number.js`, ...) are side-effect imports: do not change their load behaviour without checking `package.json` `sideEffects`
- Optional features that depend on peer dependencies (e.g. `tom-select`, `chart.js`, `leaflet`, `intl-tel-input`) must be isolated in their own module, so that bundles which do not use them do not embed the library (see `contact/IntlTelInput.js` and `form/SelectBox.js` for the pattern)

## 🔄 Method Renaming

When renaming a method (production code requirement):
1. Create the new method with the improved name
2. Keep the old method as a deprecated alias
3. Document both methods properly

```js
static getDataDirectory() { /* implementation */ }

/**
 * @deprecated Use getDataDirectory() instead
 */
static getDataDir() {
	return this.getDataDirectory();
}
```

- Public API changes (renames, removals, signature changes) must be noted in `CHANGELOG`

## 🧪 Testing Requirements

### Test Organization
- Tests live in `tests/`, mirroring the source folder structure (e.g. `calendar/DateTime.js` → `tests/calendar/DateTime.test.js`)
- Tests must mirror the class structure **exactly**
- Same sections, same order as the tested class
- **One `describe` block per tested function**
  - `describe('methodName')` covers **ALL** cases of `methodName()`
  - All test cases for a function must be grouped inside its single `describe` block
  - Naming: `describe('methodName')` tests `methodName()`
- Check if test already exists before creating

### Test Quality
- **Comprehensive coverage:** Test all possible cases, including edge cases
- Write complex mocks when necessary (e.g. `fetch`, `localStorage`, DOM elements, third-party libraries)
- **Critical:** Do NOT regress tests on failure
  - If a test fails, check implementation first
  - The test might be correct and revealing a bug
  - Only modify test if there's an obvious error in the test itself
- Run the test suite with `npm test` (Jest). Use `npm run test:coverage` to check coverage of the code you touched

Example test structure:
```js
import '../../utils/array.js';

describe('Array.prototype extensions', () => {
	// ========================================
	// Constructor & Configuration Tests
	// ========================================

	describe('constructor', () => { /* ... */ });
	describe('setDataDirectory', () => { /* ... */ });

	// ========================================
	// File Operations Methods Tests
	// ========================================

	describe('read', () => { /* ... */ });
	describe('write', () => { /* ... */ });
});
```

## 🔍 Code Review Philosophy

### Be Proactive
When reading files, report **any** issues found, even if unrelated to the current task:
- Bugs
- French code or comments (should be English)
- Poorly named methods
- Missing documentation
- Organization problems
- Code smells

### User Feedback
- If a modification is rejected, **do not propose it again** (unless explicitly asked)
- Listen to feedback and adjust approach

## 🎯 Class Improvement Requests

When asked to "improve a class", provide proposals for:
1. **Bug fixes** - Any issues found
2. **Documentation** - Missing or incomplete JSDoc
3. **Translation** - French → English
4. **Organization** - Better section structure
5. **Method additions** - Useful missing methods
6. **Method renaming** - Better names (with deprecated aliases)
7. **Method refactoring** - Merge, split, or simplify
8. **Cleanup** - Remove obsolete methods

## ✅ Best Practices

### Method Design
- Validate parameters early
- Return null on failure for optional operations
- Return boolean for success/failure operations
- Prefer explicit, predictable return values over implicit `undefined`
- Log errors appropriately (`console.error` or the project's logging helper, if any)
- Be careful with browser-only APIs (`window`, `document`, `localStorage`): guard them if the module may be imported in Node/Jest

### Error Handling
```js
if (!Number.isInteger(id) || id <= 0) {
	console.error('Invalid ID. Must be a positive integer.');
	return null;
}
```

### Documentation Links
Always include relevant reference links:
- MDN for browser APIs and JavaScript built-ins
- Official docs for integrations (Leaflet, Chart.js, tom-select, libphonenumber, etc.)
- Wikipedia for concepts/patterns
- Standards (RFC, ISO, ECMAScript spec) when applicable

## 🚀 Project Context

- **Project:** core-js (`@osimatic/core-js`, Osimatic JavaScript helper library)
- **Status:** Production code, published on npm (public access)
- **Runtime:** Browser-first ES modules (`"type": "module"`), bundled by consumers (e.g. browserify)
- **Testing:** Jest (`testEnvironment: node`, tests matched by `tests/**/*.test.js`)
- **Requirements:** Backward compatibility must be maintained
- **Dependencies:** Runtime dependencies are listed in `dependencies`; UI/third-party libraries are `peerDependencies` and must stay optional

## 📚 Example Patterns

### Class Structure
```js
export class Example {
	// ========================================
	// Constants
	// ========================================

	static API_URL = 'https://api.example.com';

	// ========================================
	// Properties
	// ========================================

	#apiKey;

	// ========================================
	// Constructor & Configuration
	// ========================================

	constructor(apiKey) { }

	// ========================================
	// Public Methods
	// ========================================

	static getData() { }

	// ========================================
	// Helper Methods
	// ========================================

	static #sendRequest() { }
}
```

### Test Structure
```js
import { Example } from '../../example/Example.js';

describe('Example', () => {
	// Match class sections exactly

	// ========================================
	// Constructor & Configuration Tests
	// ========================================

	describe('constructor', () => {
		test('should accept a valid key', () => { /* ... */ });
		test('should throw on an empty key', () => { /* ... */ });
		// Edge cases: all other cases of the constructor in this describe block
	});

	// ========================================
	// Public Methods Tests
	// ========================================

	describe('getData', () => {
		// All test cases for getData() in this describe block
	});
});
```

**❌ WRONG - Multiple describe blocks for one function:**
```js
describe('constructor', () => { });
describe('constructor with invalid parameter', () => { });
describe('constructor edge case', () => { });
```

**✅ CORRECT - One describe block with all cases:**
```js
describe('constructor', () => {
	test('should accept a valid key', () => { });
	test('should throw on an empty key', () => { });
	test('should throw on a non-string key', () => { });
});
```

---

**Note:** These guidelines ensure code quality, maintainability, and consistency across the core-js project. All contributors (human or AI) should follow these standards.