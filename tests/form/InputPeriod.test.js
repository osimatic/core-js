/**
 * @jest-environment jsdom
 */
import { jest } from '@jest/globals';
import { InputPeriod } from '../../form/InputPeriod.js';

describe('InputPeriod', () => {
	beforeEach(() => {
		document.body.innerHTML = '';
	});

	test('should be a class', () => {
		expect(typeof InputPeriod).toBe('function');
	});

	test('should have static methods', () => {
		expect(typeof InputPeriod.addLinks).toBe('function');
		expect(typeof InputPeriod.init).toBe('function');
		expect(typeof InputPeriod.selectToday).toBe('function');
		expect(typeof InputPeriod.selectPreviousDay).toBe('function');
		expect(typeof InputPeriod.selectFollowingDay).toBe('function');
		expect(typeof InputPeriod.selectCurrentWeek).toBe('function');
		expect(typeof InputPeriod.selectPreviousWeek).toBe('function');
		expect(typeof InputPeriod.selectFollowingWeek).toBe('function');
		expect(typeof InputPeriod.selectCurrentMonth).toBe('function');
		expect(typeof InputPeriod.selectPreviousMonth).toBe('function');
		expect(typeof InputPeriod.selectFollowingMonth).toBe('function');
		expect(typeof InputPeriod.selectCurrentYear).toBe('function');
		expect(typeof InputPeriod.selectPreviousYear).toBe('function');
		expect(typeof InputPeriod.selectFollowingYear).toBe('function');
		expect(typeof InputPeriod.selectPeriod).toBe('function');
	});

	describe('addLinks', () => {
		test('should add period selection links after input-group parent', () => {
			document.body.innerHTML = `
				<form>
					<div class="input-group">
						<input type="date" data-add_period_select_links="1" />
					</div>
				</form>
			`;
			const form = document.querySelector('form');

			InputPeriod.addLinks(form);

			expect(form.querySelector('.select_period_links')).not.toBeNull();
			// Links should be outside the input-group (sibling of input-group)
			const inputGroup = form.querySelector('.input-group');
			expect(inputGroup.nextElementSibling).not.toBeNull();
			expect(inputGroup.nextElementSibling.classList.contains('select_period_links')).toBe(true);
		});

		test('should add links directly to parent when not input-group', () => {
			document.body.innerHTML = `
				<form>
					<div>
						<input type="date" data-add_period_select_links="1" />
					</div>
				</form>
			`;
			const form = document.querySelector('form');

			InputPeriod.addLinks(form);

			expect(form.querySelector('.select_period_links')).not.toBeNull();
			expect(form.querySelector('a.period_select_yesterday')).not.toBeNull();
			expect(form.querySelector('a.period_select_current_week')).not.toBeNull();
			expect(form.querySelector('a.period_select_last_month')).not.toBeNull();
		});
	});

	test('should not throw when form has no input[data-add_period_select_links]', () => {
		document.body.innerHTML = `<form><div><input type="date" /></div></form>`;
		const form = document.querySelector('form');

		expect(() => InputPeriod.addLinks(form)).not.toThrow();
		expect(form.querySelector('.select_period_links')).toBeNull();
	});

	describe('init', () => {
		test('should set up click handlers for all period links', () => {
			const linkSelectors = [
				'a.period_select_today',
				'a.period_select_yesterday',
				'a.period_select_tomorrow',
				'a.period_select_current_week',
				'a.period_select_last_week',
				'a.period_select_current_month',
				'a.period_select_last_month',
				'a.period_select_current_year',
				'a.period_select_last_year'
			];

			const mockLinks = {};
			linkSelectors.forEach(selector => {
				mockLinks[selector] = { addEventListener: jest.fn() };
			});

			const mockForm = {
				querySelector: jest.fn((selector) => mockLinks[selector] || null)
			};

			InputPeriod.init(mockForm);

			linkSelectors.forEach(selector => {
				expect(mockLinks[selector].addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
			});
		});

		test('should handle missing links gracefully', () => {
			const mockForm = {
				querySelector: jest.fn(() => null)
			};

			expect(() => {
				InputPeriod.init(mockForm);
			}).not.toThrow();
		});
	});

	function makeContainerWithPeriodInputs() {
		document.body.innerHTML = `
			<div id="outer">
				<div id="inner">
					<a href="#" id="link"></a>
					<input type="date" name="start_date" />
					<input type="date" name="end_date" />
				</div>
			</div>
		`;
		return document.getElementById('link');
	}

	describe('selectToday', () => {
		test('should select today date in period inputs', () => {
			const link = makeContainerWithPeriodInputs();

			InputPeriod.selectToday(link);

			const today = new Date();
			expect(document.querySelector('input[name="start_date"]').value).not.toBe('');
			expect(document.querySelector('input[name="end_date"]').value).not.toBe('');
		});
	});

	describe('selectPreviousDay', () => {
		test('should select yesterday', () => {
			const link = makeContainerWithPeriodInputs();

			InputPeriod.selectPreviousDay(link, 1);

			expect(document.querySelector('input[name="start_date"]').value).not.toBe('');
			expect(document.querySelector('input[name="end_date"]').value).not.toBe('');
		});
	});

	describe('selectFollowingDay', () => {
		test('should select tomorrow', () => {
			const link = makeContainerWithPeriodInputs();

			InputPeriod.selectFollowingDay(link, 1);

			expect(document.querySelector('input[name="start_date"]').value).not.toBe('');
			expect(document.querySelector('input[name="end_date"]').value).not.toBe('');
		});
	});

	describe('selectCurrentWeek', () => {
		test('should select current week period', () => {
			const link = makeContainerWithPeriodInputs();

			InputPeriod.selectCurrentWeek(link);

			expect(document.querySelector('input[name="start_date"]').value).not.toBe('');
			expect(document.querySelector('input[name="end_date"]').value).not.toBe('');
		});
	});

	describe('selectPreviousWeek', () => {
		test('should select previous week', () => {
			const link = makeContainerWithPeriodInputs();

			InputPeriod.selectPreviousWeek(link, 1);

			expect(document.querySelector('input[name="start_date"]').value).not.toBe('');
			expect(document.querySelector('input[name="end_date"]').value).not.toBe('');
		});
	});

	describe('selectFollowingWeek', () => {
		test('should select following week', () => {
			const link = makeContainerWithPeriodInputs();

			InputPeriod.selectFollowingWeek(link, 2);

			expect(document.querySelector('input[name="start_date"]').value).not.toBe('');
			expect(document.querySelector('input[name="end_date"]').value).not.toBe('');
		});
	});

	describe('selectCurrentMonth', () => {
		test('should select current month period', () => {
			const link = makeContainerWithPeriodInputs();

			InputPeriod.selectCurrentMonth(link);

			expect(document.querySelector('input[name="start_date"]').value).not.toBe('');
			expect(document.querySelector('input[name="end_date"]').value).not.toBe('');
		});
	});

	describe('selectPreviousMonth', () => {
		test('should select previous month', () => {
			const link = makeContainerWithPeriodInputs();

			InputPeriod.selectPreviousMonth(link, 1);

			expect(document.querySelector('input[name="start_date"]').value).not.toBe('');
			expect(document.querySelector('input[name="end_date"]').value).not.toBe('');
		});
	});

	describe('selectFollowingMonth', () => {
		test('should select following month', () => {
			const link = makeContainerWithPeriodInputs();

			InputPeriod.selectFollowingMonth(link, 3);

			expect(document.querySelector('input[name="start_date"]').value).not.toBe('');
			expect(document.querySelector('input[name="end_date"]').value).not.toBe('');
		});
	});

	describe('selectCurrentYear', () => {
		test('should select current year period', () => {
			const link = makeContainerWithPeriodInputs();

			InputPeriod.selectCurrentYear(link);

			expect(document.querySelector('input[name="start_date"]').value).not.toBe('');
			expect(document.querySelector('input[name="end_date"]').value).not.toBe('');
		});
	});

	describe('selectPreviousYear', () => {
		test('should select previous year', () => {
			const link = makeContainerWithPeriodInputs();

			InputPeriod.selectPreviousYear(link, 1);

			expect(document.querySelector('input[name="start_date"]').value).not.toBe('');
			expect(document.querySelector('input[name="end_date"]').value).not.toBe('');
		});
	});

	describe('selectFollowingYear', () => {
		test('should select following year', () => {
			const link = makeContainerWithPeriodInputs();

			InputPeriod.selectFollowingYear(link, 2);

			expect(document.querySelector('input[name="start_date"]').value).not.toBe('');
			expect(document.querySelector('input[name="end_date"]').value).not.toBe('');
		});
	});

	describe('selectPeriod', () => {
		test('should return early when no start input found', () => {
			const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

			document.body.innerHTML = `<div><div><a href="#" id="link"></a></div></div>`;
			const link = document.getElementById('link');

			InputPeriod.selectPeriod(link, new Date(), new Date());

			expect(consoleLogSpy).toHaveBeenCalledWith('no period input found');
			consoleLogSpy.mockRestore();
		});

		test('should return early when no end input found', () => {
			const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

			document.body.innerHTML = `
				<div>
					<div>
						<a href="#" id="link"></a>
						<input type="date" name="start_date" />
					</div>
				</div>
			`;
			const link = document.getElementById('link');

			InputPeriod.selectPeriod(link, new Date(), new Date());

			expect(consoleLogSpy).toHaveBeenCalledWith('no period input found');
			consoleLogSpy.mockRestore();
		});

		test('should set values on both inputs when found', () => {
			const link = makeContainerWithPeriodInputs();

			const startDate = new Date(2023, 5, 1);
			const endDate = new Date(2023, 5, 30);

			InputPeriod.selectPeriod(link, startDate, endDate);

			expect(document.querySelector('input[name="start_date"]').value).not.toBe('');
			expect(document.querySelector('input[name="end_date"]').value).not.toBe('');
		});
	});
});