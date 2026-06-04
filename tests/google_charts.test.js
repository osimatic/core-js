/**
 * @jest-environment jsdom
 */
import { GoogleCharts } from '../google_charts.js';

describe('GoogleCharts', () => {
	let mockChart;
	let mockDataTable;
	let consoleErrorSpy;

	beforeEach(() => {
		// Mock DataTable
		mockDataTable = {
			addColumn: jest.fn(),
			addRows: jest.fn(),
			setCell: jest.fn()
		};

		// Mock Chart instances
		mockChart = {
			draw: jest.fn()
		};

		// Mock google.charts
		global.google = {
			charts: {
				load: jest.fn(),
				setOnLoadCallback: jest.fn(),
				Bar: jest.fn(() => mockChart),
				Line: jest.fn(() => mockChart)
			},
			visualization: {
				DataTable: jest.fn(() => mockDataTable),
				ComboChart: jest.fn(() => mockChart),
				PieChart: jest.fn(() => mockChart),
				events: {
					addListener: jest.fn((chart, event, callback) => {
						// Simulate immediate ready event for testing
						if (event === 'ready') {
							setTimeout(() => callback(), 0);
						}
					})
				}
			}
		};

		// Spy on console.error
		consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
	});

	afterEach(() => {
		delete global.google;
		consoleErrorSpy.mockRestore();
		jest.clearAllMocks();
		document.body.innerHTML = '';
	});

	function makeDiv(id, ...classes) {
		const div = document.createElement('div');
		div.id = id;
		if (classes.length) div.classList.add(...classes);
		document.body.appendChild(div);
		return div;
	}

	describe('init', () => {
		test('should load Google Charts with correct packages', () => {
			GoogleCharts.init();

			expect(global.google.charts.load).toHaveBeenCalledWith('current', {
				packages: ['bar', 'line', 'corechart']
			});
		});

		test('should set onLoad callback when provided', () => {
			const callback = jest.fn();

			GoogleCharts.init(callback);

			expect(global.google.charts.setOnLoadCallback).toHaveBeenCalledWith(callback);
		});

		test('should not set onLoad callback when undefined string', () => {
			GoogleCharts.init('undefined');

			expect(global.google.charts.setOnLoadCallback).not.toHaveBeenCalled();
		});

		test('should set onLoad callback with function', () => {
			const callback = jest.fn();

			GoogleCharts.init(callback);

			expect(global.google.charts.setOnLoadCallback).toHaveBeenCalledWith(callback);
		});
	});

	describe('drawCharts', () => {
		test('should filter out charts with missing div_id', () => {
			makeDiv('chart1');
			makeDiv('chart2');

			const chartsList = [
				{ div_id: 'chart1', chart_type: 'column_chart', title: 'Test' },
				{ chart_type: 'bar_chart', title: 'No ID' },
				{ div_id: 'chart2', chart_type: 'line_chart', title: 'Test 2' }
			];

			const drawSpy = jest.spyOn(GoogleCharts, 'draw').mockImplementation((div, options) => {
				if (options.onComplete) options.onComplete();
			});

			GoogleCharts.drawCharts(chartsList);

			// Should only call draw for charts with div_id
			expect(drawSpy).toHaveBeenCalledTimes(2);

			drawSpy.mockRestore();
		});

		test('should filter out charts with non-existent div elements', () => {
			makeDiv('existing');
			// 'missing' is NOT added to the DOM

			const chartsList = [
				{ div_id: 'existing', chart_type: 'column_chart', title: 'Test' },
				{ div_id: 'missing', chart_type: 'bar_chart', title: 'Missing' }
			];

			const drawSpy = jest.spyOn(GoogleCharts, 'draw').mockImplementation((div, options) => {
				if (options.onComplete) options.onComplete();
			});

			GoogleCharts.drawCharts(chartsList);

			expect(drawSpy).toHaveBeenCalledTimes(1);

			drawSpy.mockRestore();
		});

		test('should call onComplete after all charts are drawn', (done) => {
			makeDiv('chart1');
			makeDiv('chart2');

			const chartsList = [
				{
					div_id: 'chart1',
					chart_type: 'column_chart',
					title: 'Chart 1',
					abscissa_label: 'X',
					abscissa_data: ['A', 'B'],
					ordinate_label: ['Y'],
					ordinate_data: [[1, 2]],
					colors: ['#FF0000']
				},
				{
					div_id: 'chart2',
					chart_type: 'bar_chart',
					title: 'Chart 2',
					abscissa_label: 'X',
					abscissa_data: ['C', 'D'],
					ordinate_label: ['Y'],
					ordinate_data: [[3, 4]],
					colors: ['#00FF00']
				}
			];

			const onComplete = jest.fn();
			const drawSpy = jest.spyOn(GoogleCharts, 'draw').mockImplementation((div, options) => {
				// Simulate async completion
				setTimeout(() => {
					if (options.onComplete) options.onComplete();
				}, 10);
			});

			GoogleCharts.drawCharts(chartsList, onComplete);

			setTimeout(() => {
				expect(onComplete).toHaveBeenCalledTimes(1);
				expect(drawSpy).toHaveBeenCalledTimes(2);
				drawSpy.mockRestore();
				done();
			}, 50);
		});

		test('should pass all chart data to draw method', () => {
			const div = makeDiv('chart1');

			const chartData = {
				div_id: 'chart1',
				chart_type: 'pie_chart',
				title: 'Test Chart',
				abscissa_label: 'Category',
				abscissa_data: { A: 10, B: 20 },
				ordinate_label: ['Value'],
				ordinate_data: [[10, 20]],
				colors: ['#FF0000', '#00FF00'],
				ordinate_format: '#,##0',
				height: 400,
				width: 600
			};

			const drawSpy = jest.spyOn(GoogleCharts, 'draw').mockImplementation();

			GoogleCharts.drawCharts([chartData]);

			expect(drawSpy).toHaveBeenCalledWith(
				div,
				expect.objectContaining({
					chart_type: 'pie_chart',
					title: 'Test Chart',
					abscissa_label: 'Category',
					abscissa_data: { A: 10, B: 20 },
					ordinate_label: ['Value'],
					ordinate_data: [[10, 20]],
					colors: ['#FF0000', '#00FF00'],
					ordinate_format: '#,##0',
					height: 400,
					width: 600,
					onComplete: expect.any(Function),
				})
			);

			drawSpy.mockRestore();
		});
	});

	describe('draw', () => {
		test('should return early if div is undefined', () => {
			GoogleCharts.draw(undefined, { chart_type: 'column_chart', title: 'Title', abscissa_label: 'X', abscissa_data: [], ordinate_label: ['Y'], ordinate_data: [[]] });

			expect(consoleErrorSpy).toHaveBeenCalledWith('div not found');
			expect(mockDataTable.addColumn).not.toHaveBeenCalled();
		});

		test('should return early if div is null', () => {
			GoogleCharts.draw(null, { chart_type: 'column_chart', title: 'Title', abscissa_label: 'X', abscissa_data: [], ordinate_label: ['Y'], ordinate_data: [[]] });

			expect(consoleErrorSpy).toHaveBeenCalledWith('div not found');
		});

		test('should create column chart', (done) => {
			const div = makeDiv('test', 'loading');

			GoogleCharts.draw(div, {
				chart_type: 'column_chart',
				title: 'Test Chart',
				abscissa_label: 'Month',
				abscissa_data: ['Jan', 'Feb'],
				ordinate_label: ['Sales'],
				ordinate_data: [[100, 200]],
				colors: ['#FF0000'],
				height: 400,
				width: 600,
			});

			setTimeout(() => {
				expect(global.google.charts.Bar).toHaveBeenCalledWith(div);
				expect(mockChart.draw).toHaveBeenCalled();
				expect(div.classList.contains('loading')).toBe(false);
				expect(div.classList.contains('chart')).toBe(true);
				done();
			}, 10);
		});

		test('should create bar chart', (done) => {
			const div = makeDiv('test');

			GoogleCharts.draw(div, {
				chart_type: 'bar_chart',
				title: 'Test Chart',
				abscissa_label: 'Category',
				abscissa_data: ['A', 'B'],
				ordinate_label: ['Value'],
				ordinate_data: [[10, 20]],
				colors: ['#00FF00'],
			});

			setTimeout(() => {
				expect(global.google.charts.Bar).toHaveBeenCalledWith(div);
				expect(mockChart.draw).toHaveBeenCalled();
				done();
			}, 10);
		});

		test('should create line chart', (done) => {
			const div = makeDiv('test');

			GoogleCharts.draw(div, {
				chart_type: 'line_chart',
				title: 'Test Chart',
				abscissa_label: 'Time',
				abscissa_data: ['1', '2'],
				ordinate_label: ['Value'],
				ordinate_data: [[10, 20]],
				colors: ['#0000FF'],
			});

			setTimeout(() => {
				expect(global.google.charts.Line).toHaveBeenCalledWith(div);
				expect(mockChart.draw).toHaveBeenCalled();
				done();
			}, 10);
		});

		test('should create combo chart', (done) => {
			const div = makeDiv('test');

			GoogleCharts.draw(div, {
				chart_type: 'combo_chart',
				title: 'Test Chart',
				abscissa_label: 'Month',
				abscissa_data: ['Jan', 'Feb'],
				ordinate_label: ['Sales', 'Profit'],
				ordinate_data: [[100, 200], [10, 20]],
				colors: ['#FF0000', '#00FF00'],
			});

			setTimeout(() => {
				expect(global.google.visualization.ComboChart).toHaveBeenCalledWith(div);
				expect(mockChart.draw).toHaveBeenCalled();
				done();
			}, 10);
		});

		test('should create pie chart', (done) => {
			const div = makeDiv('test');

			GoogleCharts.draw(div, {
				chart_type: 'pie_chart',
				title: 'Test Chart',
				abscissa_label: 'Category',
				abscissa_data: { A: 30, B: 50, C: 20 },
				ordinate_label: [],
				ordinate_data: [],
				colors: ['#FF0000', '#00FF00', '#0000FF'],
			});

			setTimeout(() => {
				expect(global.google.visualization.PieChart).toHaveBeenCalledWith(div);
				expect(mockDataTable.addColumn).toHaveBeenCalledWith('string', 'Category');
				expect(mockDataTable.addColumn).toHaveBeenCalledWith('number', '');
				expect(mockDataTable.addRows).toHaveBeenCalledTimes(3);
				expect(mockChart.draw).toHaveBeenCalled();
				done();
			}, 10);
		});

		test('should handle stacked_bar_chart type', (done) => {
			const div = makeDiv('test');

			GoogleCharts.draw(div, {
				chart_type: 'stacked_bar_chart',
				title: 'Test Chart',
				abscissa_label: 'Category',
				abscissa_data: ['A', 'B'],
				ordinate_label: ['Val1', 'Val2'],
				ordinate_data: [[10, 20], [30, 40]],
				colors: ['#FF0000', '#00FF00'],
			});

			setTimeout(() => {
				expect(global.google.charts.Bar).toHaveBeenCalled();
				const callArgs = mockChart.draw.mock.calls[0];
				expect(callArgs[1].isStacked).toBe(true);
				done();
			}, 10);
		});

		test('should handle stacked_column_chart type', (done) => {
			const div = makeDiv('test');

			GoogleCharts.draw(div, {
				chart_type: 'stacked_column_chart',
				title: 'Test Chart',
				abscissa_label: 'Month',
				abscissa_data: ['Jan', 'Feb'],
				ordinate_label: ['Sales', 'Costs'],
				ordinate_data: [[100, 200], [50, 80]],
				colors: ['#FF0000', '#00FF00'],
			});

			setTimeout(() => {
				expect(global.google.charts.Bar).toHaveBeenCalled();
				const callArgs = mockChart.draw.mock.calls[0];
				expect(callArgs[1].isStacked).toBe(true);
				done();
			}, 10);
		});

		test('should handle stacked_combo_chart type', (done) => {
			const div = makeDiv('test');

			GoogleCharts.draw(div, {
				chart_type: 'stacked_combo_chart',
				title: 'Test Chart',
				abscissa_label: 'Month',
				abscissa_data: ['Jan', 'Feb'],
				ordinate_label: ['Sales', 'Costs'],
				ordinate_data: [[100, 200], [50, 80]],
				colors: ['#FF0000', '#00FF00'],
			});

			setTimeout(() => {
				expect(global.google.visualization.ComboChart).toHaveBeenCalled();
				const callArgs = mockChart.draw.mock.calls[0];
				expect(callArgs[1].isStacked).toBe(true);
				done();
			}, 10);
		});

		test('should handle dual_column_chart type', (done) => {
			const div = makeDiv('test');

			GoogleCharts.draw(div, {
				chart_type: 'dual_column_chart',
				title: 'Test Chart',
				abscissa_label: 'Month',
				abscissa_data: ['Jan', 'Feb'],
				ordinate_label: ['Sales', 'Profit'],
				ordinate_data: [[100, 200], [10, 20]],
				colors: ['#FF0000', '#00FF00'],
			});

			setTimeout(() => {
				expect(global.google.charts.Bar).toHaveBeenCalled();
				const callArgs = mockChart.draw.mock.calls[0];
				expect(callArgs[1].series).toBeDefined();
				expect(callArgs[1].axes).toBeDefined();
				done();
			}, 10);
		});

		test('should handle dual_bar_chart type', (done) => {
			const div = makeDiv('test');

			GoogleCharts.draw(div, {
				chart_type: 'dual_bar_chart',
				title: 'Test Chart',
				abscissa_label: 'Category',
				abscissa_data: ['A', 'B'],
				ordinate_label: ['Val1', 'Val2'],
				ordinate_data: [[10, 20], [30, 40]],
				colors: ['#FF0000', '#00FF00'],
			});

			setTimeout(() => {
				expect(global.google.charts.Bar).toHaveBeenCalled();
				const callArgs = mockChart.draw.mock.calls[0];
				expect(callArgs[1].series).toBeDefined();
				expect(callArgs[1].axes).toBeDefined();
				done();
			}, 10);
		});

		test('should apply format to vAxis when provided', (done) => {
			const div = makeDiv('test');

			GoogleCharts.draw(div, {
				chart_type: 'column_chart',
				title: 'Test Chart',
				abscissa_label: 'Month',
				abscissa_data: ['Jan', 'Feb'],
				ordinate_label: ['Sales'],
				ordinate_data: [[100, 200]],
				colors: ['#FF0000'],
				ordinate_format: '#,##0.00',
			});

			setTimeout(() => {
				const callArgs = mockChart.draw.mock.calls[0];
				expect(callArgs[1].vAxis.format).toBe('#,##0.00');
				done();
			}, 10);
		});

		test('should set custom height when provided', (done) => {
			const div = makeDiv('test');

			GoogleCharts.draw(div, {
				chart_type: 'column_chart',
				title: 'Test Chart',
				abscissa_label: 'Month',
				abscissa_data: ['Jan', 'Feb'],
				ordinate_label: ['Sales'],
				ordinate_data: [[100, 200]],
				colors: ['#FF0000'],
				height: 500,
			});

			setTimeout(() => {
				const callArgs = mockChart.draw.mock.calls[0];
				expect(callArgs[1].height).toBe(500);
				done();
			}, 10);
		});

		test('should handle null chart creation', () => {
			const div = makeDiv('test');

			GoogleCharts.draw(div, {
				chart_type: 'unknown_type',
				title: 'Test Chart',
				abscissa_label: 'X',
				abscissa_data: ['A'],
				ordinate_label: ['Y'],
				ordinate_data: [[1]],
				colors: ['#FF0000'],
			});

			expect(consoleErrorSpy).toHaveBeenCalledWith('error during creating chart');
			expect(div.classList.contains('graphique_error')).toBe(true);
			expect(div.innerHTML).toContain('erreur');
		});

		test('should call onComplete callback when chart is ready', (done) => {
			const div = makeDiv('test');
			const onComplete = jest.fn();

			GoogleCharts.draw(div, {
				chart_type: 'column_chart',
				title: 'Test Chart',
				abscissa_label: 'Month',
				abscissa_data: ['Jan', 'Feb'],
				ordinate_label: ['Sales'],
				ordinate_data: [[100, 200]],
				colors: ['#FF0000'],
				onComplete,
			});

			setTimeout(() => {
				expect(onComplete).toHaveBeenCalledWith(mockChart);
				done();
			}, 10);
		});

		test('should handle tab-pane not active scenario', (done) => {
			const tabPane = document.createElement('div');
			tabPane.classList.add('tab-pane');
			document.body.appendChild(tabPane);

			const div = document.createElement('div');
			tabPane.appendChild(div);

			GoogleCharts.draw(div, {
				chart_type: 'column_chart',
				title: 'Test Chart',
				abscissa_label: 'Month',
				abscissa_data: ['Jan'],
				ordinate_label: ['Sales'],
				ordinate_data: [[100]],
				colors: ['#FF0000'],
			});

			// tabPane.active should have been added before draw
			expect(tabPane.classList.contains('active')).toBe(true);

			setTimeout(() => {
				// After ready event, active should be removed since it wasn't active before
				expect(tabPane.classList.contains('active')).toBe(false);
				done();
			}, 10);
		});

		test('should not toggle active class if already active', (done) => {
			const tabPane = document.createElement('div');
			tabPane.classList.add('tab-pane', 'active');
			document.body.appendChild(tabPane);

			const div = document.createElement('div');
			tabPane.appendChild(div);

			GoogleCharts.draw(div, {
				chart_type: 'column_chart',
				title: 'Test Chart',
				abscissa_label: 'Month',
				abscissa_data: ['Jan'],
				ordinate_label: ['Sales'],
				ordinate_data: [[100]],
				colors: ['#FF0000'],
			});

			setTimeout(() => {
				// Still active after ready event
				expect(tabPane.classList.contains('active')).toBe(true);
				done();
			}, 10);
		});

		test('should handle when div itself has tab-pane class', (done) => {
			const div = makeDiv('test', 'tab-pane');

			GoogleCharts.draw(div, {
				chart_type: 'column_chart',
				title: 'Test Chart',
				abscissa_label: 'Month',
				abscissa_data: ['Jan'],
				ordinate_label: ['Sales'],
				ordinate_data: [[100]],
				colors: ['#FF0000'],
			});

			setTimeout(() => {
				// div itself is used as tabPaneDiv — no closest() traversal
				expect(div.classList.contains('chart')).toBe(true);
				done();
			}, 10);
		});

		test('should set line chart specific options', (done) => {
			const div = makeDiv('test');

			GoogleCharts.draw(div, {
				chart_type: 'line_chart',
				title: 'Test Chart',
				abscissa_label: 'Time',
				abscissa_data: ['1', '2'],
				ordinate_label: ['Value'],
				ordinate_data: [[10, 20]],
				colors: ['#0000FF'],
			});

			setTimeout(() => {
				const callArgs = mockChart.draw.mock.calls[0];
				expect(callArgs[1].series).toEqual([{ lineWidth: 3 }, { lineWidth: 1.5 }]);
				expect(callArgs[1].curveType).toBe('function');
				done();
			}, 10);
		});

		test('should set pie chart specific options', (done) => {
			const div = makeDiv('test');

			GoogleCharts.draw(div, {
				chart_type: 'pie_chart',
				title: 'Test Chart',
				abscissa_label: 'Category',
				abscissa_data: { A: 30, B: 50 },
				ordinate_label: [],
				ordinate_data: [],
				colors: ['#FF0000', '#00FF00'],
			});

			setTimeout(() => {
				const callArgs = mockChart.draw.mock.calls[0];
				expect(callArgs[1].is3D).toBe(false);
				expect(callArgs[1].pieResidueSliceLabel).toBe('Autre');
				expect(callArgs[1].legend.position).toBe('right');
				done();
			}, 10);
		});

		test('should set bar chart specific options', (done) => {
			const div = makeDiv('test');

			GoogleCharts.draw(div, {
				chart_type: 'bar_chart',
				title: 'Test Chart',
				abscissa_label: 'Category',
				abscissa_data: ['A', 'B'],
				ordinate_label: ['Value'],
				ordinate_data: [[10, 20]],
				colors: ['#00FF00'],
			});

			setTimeout(() => {
				const callArgs = mockChart.draw.mock.calls[0];
				expect(callArgs[1].bars).toBe('horizontal');
				expect(callArgs[1].legend.position).toBe('bottom');
				expect(callArgs[1].vAxis.title).toBe('Category');
				done();
			}, 10);
		});

		test('should populate DataTable correctly for non-pie charts', (done) => {
			const div = makeDiv('test');

			GoogleCharts.draw(div, {
				chart_type: 'column_chart',
				title: 'Test Chart',
				abscissa_label: 'Month',
				abscissa_data: ['Jan', 'Feb', 'Mar'],
				ordinate_label: ['Sales', 'Profit'],
				ordinate_data: [[100, 200, 300], [10, 20, 30]],
				colors: ['#FF0000', '#00FF00'],
			});

			setTimeout(() => {
				expect(mockDataTable.addColumn).toHaveBeenCalledWith('string', 'Month');
				expect(mockDataTable.addColumn).toHaveBeenCalledWith('number', 'Sales');
				expect(mockDataTable.addColumn).toHaveBeenCalledWith('number', 'Profit');
				expect(mockDataTable.addRows).toHaveBeenCalledTimes(3);
				expect(mockDataTable.setCell).toHaveBeenCalled();
				done();
			}, 10);
		});

		test('should handle combo chart with multiple series', (done) => {
			const div = makeDiv('test');

			GoogleCharts.draw(div, {
				chart_type: 'combo_chart',
				title: 'Test Chart',
				abscissa_label: 'Month',
				abscissa_data: ['Jan', 'Feb'],
				ordinate_label: ['Sales', 'Profit', 'Trend'],
				ordinate_data: [[100, 200], [10, 20], [50, 60]],
				colors: ['#FF0000', '#00FF00', '#0000FF'],
			});

			setTimeout(() => {
				const callArgs = mockChart.draw.mock.calls[0];
				expect(callArgs[1].seriesType).toBe('bars');
				expect(callArgs[1].series).toBeDefined();
				// Last series (index 2 with 3 series) should be line type
				expect(callArgs[1].series[2]).toEqual({ type: 'line' });
				done();
			}, 10);
		});

		test('should apply dual axis formatting for dual_column_chart', (done) => {
			const div = makeDiv('test');

			GoogleCharts.draw(div, {
				chart_type: 'dual_column_chart',
				title: 'Test Chart',
				abscissa_label: 'Month',
				abscissa_data: ['Jan', 'Feb'],
				ordinate_label: ['Sales', 'Profit'],
				ordinate_data: [[100, 200], [10, 20]],
				colors: ['#FF0000', '#00FF00'],
				ordinate_format: '$#,##0',
			});

			setTimeout(() => {
				const callArgs = mockChart.draw.mock.calls[0];
				expect(callArgs[1].vAxes).toBeDefined();
				expect(callArgs[1].vAxes[0]).toEqual({ format: '$#,##0' });
				expect(callArgs[1].axes.y[1].side).toBe('right');
				done();
			}, 10);
		});

		test('should apply dual axis formatting for dual_bar_chart', (done) => {
			const div = makeDiv('test');

			GoogleCharts.draw(div, {
				chart_type: 'dual_bar_chart',
				title: 'Test Chart',
				abscissa_label: 'Category',
				abscissa_data: ['A', 'B'],
				ordinate_label: ['Val1', 'Val2'],
				ordinate_data: [[10, 20], [30, 40]],
				colors: ['#FF0000', '#00FF00'],
				ordinate_format: '#,##0.00',
			});

			setTimeout(() => {
				const callArgs = mockChart.draw.mock.calls[0];
				expect(callArgs[1].hAxes).toBeDefined();
				expect(callArgs[1].hAxes[0]).toEqual({ format: '#,##0.00' });
				expect(callArgs[1].axes.x[1].side).toBe('top');
				done();
			}, 10);
		});
	});
});