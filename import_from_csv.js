import './string.js';
import { toEl } from './util.js';
import Papa from 'papaparse';
import { FormHelper } from './form_helper.js';
import { CSV } from './file.js';

class ImportFromCsv {

	static _defaults = {
		errorMessageFileNotValid: 'Le fichier sélectionné n’est pas un fichier CSV valide.',
		errorMessageFileEmpty: 'Veuillez indiquer le fichier CSV à importer.',
		errorMessageImportSelectColumns: 'Veuillez sélectionner les colonnes à importer.',
		selectDefaultOptionLabel: 'Sélectionnez la colonne\u2026',
		lineLabel: 'Ligne {0} :',
		errorMessageImportFailed: 'L’importation a échouée :',
	};

	static setDefault(options) {
		ImportFromCsv._defaults = { ...ImportFromCsv._defaults, ...options };
	}

	static initForm(div, options = {}) {
		div = toEl(div);
		if (!div) {
			return;
		}

		const {
			importColumns,
			requestImportData,
			specificDescDiv,
			additionalFormField,
			errorMessageFileNotValid,
			errorMessageFileEmpty,
			errorMessageImportSelectColumns,
			selectDefaultOptionLabel,
			lineLabel,
			errorMessageImportFailed,
		} = { ...ImportFromCsv._defaults, ...options };

		const template = document.querySelector('.import_form_base');
		if (!template) {
			return;
		}

		const clone = template.cloneNode(true);
		clone.classList.remove('import_form_base', 'hide');
		div.innerHTML = '';
		div.appendChild(clone);

		const formUpload = div.querySelector('.form_upload');
		const formMatching = div.querySelector('.form_matching');
		const divResult = div.querySelector('.csv_result');

		function resetUi() {
			formMatching.classList.add('hide');
			formUpload.classList.remove('hide');
			formUpload.querySelector('div.errors')?.classList.add('hide');
		}

		const specificDescDivEl = toEl(specificDescDiv);
		if (specificDescDivEl != null) {
			div.querySelector('.specific_desc')?.append(specificDescDivEl);
		}

		if (additionalFormField != null) {
			div.querySelector('.import_matching_select_content')?.insertAdjacentHTML('afterend', additionalFormField);
		}

		const submitUploadBtn = formUpload.querySelector('button[type="submit"]');
		submitUploadBtn.addEventListener('click', function(event) {
			event.preventDefault();
			FormHelper.buttonLoader(this, 'loading');
			formUpload.querySelector('div.errors')?.classList.add('hide');

			const fileInput = formUpload.querySelector('input[type="file"]');
			if (!fileInput.files || !fileInput.files.length) {
				const errDiv = formUpload.querySelector('div.errors');
				if (errDiv) {
					errDiv.innerHTML = errorMessageFileEmpty; errDiv.classList.remove('hide');
				}
				FormHelper.buttonLoader(submitUploadBtn, 'reset');
				return;
			}

			const hasHeader = formUpload.querySelectorAll('input[name="header"][value="1"]:checked').length;
			const encoding = formUpload.querySelector('select[name="encoding"]')?.value;

			Papa.parse(fileInput.files[0], {
				header: hasHeader,
				encoding: encoding,
				dynamicTyping: false,
				skipEmptyLines: true,
				beforeFirstChunk: function(chunk) {
					return chunk.trim();
				},
				complete: function(results, file) {
					if (false === CSV.checkFile(file.name, file.type)) {
						const errDiv = document.querySelector('#form_import_upload div.errors');
						if (errDiv) {
							errDiv.innerHTML = errorMessageFileNotValid; errDiv.classList.remove('hide');
						}
						FormHelper.buttonLoader(submitUploadBtn, 'reset');
						return;
					}

					const parsedImportList = results.data;
					const header = hasHeader ? results.meta.fields : results.data[0];

					ImportFromCsv.displayData(divResult, parsedImportList, (hasHeader ? header : null), formMatching);
					ImportFromCsv.displayFormMatching(formMatching, importColumns, header, hasHeader, selectDefaultOptionLabel);

					formUpload.classList.add('hide');
					FormHelper.buttonLoader(submitUploadBtn, 'reset');
				},
				error: function(err, file) {
					const errDiv = formUpload.querySelector('div.errors');
					if (errDiv) {
						errDiv.innerHTML = errorMessageFileNotValid; errDiv.classList.remove('hide');
					}
					console.error(err, file);
					FormHelper.buttonLoader(submitUploadBtn, 'reset');
				}
			});
		});

		const submitMatchingBtn = formMatching.querySelector('button[type="submit"]');
		submitMatchingBtn.addEventListener('click', function(event) {
			event.preventDefault();
			FormHelper.buttonLoader(this, 'loading');
			const errDiv = formMatching.querySelector('div.errors');
			if (errDiv) {
				errDiv.classList.add('hide'); errDiv.innerHTML = '';
			}
			divResult.querySelectorAll('table tr').forEach(tr => tr.classList.remove('danger'));

			const tabLink = ImportFromCsv.getTabLink(formMatching);

			if (Object.keys(tabLink).length === 0) {
				if (errDiv) {
					errDiv.innerHTML = errorMessageImportSelectColumns; errDiv.classList.remove('hide');
				}
				FormHelper.buttonLoader(this, 'reset');
				return;
			}

			const dataToImport = ImportFromCsv.getDataToImport(divResult, tabLink);

			requestImportData(dataToImport,
				(json) => {
					if (errDiv) {
						errDiv.innerHTML = typeof json['import_list'] !== 'undefined'
							? json['import_list']
							: ImportFromCsv.getErrorsHtmlOfImportData(json, divResult, errorMessageImportFailed, lineLabel);
						errDiv.classList.remove('hide');
					}
					FormHelper.buttonLoader(formMatching.querySelector('button[type="submit"]'), 'reset');
				}
			);
		});

		const cancelLink = formMatching.querySelector('a.cancel_link');
		if (cancelLink) {
			cancelLink.addEventListener('click', (event) => {
				event.preventDefault();
				resetUi();
			});
		}

		resetUi();
	}

	static getDataToImport(divResult, tabLink) {
		const importListWithFieldNames = [];
		divResult.querySelectorAll('table tbody tr').forEach((line, index) => {
			if (!line.querySelectorAll('input.import_line_checkbox:checked').length) {
				return;
			}

			const lineData = { line: (index + 1) };
			Object.entries(tabLink).forEach(([key, listeImportIndex]) => {
				if (listeImportIndex != -1) {
					const td = line.querySelector('td[data-key="' + listeImportIndex + '"]');
					if (td) {
						lineData[key] = td.textContent;
					}
				}
			});
			importListWithFieldNames.push(lineData);
		});
		return importListWithFieldNames;
	}

	static displayData(divResult, data, header, formMatching) {
		divResult = toEl(divResult);
		if (!divResult) {
			return;
		}

		let table = divResult.querySelector('table');
		if (!table) {
			divResult.insertAdjacentHTML('beforeend', '<table class="table table-sm table-bordered"></table>');
			table = divResult.querySelector('table');
		}
		table.innerHTML = '';

		let tableContent = '';
		if (null !== header) {
			tableContent += '<thead><tr>';
			tableContent += '<th></th>';
			header.forEach((value) => {
				tableContent += '<th>' + value + '</th>';
			});
			tableContent += '<th></th>';
			tableContent += '</tr></thead>';
		}

		tableContent += '<tbody>';
		data.forEach((line, index) => {
			tableContent += '<tr data-line="' + (index + 1) + '">';
			tableContent += '<td class="text-bold text-end select_line_checkbox"><input type="checkbox" class="import_line_checkbox pull-left" checked="checked" /> ' + (index + 1) + '.</td>';
			const entries = Array.isArray(line) ? line.map((v, i) => [i, v]) : Object.entries(line);
			entries.forEach(([key, value]) => {
				tableContent += '<td data-key="' + key + '">' + (value !== null ? value : '') + '</td>';
			});
			tableContent += '<td class="text-center edit_line_button"></td>';
			tableContent += '</tr>';
		});
		tableContent += '</tbody>';

		table.innerHTML = tableContent;

		table.querySelectorAll('td.edit_line_button').forEach(el => {
			ImportFromCsv.initEditLink(formMatching, el);
		});

		divResult.classList.remove('hide');
	}

	static initValidateLine(formMatching, td) {
		td.innerHTML = '<a href="#" class="import_validate_line text-success"><i class="fas fa-check"></i></a>';
		td.querySelector('a.import_validate_line').addEventListener('click', function(e) {
			e.preventDefault();
			const tr = this.closest('tr');
			tr.querySelectorAll('td').forEach((cell) => {
				if (cell.classList.contains('select_line_checkbox') || cell.classList.contains('edit_line_button')) {
					return;
				}
				const input = cell.querySelector('input');
				cell.innerHTML = input ? input.value : '';
			});

			if (!td.closest('table').querySelectorAll('td input[type="text"]').length) {
				formMatching.querySelector('button[type="submit"]').disabled = false;
			}
			ImportFromCsv.initEditLink(formMatching, td);
		});
	}

	static initEditLink(formMatching, td) {
		td.innerHTML = '<a href="#" class="import_edit_line text-danger"><i class="fas fa-pencil-alt"></i></a>';
		td.querySelector('a.import_edit_line').addEventListener('click', function(e) {
			e.preventDefault();
			const tr = this.closest('tr');
			tr.querySelectorAll('td').forEach((cell) => {
				if (cell.classList.contains('select_line_checkbox') || cell.classList.contains('edit_line_button')) {
					return;
				}
				cell.dataset.original_value = cell.innerHTML;
				cell.innerHTML = '<input type="text" class="form-control" value="' + cell.innerHTML.replace(/"/g, '&quot;') + '" />';
			});
			formMatching.querySelector('button[type="submit"]').disabled = true;
			ImportFromCsv.initValidateLine(formMatching, td);
		});
	}

	static getErrorsHtmlOfImportData(json, divResult = null, errorMessageImportFailed = null, lineLabel = null) {
		errorMessageImportFailed = errorMessageImportFailed ?? ImportFromCsv._defaults.errorMessageImportFailed;
		lineLabel = lineLabel ?? ImportFromCsv._defaults.lineLabel;
		let resultError = errorMessageImportFailed;
		resultError += '<ul>';
		json.forEach((errorData) => {
			console.error(errorData);
			if (null != divResult) {
				divResult.querySelector('table tr[data-line="' + errorData.line + '"]')?.classList.add('danger');
			}
			resultError += '<li>' + lineLabel.format(errorData.line) + '<ul>';
			const errors = (Array.isArray(errorData.errors) ? errorData.errors : Object.values(errorData.errors));
			errors.forEach((error) => {
				resultError += '<li>' + error + '</li>';
			});
			resultError += '</ul></li>';
		});
		resultError += '</ul>';
		return resultError;
	}

	static isImportErrors(json) {
		if (!Array.isArray(json)) {
			return false;
		}

		for (let key in json) {
			let value = json[key];
			if (typeof value == 'object' && typeof value['line'] != 'undefined' && typeof value['errors'] != 'undefined') {
				return true;
			}
		}

		return false;
	}

	static getTabLink(formMatching) {
		const tabLink = {};
		formMatching.querySelectorAll('select').forEach((select) => {
			const listeImportIndex = select.value;
			if (listeImportIndex != -1) {
				tabLink[select.name] = listeImportIndex;
			}
		});
		return tabLink;
	}

	static displayFormMatching(formMatching, importColumns, header, hasHeader, selectDefaultOptionLabel = null) {
		selectDefaultOptionLabel = selectDefaultOptionLabel ?? ImportFromCsv._defaults.selectDefaultOptionLabel;
		let options = '<option value="-1">' + selectDefaultOptionLabel + '</option>';
		header.forEach((value, index) => {
			options += '<option value="' + (hasHeader ? value : index) + '">' + value + '</option>';
		});

		const selectContent = formMatching.querySelector('.import_matching_select_content');
		selectContent.classList.add('row');
		selectContent.innerHTML = '';

		Object.entries(importColumns).forEach(([key, label]) => {
			const tempDiv = document.createElement('div');
			tempDiv.innerHTML =
				'<div class="form-group col-md-3">' +
					'<label for="form_import_' + key + '">' + label + '</label>' +
					'<select class="form-control" name="' + key + '" id="form_import_' + key + '">' + options + '</select>' +
				'</div>';
			const selectFormGroup = tempDiv.firstElementChild;
			for (const option of selectFormGroup.querySelector('select').options) {
				if (option.textContent.trim() === label) {
					option.selected = true;
					break;
				}
			}
			selectContent.appendChild(selectFormGroup);
		});

		formMatching.querySelector('div.errors')?.classList.add('hide');
		formMatching.classList.remove('hide');
	}

}

export { ImportFromCsv };