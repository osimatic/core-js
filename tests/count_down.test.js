/**
 * @jest-environment jsdom
 */
import { CountDown } from '../count_down.js';

describe('CountDown', () => {
	let div;
	let intervalCallback;

	beforeEach(() => {
		jest.useFakeTimers();

		div = document.createElement('div');
		document.body.appendChild(div);

		const originalSetInterval = global.setInterval;
		jest.spyOn(global, 'setInterval').mockImplementation((callback, delay) => {
			intervalCallback = callback;
			return originalSetInterval(callback, delay);
		});
	});

	afterEach(() => {
		jest.clearAllTimers();
		jest.restoreAllMocks();
		document.body.innerHTML = '';
	});

	function getLinkA()           { return div.querySelector('.count_down_link a'); }
	function getCountDownCurrent(){ return div.querySelector('.count_down_current'); }
	function getCountDownText()   { return div.querySelector('.count_down_text'); }

	describe('init', () => {
		test('should return undefined when div is null', () => {
			const result = CountDown.init(null, { onRefreshData: jest.fn() });
			expect(result).toBeUndefined();
		});

		test('should create countdown UI elements with provided labels', () => {
			CountDown.init(div, { labelNextUpdate: 'Next Update', labelDoUpdate: 'Refresh Now' });

			expect(div.querySelector('.count_down_title').textContent).toBe('Next Update');
			expect(div.querySelector('.count_down_progress')).not.toBeNull();
			expect(getCountDownCurrent()).not.toBeNull();
			expect(getCountDownText()).not.toBeNull();
			expect(getLinkA().textContent).toBe('Refresh Now');
		});

		test('should use default labels when not provided', () => {
			CountDown.init(div, {});

			expect(div.querySelector('.count_down_title').textContent).toBe('Prochaine mise à jour');
			expect(getLinkA().textContent).toBe('Mettre à jour');
		});

		test('should set up click handler on refresh link', () => {
			const callback = jest.fn((cb) => cb());
			CountDown.init(div, { onRefreshData: callback });
			const callCountAfterInit = callback.mock.calls.length;

			getLinkA().click();

			expect(callback.mock.calls.length).toBeGreaterThan(callCountAfterInit);
		});

		test('should start interval timer', () => {
			CountDown.init(div, {});
			expect(setInterval).toHaveBeenCalledWith(expect.any(Function), 60);
		});

		test('should call onRefreshData immediately after init', () => {
			const callback = jest.fn((cb) => cb());
			CountDown.init(div, { onRefreshData: callback });

			expect(callback).toHaveBeenCalled();
		});

		test('should accept a jQuery-like object', () => {
			const jqueryLike = { jquery: '3.6.0', 0: div, length: 1 };
			expect(() => CountDown.init(jqueryLike, {})).not.toThrow();
			expect(div.querySelector('.count_down_title')).not.toBeNull();
		});
	});

	describe('refreshData', () => {
		test('should call onRefreshData on click', () => {
			const callback = jest.fn((cb) => cb());
			CountDown.init(div, { onRefreshData: callback });
			const callCountAfterInit = callback.mock.calls.length;

			getLinkA().click();

			expect(callback.mock.calls.length).toBe(callCountAfterInit + 1);
		});

		test('should disable button during request', () => {
			let callCount = 0;
			const callback = jest.fn((cb) => {
				callCount++;
				if (callCount === 1) cb(); // first (init) call completes, click does not
			});
			CountDown.init(div, { onRefreshData: callback });

			getLinkA().click();

			expect(getLinkA().disabled).toBe(true);
		});

		test('should re-enable button after request completes', () => {
			const callback = jest.fn((cb) => cb());
			CountDown.init(div, { onRefreshData: callback });

			getLinkA().click();

			expect(getLinkA().disabled).toBe(false);
		});

		test('should not launch new request if already making request', () => {
			const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
			const callback = jest.fn(); // never completes → alreadyMakingRequest stays true
			CountDown.init(div, { onRefreshData: callback });
			const callCountAfterInit = callback.mock.calls.length;

			getLinkA().click();

			expect(callback.mock.calls.length).toBe(callCountAfterInit);
			expect(consoleLogSpy).toHaveBeenCalledWith('Already making request, no new request lauched.');
			consoleLogSpy.mockRestore();
		});

		test('should not crash if onRefreshData is not a function', () => {
			expect(() => CountDown.init(div, {})).not.toThrow();
		});

		test('should allow new request after previous completes', () => {
			let completeCallback;
			const callback = jest.fn((cb) => { completeCallback = cb; });
			CountDown.init(div, { onRefreshData: callback });

			completeCallback();
			const callCountAfterComplete = callback.mock.calls.length;

			getLinkA().click();

			expect(callback.mock.calls.length).toBe(callCountAfterComplete + 1);
		});
	});

	describe('interval timer behavior', () => {
		test('should show remaining seconds in text', () => {
			const callback = jest.fn((cb) => cb());
			CountDown.init(div, { onRefreshData: callback });

			intervalCallback();

			expect(getCountDownText().innerHTML).toBe('10s');
		});

		test('should show 0s when time reaches limit', () => {
			const callback = jest.fn((cb) => cb());
			CountDown.init(div, { onRefreshData: callback });

			for (let i = 0; i < 167; i++) intervalCallback();

			expect(getCountDownText().innerHTML).toBe('0s');
		});

		test('should set progress bar to full when time reaches limit', () => {
			const callback = jest.fn((cb) => cb());
			CountDown.init(div, { onRefreshData: callback });

			for (let i = 0; i < 167; i++) intervalCallback();

			expect(getCountDownCurrent().style.width).toBe('120px');
		});

		test('should update progress bar width proportionally', () => {
			const callback = jest.fn((cb) => cb());
			CountDown.init(div, { onRefreshData: callback });

			intervalCallback();

			const width = parseInt(getCountDownCurrent().style.width);
			expect(width).toBeGreaterThanOrEqual(0);
			expect(width).toBeLessThanOrEqual(120);
		});

		test('should trigger refreshData after timeout when time limit reached', () => {
			const callback = jest.fn((cb) => cb());
			CountDown.init(div, { onRefreshData: callback });

			for (let i = 0; i < 167; i++) intervalCallback();

			const callCountBefore = callback.mock.calls.length;
			jest.advanceTimersByTime(100);

			expect(callback.mock.calls.length).toBeGreaterThan(callCountBefore);
		});

		test('should reset currentMillis to 0 when button is disabled', () => {
			const callback = jest.fn((cb) => cb());
			CountDown.init(div, { onRefreshData: callback });

			getLinkA().disabled = true;
			intervalCallback();

			expect(getCountDownCurrent().style.width).toBe('0px');
		});
	});

	describe('integration scenarios', () => {
		test('should complete full countdown cycle', () => {
			const callback = jest.fn((cb) => cb());
			CountDown.init(div, { onRefreshData: callback });
			const initialCallCount = callback.mock.calls.length;

			for (let i = 0; i < 167; i++) intervalCallback();
			jest.advanceTimersByTime(100);

			expect(callback.mock.calls.length).toBeGreaterThan(initialCallCount);
		});

		test('should block rapid manual refreshes when already in progress', () => {
			const callback = jest.fn(); // never completes
			CountDown.init(div, { onRefreshData: callback });
			const callCountAfterInit = callback.mock.calls.length;

			getLinkA().click();

			expect(callback.mock.calls.length).toBe(callCountAfterInit);
		});

		test('should allow new refresh after previous completes', () => {
			let completeCallback;
			const callback = jest.fn((cb) => { completeCallback = cb; });
			CountDown.init(div, { onRefreshData: callback });

			completeCallback();
			const callCountAfterComplete = callback.mock.calls.length;

			getLinkA().click();
			expect(callback.mock.calls.length).toBe(callCountAfterComplete + 1);
		});
	});
});