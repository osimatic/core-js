import { sleep, refresh } from '../util.js';

describe('Util', () => {
	describe('sleep', () => {
		test('should block for approximately the specified time', () => {
			const startTime = Date.now();
			sleep(100);
			const endTime = Date.now();
			const elapsed = endTime - startTime;

			// Allow some tolerance for timing
			expect(elapsed).toBeGreaterThanOrEqual(100);
			expect(elapsed).toBeLessThan(200);
		});

		test('should block for 0 milliseconds', () => {
			const startTime = Date.now();
			sleep(0);
			const endTime = Date.now();
			const elapsed = endTime - startTime;

			// Should complete very quickly
			expect(elapsed).toBeLessThan(50);
		});

		test('should handle small delays', () => {
			const startTime = Date.now();
			sleep(10);
			const endTime = Date.now();
			const elapsed = endTime - startTime;

			expect(elapsed).toBeGreaterThanOrEqual(10);
			expect(elapsed).toBeLessThan(100);
		});

		test('should handle negative values as immediate return', () => {
			const startTime = Date.now();
			sleep(-100);
			const endTime = Date.now();
			const elapsed = endTime - startTime;

			// Should complete immediately as condition is never met
			expect(elapsed).toBeLessThan(50);
		});

		test('should not throw error', () => {
			expect(() => sleep(50)).not.toThrow();
		});

		test('should be a function', () => {
			expect(typeof sleep).toBe('function');
		});
	});

	describe('refresh', () => {
		let reloadMock;
		let originalWindow;

		beforeEach(() => {
			// Save original window
			originalWindow = global.window;

			// Mock window.location.reload
			reloadMock = jest.fn();
			global.window = {
				location: {
					reload: reloadMock
				}
			};
		});

		afterEach(() => {
			// Restore original window
			global.window = originalWindow;
		});

		test('should call window.location.reload with true', () => {
			refresh();

			expect(reloadMock).toHaveBeenCalledTimes(1);
			expect(reloadMock).toHaveBeenCalledWith(true);
		});

		test('should not throw error', () => {
			expect(() => refresh()).not.toThrow();
		});

		test('should be a function', () => {
			expect(typeof refresh).toBe('function');
		});

		test('should force reload (not use cache)', () => {
			refresh();

			// Verify that reload was called with true (force reload)
			expect(reloadMock).toHaveBeenCalledWith(true);
		});
	});
});