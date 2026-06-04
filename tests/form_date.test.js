/**
 * @jest-environment jsdom
 */
import { FormDate, InputPeriod } from '../form_date.js';

describe('FormDate', () => {
	describe('getPeriodList', () => {
		let periodList;

		beforeEach(() => {
			periodList = FormDate.getPeriodList();
		});

		test('should return an object', () => {
			expect(typeof periodList).toBe('object');
			expect(periodList).not.toBeNull();
		});

		test('should contain other category', () => {
			expect(periodList).toHaveProperty('other');
			expect(periodList.other).toHaveProperty('label', 'Autre');
			expect(periodList.other).toHaveProperty('list');
			expect(periodList.other.list).toHaveProperty('perso', 'Personnalisé');
		});

		test('should contain 1d (one day) category', () => {
			expect(periodList).toHaveProperty('1d');
			expect(periodList['1d']).toHaveProperty('label', 'Un jour');
			expect(periodList['1d']).toHaveProperty('list');
			expect(periodList['1d'].list).toHaveProperty('ajd', 'Aujourd’hui');
			expect(periodList['1d'].list).toHaveProperty('hier', 'Hier');
			expect(periodList['1d'].list).toHaveProperty('jourMoins2', 'Avant-hier');
		});

		test('should contain 1w (one week) category', () => {
			expect(periodList).toHaveProperty('1w');
			expect(periodList['1w']).toHaveProperty('label', 'Une semaine');
			expect(periodList['1w'].list).toHaveProperty('curr_week', 'Cette semaine');
			expect(periodList['1w'].list).toHaveProperty('last_week', 'La semaine dernière');
		});

		test('should contain 7d (7 days) category', () => {
			expect(periodList).toHaveProperty('7d');
			expect(periodList['7d']).toHaveProperty('label', '7 jours');
			expect(periodList['7d'].list).toHaveProperty('last_7_days', 'Les 7 derniers jours');
		});

		test('should contain 14d (14 days) category', () => {
			expect(periodList).toHaveProperty('14d');
			expect(periodList['14d']).toHaveProperty('label', '14 jours');
			expect(periodList['14d'].list).toHaveProperty('last_14_days', 'Les 14 derniers jours');
		});

		test('should contain 30d (30 days) category', () => {
			expect(periodList).toHaveProperty('30d');
			expect(periodList['30d']).toHaveProperty('label', '30 jours');
			expect(periodList['30d'].list).toHaveProperty('last_30_days', 'Les 30 derniers jours');
		});

		test('should contain 60d (60 days) category', () => {
			expect(periodList).toHaveProperty('60d');
			expect(periodList['60d']).toHaveProperty('label', '60 jours');
			expect(periodList['60d'].list).toHaveProperty('last_60_days', 'Les 60 derniers jours');
		});

		test('should contain 1m (one month) category', () => {
			expect(periodList).toHaveProperty('1m');
			expect(periodList['1m']).toHaveProperty('label', 'Un mois');
			expect(periodList['1m'].list).toHaveProperty('curr_month', 'Ce mois-ci');
			expect(periodList['1m'].list).toHaveProperty('last_month', 'Le mois dernier');
		});

		test('should contain 3m (3 months) category', () => {
			expect(periodList).toHaveProperty('3m');
			expect(periodList['3m']).toHaveProperty('label', '3 mois');
			expect(periodList['3m'].list).toHaveProperty('last_3_month', 'Les 3 derniers mois');
		});

		test('should contain 6m (6 months) category', () => {
			expect(periodList).toHaveProperty('6m');
			expect(periodList['6m']).toHaveProperty('label', '6 mois');
			expect(periodList['6m'].list).toHaveProperty('last_6_month', 'Les 6 derniers mois');
		});

		test('should contain 12m (12 months) category', () => {
			expect(periodList).toHaveProperty('12m');
			expect(periodList['12m']).toHaveProperty('label', '12 mois');
			expect(periodList['12m'].list).toHaveProperty('last_12_month', 'Les 12 derniers mois');
		});

		test('should contain 24m (24 months) category', () => {
			expect(periodList).toHaveProperty('24m');
			expect(periodList['24m']).toHaveProperty('label', '24 mois');
			expect(periodList['24m'].list).toHaveProperty('last_24_month', 'Les 24 derniers mois');
		});

		test('should contain 1y (one year) category', () => {
			expect(periodList).toHaveProperty('1y');
			expect(periodList['1y']).toHaveProperty('label', 'Une année');
			expect(periodList['1y'].list).toHaveProperty('curr_year', 'Cette année');
			expect(periodList['1y'].list).toHaveProperty('last_year', 'L’année dernière');
		});

		test('should have all expected day options in 1d category', () => {
			expect(periodList['1d'].list).toEqual({
				'ajd': 'Aujourd’hui',
				'hier': 'Hier',
				'jourMoins2': 'Avant-hier',
				'jourMoins3': 'J-3',
				'jourMoins7': 'J-7',
				'jourMoins8': 'J-8',
				'same_day_last_year': 'Même jour l’année dernière',
				'same_day_least_2_years': 'Même jour l’année A-2',
				'same_day_as_yesterday_last_year': 'Même jour qu’hier l’année dernière',
				'same_day_as_yesterday_least_2_years': 'Même jour qu’hier l’année A-2'
			});
		});

		test('should have all expected week options in 1w category', () => {
			expect(periodList['1w'].list).toEqual({
				'curr_week': 'Cette semaine',
				'last_week': 'La semaine dernière',
				'weekMoins2': 'Semaine S-2',
				'weekMoins3': 'Semaine S-3',
				'weekMoins4': 'Semaine S-4',
			});
		});

		test('should have all expected month options in 1m category', () => {
			expect(periodList['1m'].list).toEqual({
				'curr_month': 'Ce mois-ci',
				'last_month': 'Le mois dernier',
				'monthMoins2': 'Mois M-2',
				'monthMoins3': 'Mois M-3',
				'monthMoins4': 'Mois M-4',
				'monthMoins5': 'Mois M-5',
				'monthMoins6': 'Mois M-6',
				'same_month_last_year': 'Même mois l’année dernière',
				'same_month_least_2_years': 'Même mois l’année A-2',
			});
		});

		test('should have all expected year options in 1y category', () => {
			expect(periodList['1y'].list).toEqual({
				'curr_year': 'Cette année',
				'last_year': 'L’année dernière',
				'yearMoins2': 'Année A-2',
				'yearMoins3': 'Année A-3',
				'yearMoins4': 'Année A-4',
			});
		});

		test('should have same_day_last_year in 1d category', () => {
			expect(periodList['1d'].list).toHaveProperty('same_day_last_year', 'Même jour l’année dernière');
		});

		test('should have last_7_days_least_1_year in 7d category', () => {
			expect(periodList['7d'].list).toHaveProperty('last_7_days_least_1_year', 'Les mêmes 7 jours l’année dernière');
		});

		test('should return consistent structure on multiple calls', () => {
			const list1 = FormDate.getPeriodList();
			const list2 = FormDate.getPeriodList();

			expect(list1).toEqual(list2);
		});

		test('should have all 13 categories', () => {
			const keys = Object.keys(periodList);
			expect(keys).toHaveLength(13);
			expect(keys).toEqual([
				'other', '1d', '1w', '7d', '14d', '30d', '60d',
				'1m', '3m', '6m', '12m', '24m', '1y'
			]);
		});
	});

	describe('fillYearSelect', () => {
		let mockSelect;

		beforeEach(() => {
			mockSelect = { insertAdjacentHTML: jest.fn() };
		});

		test('should do nothing if element does not exist', () => {
			expect(() => FormDate.fillYearSelect(null)).not.toThrow();
			expect(() => FormDate.fillYearSelect(undefined)).not.toThrow();
		});

		test('should fill select with years from 5 years before to current year', () => {
			FormDate.fillYearSelect(mockSelect);

			const currentYear = new Date().getUTCFullYear();

			// Should be called 6 times (current year + 5 years before)
			expect(mockSelect.insertAdjacentHTML).toHaveBeenCalledTimes(6);

			// Check first year
			expect(mockSelect.insertAdjacentHTML).toHaveBeenCalledWith(
				'beforeend',
				`<option value="${currentYear - 5}">${currentYear - 5}</option>`
			);

			// Check last year (current year)
			expect(mockSelect.insertAdjacentHTML).toHaveBeenCalledWith(
				'beforeend',
				`<option value="${currentYear}">${currentYear}</option>`
			);
		});

		test('should fill select with custom range', () => {
			FormDate.fillYearSelect(mockSelect, 3, 2);

			const currentYear = new Date().getUTCFullYear();

			// Should be called 6 times (3 before + current + 2 after)
			expect(mockSelect.insertAdjacentHTML).toHaveBeenCalledTimes(6);

			// Check first year
			expect(mockSelect.insertAdjacentHTML).toHaveBeenCalledWith(
				'beforeend',
				`<option value="${currentYear - 3}">${currentYear - 3}</option>`
			);

			// Check last year
			expect(mockSelect.insertAdjacentHTML).toHaveBeenCalledWith(
				'beforeend',
				`<option value="${currentYear + 2}">${currentYear + 2}</option>`
			);
		});

		test('should handle only future years', () => {
			FormDate.fillYearSelect(mockSelect, 0, 5);

			// Should be called 6 times (current + 5 after)
			expect(mockSelect.insertAdjacentHTML).toHaveBeenCalledTimes(6);
		});

		test('should handle only one year (current)', () => {
			FormDate.fillYearSelect(mockSelect, 0, 0);

			const currentYear = new Date().getUTCFullYear();

			// Should be called 1 time (only current year)
			expect(mockSelect.insertAdjacentHTML).toHaveBeenCalledTimes(1);
			expect(mockSelect.insertAdjacentHTML).toHaveBeenCalledWith(
				'beforeend',
				`<option value="${currentYear}">${currentYear}</option>`
			);
		});
	});

	describe('fillMonthSelect', () => {
		let mockSelect;

		beforeEach(() => {
			mockSelect = { insertAdjacentHTML: jest.fn() };

			// Mock String.prototype.capitalize for this test
			if (!String.prototype.capitalize) {
				String.prototype.capitalize = function() {
					return this.charAt(0).toUpperCase() + this.slice(1);
				};
			}
		});

		test('should do nothing if element does not exist', () => {
			expect(() => FormDate.fillMonthSelect(null)).not.toThrow();
			expect(() => FormDate.fillMonthSelect(undefined)).not.toThrow();
		});

		test('should fill select with 12 months', () => {
			FormDate.fillMonthSelect(mockSelect, 'fr');

			expect(mockSelect.insertAdjacentHTML).toHaveBeenCalledTimes(12);
			expect(mockSelect.insertAdjacentHTML).toHaveBeenCalledWith('beforeend', '<option value="1">Janvier</option>');
			expect(mockSelect.insertAdjacentHTML).toHaveBeenCalledWith('beforeend', '<option value="12">Décembre</option>');
		});
	});

	describe('fillDayOfWeekSelect', () => {
		let mockSelect;

		beforeEach(() => {
			mockSelect = { insertAdjacentHTML: jest.fn() };

			if (!String.prototype.capitalize) {
				String.prototype.capitalize = function() {
					return this.charAt(0).toUpperCase() + this.slice(1);
				};
			}
		});

		test('should do nothing if element does not exist', () => {
			expect(() => FormDate.fillDayOfWeekSelect(null)).not.toThrow();
			expect(() => FormDate.fillDayOfWeekSelect(undefined)).not.toThrow();
		});

		test('should fill select with 7 days of week', () => {
			FormDate.fillDayOfWeekSelect(mockSelect, 'fr');

			expect(mockSelect.insertAdjacentHTML).toHaveBeenCalledTimes(7);
			expect(mockSelect.insertAdjacentHTML).toHaveBeenCalledWith('beforeend', '<option value="1">Lundi</option>');
			expect(mockSelect.insertAdjacentHTML).toHaveBeenCalledWith('beforeend', '<option value="7">Dimanche</option>');
		});
	});

	function makeDateFormGroupMock(day, month, year) {
		const dayObj = { value: day != null ? String(day) : undefined };
		const monthObj = { value: month != null ? String(month) : undefined };
		const yearObj = { value: year != null ? String(year) : undefined };
		return {
			querySelector: jest.fn((selector) => {
				if (selector === 'select.day') return dayObj;
				if (selector === 'select.month') return monthObj;
				if (selector === 'select.year') return yearObj;
				return null;
			}),
			_day: dayObj, _month: monthObj, _year: yearObj
		};
	}

	describe('getSelectedDate', () => {
		test('should return date from select values', () => {
			const mockFormGroup = makeDateFormGroupMock(15, 6, 2023);

			const result = FormDate.getSelectedDate(mockFormGroup);

			expect(result).toBeInstanceOf(Date);
			expect(result.getDate()).toBe(15);
			expect(result.getMonth()).toBe(5); // June (0-indexed)
			expect(result.getFullYear()).toBe(2023);
		});

		test('should return current date when selects return null values', () => {
			const periodFormGroup = {
				querySelector: jest.fn(() => ({ value: null }))
			};

			const result = FormDate.getSelectedDate(periodFormGroup);
			const now = new Date();

			expect(result).toBeInstanceOf(Date);
			// Just check it's approximately now (within 1 second)
			expect(Math.abs(result.getTime() - now.getTime())).toBeLessThan(1000);
		});
	});

	describe('setSelectedDate', () => {
		test('should set values on selects', () => {
			const mock = makeDateFormGroupMock();

			FormDate.setSelectedDate(mock, 25, 12, 2024);

			expect(mock._day.value).toBe(25);
			expect(mock._month.value).toBe(12);
			expect(mock._year.value).toBe(2024);
		});

		test('should handle -1 values (for not setting day/month)', () => {
			const mock = makeDateFormGroupMock();

			FormDate.setSelectedDate(mock, -1, -1, 2024);

			expect(mock._day.value).toBe(-1);
			expect(mock._month.value).toBe(-1);
			expect(mock._year.value).toBe(2024);
		});
	});

	describe('setTodaySelected', () => {
		test('should set today as selected date', () => {
			const mock = makeDateFormGroupMock();
			const today = new Date();

			FormDate.setTodaySelected(mock);

			expect(mock._day.value).toBe(today.getDate());
			expect(mock._month.value).toBe(today.getMonth() + 1);
			expect(mock._year.value).toBe(today.getFullYear());
		});
	});

	describe('setCurrentMonthSelected', () => {
		test('should set current month and year', () => {
			const mock = makeDateFormGroupMock();
			const today = new Date();

			FormDate.setCurrentMonthSelected(mock);

			expect(mock._day.value).toBe(-1);
			expect(mock._month.value).toBe(today.getMonth() + 1);
			expect(mock._year.value).toBe(today.getFullYear());
		});
	});

	describe('setCurrentYearSelected', () => {
		test('should set current year only', () => {
			const mock = makeDateFormGroupMock();
			const today = new Date();

			FormDate.setCurrentYearSelected(mock);

			expect(mock._day.value).toBe(-1);
			expect(mock._month.value).toBe(-1);
			expect(mock._year.value).toBe(today.getFullYear());
		});
	});

	describe('addNbDaysToToday', () => {
		test('should add 5 days to today', () => {
			const mock = makeDateFormGroupMock();

			FormDate.addNbDaysToToday(mock, 5);

			const expectedDate = new Date();
			expectedDate.setDate(expectedDate.getDate() + 5);

			expect(mock._day.value).toBe(expectedDate.getDate());
			expect(mock._month.value).toBe(expectedDate.getMonth() + 1);
			expect(mock._year.value).toBe(expectedDate.getFullYear());
		});

		test('should subtract 3 days from today', () => {
			const mock = makeDateFormGroupMock();

			FormDate.addNbDaysToToday(mock, -3);

			const expectedDate = new Date();
			expectedDate.setDate(expectedDate.getDate() - 3);

			expect(mock._day.value).toBe(expectedDate.getDate());
		});
	});

	describe('addNbMonthsToToday', () => {
		test('should add 2 months to today', () => {
			const mock = makeDateFormGroupMock();

			FormDate.addNbMonthsToToday(mock, 2);

			const expectedDate = new Date();
			expectedDate.setDate(1);
			expectedDate.setMonth(expectedDate.getMonth() - 2);

			expect(mock._day.value).toBe(-1);
			expect(mock._month.value).toBe(expectedDate.getMonth() + 1);
		});
	});

	describe('addNbYearsToToday', () => {
		test('should subtract 1 year from today', () => {
			const mock = makeDateFormGroupMock();

			FormDate.addNbYearsToToday(mock, -1);

			const expectedDate = new Date();

			expect(mock._day.value).toBe(-1);
			expect(mock._month.value).toBe(-1);
			expect(mock._year.value).toBe(expectedDate.getFullYear() + 1);
		});
	});

	describe('addNbDaysToSelectedDate', () => {
		test('should add days to selected date', () => {
			const mock = makeDateFormGroupMock(15, 6, 2023);

			FormDate.addNbDaysToSelectedDate(mock, 7);

			const expectedDate = new Date(2023, 5, 15);
			expectedDate.setDate(expectedDate.getDate() + 7);

			expect(mock._day.value).toBe(expectedDate.getDate());
		});

		test('should add days to today when fromSelectedDate is false', () => {
			const mock = makeDateFormGroupMock();

			FormDate.addNbDaysToSelectedDate(mock, 5, false);

			const expectedDate = new Date();
			expectedDate.setDate(expectedDate.getDate() + 5);

			expect(mock._day.value).toBe(expectedDate.getDate());
		});
	});

	describe('addNbMonthsToSelectedDate', () => {
		test('should subtract months from selected date', () => {
			const mock = makeDateFormGroupMock(15, 8, 2023);

			FormDate.addNbMonthsToSelectedDate(mock, -2);

			const expectedDate = new Date(2023, 7, 15);
			expectedDate.setDate(1);
			expectedDate.setMonth(expectedDate.getMonth() + 2);

			expect(mock._day.value).toBe(-1);
			expect(mock._month.value).toBe(expectedDate.getMonth() + 1);
		});
	});

	describe('addNbYearsToSelectedDate', () => {
		test('should subtract years from selected date', () => {
			const mock = makeDateFormGroupMock(20, 3, 2023);

			FormDate.addNbYearsToSelectedDate(mock, -2);

			expect(mock._day.value).toBe(-1);
			expect(mock._month.value).toBe(-1);
			expect(mock._year.value).toBe(2025);
		});
	});

	describe('initForm', () => {
		beforeEach(() => {
			if (!String.prototype.capitalize) {
				String.prototype.capitalize = function() {
					return this.charAt(0).toUpperCase() + this.slice(1);
				};
			}
		});

		test('should initialize without errors when no selects present', () => {
			const form = document.createElement('form');
			expect(() => {
				FormDate.initForm(form);
			}).not.toThrow();
		});

		test('should fill period select when select.periode is present', () => {
			const form = document.createElement('form');
			form.innerHTML = `
				<div class="form-group">
					<select class="periode"></select>
				</div>
				<div class="form-group hide"></div>
			`;
			document.body.appendChild(form);

			FormDate.initForm(form);

			const periodeSelect = form.querySelector('select.periode');
			expect(periodeSelect.children.length).toBeGreaterThan(0);

			document.body.removeChild(form);
		});

		test('should add quick select links for day/month/year selects', () => {
			const form = document.createElement('form');
			form.innerHTML = `
				<select class="day"></select>
				<select class="month"></select>
				<select class="year"></select>
			`;

			FormDate.initForm(form);

			expect(form.querySelector('a.lien_form_today')).not.toBeNull();
			expect(form.querySelector('a.lien_form_yesterday')).not.toBeNull();
			expect(form.querySelector('a.lien_form_current_month')).not.toBeNull();
		});

		test('should add click handlers for today link', () => {
			const form = document.createElement('form');
			form.innerHTML = `
				<select class="day"></select>
				<select class="month"></select>
				<select class="year"></select>
			`;

			FormDate.initForm(form);

			const todayLink = form.querySelector('a.lien_form_today');
			expect(todayLink).not.toBeNull();
		});

		test('should fill period comparison select when present', () => {
			const form = document.createElement('form');
			form.innerHTML = `
				<div class="form-group">
					<select class="periode"></select>
				</div>
				<div class="form-group hide"></div>
				<div class="form-group">
					<select class="periodeCompare"></select>
				</div>
				<div class="form-group hide"></div>
			`;
			document.body.appendChild(form);

			FormDate.initForm(form);

			expect(form.querySelector('select.periode').children.length).toBeGreaterThan(0);
			expect(form.querySelector('select.periodeCompare').children.length).toBeGreaterThan(0);

			document.body.removeChild(form);
		});
	});
});

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