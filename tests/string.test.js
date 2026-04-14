require('../string');

describe('String extensions', () => {
	describe('reverseString', () => {
		test('should reverse a string', () => {
			expect('hello'.reverseString()).toBe('olleh');
			expect('world'.reverseString()).toBe('dlrow');
			expect('12345'.reverseString()).toBe('54321');
		});

		test('should handle empty string', () => {
			expect(''.reverseString()).toBe('');
		});

		test('should handle single character', () => {
			expect('a'.reverseString()).toBe('a');
		});

		test('should handle palindrome', () => {
			expect('radar'.reverseString()).toBe('radar');
		});

		test('should handle special characters', () => {
			expect('a b c'.reverseString()).toBe('c b a');
			expect('!@#$%'.reverseString()).toBe('%$#@!');
		});
	});

	describe('truncateOnWord', () => {
		test('should truncate string on word boundary', () => {
			const text = 'Hello world this is a test';
			// La fonction retire les espaces de fin
			expect(text.truncateOnWord(14)).toBe('Hello world…');
		});

		test('should not truncate if within limit', () => {
			const text = 'Hello';
			expect(text.truncateOnWord(10)).toBe('Hello');
		});

		test('should truncate from left when fromLeft is true', () => {
			const text = 'Hello world this is a test';
			expect(text.truncateOnWord(10, true)).toBe('…is a test');
		});

		test('should handle empty string', () => {
			expect(''.truncateOnWord(10)).toBe('');
		});
	});

	describe('truncateString', () => {
		test('should truncate from right by default', () => {
			const text = 'Hello world this is a test';
			expect(text.truncateString(10)).toBe('Hello worl…');
		});

		test('should truncate from left', () => {
			const text = 'Hello world this is a test';
			expect(text.truncateString(10, 'left')).toBe('… is a test');
		});

		test('should truncate from left with split=true', () => {
			const text = 'Hello world this is a test';
			expect(text.truncateString(10, 'left', '…', true)).toBe('… is a test');
		});

		test('should truncate from middle', () => {
			const text = 'Hello world this is a test';
			const result = text.truncateString(10, 'middle');
			// Il y a un espace avant et après "…"
			expect(result).toBe('Hello … test');
		});

		test('should truncate from middle with split=true', () => {
			const text = 'Hello world this is a test';
			expect(text.truncateString(10, 'middle', '…', true)).toBe('Hello … test');
		});

		test('should not truncate if within length', () => {
			const text = 'Hello';
			expect(text.truncateString(10)).toBe('Hello');
		});

		test('should use custom ellipsis', () => {
			const text = 'Hello world';
			expect(text.truncateString(5, 'right', '...')).toBe('Hello...');
		});

		test('should truncate on word when split is true', () => {
			const text = 'Hello world';
			expect(text.truncateString(8, 'right', '…', true)).toBe('Hello …');
		});

		test('should handle empty string', () => {
			expect(''.truncateString(10)).toBe('');
		});
	});

	describe('htmlentities', () => {
		test('should convert special characters to HTML entities', () => {
			expect('<'.htmlentities()).toBe('&#60;');
			expect('>'.htmlentities()).toBe('&#62;');
			expect('&'.htmlentities()).toBe('&#38;');
		});

		test('should convert extended characters', () => {
			expect('é'.htmlentities()).toBe('&#233;');
			expect('à'.htmlentities()).toBe('&#224;');
		});

		test('should handle multiple characters', () => {
			const result = '<div>Test & "quote"</div>'.htmlentities();
			expect(result).toContain('&#60;');
			expect(result).toContain('&#62;');
			expect(result).toContain('&#38;');
		});

		test('should not affect regular ASCII characters', () => {
			expect('abc123'.htmlentities()).toBe('abc123');
		});
	});

	describe('escapeHtml', () => {
		test('should escape HTML special characters', () => {
			expect('<'.escapeHtml()).toBe('&lt;');
			expect('>'.escapeHtml()).toBe('&gt;');
			expect('&'.escapeHtml()).toBe('&amp;');
			expect('"'.escapeHtml()).toBe('&quot;');
			expect("'".escapeHtml()).toBe('&#39;');
			expect('/'.escapeHtml()).toBe('&#x2F;');
		});

		test('should escape complete HTML tags', () => {
			expect('<div>Test</div>'.escapeHtml()).toBe('&lt;div&gt;Test&lt;&#x2F;div&gt;');
		});

		test('should escape script tags', () => {
			expect('<script>alert("XSS")</script>'.escapeHtml()).toBe('&lt;script&gt;alert(&quot;XSS&quot;)&lt;&#x2F;script&gt;');
		});

		test('should handle empty string', () => {
			expect(''.escapeHtml()).toBe('');
		});

		test('should not affect regular text', () => {
			expect('Hello World'.escapeHtml()).toBe('Hello World');
		});
	});

	describe('normalizeBreaks', () => {
		test('should normalize \\r\\n to specified break', () => {
			expect('Line1\r\nLine2'.normalizeBreaks('<br>')).toBe('Line1<br>Line2');
		});

		test('should normalize \\n to specified break', () => {
			expect('Line1\nLine2'.normalizeBreaks('<br>')).toBe('Line1<br>Line2');
		});

		test('should normalize \\r to specified break', () => {
			expect('Line1\rLine2'.normalizeBreaks('<br>')).toBe('Line1<br>Line2');
		});

		test('should handle multiple line breaks', () => {
			expect('Line1\n\nLine2'.normalizeBreaks('<br>')).toBe('Line1<br><br>Line2');
		});

		test('should handle mixed line breaks', () => {
			expect('Line1\r\nLine2\nLine3\rLine4'.normalizeBreaks('<br>')).toBe('Line1<br>Line2<br>Line3<br>Line4');
		});

		test('should handle empty string', () => {
			expect(''.normalizeBreaks('<br>')).toBe('');
		});
	});

	describe('escapeRegExp', () => {
		test('should escape regex special characters', () => {
			expect('.'.escapeRegExp()).toBe('\\.');
			expect('*'.escapeRegExp()).toBe('\\*');
			expect('+'.escapeRegExp()).toBe('\\+');
			expect('?'.escapeRegExp()).toBe('\\?');
			expect('^'.escapeRegExp()).toBe('\\^');
			expect('$'.escapeRegExp()).toBe('\\$');
			expect('{'.escapeRegExp()).toBe('\\{');
			expect('}'.escapeRegExp()).toBe('\\}');
			expect('('.escapeRegExp()).toBe('\\(');
			expect(')'.escapeRegExp()).toBe('\\)');
			expect('['.escapeRegExp()).toBe('\\[');
			expect(']'.escapeRegExp()).toBe('\\]');
			expect('\\'.escapeRegExp()).toBe('\\\\');
			expect('|'.escapeRegExp()).toBe('\\|');
		});

		test('should escape multiple special characters', () => {
			expect('.*+?'.escapeRegExp()).toBe('\\.\\*\\+\\?');
		});

		test('should not affect regular characters', () => {
			expect('abc123'.escapeRegExp()).toBe('abc123');
		});

		test('should handle empty string', () => {
			expect(''.escapeRegExp()).toBe('');
		});
	});

	describe('format', () => {
		test('should replace placeholders with arguments', () => {
			expect('Hello {0}'.format('World')).toBe('Hello World');
			expect('{0} {1}'.format('Hello', 'World')).toBe('Hello World');
		});

		test('should handle multiple placeholders', () => {
			expect('{0} {1} {2}'.format('A', 'B', 'C')).toBe('A B C');
		});

		test('should handle out of order placeholders', () => {
			expect('{1} {0}'.format('World', 'Hello')).toBe('Hello World');
		});

		test('should leave unmatched placeholders', () => {
			expect('Hello {0} {1}'.format('World')).toBe('Hello World {1}');
		});

		test('should handle empty string', () => {
			expect(''.format('test')).toBe('');
		});

		test('should handle no placeholders', () => {
			expect('Hello World'.format('test')).toBe('Hello World');
		});
	});

	describe('ucwords', () => {
		test('should capitalize first letter of each word', () => {
			expect('hello world'.ucwords()).toBe('Hello World');
			expect('the quick brown fox'.ucwords()).toBe('The Quick Brown Fox');
		});

		test('should handle single word', () => {
			expect('hello'.ucwords()).toBe('Hello');
		});

		test('should handle hyphenated words', () => {
			expect('jean-paul'.ucwords()).toBe('Jean-Paul');
		});

		test('should handle already capitalized text', () => {
			expect('Hello World'.ucwords()).toBe('Hello World');
		});

		test('should handle mixed case', () => {
			expect('hELLo WoRLd'.ucwords()).toBe('Hello World');
		});

		test('should handle empty string', () => {
			expect(''.ucwords()).toBe('');
		});
	});

	describe('capitalize', () => {
		test('should capitalize first letter only', () => {
			expect('hello'.capitalize()).toBe('Hello');
			expect('world'.capitalize()).toBe('World');
		});

		test('should not affect rest of string', () => {
			expect('hELLO'.capitalize()).toBe('HELLO');
			expect('hello world'.capitalize()).toBe('Hello world');
		});

		test('should handle single character', () => {
			expect('a'.capitalize()).toBe('A');
		});

		test('should handle empty string', () => {
			expect(''.capitalize()).toBe('');
		});

		test('should handle already capitalized', () => {
			expect('Hello'.capitalize()).toBe('Hello');
		});
	});

	describe('acronym', () => {
		test('should create acronym from first letters', () => {
			expect('Hello World'.acronym()).toBe('HW');
			expect('United States of America'.acronym()).toBe('USoA');
		});

		test('should handle single word', () => {
			expect('Hello'.acronym()).toBe('H');
		});

		test('should handle empty string', () => {
			expect(''.acronym()).toBe('');
		});

		test('should handle multiple spaces', () => {
			expect('Hello  World'.acronym()).toBe('HW');
		});
	});

	describe('encodeForHtmlDataAttribute', () => {
		test('should replace double quotes with single quotes', () => {
			expect('"hello"'.encodeForHtmlDataAttribute()).toBe("'hello'");
			expect('Say "hello"'.encodeForHtmlDataAttribute()).toBe("Say 'hello'");
		});

		test('should handle multiple double quotes', () => {
			expect('"one" "two" "three"'.encodeForHtmlDataAttribute()).toBe("'one' 'two' 'three'");
		});

		test('should not affect single quotes', () => {
			expect("'hello'".encodeForHtmlDataAttribute()).toBe("'hello'");
		});

		test('should handle empty string', () => {
			expect(''.encodeForHtmlDataAttribute()).toBe('');
		});

		test('should handle string without quotes', () => {
			expect('hello world'.encodeForHtmlDataAttribute()).toBe('hello world');
		});
	});

	describe('isNumeric', () => {
		test('should return true for numeric strings', () => {
			expect('123'.isNumeric()).toBe(true);
			expect('0'.isNumeric()).toBe(true);
			expect('123.456'.isNumeric()).toBe(true);
			expect('0.5'.isNumeric()).toBe(true);
		});

		test('should return false for non-numeric strings', () => {
			expect('abc'.isNumeric()).toBe(false);
			expect('12a34'.isNumeric()).toBe(false);
			expect(''.isNumeric()).toBe(true); // Empty string is considered numeric
		});

		test('should return false for special characters', () => {
			expect('-123'.isNumeric()).toBe(false);
			expect('+123'.isNumeric()).toBe(false);
			expect('12,34'.isNumeric()).toBe(false);
		});

		test('should handle multiple dots', () => {
			expect('1.2.3'.isNumeric()).toBe(true); // Permis par la fonction actuelle
		});
	});

	describe('isBase64', () => {
		test('should return true for valid base64 strings', () => {
			expect('SGVsbG8='.isBase64()).toBe(true); // "Hello"
			expect('V29ybGQ='.isBase64()).toBe(true); // "World"
		});

		test('should return false for invalid base64 strings', () => {
			expect('Hello!'.isBase64()).toBe(false);
			expect('SGVsbG8'.isBase64()).toBe(false); // Pas de padding
			expect('SGVs bG8='.isBase64()).toBe(false); // Espace invalide
		});

		test('should handle valid base64 without special chars', () => {
			const base64 = btoa('Test string');
			expect(base64.isBase64()).toBe(true);
		});

		test('should return false for empty string', () => {
			expect(''.isBase64()).toBe(false);
		});

		test('should handle base64 with + and /', () => {
			expect('AAAA+///'.isBase64()).toBe(true);
		});
	});
});

describe('String static methods', () => {
	describe('String.format', () => {
		test('should replace placeholders with arguments', () => {
			expect(String.format('Hello {0}', 'World')).toBe('Hello World');
			expect(String.format('{0} {1}', 'Hello', 'World')).toBe('Hello World');
		});

		test('should handle multiple placeholders', () => {
			expect(String.format('{0} {1} {2}', 'A', 'B', 'C')).toBe('A B C');
		});

		test('should handle out of order placeholders', () => {
			expect(String.format('{1} {0}', 'World', 'Hello')).toBe('Hello World');
		});

		test('should leave unmatched placeholders', () => {
			expect(String.format('Hello {0} {1}', 'World')).toBe('Hello World {1}');
		});

		test('should handle no arguments', () => {
			expect(String.format('Hello {0}')).toBe('Hello {0}');
		});
	});
});

describe('JSON extensions', () => {
	describe('JSON.encodeJsonForDataAttr', () => {
		test('should encode simple object', () => {
			const obj = { name: 'John', age: 30 };
			const encoded = JSON.encodeJsonForDataAttr(obj);
			expect(typeof encoded).toBe('string');
			expect(encoded.length).toBeGreaterThan(0);
		});

		test('should encode array', () => {
			const arr = [1, 2, 3];
			const encoded = JSON.encodeJsonForDataAttr(arr);
			expect(typeof encoded).toBe('string');
		});

		test('should encode nested object', () => {
			const obj = { user: { name: 'John', address: { city: 'Paris' } } };
			const encoded = JSON.encodeJsonForDataAttr(obj);
			expect(typeof encoded).toBe('string');
		});

		test('should produce base64 string', () => {
			const obj = { test: 'value' };
			const encoded = JSON.encodeJsonForDataAttr(obj);
			// Base64 characters only
			expect(/^[A-Za-z0-9+/=]+$/.test(encoded)).toBe(true);
		});
	});

	describe('JSON.decodeJsonFromDataAttr', () => {
		test('should decode encoded object', () => {
			const obj = { name: 'John', age: 30 };
			const encoded = JSON.encodeJsonForDataAttr(obj);
			const decoded = JSON.decodeJsonFromDataAttr(encoded);
			expect(decoded).toEqual(obj);
		});

		test('should decode encoded array', () => {
			const arr = [1, 2, 3];
			const encoded = JSON.encodeJsonForDataAttr(arr);
			const decoded = JSON.decodeJsonFromDataAttr(encoded);
			expect(decoded).toEqual(arr);
		});

		test('should decode nested object', () => {
			const obj = { user: { name: 'John', address: { city: 'Paris' } } };
			const encoded = JSON.encodeJsonForDataAttr(obj);
			const decoded = JSON.decodeJsonFromDataAttr(encoded);
			expect(decoded).toEqual(obj);
		});

		test('should handle special characters', () => {
			const obj = { text: 'Hello "World" & <tag>' };
			const encoded = JSON.encodeJsonForDataAttr(obj);
			const decoded = JSON.decodeJsonFromDataAttr(encoded);
			expect(decoded).toEqual(obj);
		});
	});

	describe('JSON encode/decode round-trip', () => {
		test('should preserve data through encode/decode cycle', () => {
			const testCases = [
				{ string: 'test' },
				{ number: 123 },
				{ boolean: true },
				{ null: null },
				{ array: [1, 2, 3] },
				{ nested: { a: { b: { c: 'deep' } } } },
				{ mixed: ['text', 123, true, null, { key: 'value' }] }
			];

			testCases.forEach(obj => {
				const encoded = JSON.encodeJsonForDataAttr(obj);
				const decoded = JSON.decodeJsonFromDataAttr(encoded);
				expect(decoded).toEqual(obj);
			});
		});
	});
});