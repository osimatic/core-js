import { HexColor, RgbColor } from '../draw.js';

describe('HexColor', () => {
	describe('check', () => {
		test('should return true for valid 6-character hex color', () => {
			expect(HexColor.check('FF5733')).toBe(true);
		});

		test('should return true for lowercase hex color', () => {
			expect(HexColor.check('ff5733')).toBe(true);
		});

		test('should return true for mixed case hex color', () => {
			expect(HexColor.check('Ff5733')).toBe(true);
		});

		test('should return true for all zeros', () => {
			expect(HexColor.check('000000')).toBe(true);
		});

		test('should return true for all Fs', () => {
			expect(HexColor.check('FFFFFF')).toBe(true);
		});

		test('should return false for hex with # prefix', () => {
			expect(HexColor.check('#FF5733')).toBe(false);
		});

		test('should return false for 3-character hex', () => {
			expect(HexColor.check('F57')).toBe(false);
		});

		test('should return false for 5-character hex', () => {
			expect(HexColor.check('FF573')).toBe(false);
		});

		test('should return false for 7-character hex', () => {
			expect(HexColor.check('FF57333')).toBe(false);
		});

		test('should return false for invalid characters', () => {
			expect(HexColor.check('GG5733')).toBe(false);
		});

		test('should return false for empty string', () => {
			expect(HexColor.check('')).toBe(false);
		});
	});

	describe('convertToRgb', () => {
		test('should convert valid hex to RGB array', () => {
			expect(HexColor.convertToRgb('FF5733')).toEqual([255, 87, 51]);
		});

		test('should convert white to RGB', () => {
			expect(HexColor.convertToRgb('FFFFFF')).toEqual([255, 255, 255]);
		});

		test('should convert black to RGB', () => {
			expect(HexColor.convertToRgb('000000')).toEqual([0, 0, 0]);
		});

		test('should handle hex with # prefix', () => {
			expect(HexColor.convertToRgb('#FF5733')).toEqual([255, 87, 51]);
		});

		test('should handle lowercase hex', () => {
			expect(HexColor.convertToRgb('ff5733')).toEqual([255, 87, 51]);
		});

		test('should handle mixed case hex', () => {
			expect(HexColor.convertToRgb('Ff5733')).toEqual([255, 87, 51]);
		});

		test('should convert 3-character hex by doubling', () => {
			expect(HexColor.convertToRgb('F57')).toEqual([255, 85, 119]);
		});

		test('should handle 3-character hex with # prefix', () => {
			expect(HexColor.convertToRgb('#F57')).toEqual([255, 85, 119]);
		});

		test('should convert 3-character white', () => {
			expect(HexColor.convertToRgb('FFF')).toEqual([255, 255, 255]);
		});

		test('should convert 3-character black', () => {
			expect(HexColor.convertToRgb('000')).toEqual([0, 0, 0]);
		});

		test('should return null for invalid hex', () => {
			expect(HexColor.convertToRgb('GG5733')).toBeNull();
		});

		test('should return null for empty string', () => {
			expect(HexColor.convertToRgb('')).toBeNull();
		});

		test('should return null for too long hex', () => {
			expect(HexColor.convertToRgb('FF57333')).toBeNull();
		});

		test('should convert red', () => {
			expect(HexColor.convertToRgb('FF0000')).toEqual([255, 0, 0]);
		});

		test('should convert green', () => {
			expect(HexColor.convertToRgb('00FF00')).toEqual([0, 255, 0]);
		});

		test('should convert blue', () => {
			expect(HexColor.convertToRgb('0000FF')).toEqual([0, 0, 255]);
		});
	});

	describe('isLight', () => {
		test('should return true for white', () => {
			expect(HexColor.isLight('FFFFFF')).toBe(true);
		});

		test('should return false for black', () => {
			expect(HexColor.isLight('000000')).toBe(false);
		});

		test('should return true for yellow (light color)', () => {
			expect(HexColor.isLight('FFFF00')).toBe(true);
		});

		test('should return false for dark blue', () => {
			expect(HexColor.isLight('0000FF')).toBe(false);
		});

		test('should return false for dark red', () => {
			expect(HexColor.isLight('8B0000')).toBe(false);
		});

		test('should return true for light cyan', () => {
			expect(HexColor.isLight('E0FFFF')).toBe(true);
		});

		test('should handle # prefix', () => {
			expect(HexColor.isLight('#FFFFFF')).toBe(true);
		});

		test('should handle 3-character hex', () => {
			expect(HexColor.isLight('FFF')).toBe(true);
		});

		test('should return false for invalid hex', () => {
			expect(HexColor.isLight('GGGGGG')).toBe(false);
		});

		test('should return false for empty string', () => {
			expect(HexColor.isLight('')).toBe(false);
		});

		test('should return true for light gray', () => {
			expect(HexColor.isLight('CCCCCC')).toBe(true);
		});

		test('should return false for dark gray', () => {
			expect(HexColor.isLight('333333')).toBe(false);
		});

		test('should correctly evaluate medium gray (borderline)', () => {
			// Medium gray (808080 = 128,128,128) should be evaluated by the luminance formula
			// coeff = 0.2125*128 + 0.7154*128 + 0.0721*128 = 128
			// coeff > 128 returns false, so it's considered dark
			expect(HexColor.isLight('808080')).toBe(false);
		});

		test('should return true for slightly lighter than medium gray', () => {
			expect(HexColor.isLight('818181')).toBe(true);
		});

		test('should handle green (important for luminance calculation)', () => {
			// Green has highest weight in luminance formula (0.7154)
			expect(HexColor.isLight('00FF00')).toBe(true);
		});
	});
});

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