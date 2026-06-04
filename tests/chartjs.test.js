/**
 * @jest-environment jsdom
 */
import { Chartjs } from '../chartjs.js';
import { DatePeriod } from '../date_time.js';

let mockChartInstance;

beforeEach(() => {
	mockChartInstance = { data: null, config: null };
	global.Chart = jest.fn((ctx, config) => {
		mockChartInstance.config = config;
		return mockChartInstance;
	});
	global.Chart.register = jest.fn();
	Chartjs.initialized = false;
	HTMLCanvasElement.prototype.getContext = jest.fn(() => ({}));
});

afterEach(() => {
	delete global.Chart;
	Chartjs.initialized = false;
	document.body.innerHTML = '';
	jest.restoreAllMocks();
});

function makeCanvas() {
	const canvas = document.createElement('canvas');
	document.body.appendChild(canvas);
	return canvas;
}

describe('Chartjs', () => {

	describe('init', () => {
		test('registers centerText plugin on first call', () => {
			Chartjs.init();
			expect(global.Chart.register).toHaveBeenCalledTimes(1);
			expect(global.Chart.register).toHaveBeenCalledWith(
				expect.objectContaining({ id: 'centerText' })
			);
		});

		test('does not register plugin on subsequent calls', () => {
			Chartjs.init();
			global.Chart.register.mockClear();
			Chartjs.init();
			expect(global.Chart.register).not.toHaveBeenCalled();
		});

		test('sets Chartjs.initialized to true', () => {
			Chartjs.init();
			expect(Chartjs.initialized).toBe(true);
		});
	});

	describe('createStackedChart', () => {
		const chartData = { labels: ['A', 'B'], datasets: [{ label: 'X', data: [1, 2] }] };

		test('clears div and calls Chart constructor with type bar', () => {
			const canvas = makeCanvas();
			canvas.innerHTML = '<span>old</span>';
			Chartjs.createStackedChart(canvas, chartData);
			expect(canvas.innerHTML).toBe('');
			expect(global.Chart).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ type: 'bar' }));
		});

		test('merges user options', () => {
			Chartjs.createStackedChart(makeCanvas(), chartData, null, { options: { responsive: false } });
			expect(mockChartInstance.config.options.responsive).toBe(false);
		});

		test('title displayed when provided', () => {
			Chartjs.createStackedChart(makeCanvas(), chartData, 'My Title');
			expect(mockChartInstance.config.options.plugins.title.display).toBe(true);
			expect(mockChartInstance.config.options.plugins.title.text).toBe('My Title');
		});

		test('title not displayed when null', () => {
			Chartjs.createStackedChart(makeCanvas(), chartData, null);
			expect(mockChartInstance.config.options.plugins.title.display).toBe(false);
		});

		test('tooltip label callback', () => {
			Chartjs.createStackedChart(makeCanvas(), chartData);
			const fn = mockChartInstance.config.options.plugins.tooltip.callbacks.label;
			expect(fn({ dataset: { label: 'Test' }, parsed: { y: 42 } })).toBe('Test: 42');
		});

		test('accepts jQuery-like object', () => {
			const canvas = makeCanvas();
			const jq = { jquery: '3.6.0', 0: canvas, length: 1 };
			expect(() => Chartjs.createStackedChart(jq, chartData)).not.toThrow();
			expect(global.Chart).toHaveBeenCalled();
		});
	});

	describe('createBarChart', () => {
		const chartData = { labels: ['A', 'B'], datasets: [{ label: 'X', data: [1, 2] }] };

		test('clears div and calls Chart constructor with type bar', () => {
			const canvas = makeCanvas();
			canvas.innerHTML = '<span>old</span>';
			Chartjs.createBarChart(canvas, chartData);
			expect(canvas.innerHTML).toBe('');
			expect(global.Chart).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ type: 'bar' }));
		});

		test('title displayed when provided', () => {
			Chartjs.createBarChart(makeCanvas(), chartData, 'My Title');
			expect(mockChartInstance.config.options.plugins.title.display).toBe(true);
			expect(mockChartInstance.config.options.plugins.title.text).toBe('My Title');
		});

		test('title not displayed when null', () => {
			Chartjs.createBarChart(makeCanvas(), chartData, null);
			expect(mockChartInstance.config.options.plugins.title.display).toBe(false);
		});

		test('tooltip label callback', () => {
			Chartjs.createBarChart(makeCanvas(), chartData);
			const fn = mockChartInstance.config.options.plugins.tooltip.callbacks.label;
			expect(fn({ dataset: { label: 'Test' }, parsed: { y: 10 } })).toBe('Test : 10');
		});

		test('accepts jQuery-like object', () => {
			const canvas = makeCanvas();
			const jq = { jquery: '3.6.0', 0: canvas, length: 1 };
			expect(() => Chartjs.createBarChart(jq, chartData)).not.toThrow();
			expect(global.Chart).toHaveBeenCalled();
		});
	});

	describe('createLineChart', () => {
		const chartData = { labels: ['A', 'B'], datasets: [{ label: 'X', data: [1, 2] }] };

		test('clears div and calls Chart constructor with type line', () => {
			const canvas = makeCanvas();
			Chartjs.createLineChart(canvas, chartData);
			expect(canvas.innerHTML).toBe('');
			expect(global.Chart).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ type: 'line' }));
		});

		test('tooltip label callback', () => {
			Chartjs.createLineChart(makeCanvas(), chartData);
			const fn = mockChartInstance.config.options.plugins.tooltip.callbacks.label;
			expect(fn({ dataset: { label: 'Line' }, parsed: { y: 7 } })).toBe('Line : 7');
		});
	});

	describe('createDoughnutChart', () => {
		test('clears div and calls Chart constructor with type doughnut', () => {
			const canvas = makeCanvas();
			Chartjs.createDoughnutChart(canvas, { labels: ['A'], values: [1], colors: ['#f00'] });
			expect(canvas.innerHTML).toBe('');
			expect(global.Chart).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ type: 'doughnut' }));
		});

		test('uses chartData.values as dataset data', () => {
			Chartjs.createDoughnutChart(makeCanvas(), { labels: ['A', 'B'], values: [30, 70], colors: ['#f00', '#00f'] });
			expect(mockChartInstance.config.data.datasets[0].data).toEqual([30, 70]);
		});

		test('tooltip label shows percentage', () => {
			Chartjs.createDoughnutChart(makeCanvas(), { labels: ['A', 'B'], values: [30, 70], colors: ['#f00', '#00f'] });
			const fn = mockChartInstance.config.options.plugins.tooltip.callbacks.label;
			expect(fn({ label: 'A', raw: 30, dataset: { data: [30, 70] } })).toBe('A: 30 (30.0%)');
		});

		test('tooltip label for 100%', () => {
			Chartjs.createDoughnutChart(makeCanvas(), { labels: ['Only'], values: [100], colors: ['#f00'] });
			const fn = mockChartInstance.config.options.plugins.tooltip.callbacks.label;
			expect(fn({ label: 'Only', raw: 100, dataset: { data: [100] } })).toBe('Only: 100 (100.0%)');
		});
	});

	describe('groupByPeriod', () => {
		test('should group data by day (default)', () => {
			const data = {
				'2024-01-15': { views: 10, clicks: 5 },
				'2024-01-16': { views: 20, clicks: 8 },
				'2024-01-17': { views: 15, clicks: 6 }
			};
			const result = Chartjs.groupByPeriod(data, 'day', ['views', 'clicks']);
			expect(result).toHaveLength(3);
			expect(result[0]).toEqual({ label: '2024-01-15', views: 10, clicks: 5 });
			expect(result[1]).toEqual({ label: '2024-01-16', views: 20, clicks: 8 });
			expect(result[2]).toEqual({ label: '2024-01-17', views: 15, clicks: 6 });
		});

		test('should group data by month', () => {
			const data = {
				'2024-01-15': { views: 10, clicks: 5 },
				'2024-01-20': { views: 20, clicks: 8 },
				'2024-02-05': { views: 15, clicks: 6 }
			};
			const result = Chartjs.groupByPeriod(data, 'month', ['views', 'clicks']);
			expect(result).toHaveLength(2);
			expect(result[0].label).toBe('2024-01');
			expect(result[0].views).toBe(15);
			expect(result[0].clicks).toBe(6.5);
			expect(result[1].label).toBe('2024-02');
		});

		test('should group data by week', () => {
			const data = {
				'2024-01-01': { views: 10 },
				'2024-01-02': { views: 20 },
				'2024-01-08': { views: 15 },
				'2024-01-09': { views: 25 }
			};
			const result = Chartjs.groupByPeriod(data, 'week', ['views']);
			expect(result.length).toBeGreaterThan(0);
			result.forEach(item => {
				expect(item.label).toMatch(/^\d{4}-S\d+$/);
			});
		});

		test('should handle single metric', () => {
			const data = { '2024-01-15': { views: 10 }, '2024-01-16': { views: 20 } };
			const result = Chartjs.groupByPeriod(data, 'day', ['views']);
			expect(result).toHaveLength(2);
			expect(result[0]).toEqual({ label: '2024-01-15', views: 10 });
		});

		test('should handle multiple metrics', () => {
			const data = { '2024-01-15': { views: 10, clicks: 5, conversions: 2 } };
			const result = Chartjs.groupByPeriod(data, 'day', ['views', 'clicks', 'conversions']);
			expect(result[0]).toEqual({ label: '2024-01-15', views: 10, clicks: 5, conversions: 2 });
		});

		test('should handle empty data', () => {
			expect(Chartjs.groupByPeriod({}, 'day', ['views'])).toEqual([]);
		});

		test('should average values when grouping by month', () => {
			const data = {
				'2024-01-10': { score: 100 },
				'2024-01-15': { score: 200 },
				'2024-01-20': { score: 300 }
			};
			const result = Chartjs.groupByPeriod(data, 'month', ['score']);
			expect(result[0].score).toBe(200);
		});

		test('should handle missing metric values', () => {
			const data = { '2024-01-15': { views: 10 }, '2024-01-16': { views: 20, clicks: 5 } };
			const result = Chartjs.groupByPeriod(data, 'day', ['views', 'clicks']);
			expect(result[0]).toEqual({ label: '2024-01-15', views: 10, clicks: NaN });
			expect(result[1]).toEqual({ label: '2024-01-16', views: 20, clicks: 5 });
		});

		test('should handle dates across different years', () => {
			const data = { '2023-12-30': { count: 5 }, '2024-01-02': { count: 10 } };
			const result = Chartjs.groupByPeriod(data, 'month', ['count']);
			expect(result[0].label).toBe('2023-12');
			expect(result[1].label).toBe('2024-01');
		});
	});

	describe('getPeriodLabels', () => {

		test('delegates to DatePeriod.getPeriodLabels with default locale/timezone', () => {
			const spy = jest.spyOn(DatePeriod, 'getPeriodLabels');
			const data = { '2024-01-01': {}, '2024-02-01': {} };
			Chartjs.getPeriodLabels(data, 'month');
			expect(spy).toHaveBeenCalledWith(Object.keys(data), 'month', 'fr-FR', 'Europe/Paris');
		});

		test('passes custom locale and timezone', () => {
			const spy = jest.spyOn(DatePeriod, 'getPeriodLabels');
			const data = { '2024-01-01': {} };
			Chartjs.getPeriodLabels(data, 'month', 'en-US', 'America/New_York');
			expect(spy).toHaveBeenCalledWith(Object.keys(data), 'month', 'en-US', 'America/New_York');
		});
	});

	describe('getAutoGranularity', () => {
		test('should return day_of_month for data spanning 30 days or less', () => {
			expect(Chartjs.getAutoGranularity({ '2024-01-01': {}, '2024-01-15': {}, '2024-01-30': {} })).toBe('day_of_month');
		});

		test('should return week for data spanning 31-90 days', () => {
			expect(Chartjs.getAutoGranularity({ '2024-01-01': {}, '2024-03-15': {} })).toBe('week');
		});

		test('should return month for data spanning more than 90 days', () => {
			expect(Chartjs.getAutoGranularity({ '2024-01-01': {}, '2024-05-01': {} })).toBe('month');
		});

		test('should return day_of_month for single day', () => {
			expect(Chartjs.getAutoGranularity({ '2024-01-01': {} })).toBe('day_of_month');
		});

		test('should return week for exactly 31 days', () => {
			expect(Chartjs.getAutoGranularity({ '2024-01-01': {}, '2024-02-01': {} })).toBe('week');
		});

		test('should return week for exactly 90 days', () => {
			expect(Chartjs.getAutoGranularity({ '2024-01-01': {}, '2024-03-31': {} })).toBe('week');
		});

		test('should return month for exactly 91 days', () => {
			expect(Chartjs.getAutoGranularity({ '2024-01-01': {}, '2024-04-01': {} })).toBe('month');
		});

		test('should handle dates in random order', () => {
			expect(Chartjs.getAutoGranularity({ '2024-03-01': {}, '2024-01-01': {}, '2024-02-01': {} })).toBe('week');
		});

		test('should return month for data spanning a full year', () => {
			expect(Chartjs.getAutoGranularity({ '2024-01-01': {}, '2024-12-31': {} })).toBe('month');
		});
	});

});