import { Chart } from 'chart.js';
import { toEl } from './util.js';
import deepmerge from 'deepmerge';
import { TimeZone, DatePeriod } from './date_time.js';
import { Locale } from './locale.js';

class Chartjs {
	static init() {
		if (Chartjs.initialized) {
			return;
		}

		Chartjs.initialized = true;

		const centerTextPlugin = {
			id: 'centerText',
			afterDraw(chart) {
				if (typeof chart.config.options.centerText == 'undefined' || !chart.config.options.centerText.display) {
					return;
				}

				const { ctx, chartArea: { width, height } } = chart;
				ctx.save();
				const total = chart.data.datasets[0].data.reduce((a,b) => a+b, 0);
				const label = chart.config.options.centerText.label || '';
				const fontSize = chart.config.options.centerText.fontSize || 16;
				const textColor = chart.config.options.centerText.color || '#333';

				ctx.font = `bold ${fontSize}px sans-serif`;
				ctx.fillStyle = textColor;
				ctx.textAlign = 'center';
				ctx.textBaseline = 'middle';
				ctx.fillText(`${total}`, width / 2, height / 2);
				if (label) {
					ctx.font = `12px sans-serif`;
					ctx.fillText(label, width / 2, height / 2 + 20);
				}
				ctx.restore();
			}
		};

		Chart.register(centerTextPlugin);
	}

	static createStackedChart(chartDiv, chartData, title=null, options={}) {
		Chartjs.init();

		chartDiv = toEl(chartDiv);
		if (!chartDiv) {
			return;
		}

		chartDiv.innerHTML = '';
		new Chart(chartDiv.getContext("2d"), deepmerge({
			type: "bar",
			data: {
				labels: chartData.labels,
				datasets: chartData.datasets
			},
			options: {
				responsive: true,
				scales: {
					x: {
						stacked: true
					},
					y: {
						stacked: true,
						beginAtZero: true,
						ticks: {
							precision: 0
						},
					}
				},
				plugins: {
					title: {
						display: null !== title,
						text: title || '',
						font: { size: 14 },
						color: "#333",
						padding: { top: 10, bottom: 20 }
					},
					legend: {
						position: "bottom",
						labels: {
							usePointStyle: true,
							padding: 15
						}
					},
					tooltip: {
						callbacks: {
							label: function(context) {
								return `${context.dataset.label}: ${context.parsed.y}`;
							}
						}
					}
				}
			}
		}, options));
	}

	static createBarChart(chartDiv, chartData, title=null, options={}) {
		Chartjs.init();

		chartDiv = toEl(chartDiv);
		if (!chartDiv) {
			return;
		}

		chartDiv.innerHTML = '';
		new Chart(chartDiv.getContext("2d"), deepmerge({
			type: "bar",
			data: {
				labels: chartData.labels,
				datasets: chartData.datasets
			},
			options: {
				responsive: false,
				maintainAspectRatio: false,
				aspectRatio: 2,
				scales: {
					x: {
						grid: {
							display: false
						},
					},
					y: {
						beginAtZero: true,
						ticks: {
							precision: 0
						},
						grid: {
							color: "#eee"
						}
					}
				},
				plugins: {
					title: {
						display: null !== title,
						text: title || '',
						font: { size: 14 },
						color: "#333",
						padding: { top: 10, bottom: 20 }
					},
					legend: {
						display: chartData.datasets.length > 1,
						position: "bottom",
					},
					tooltip: {
						callbacks: {
							label: context => context.dataset.label + ' : ' + context.parsed.y
						}
					}
				},
				animation: {
					duration: 1200,
					easing: "easeOutQuart"
				}
			}
		}, options));
	}

	static createLineChart(chartDiv, chartData, title=null, options={}) {
		Chartjs.init();

		chartDiv = toEl(chartDiv);
		if (!chartDiv) {
			return;
		}

		chartDiv.innerHTML = '';
		new Chart(chartDiv.getContext("2d"), deepmerge({
			type: "line",
			data: {
				labels: chartData.labels,
				datasets: chartData.datasets
			},
			options: {
				responsive: false,
				maintainAspectRatio: false,
				aspectRatio: 2,
				scales: {
					y: {
						beginAtZero: true,
						ticks: {
							precision: 0
						},
						grid: {
							color: "#eee"
						}
					},
					x: {
						grid: {
							display: false
						}
					}
				},
				plugins: {
					title: {
						display: null !== title,
						text: title || '',
						font: { size: 14 },
						color: "#333",
						padding: { top: 10, bottom: 20 }
					},
					legend: {
						display: chartData.datasets.length > 1,
						position: "bottom",
					},
					tooltip: {
						callbacks: {
							label: context => context.dataset.label + ' : ' + context.parsed.y
						}
					}
				}
			}
		}, options));
	}

	static createDoughnutChart(chartDiv, chartData, title=null, options={}) {
		Chartjs.init();

		chartDiv = toEl(chartDiv);
		if (!chartDiv) {
			return;
		}

		chartDiv.innerHTML = '';
		new Chart(chartDiv.getContext("2d"), deepmerge({
			type: "doughnut",
			data: {
				labels: chartData.labels,
				datasets: [{
					data: chartData.values,
					backgroundColor: chartData.colors,
					borderWidth: 0,
					hoverOffset: 10
				}]
			},
			options: {
				cutout: "65%",
				responsive: false,
				maintainAspectRatio: false,
				aspectRatio: 2,
				plugins: {
					title: {
						display: null !== title,
						text: title || ''
					},
					legend: {
						position: "right",
						labels: {
							boxWidth: 12,
							font: { size: 12 },
							usePointStyle: true
						}
					},
					tooltip: {
						callbacks: {
							label: function(context) {
								const total = context.dataset.data.reduce((a,b)=>a+b,0);
								const value = context.raw;
								const percent = ((value / total) * 100).toFixed(1);
								return `${context.label}: ${value} (${percent}%)`;
							}
						}
					}
				},
				animation: {
					animateRotate: true,
					animateScale: true
				},
				centerText: {
					display: false,
					fontSize: 18,
					color: "#000"
				}
			}
		}, options));
	}

	static groupByPeriod(data, period, metrics) {
		const grouped = {};

		Object.entries(data).forEach(([date, values]) => {
			const d = new Date(date);
			let key;

			if (period === 'week') {
				const week = Math.ceil((d.getDate() - d.getDay() + 1) / 7);
				key = `${d.getFullYear()}-S${week}`;
			}
			else if (period === 'month') {
				key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
			}
			else {
				key = date;
			}

			if (!grouped[key]) {
				grouped[key] = {};
				metrics.forEach(m => grouped[key][m] = []);
			}

			metrics.forEach(m => {
				if (values[m] !== undefined) grouped[key][m].push(values[m]);
			});
		});

		return Object.entries(grouped).map(([label, vals]) => {
			const aggregated = {};
			metrics.forEach(m => {
				aggregated[m] = vals[m].reduce((a, b) => a + b, 0) / vals[m].length;
			});
			return { label, ...aggregated };
		});
	}

	static getPeriodLabels(data, period, locale= Locale.getDefault(), timeZone= TimeZone.getDefault()) {
		return DatePeriod.getPeriodLabels(Object.keys(data), period, locale, timeZone);
	}

	static getAutoGranularity(data) {
		const dates = Object.keys(data).sort();
		const days = (new Date(dates[dates.length - 1]) - new Date(dates[0])) / (1000 * 60 * 60 * 24);
		if (days > 90) return 'month';
		if (days > 30) return 'week';
		return 'day_of_month';
	}
}

export { Chartjs };