import { toEl } from './util.js';

class GoogleCharts {
	static init(onLoadCallback) {
		// google.load("visualization", "1", {packages:["corechart"]});
		google.charts.load('current', {'packages':['bar','line','corechart']});
		// google.charts.load('current', {packages:['corechart']});

		if (onLoadCallback !== 'undefined') {
			google.charts.setOnLoadCallback(onLoadCallback);
		}
	}

	static drawCharts(chartsList, onComplete) {
		// on supprime du tableau la liste des graphiques dont l'id div n'a pas été trouvé (le graphique ne pourra pas être généré)
		chartsList = chartsList.filter(chartData => typeof chartData.div_id != 'undefined' && document.getElementById(chartData.div_id) !== null);

		let nbChartsCompleted = 0;
		chartsList.forEach(chartData => {
			//console.log(chartData);
			GoogleCharts.draw(
				document.getElementById(chartData.div_id),
				{
					chart_type: chartData.chart_type,
					title: chartData.title,
					abscissa_label: chartData.abscissa_label,
					abscissa_data: chartData.abscissa_data,
					ordinate_label: chartData.ordinate_label,
					ordinate_data: chartData.ordinate_data,
					colors: chartData.colors,
					ordinate_format: chartData.ordinate_format,
					height: chartData.height,
					width: chartData.width,
					onComplete: chart => {
						nbChartsCompleted++;
						// si tous les graphiques ont été chargés, on appelle le callback onComplete transmis en paramètre
						if (chartsList.length === nbChartsCompleted && typeof onComplete == 'function') {
							onComplete();
						}
					},
				},
			);
		});
	}

	static draw(div, options) {
		div = toEl(div);
		if (!div) {
			return;
		}

		const {
			chart_type: chartType,
			title: title,
			abscissa_label: abscissaLabel,
			abscissa_data: abscissaData,
			ordinate_label: ordinateLabel,
			ordinate_data: ordinateData,
			colors: colors = [],
			ordinate_format: formatData = null,
			height: height = null,
			width: width = null,
			onComplete = null,
		} = options;

		if (typeof div == 'undefined' || !div) {
			console.error('div not found');
			return;
		}

		let isStacked = false;
		let graphType = chartType;
		if (graphType === 'stacked_bar_chart') {
			graphType = 'bar_chart';
			isStacked = true;
		}
		if (graphType === 'stacked_column_chart') {
			graphType = 'column_chart';
			isStacked = true;
		}
		if (graphType === 'stacked_combo_chart') {
			graphType = 'combo_chart';
			isStacked = true;
		}

		let isDualChart = false;
		if (graphType === 'dual_column_chart') {
			graphType = 'column_chart';
			isDualChart = true;
		}
		if (graphType === 'dual_bar_chart') {
			graphType = 'bar_chart';
			isDualChart = true;
		}

		let data = null;
		let nbCells = 0;
		if (graphType === 'pie_chart') {
			//data = google.visualization.arrayToDataTable(tabDataAbsParam);

			data = new google.visualization.DataTable();
			data.addColumn('string', abscissaLabel);
			data.addColumn('number', '');

			let numRow = 0;
			Object.entries(abscissaData).forEach(([idx, value]) => {
				data.addRows(1);
				data.setCell(numRow, 0, idx);
				data.setCell(numRow, 1, value);
				numRow++;
			});
		}
		else {
			// Déclaration du tableau de données
			data = new google.visualization.DataTable();
			data.addColumn('string', abscissaLabel);
			ordinateLabel.forEach((libelleOrd) => {
				data.addColumn('number', libelleOrd);
			});

			// Remplissage des données
			nbCells = 0;
			let numRow = 0;
			abscissaData.forEach((dataAbs, idx) => {
				// dataOrd = tabDataOrd[idx];
				// data.addRow([dataAbs, dataOrd]);
				data.addRows(1);

				data.setCell(numRow, 0, dataAbs);

				let numCell = 1;
				ordinateData.forEach((tabDataOrd) => {
					data.setCell(numRow, numCell, tabDataOrd[idx]);
					//data.setCell(numRow, numCell, Math.round(tabDataOrd[idx], 2));
					numCell++;
				});

				nbCells = numCell;
				numRow++;
			});
			nbCells -= 2;
		}

		// console.log(data);
		// console.log('drawGraph : '+div+' ; type : '+graphType);

		// Options générales
		let chartOptions = {
			colors: colors,
			fontName: 'Trebuchet MS',
			fontSize: 12,
			hAxis: {maxAlternation: 1},
			vAxis: {minValue: 0, textPosition: 'out'},
			//gridlines: {color: '#333', count: 1}
		};

		if (formatData != null) {
			chartOptions.vAxis.format = formatData;
		}

		// Options sur le titre du graphique
		chartOptions.title = title;
		if (graphType === 'pie_chart') {
			// chartOptions.titlePosition = 'none';
		}
		else {
			chartOptions.titlePosition = 'none';
		}

		// Options sur la taille du graphique
		if (graphType === 'bar_chart') {
			chartOptions.chartArea = {left:120, top:30};
			//chartOptions.chartArea = {left:"auto", top:"auto"};
			//chartOptions.chartArea = {};
			if (height != null) {
				chartOptions.chartArea.height = (height - 60);
				//chartOptions.chartArea.height = '100%';
			}
			chartOptions.chartArea.width = "85%";
			//chartOptions.chartArea.width = "100%";
		}
		else {
			chartOptions.chartArea = {left:"auto", top:"auto"};
			if (height != null) {
				chartOptions.chartArea.height = height+"%";
			}
			else {
				chartOptions.chartArea.height = "80%";
			}
			chartOptions.chartArea.width = "85%";
		}
		// chartOptions.chartArea = {};
		// chartOptions.chartArea.height = "100%";
		// chartOptions.chartArea.width = "100%";

		//chartOptions.width = width;
		//chartOptions.width = "100%";
		if (typeof height != 'undefined' && height != null) {
			chartOptions.height = height;
		}
		//console.log(div);
		//console.log(div.width());
		//chartOptions.width = div.width();

		// Options sur la légende
		chartOptions.legend = {};
		if (graphType === 'pie_chart') {
			chartOptions.legend.position = 'right';
		}
		else if (graphType === 'bar_chart') {
			chartOptions.legend.position = 'bottom';
		}
		else {
			chartOptions.legend.position = 'top';
		}

		// Options sur l'affichage des labels en absisse / ordonnée
		if (graphType === 'bar_chart') {
			// chartOptions.hAxis.title = libelleOrd;
			chartOptions.vAxis.title = abscissaLabel;
		}
		else {
			chartOptions.hAxis.title = abscissaLabel;
			// chartOptions.vAxis.title = libelleOrd;
		}

		// Options sur les graphiques "dual bar chart / dual column chart"
		if (isDualChart) {
			chartOptions.series = {};
			chartOptions.axes = {};
			if (graphType === 'column_chart') {
				chartOptions.axes.y = {};
				chartOptions.vAxes = {};
			}
			else {
				chartOptions.axes.x = {};
				chartOptions.hAxes = {};
			}
			ordinateLabel.forEach((libelleOrd, idx) => {
				// console.log(idx);
				if (idx <= 1) {
					// key = 'series_'+idx;
					let key = idx;
					// chartOptions.series[idx] = {axis: key, targetAxisIndex: key};
					chartOptions.series[idx] = {axis: key, targetAxisIndex: idx};
					if (graphType === 'column_chart') {
						chartOptions.axes.y[key] = {label: libelleOrd};
						if (idx === 1) {
							chartOptions.axes.y[key].side = 'right';
						}
						if (formatData != null) {
							chartOptions.vAxes[key] = {format: formatData};
						}
					}
					else {
						chartOptions.axes.x[key] = {label: libelleOrd};
						if (idx === 1) {
							chartOptions.axes.x[key].side = 'top';
						}
						if (formatData != null) {
							chartOptions.hAxes[key] = {format: formatData};
						}
					}
				}
			});
			// console.log(chartOptions.series);
			// console.log(chartOptions.vAxes);
		}

		// Options sur les graphiques "combo chart"
		if (graphType === 'combo_chart') {
			chartOptions.seriesType = "bars";
			chartOptions.series = {};
			chartOptions.series[nbCells] = {type: "line"};
		}

		// Options sur le style des lignes pour les "line chart"
		if (graphType === 'line_chart') {
			chartOptions.series = [{lineWidth: 3}, {lineWidth: 1.5}];
			chartOptions.curveType = 'function';
		}

		// Options sur le style pour les "pie chart"
		if (graphType === 'pie_chart') {
			chartOptions.is3D = false;
			chartOptions.pieResidueSliceLabel = 'Autre';
		}

		if (graphType === 'bar_chart') {
			chartOptions.bars = 'horizontal';
		}

		if (isStacked) {
			chartOptions.isStacked = true;
		}

		// console.log(chartOptions);

		// Création du graphique
		let chart = null;
		if (graphType === 'column_chart') {
			// chart = new google.visualization.ColumnChart(div);
			chart = new google.charts.Bar(div);
		}
		else if (graphType === 'bar_chart') {
			// chart = new google.visualization.BarChart(div);
			chart = new google.charts.Bar(div);
		}
		else if (graphType === 'line_chart') {
			// chart = new google.visualization.LineChart(div);
			chart = new google.charts.Line(div);
		}
		else if (graphType === 'combo_chart') {
			chart = new google.visualization.ComboChart(div);
		}
		else if (graphType === 'pie_chart') {
			chart = new google.visualization.PieChart(div);
		}

		div.classList.remove('loading');

		if (chart === null) {
			console.error('error during creating chart');
			div.classList.add('graphique_error');
			div.innerHTML = 'Une erreur s\'est produite lors du chargement du graphique.';
			return;
		}

		//div.classList.add('graphique');
		div.classList.add('chart');
		div.innerHTML = '';

		// div.style.display = 'block';
		let tabPaneDiv = div;
		if (!div.classList.contains('tab-pane')) {
			tabPaneDiv = div.closest('.tab-pane');
		}

		let hasClassActive = tabPaneDiv?.classList.contains('active') ?? false;
		if (!hasClassActive) {
			tabPaneDiv?.classList.add('active');
		}

		google.visualization.events.addListener(chart, 'ready', function () {
			//console.log('ready');
			//console.log(chart);
			// div.style.display = 'none';
			// div.hide();
			if (!hasClassActive) {
				tabPaneDiv?.classList.remove('active');
			}

			if (typeof onComplete == 'function') {
				onComplete(chart);
			}
		});

		// console.log($("ul li.ui-state-active").index()
		//console.log(chartOptions);

		chart.draw(data, chartOptions);
	}

}

export { GoogleCharts };