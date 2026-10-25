import { RgbColor } from '../../draw/RgbColor.js';

describe('RgbColor', () => {
	describe('isLight', () => {
		test('should return true for white (255,255,255)', () => {
			expect(RgbColor.isLight(255, 255, 255)).toBe(true);
		});

		test('should return false for black (0,0,0)', () => {
			expect(RgbColor.isLight(0, 0, 0)).toBe(false);
		});

		test('should return true for pure red at high intensity (255,0,0)', () => {
			expect(RgbColor.isLight(255, 0, 0)).toBe(false);
		});

		test('should return true for pure green at high intensity (0,255,0)', () => {
			// Green has highest weight (0.7154) so pure green should be light
			expect(RgbColor.isLight(0, 255, 0)).toBe(true);
		});

		test('should return false for pure blue at high intensity (0,0,255)', () => {
			// Blue has lowest weight (0.0721) so pure blue should be dark
			expect(RgbColor.isLight(0, 0, 255)).toBe(false);
		});

		test('should return true for yellow (255,255,0)', () => {
			expect(RgbColor.isLight(255, 255, 0)).toBe(true);
		});

		test('should return true for cyan (0,255,255)', () => {
			expect(RgbColor.isLight(0, 255, 255)).toBe(true);
		});

		test('should return false for magenta (255,0,255)', () => {
			expect(RgbColor.isLight(255, 0, 255)).toBe(false);
		});

		test('should return true for light gray (200,200,200)', () => {
			expect(RgbColor.isLight(200, 200, 200)).toBe(true);
		});

		test('should return false for dark gray (50,50,50)', () => {
			expect(RgbColor.isLight(50, 50, 50)).toBe(false);
		});

		test('should handle edge case at exactly 128 threshold', () => {
			// coeff = 0.2125*128 + 0.7154*128 + 0.0721*128 = 128
			// coeff > 128 is false
			expect(RgbColor.isLight(128, 128, 128)).toBe(false);
		});

		test('should return true for just above threshold', () => {
			expect(RgbColor.isLight(129, 129, 129)).toBe(true);
		});

		test('should return false for just below threshold', () => {
			expect(RgbColor.isLight(127, 127, 127)).toBe(false);
		});

		test('should correctly weight green more than red', () => {
			// Test that green contributes more to lightness
			// (100,0,0) vs (0,100,0)
			expect(RgbColor.isLight(100, 0, 0)).toBe(false);
			expect(RgbColor.isLight(0, 100, 0)).toBe(false); // Still too dark
			expect(RgbColor.isLight(0, 180, 0)).toBe(true); // Green reaches light faster
		});

		test('should correctly weight blue less than red', () => {
			// Test that blue contributes least to lightness
			expect(RgbColor.isLight(150, 0, 0)).toBe(false);
			expect(RgbColor.isLight(0, 0, 150)).toBe(false);
		});

		test('should handle orange color (255,165,0)', () => {
			expect(RgbColor.isLight(255, 165, 0)).toBe(true);
		});

		test('should handle brown color (165,42,42)', () => {
			expect(RgbColor.isLight(165, 42, 42)).toBe(false);
		});

		test('should handle pink color (255,192,203)', () => {
			expect(RgbColor.isLight(255, 192, 203)).toBe(true);
		});

		test('should handle navy color (0,0,128)', () => {
			expect(RgbColor.isLight(0, 0, 128)).toBe(false);
		});
	});
});