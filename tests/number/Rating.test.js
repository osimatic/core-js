import { Rating } from '../../number/Rating.js';

describe('Rating', () => {
	describe('display', () => {
		test('should return empty string for null rating', () => {
			expect(Rating.display(null)).toBe('');
		});

		test('should display full stars only', () => {
			expect(Rating.display(3, 5)).toBe('&#9733;&#9733;&#9733;&#9734;&#9734;');
		});

		test('should round up at 0.5', () => {
			expect(Rating.display(3.5, 5)).toBe('&#9733;&#9733;&#9733;&#9733;&#9734;');
		});

		test('should round down below 0.5', () => {
			expect(Rating.display(3.4, 5)).toBe('&#9733;&#9733;&#9733;&#9734;&#9734;');
		});

		test('should display max rating', () => {
			expect(Rating.display(5, 5)).toBe('&#9733;&#9733;&#9733;&#9733;&#9733;');
		});

		test('should display zero rating', () => {
			expect(Rating.display(0, 5)).toBe('&#9734;&#9734;&#9734;&#9734;&#9734;');
		});

		test('should show half star when imgHalf provided and decimal in [0.25, 0.75)', () => {
			expect(Rating.display(3.5, 5, '&#9733;', '&#9734;', '½')).toBe('&#9733;&#9733;&#9733;½&#9734;');
		});

		test('should round up with imgHalf when decimal >= 0.75', () => {
			expect(Rating.display(3.8, 5, '&#9733;', '&#9734;', '½')).toBe('&#9733;&#9733;&#9733;&#9733;&#9734;');
		});

		test('should round down with imgHalf when decimal < 0.25', () => {
			expect(Rating.display(3.1, 5, '&#9733;', '&#9734;', '½')).toBe('&#9733;&#9733;&#9733;&#9734;&#9734;');
		});

		test('should support custom image strings', () => {
			expect(Rating.display(2, 3, '[on]', '[off]')).toBe('[on][on][off]');
		});
	});
});