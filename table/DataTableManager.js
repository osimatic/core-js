import DataTable from 'datatables.net';
import { FormHelper } from '../form/FormHelper.js';
import { InputPeriod } from '../form/InputPeriod.js';
import { UrlAndQueryString } from '../network/UrlAndQueryString.js';
import { MultipleActionInTable } from './MultipleActionInTable.js';

export class DataTableManager {

	static setOptions(options) {
		DataTableManager.dateTableOptions = Object.assign({}, DataTableManager.getOptions(), options);
	}
	static getOptions() {
		return DataTableManager.dateTableOptions || {};
	}

	static setCallbackOnLoadData(callback) {
		this.callbackOnLoadData = callback;
	}

	// ------------------------------------------------------------
	// Criteria
	// ------------------------------------------------------------

	static populateFormFromFilters(form) {
		FormHelper.populateForm(form, this.criteres);
	}

	static setDefaultFilters(filters) {
		this.criteres = filters;
	}

	static setFiltersFromForm(form) {
		this.criteres = UrlAndQueryString.parseQuery(form.serialize());
	}

	static getFilterParam(key) {
		return this.criteres[key] || null;
	}

	static getFilters() {
		return this.criteres;
	}

	// ------------------------------------------------------------
	// Table loading
	// ------------------------------------------------------------

	static init(options) {
		let {
			div,
			default_filters: defaultFilters = {},
			on_show_filter_form: onShowFilterForm,
			export_modal_enabled: exportModalEnabled,
			on_export: onExport,
			set_export_form: setExportForm,
			on_show_export_form: onShowExportForm,
			on_submit_export_modal: onSubmitExportModal,
			on_load_data: onLoadData,
		} = options;

		let queryStringFilters = UrlAndQueryString.parseQuery(window.location.search);
		defaultFilters = Object.assign(defaultFilters, queryStringFilters);

		// Filter button
		let filterLink = div.find('a.filter_link');
		if (filterLink.length) {
			filterLink.click(function(e) {
				e.preventDefault();
			});

			$('div#modal_filter').on('show.bs.modal', function (event) {
				let button = $(event.relatedTarget);
				let modal = $(this);
				let form = modal.find('form');

				DataTableManager.populateFormFromFilters(form);

				// Input period link
				InputPeriod.addLinks(form);

				// Custom callback
				if (typeof onShowFilterForm == 'function') {
					onShowFilterForm(modal, button);
				}

				form.find('button[type="submit"]').off('click').click(function(e) {
					e.preventDefault();
					DataTableManager.updateFiltersAndLoadData(div, form);
					return false;
				});
			});
		}

		// Export button
		let exportLink = div.find('a.export_link');
		if (exportLink.length) {
			if (!exportModalEnabled) {
				// without modal
				exportLink.click(function(e) {
					e.preventDefault();
					var button = $(this).attr('disabled', true).button('loading');
					if (typeof onExport == 'function') {
						onExport(button.data('format'), {...DataTableManager.getFilters()}, () => {
							button.attr('disabled', false).button('reset');
						});
					}
					return false;
				});
			}
			else {
				// with modal
				exportLink.click(function(e) {
					// todo: open modal #modal_export when the link is clicked
				});

				$('div#modal_export').on('show.bs.modal', function (event) {
					let button = $(event.relatedTarget);
					let modal = $(this);
					let form = modal.find('form');

					// Callback function used to initialize the content of the export modal, this function must return the content of the modal
					if (typeof setExportForm == 'function') {
						modal.find('.modal-body').html(setExportForm(modal, button));
					}

					// Callback function used to initialize the export modal
					if (typeof onShowExportForm == 'function') {
						onShowExportForm(modal, button);
					}

					let btnSubmit = form.find('button[type="submit"]').attr('disabled', false).button('reset');
					btnSubmit.off('click').click(function(e) {
						e.preventDefault();
						$(this).attr('disabled', true).button('loading');

						// Once the export form is validated, if a callback function is specified, we call it; this function must return true or false to indicate whether the form contains errors or not.
						let hasErrors = false;
						if (typeof onSubmitExportModal == 'function') {
							hasErrors = onSubmitExportModal(modal, button);
						}

						if (hasErrors) {
							$(this).attr('disabled', false).button('reset');
							return false;
						}

						// If there is no error, we trigger the export
						if (typeof onExport == 'function') {
							onExport(button.data('format'), {...DataTableManager.getFilters()}, form, () => {
								// Remove the modal
								modal.modal('hide');
							});
						}

						return false;
					});
				});
			}

		}

		DataTableManager.setDefaultFilters(defaultFilters);
		DataTableManager.setCallbackOnLoadData(onLoadData);

		DataTableManager.loadData(div);
	}

	static updateFiltersAndLoadData(div, form) {
		DataTableManager.setFiltersFromForm(form);
		DataTableManager.addBrowserHistory();

		$('div#modal_filter').modal('hide');

		DataTableManager.loadData(div);
	}

	static loadData(div) {
		DataTableManager.addLoader(div);

		if (typeof this.callbackOnLoadData != 'undefined' && this.callbackOnLoadData != null) {
			this.callbackOnLoadData(div, DataTableManager.getFilters());
		}
	}

	static addBrowserHistory() {
		//console.log('addBrowserHistory');
		// we only keep the criteria containing string values or arrays with at most 3 elements
		let savedCriterias = Object.filter(this.criteres, value => (!Array.isArray(value) || (Array.isArray(value) && value.length <= 3)));
		//console.log('savedCriterias', savedCriterias);

		//var url = urldecode(urlRetour);
		var url = window.location.href;
		//console.log('current url', url);

		let queryString = UrlAndQueryString.getQueryString(url);
		//console.log('current QueryString', queryString);

		// Remove from the URL the criteria keys that are no longer in savedCriterias
		Object.keys(this.criteres).forEach(key => {
			if (!(key in savedCriterias)) {
				queryString = UrlAndQueryString.deleteParam(queryString, key);
			}
		});
		Object.entries(savedCriterias).forEach(([key, value]) => queryString = UrlAndQueryString.setParam(queryString, key, value));
		queryString = queryString.includes('?') ? queryString.substring(1) : queryString;
		//console.log('new queryString', queryString);

		let newUrl = UrlAndQueryString.getHostAndPath(url) + '?' + queryString;
		window.history.pushState("", "", newUrl);
	}


	// ------------------------------------------------------------
	// Table display
	// ------------------------------------------------------------

	static resetContent(div) {
		//console.log('resetContent');
		div.find('span.nb_items_many, span.nb_items_one').addClass('hide');
		div.find('span.nb_items_no').removeClass('hide');
		var table = div.find('table.table');
		table.find('thead,tfoot').removeClass('hide');
		table.find('tbody').children().remove();

		if (DataTable.isDataTable(table)) {
			const dt = table.DataTable();
			dt.clear();
			dt.destroy();
		}
	}

	static addModalLoader(modal, btnSubmit) {
		modal.find('.modal-body').addClass('hide').before('<div class="modal-body loader center"><i class="fa fa-circle-notch fa-spin"></i></div>');
		if (typeof btnSubmit != 'undefined') {
			btnSubmit.attr('disabled', true).button('loading');
		}
	}
	static removeModalLoader(modal, btnSubmit) {
		modal.find('.modal-body').removeClass('hide').parent().find('.loader').remove();
		if (typeof btnSubmit != 'undefined') {
			btnSubmit.attr('disabled', false).button('reset');
		}
	}

	static addLoader(div, isSmall) {
		if (typeof isSmall != 'undefined' && isSmall) {
			div.addClass('hide').before('<p class="loader center"><i class="fa fa-circle-notch fa-spin"></i></p>');
			return;
		}
		//div.addClass('hide').parent().prepend('<div class="alert alert-info loader center">Veuillez patienter… <br><p><i class="fa fa-circle-notch fa-spin"></i></p></div>');
		div.addClass('hide').before('<div class="alert alert-info loader center">Veuillez patienter… <br><p><i class="fa fa-circle-notch fa-spin"></i></p></div>');
	}
	static removeLoader(div) {
		div.removeClass('hide').parent().find('.loader').remove();
	}

	static displayErrorMessage(div, msg) {
		this.displayMessage(div, msg, 'danger');
	}
	static displayMessage(div, msg, cssClass /*, removeLoader=false*/) {
		this.resetContent(div);
		let table = div.find('table');
		table.find('thead,tfoot').addClass('hide');
		let msgHtml = '<div class="text-'+cssClass+' center">'+msg+'</div>';
		if (table.find('tbody').length == 0) {
			table.append('<tbody></tbody>');
		}
		table.find('tbody').append('<tr class="no_items '+cssClass+'"><td>'+msgHtml+'</td></tr>');
		// table.after(msgHtml);
		// if (removeLoader) {
		DataTableManager.removeLoader(div);
		// }
	}

	static displayError(div, data, defaultMessage) {
		let error = null;
		if (data != null) {
			if (typeof data.error != 'undefined') {
				error = data.error;
			}
			else if (typeof data[0] != 'undefined' && typeof data[0].error != 'undefined') {
				error = data[0].error;
			}
		}

		if (error == null) {
			return this.displayErrorMessage(div, (typeof defaultMessage != 'undefined' ? defaultMessage : (typeof labelErrorOccured != 'undefined' ? labelErrorOccured :  'Une erreur s’est produite.')));
		}
		return this.displayErrorMessage(div, 'Critères sélectionnés incorrect.');
	}

	static getDefaultColumnsForDisplayedTable(div) {
		let table = div.find('table');
		let columns = [];
		let defaultHiddenColumns = table.data('hidden_fields') != null ? table.data('hidden_fields').split(',') : [];
		table.find('thead tr th').each(function(idx, th) {
			if (defaultHiddenColumns.indexOf($(th).data('key')) == -1) {
				columns.push($(th).data('key'));
			}
		});
		//console.log(columns);
		return columns;
	}

	static setDataContent(div, data, displayLineCallback, completeCallback) {
		//console.log('setDataContent');
		let table = div.find('table').removeClass('hide');

		try {
			DataTableManager.resetContent(div);
			let tableBody = table.find('tbody');
			for (let i = 0; i < data.length; i++) {
				tableBody.append(displayLineCallback(data[i]));
			}

			if (data.length) {
				div.find('span.nb_items_no').addClass('hide');
				if (data.length === 1 && div.find('span.nb_items_one').length) {
					div.find('span.nb_items_one').removeClass('hide');
				}
				else {
					div.find('span.nb_items_many').removeClass('hide');
					div.find('span.nb_items').text(data.length);
				}
			}
			else {
				// if there is no DataTable plugin on the table, we hide the table if there is no result
				if (table.is('[data-no_datatables="1"]')) {
					table.addClass('hide');
				}
			}

			DataTableManager.initDataContent(div);
			if (typeof completeCallback == 'function') {
				completeCallback();
			}
			DataTableManager.removeLoader(div);
		}
		catch (e) {
			console.error(e);
		}
	}

	static initDataContent(div) {
		//console.log('initDataContent');
		let table = div.find('table');

		// Popover/Tooltip
		div.find('[data-toggle="popover"]').popover({'trigger':'hover', 'html':true});
		div.find('[data-toggle="tooltip"]').tooltip();

		// Action multiple / checkbox select all
		if (table.length > 0) {
			//SelectAll.initInTable(table);
			//MultipleActionInTable.init(table);

			//paging(div.find('select.pagination_max_rows'));
		}

		if (table.length > 0 && !table.is('[data-no_datatables="1"]') && !DataTable.isDataTable(table)) {
			const dtOptions = {...DataTableManager.getOptions()};
			if (table.data('page_length') != null) {
				dtOptions['pageLength'] = table.data('page_length');
			}
			table.DataTable(dtOptions);
		}

		DataTableManager.updateDataContent(div);
	}

	static updateDataContent(div) {
		let table = div.find('table');

		// Maj colonnes
		if (table.length > 0 && typeof div.data('table_name') != 'undefined' && div.data('table_name') != null && div.data('display_items').split(',').indexOf('table_columns') != -1) {
			table.find('thead tr th').each(function(idx, th) {
				// table.find('.'+$(th).data('key')+':not(.select):not(.action)').hide();
				table.find('.'+$(th).data('key')+':not(.select):not(.action)').addClass('hide');
			});
			let columns = this.getDisplayParam(div, 'html', null, 'columns').split(',').removeEmptyValues();
			$.each(columns, function(idx, key) {
				table.find('.'+key).removeClass('hide');
				// table.find('.'+key).show();
			});
		}

		if (typeof this.callbackOnUpdateDataContent != 'undefined' && this.callbackOnUpdateDataContent != null) {
			this.callbackOnUpdateDataContent(div);
		}
	}

	static filterRows(table, callback) {
		if (!DataTable.isDataTable(table)) {
			return;
		}

		const dt = table.DataTable();

		// Remove the previous filter registered for this table
		DataTable.ext.search = DataTable.ext.search.filter(fn => fn._table !== table[0]);

		// Register a filter scoped to this table only
		const filterFn = function(settings, searchData, index) {
			if (settings.table !== table[0]) return true;
			return callback($(dt.row(index).node()));
		};
		filterFn._table = table[0];
		DataTable.ext.search.push(filterFn);
		dt.draw();
	}

	static sort(table, tdSelector) {
		//if (table.find('tbody tr').length > 0 && DataTable.isDataTable(table)) {
		if (DataTable.isDataTable(table)) {
			let idx = table.find('thead tr '+tdSelector).index();
			if (idx >= 0) {
				table.DataTable().order([[idx, 'asc']]).draw();
			}
		}
	}

}
