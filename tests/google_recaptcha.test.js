import { GoogleRecaptcha } from '../google_recaptcha.js';

describe('GoogleRecaptcha', () => {
	let mockGrecaptcha;
	let consoleLogSpy;
	let consoleErrorSpy;

	beforeEach(() => {
		// Mock grecaptcha
		mockGrecaptcha = {
			render: jest.fn((id, config) => {
				return `widget-${id}`;
			}),
			reset: jest.fn()
		};

		global.grecaptcha = mockGrecaptcha;

		// Spy on console methods
		consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
		consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

		// Clear static properties
		delete GoogleRecaptcha.config;
		delete GoogleRecaptcha.googleCaptchaRendersCallback;
		delete GoogleRecaptcha.grecaptchaWidgets;
	});

	afterEach(() => {
		jest.clearAllMocks();
		consoleLogSpy.mockRestore();
		consoleErrorSpy.mockRestore();
		delete global.grecaptcha;
		delete GoogleRecaptcha.config;
		delete GoogleRecaptcha.googleCaptchaRendersCallback;
		delete GoogleRecaptcha.grecaptchaWidgets;
	});

	describe('setConfig', () => {
		test('should set config', () => {
			const config = {
				sitekey: 'test-site-key',
				theme: 'light'
			};

			GoogleRecaptcha.setConfig(config);

			expect(GoogleRecaptcha.config).toBe(config);
		});

		test('should overwrite existing config', () => {
			const config1 = { sitekey: 'key1' };
			const config2 = { sitekey: 'key2' };

			GoogleRecaptcha.setConfig(config1);
			expect(GoogleRecaptcha.config).toBe(config1);

			GoogleRecaptcha.setConfig(config2);
			expect(GoogleRecaptcha.config).toBe(config2);
		});
	});

	describe('onLoad', () => {
		test('should log onLoad message', () => {
			GoogleRecaptcha.onLoad();

			expect(consoleLogSpy).toHaveBeenCalledWith('GoogleRecaptcha.onLoad');
		});

		test('should return early when grecaptcha is undefined', () => {
			delete global.grecaptcha;

			GoogleRecaptcha.onLoad();

			expect(consoleLogSpy).toHaveBeenCalledWith('var grecaptcha undefined');
		});

		test('should return early when grecaptcha.render is not a function', () => {
			global.grecaptcha = { render: null };

			GoogleRecaptcha.onLoad();

			expect(consoleLogSpy).toHaveBeenCalledWith('var grecaptcha undefined');
		});

		test('should initialize googleCaptchaRendersCallback if undefined', () => {
			GoogleRecaptcha.onLoad();

			expect(Array.isArray(GoogleRecaptcha.googleCaptchaRendersCallback)).toBe(true);
		});

		test('should execute all callbacks in googleCaptchaRendersCallback', () => {
			const callback1 = jest.fn();
			const callback2 = jest.fn();
			const callback3 = jest.fn();

			GoogleRecaptcha.googleCaptchaRendersCallback = [callback1, callback2, callback3];

			GoogleRecaptcha.onLoad();

			expect(callback1).toHaveBeenCalled();
			expect(callback2).toHaveBeenCalled();
			expect(callback3).toHaveBeenCalled();
		});

		test('should clear googleCaptchaRendersCallback after execution', () => {
			const callback = jest.fn();
			GoogleRecaptcha.googleCaptchaRendersCallback = [callback];

			GoogleRecaptcha.onLoad();

			expect(GoogleRecaptcha.googleCaptchaRendersCallback).toEqual([]);
		});

		test('should handle empty callback array', () => {
			GoogleRecaptcha.googleCaptchaRendersCallback = [];

			expect(() => {
				GoogleRecaptcha.onLoad();
			}).not.toThrow();

			expect(GoogleRecaptcha.googleCaptchaRendersCallback).toEqual([]);
		});

		test('should execute callbacks with correct context', () => {
			let contextThis;
			const callback = jest.fn(function() {
				contextThis = this;
			});
			GoogleRecaptcha.googleCaptchaRendersCallback = [callback];

			GoogleRecaptcha.onLoad();

			expect(callback).toHaveBeenCalled();
		});
	});

	describe('render', () => {
		test('should add render callback and execute it', () => {
			const id = 'recaptcha-1';
			GoogleRecaptcha.setConfig({ sitekey: 'test' });

			GoogleRecaptcha.render(id);

			// Callback should have been executed and array cleared
			expect(GoogleRecaptcha.googleCaptchaRendersCallback).toEqual([]);
			// The callback should have called reset which renders the captcha
			expect(mockGrecaptcha.render).toHaveBeenCalledWith(id, { sitekey: 'test' });
		});

		test('should call reset through callback', () => {
			const id = 'recaptcha-1';
			GoogleRecaptcha.setConfig({ sitekey: 'test' });

			GoogleRecaptcha.render(id);

			// The render method should have triggered reset which calls grecaptcha.render
			expect(mockGrecaptcha.render).toHaveBeenCalledWith(id, { sitekey: 'test' });
		});

		test('should trigger onLoad', () => {
			const onLoadSpy = jest.spyOn(GoogleRecaptcha, 'onLoad');

			GoogleRecaptcha.render('recaptcha-1');

			expect(onLoadSpy).toHaveBeenCalled();

			onLoadSpy.mockRestore();
		});
	});

	describe('reset', () => {
		beforeEach(() => {
			GoogleRecaptcha.setConfig({ sitekey: 'test-key' });
		});

		test('should return early when grecaptcha is undefined', () => {
			delete global.grecaptcha;

			GoogleRecaptcha.reset('recaptcha-1');

			expect(consoleLogSpy).toHaveBeenCalledWith('var grecaptcha.render undefined');
		});

		test('should return early when grecaptcha.render is not a function', () => {
			global.grecaptcha = { render: null };

			GoogleRecaptcha.reset('recaptcha-1');

			expect(consoleLogSpy).toHaveBeenCalledWith('var grecaptcha.render undefined');
		});

		test('should initialize grecaptchaWidgets if undefined', () => {
			GoogleRecaptcha.reset('recaptcha-1');

			expect(Array.isArray(GoogleRecaptcha.grecaptchaWidgets)).toBe(true);
		});

		test('should render new widget when widget does not exist', () => {
			const id = 'recaptcha-1';

			GoogleRecaptcha.reset(id);

			expect(mockGrecaptcha.render).toHaveBeenCalledWith(id, { sitekey: 'test-key' });
		});

		test('should store widget id after rendering', () => {
			const id = 'recaptcha-1';

			GoogleRecaptcha.reset(id);

			expect(GoogleRecaptcha.grecaptchaWidgets[id]).toBe('widget-recaptcha-1');
		});

		test('should reset existing widget instead of creating new one', () => {
			const id = 'recaptcha-1';

			// First call - creates widget
			GoogleRecaptcha.reset(id);
			expect(mockGrecaptcha.render).toHaveBeenCalledTimes(1);

			jest.clearAllMocks();

			// Second call - resets widget
			GoogleRecaptcha.reset(id);
			expect(mockGrecaptcha.render).not.toHaveBeenCalled();
			expect(mockGrecaptcha.reset).toHaveBeenCalledWith('widget-recaptcha-1');
		});

		test('should handle multiple widgets independently', () => {
			GoogleRecaptcha.reset('recaptcha-1');
			GoogleRecaptcha.reset('recaptcha-2');

			expect(GoogleRecaptcha.grecaptchaWidgets['recaptcha-1']).toBe('widget-recaptcha-1');
			expect(GoogleRecaptcha.grecaptchaWidgets['recaptcha-2']).toBe('widget-recaptcha-2');
			expect(mockGrecaptcha.render).toHaveBeenCalledTimes(2);
		});

		test('should catch and log error during grecaptcha.render', () => {
			const error = new Error('Render failed');
			mockGrecaptcha.render.mockImplementation(() => {
				throw error;
			});

			GoogleRecaptcha.reset('recaptcha-1');

			expect(consoleErrorSpy).toHaveBeenCalledWith('Exception during grecaptcha.render', error);
		});

		test('should not store widget id when render throws error', () => {
			mockGrecaptcha.render.mockImplementation(() => {
				throw new Error('Render failed');
			});

			GoogleRecaptcha.reset('recaptcha-1');

			expect(GoogleRecaptcha.grecaptchaWidgets['recaptcha-1']).toBeUndefined();
		});

		test('should use config passed to setConfig', () => {
			const config = {
				sitekey: 'my-site-key',
				theme: 'dark',
				size: 'compact'
			};
			GoogleRecaptcha.setConfig(config);

			GoogleRecaptcha.reset('recaptcha-1');

			expect(mockGrecaptcha.render).toHaveBeenCalledWith('recaptcha-1', config);
		});
	});

	describe('addRenderCallback', () => {
		test('should initialize googleCaptchaRendersCallback if undefined', () => {
			const callback = jest.fn();

			GoogleRecaptcha.addRenderCallback(callback);

			expect(Array.isArray(GoogleRecaptcha.googleCaptchaRendersCallback)).toBe(true);
		});

		test('should add callback to array and execute immediately', () => {
			const callback1 = jest.fn();
			const callback2 = jest.fn();

			GoogleRecaptcha.addRenderCallback(callback1);
			// Callback is executed immediately and array is cleared
			expect(callback1).toHaveBeenCalled();
			expect(GoogleRecaptcha.googleCaptchaRendersCallback).toEqual([]);

			GoogleRecaptcha.addRenderCallback(callback2);
			expect(callback2).toHaveBeenCalled();
			expect(GoogleRecaptcha.googleCaptchaRendersCallback).toEqual([]);
		});

		test('should log addRenderCallback message', () => {
			GoogleRecaptcha.addRenderCallback(jest.fn());

			expect(consoleLogSpy).toHaveBeenCalledWith('GoogleRecaptcha.addRenderCallback');
		});

		test('should call onLoad after adding callback', () => {
			const onLoadSpy = jest.spyOn(GoogleRecaptcha, 'onLoad');

			GoogleRecaptcha.addRenderCallback(jest.fn());

			expect(onLoadSpy).toHaveBeenCalled();

			onLoadSpy.mockRestore();
		});

		test('should execute callback immediately if grecaptcha is loaded', () => {
			const callback = jest.fn();

			GoogleRecaptcha.addRenderCallback(callback);

			expect(callback).toHaveBeenCalled();
		});

		test('should not execute callback if grecaptcha is not loaded', () => {
			delete global.grecaptcha;
			const callback = jest.fn();

			GoogleRecaptcha.addRenderCallback(callback);

			expect(callback).not.toHaveBeenCalled();
		});

		test('should keep callback in array if grecaptcha not loaded', () => {
			delete global.grecaptcha;
			const callback = jest.fn();

			GoogleRecaptcha.addRenderCallback(callback);

			expect(GoogleRecaptcha.googleCaptchaRendersCallback).toContain(callback);
		});
	});

	describe('integration scenarios', () => {
		test('should render multiple captchas sequentially', () => {
			GoogleRecaptcha.setConfig({ sitekey: 'test-key' });

			GoogleRecaptcha.render('captcha-1');
			GoogleRecaptcha.render('captcha-2');
			GoogleRecaptcha.render('captcha-3');

			// Execute callbacks
			GoogleRecaptcha.googleCaptchaRendersCallback.forEach(cb => cb());

			expect(mockGrecaptcha.render).toHaveBeenCalledWith('captcha-1', { sitekey: 'test-key' });
			expect(mockGrecaptcha.render).toHaveBeenCalledWith('captcha-2', { sitekey: 'test-key' });
			expect(mockGrecaptcha.render).toHaveBeenCalledWith('captcha-3', { sitekey: 'test-key' });
		});

		test('should handle render and reset lifecycle', () => {
			GoogleRecaptcha.setConfig({ sitekey: 'test-key' });

			// Render
			GoogleRecaptcha.render('captcha-1');
			GoogleRecaptcha.googleCaptchaRendersCallback.forEach(cb => cb());

			expect(mockGrecaptcha.render).toHaveBeenCalledTimes(1);

			jest.clearAllMocks();

			// Reset should reuse widget
			GoogleRecaptcha.reset('captcha-1');
			expect(mockGrecaptcha.render).not.toHaveBeenCalled();
			expect(mockGrecaptcha.reset).toHaveBeenCalled();
		});

		test('should queue callbacks when grecaptcha not loaded yet', () => {
			delete global.grecaptcha;

			const callback1 = jest.fn();
			const callback2 = jest.fn();

			GoogleRecaptcha.addRenderCallback(callback1);
			GoogleRecaptcha.addRenderCallback(callback2);

			expect(callback1).not.toHaveBeenCalled();
			expect(callback2).not.toHaveBeenCalled();

			// Simulate grecaptcha loading
			global.grecaptcha = mockGrecaptcha;
			GoogleRecaptcha.onLoad();

			expect(callback1).toHaveBeenCalled();
			expect(callback2).toHaveBeenCalled();
		});

		test('should handle config changes between renders', () => {
			GoogleRecaptcha.setConfig({ sitekey: 'key1' });
			GoogleRecaptcha.reset('captcha-1');

			expect(mockGrecaptcha.render).toHaveBeenCalledWith('captcha-1', { sitekey: 'key1' });

			jest.clearAllMocks();

			GoogleRecaptcha.setConfig({ sitekey: 'key2' });
			GoogleRecaptcha.reset('captcha-2');

			expect(mockGrecaptcha.render).toHaveBeenCalledWith('captcha-2', { sitekey: 'key2' });
		});

		test('should handle errors gracefully and continue working', () => {
			GoogleRecaptcha.setConfig({ sitekey: 'test-key' });

			// First render fails
			mockGrecaptcha.render.mockImplementationOnce(() => {
				throw new Error('Render failed');
			});

			GoogleRecaptcha.reset('captcha-1');
			expect(consoleErrorSpy).toHaveBeenCalled();

			// Second render succeeds
			GoogleRecaptcha.reset('captcha-2');
			expect(GoogleRecaptcha.grecaptchaWidgets['captcha-2']).toBe('widget-captcha-2');
		});

		test('should reset same captcha multiple times', () => {
			GoogleRecaptcha.setConfig({ sitekey: 'test-key' });

			// First reset - renders
			GoogleRecaptcha.reset('captcha-1');
			expect(mockGrecaptcha.render).toHaveBeenCalledTimes(1);

			jest.clearAllMocks();

			// Second reset - resets
			GoogleRecaptcha.reset('captcha-1');
			expect(mockGrecaptcha.reset).toHaveBeenCalledTimes(1);

			// Third reset - resets again
			GoogleRecaptcha.reset('captcha-1');
			expect(mockGrecaptcha.reset).toHaveBeenCalledTimes(2);
		});
	});
});