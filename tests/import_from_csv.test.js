/**
 * @jest-environment jsdom
 */
import { ImportFromCsv } from '../import_from_csv.js';

const originalDefaults = { ...ImportFromCsv._defaults };

function setupFormMatching() {
	const form = document.createElement('div');
	form.classList.add('form_matching');
	form.innerHTML = `
		<div class="import_matching_select_content"></div>
		<div class="errors hide"></div>
		<button type="submit">Import</button>`;
	document.body.appendChild(form);
	return form;
}

function setupDivResult(rows = []) {
	const div = document.createElement('div');
	div.classList.add('csv_result', 'hide');
	const tbodyRows = rows.map((row, rowIndex) => {
		const entries = Array.isArray(row) ? row.map((v, i) => [i, v]) : Object.entries(row);
		const tds = entries.map(([key, val]) => `<td data-key="${key}">${val ?? ''}</td>`).join('');
		return `<tr data-line="${rowIndex + 1}">
			<td class="select_line_checkbox"><input type="checkbox" class="import_line_checkbox" checked="checked" /></td>
			${tds}
			<td class="edit_line_button"></td>
		</tr>`;
	}).join('');
	div.innerHTML = `<table><tbody>${tbodyRows}</tbody></table>`;
	document.body.appendChild(div);
	return div;
}

function setupTableWithRow(cells = ['John', 'john@example.com'], formMatching = null) {
	const fm = formMatching ?? setupFormMatching();
	const table = document.createElement('table');
	const tbody = document.createElement('tbody');
	const tr = document.createElement('tr');

	const checkboxTd = document.createElement('td');
	checkboxTd.className = 'select_line_checkbox';
	checkboxTd.innerHTML = '<input type="checkbox" class="import_line_checkbox" checked="checked" />';
	tr.appendChild(checkboxTd);

	cells.forEach((val, i) => {
		const td = document.createElement('td');
		td.dataset.key = String(i);
		td.textContent = val ?? '';
		tr.appendChild(td);
	});

	const editTd = document.createElement('td');
	editTd.className = 'edit_line_button';
	tr.appendChild(editTd);

	tbody.appendChild(tr);
	table.appendChild(tbody);
	document.body.appendChild(table);

	return { table, tr, editTd, fm };
}

afterEach(() => {
	document.body.innerHTML = '';
	ImportFromCsv._defaults = { ...originalDefaults };
});

describe('ImportFromCsv', () => {

	describe('setDefault', () => {
		test('should set default options', () => {
			ImportFromCsv.setDefault({ errorMessageImportFailed: 'Custom error' });

			expect(ImportFromCsv._defaults.errorMessageImportFailed).toBe('Custom error');
		});

		test('should merge with existing defaults', () => {
			ImportFromCsv.setDefault({ errorMessageFileEmpty: 'Empty file' });
			ImportFromCsv.setDefault({ errorMessageImportFailed: 'Import failed' });

			expect(ImportFromCsv._defaults.errorMessageFileEmpty).toBe('Empty file');
			expect(ImportFromCsv._defaults.errorMessageImportFailed).toBe('Import failed');
		});

		test('should use defaults in getErrorsHtmlOfImportData when no params passed', () => {
			ImportFromCsv.setDefault({ errorMessageImportFailed: 'Default error', lineLabel: 'Row {0}' });

			const html = ImportFromCsv.getErrorsHtmlOfImportData([{ line: 1, errors: ['Err'] }]);

			expect(html).toContain('Default error');
			expect(html).toContain('Row 1');
		});

		test('should use defaults in displayFormMatching when no selectDefaultOptionLabel passed', () => {
			ImportFromCsv.setDefault({ selectDefaultOptionLabel: 'Pick a column' });
			const formMatching = setupFormMatching();

			ImportFromCsv.displayFormMatching(formMatching, { col: 'Col' }, ['Col'], true);

			const select = formMatching.querySelector('select');
			expect(select.options[0].textContent).toBe('Pick a column');
		});
	});

	describe('isImportErrors', () => {
		test('should return true when json contains import errors', () => {
			const json = [
				{ line: 1, errors: ['Error 1', 'Error 2'] },
				{ line: 2, errors: ['Error 3'] }
			];
			expect(ImportFromCsv.isImportErrors(json)).toBe(true);
		});

		test('should return false when json is not an array', () => {
			const json = { message: 'success' };
			expect(ImportFromCsv.isImportErrors(json)).toBe(false);
		});

		test('should return false when array does not contain error objects', () => {
			const json = [
				{ name: 'John', email: 'john@example.com' },
				{ name: 'Jane', email: 'jane@example.com' }
			];
			expect(ImportFromCsv.isImportErrors(json)).toBe(false);
		});

		test('should return false for empty array', () => {
			expect(ImportFromCsv.isImportErrors([])).toBe(false);
		});

		test('should return true when at least one item has line and errors', () => {
			const json = [
				{ name: 'John' },
				{ line: 2, errors: ['Error'] }
			];
			expect(ImportFromCsv.isImportErrors(json)).toBe(true);
		});
	});

	describe('getTabLink', () => {
		test('should extract selected values from selects', () => {
			const formMatching = setupFormMatching();
			formMatching.querySelector('.import_matching_select_content').innerHTML = `
				<select name="name"><option value="0" selected>Col0</option></select>
				<select name="email"><option value="1" selected>Col1</option></select>
				<select name="phone"><option value="-1" selected>--</option></select>`;

			const result = ImportFromCsv.getTabLink(formMatching);

			expect(result).toEqual({ name: '0', email: '1' });
		});

		test('should return empty object when no selects with valid values', () => {
			const formMatching = setupFormMatching();
			formMatching.querySelector('.import_matching_select_content').innerHTML = `
				<select name="name"><option value="-1" selected>--</option></select>`;

			const result = ImportFromCsv.getTabLink(formMatching);

			expect(result).toEqual({});
		});

		test('should return empty object when no selects', () => {
			const formMatching = setupFormMatching();

			const result = ImportFromCsv.getTabLink(formMatching);

			expect(result).toEqual({});
		});
	});

	describe('getErrorsHtmlOfImportData', () => {
		test('should generate HTML for import errors', () => {
			const json = [
				{ line: 1, errors: ['Name is required', 'Email is invalid'] },
				{ line: 3, errors: ['Phone is required'] }
			];

			const html = ImportFromCsv.getErrorsHtmlOfImportData(json, null, 'Import failed', 'Line {0}');

			expect(html).toContain('Import failed');
			expect(html).toContain('<ul>');
			expect(html).toContain('Line 1');
			expect(html).toContain('Name is required');
			expect(html).toContain('Email is invalid');
			expect(html).toContain('Line 3');
			expect(html).toContain('Phone is required');
		});

		test('should mark error lines in divResult when provided', () => {
			const divResult = setupDivResult([['a'], ['b']]);

			const json = [{ line: 2, errors: ['Error'] }];
			ImportFromCsv.getErrorsHtmlOfImportData(json, divResult, 'Import failed', 'Line {0}');

			const tr2 = divResult.querySelector('table tr[data-line="2"]');
			expect(tr2.classList.contains('danger')).toBe(true);

			const tr1 = divResult.querySelector('table tr[data-line="1"]');
			expect(tr1.classList.contains('danger')).toBe(false);
		});

		test('should handle empty errors array', () => {
			const html = ImportFromCsv.getErrorsHtmlOfImportData([], null, 'Import failed', 'Line {0}');

			expect(html).toContain('Import failed');
			expect(html).toContain('<ul>');
			expect(html).toContain('</ul>');
		});
	});

	describe('getDataToImport', () => {
		test('should extract data from checked rows', () => {
			const divResult = setupDivResult([
				['John Doe', 'john@example.com'],
				['Jane', 'jane@example.com']
			]);
			// Uncheck second row
			divResult.querySelectorAll('input.import_line_checkbox')[1].checked = false;

			const result = ImportFromCsv.getDataToImport(divResult, { name: '0', email: '1' });

			expect(result).toHaveLength(1);
			expect(result[0]).toEqual({ line: 1, name: 'John Doe', email: 'john@example.com' });
		});

		test('should skip rows without checked checkbox', () => {
			const divResult = setupDivResult([['John']]);
			divResult.querySelector('input.import_line_checkbox').checked = false;

			const result = ImportFromCsv.getDataToImport(divResult, { name: '0' });

			expect(result).toEqual([]);
		});

		test('should handle missing columns gracefully', () => {
			const divResult = setupDivResult([['John', 'john@test.com']]);
			// tabLink references key "2" which has no td

			const result = ImportFromCsv.getDataToImport(divResult, { name: '0', email: '1', phone: '2' });

			expect(result).toHaveLength(1);
			expect(result[0]).toEqual({ line: 1, name: 'John', email: 'john@test.com' });
			expect(result[0].phone).toBeUndefined();
		});

		test('should include line number in each result', () => {
			const divResult = setupDivResult([['A'], ['B'], ['C']]);

			const result = ImportFromCsv.getDataToImport(divResult, { val: '0' });

			expect(result[0].line).toBe(1);
			expect(result[1].line).toBe(2);
			expect(result[2].line).toBe(3);
		});

		test('should return empty array for empty table', () => {
			const divResult = setupDivResult([]);

			const result = ImportFromCsv.getDataToImport(divResult, { name: '0' });

			expect(result).toEqual([]);
		});
	});

	describe('displayFormMatching', () => {
		test('should create select elements for each import column', () => {
			const formMatching = setupFormMatching();
			const importColumns = { name: 'Name', email: 'Email', phone: 'Phone' };
			const header = ['Name', 'Email', 'Phone', 'Address'];

			ImportFromCsv.displayFormMatching(formMatching, importColumns, header, true);

			const selects = formMatching.querySelectorAll('select');
			expect(selects).toHaveLength(3);
			expect(selects[0].name).toBe('name');
			expect(selects[1].name).toBe('email');
			expect(selects[2].name).toBe('phone');
		});

		test('should populate options from header', () => {
			const formMatching = setupFormMatching();
			const header = ['Col A', 'Col B'];

			ImportFromCsv.displayFormMatching(formMatching, { field: 'Field' }, header, true);

			const select = formMatching.querySelector('select');
			const optionValues = [...select.options].map(o => o.value);
			expect(optionValues).toContain('Col A');
			expect(optionValues).toContain('Col B');
			expect(optionValues).toContain('-1');
		});

		test('should use index as option value when hasHeader is false', () => {
			const formMatching = setupFormMatching();
			const header = ['Col1', 'Col2'];

			ImportFromCsv.displayFormMatching(formMatching, { field: 'Field' }, header, false);

			const select = formMatching.querySelector('select');
			const optionValues = [...select.options].map(o => o.value);
			expect(optionValues).toContain('0');
			expect(optionValues).toContain('1');
		});

		test('should auto-select option matching column label', () => {
			const formMatching = setupFormMatching();
			const importColumns = { name: 'Name', email: 'Email' };
			const header = ['Name', 'Email', 'Phone'];

			ImportFromCsv.displayFormMatching(formMatching, importColumns, header, true);

			const nameSelect = formMatching.querySelector('select[name="name"]');
			expect(nameSelect.value).toBe('Name');

			const emailSelect = formMatching.querySelector('select[name="email"]');
			expect(emailSelect.value).toBe('Email');
		});

		test('should show formMatching and hide errors', () => {
			const formMatching = setupFormMatching();
			formMatching.classList.add('hide');

			ImportFromCsv.displayFormMatching(formMatching, { col: 'Col' }, ['Col'], true);

			expect(formMatching.classList.contains('hide')).toBe(false);
			expect(formMatching.querySelector('div.errors').classList.contains('hide')).toBe(true);
		});

		test('should clear previous select content', () => {
			const formMatching = setupFormMatching();

			ImportFromCsv.displayFormMatching(formMatching, { a: 'A' }, ['A'], true);
			ImportFromCsv.displayFormMatching(formMatching, { b: 'B', c: 'C' }, ['B', 'C'], true);

			const selects = formMatching.querySelectorAll('select');
			expect(selects).toHaveLength(2);
		});
	});

	describe('displayData', () => {
		test('should create table with header when header is provided', () => {
			const formMatching = setupFormMatching();
			const divResult = document.createElement('div');
			divResult.classList.add('csv_result', 'hide');
			document.body.appendChild(divResult);

			const data = [['John', 'john@example.com'], ['Jane', 'jane@example.com']];
			const header = ['Name', 'Email'];

			ImportFromCsv.displayData(divResult, data, header, formMatching);

			const thead = divResult.querySelector('thead');
			expect(thead).not.toBeNull();
			expect(thead.textContent).toContain('Name');
			expect(thead.textContent).toContain('Email');
		});

		test('should create table without header when header is null', () => {
			const formMatching = setupFormMatching();
			const divResult = document.createElement('div');
			document.body.appendChild(divResult);

			ImportFromCsv.displayData(divResult, [['John']], null, formMatching);

			expect(divResult.querySelector('thead')).toBeNull();
			expect(divResult.querySelector('tbody')).not.toBeNull();
		});

		test('should add checkboxes for each row', () => {
			const formMatching = setupFormMatching();
			const divResult = document.createElement('div');
			document.body.appendChild(divResult);

			ImportFromCsv.displayData(divResult, [['John'], ['Jane']], null, formMatching);

			const checkboxes = divResult.querySelectorAll('input.import_line_checkbox');
			expect(checkboxes).toHaveLength(2);
			expect(checkboxes[0].checked).toBe(true);
		});

		test('should set data-line attribute on rows', () => {
			const formMatching = setupFormMatching();
			const divResult = document.createElement('div');
			document.body.appendChild(divResult);

			ImportFromCsv.displayData(divResult, [['A'], ['B'], ['C']], null, formMatching);

			expect(divResult.querySelector('tr[data-line="1"]')).not.toBeNull();
			expect(divResult.querySelector('tr[data-line="2"]')).not.toBeNull();
			expect(divResult.querySelector('tr[data-line="3"]')).not.toBeNull();
		});

		test('should create table if it does not exist', () => {
			const formMatching = setupFormMatching();
			const divResult = document.createElement('div');
			document.body.appendChild(divResult);

			ImportFromCsv.displayData(divResult, [['test']], null, formMatching);

			expect(divResult.querySelector('table')).not.toBeNull();
			expect(divResult.querySelector('table').classList.contains('table')).toBe(true);
		});

		test('should handle null values in data', () => {
			const formMatching = setupFormMatching();
			const divResult = document.createElement('div');
			document.body.appendChild(divResult);

			ImportFromCsv.displayData(divResult, [['John', null, 'test@example.com']], null, formMatching);

			const tds = divResult.querySelectorAll('tbody td[data-key]');
			expect(tds[0].textContent).toBe('John');
			expect(tds[1].textContent).toBe('');
			expect(tds[2].textContent).toBe('test@example.com');
		});

		test('should show divResult after populating data', () => {
			const formMatching = setupFormMatching();
			const divResult = document.createElement('div');
			divResult.classList.add('hide');
			document.body.appendChild(divResult);

			ImportFromCsv.displayData(divResult, [['A']], null, formMatching);

			expect(divResult.classList.contains('hide')).toBe(false);
		});

		test('should add edit links to each row', () => {
			const formMatching = setupFormMatching();
			const divResult = document.createElement('div');
			document.body.appendChild(divResult);

			ImportFromCsv.displayData(divResult, [['A'], ['B']], null, formMatching);

			const editLinks = divResult.querySelectorAll('a.import_edit_line');
			expect(editLinks).toHaveLength(2);
		});

		test('should handle object-based rows (with header)', () => {
			const formMatching = setupFormMatching();
			const divResult = document.createElement('div');
			document.body.appendChild(divResult);

			const data = [{ name: 'John', email: 'john@example.com' }];
			const header = ['name', 'email'];

			ImportFromCsv.displayData(divResult, data, header, formMatching);

			expect(divResult.querySelector('td[data-key="name"]').textContent).toBe('John');
			expect(divResult.querySelector('td[data-key="email"]').textContent).toBe('john@example.com');
		});
	});

	describe('initEditLink', () => {
		test('should set up edit link in td', () => {
			const { editTd, fm } = setupTableWithRow();

			ImportFromCsv.initEditLink(fm, editTd);

			expect(editTd.querySelector('a.import_edit_line')).not.toBeNull();
		});

		test('should convert cells to inputs on click', () => {
			const { editTd, fm } = setupTableWithRow(['John', 'john@example.com']);

			ImportFromCsv.initEditLink(fm, editTd);
			editTd.querySelector('a.import_edit_line').click();

			const inputs = document.querySelectorAll('td[data-key] input[type="text"]');
			expect(inputs).toHaveLength(2);
			expect(inputs[0].value).toBe('John');
			expect(inputs[1].value).toBe('john@example.com');
		});

		test('should disable submit button when editing', () => {
			const { editTd, fm } = setupTableWithRow(['John']);

			ImportFromCsv.initEditLink(fm, editTd);
			editTd.querySelector('a.import_edit_line').click();

			expect(fm.querySelector('button[type="submit"]').disabled).toBe(true);
		});

		test('should save original cell value in dataset', () => {
			const { editTd, fm } = setupTableWithRow(['John']);

			ImportFromCsv.initEditLink(fm, editTd);
			editTd.querySelector('a.import_edit_line').click();

			const dataCell = document.querySelector('td[data-key="0"]');
			expect(dataCell.dataset.original_value).toBe('John');
		});

		test('should replace edit link with validate link after click', () => {
			const { editTd, fm } = setupTableWithRow(['John']);

			ImportFromCsv.initEditLink(fm, editTd);
			editTd.querySelector('a.import_edit_line').click();

			expect(editTd.querySelector('a.import_edit_line')).toBeNull();
			expect(editTd.querySelector('a.import_validate_line')).not.toBeNull();
		});

		test('should not affect select_line_checkbox or edit_line_button cells', () => {
			const { editTd, fm } = setupTableWithRow(['John']);

			ImportFromCsv.initEditLink(fm, editTd);
			editTd.querySelector('a.import_edit_line').click();

			const checkboxTd = document.querySelector('td.select_line_checkbox');
			expect(checkboxTd.querySelector('input[type="text"]')).toBeNull();
		});
	});

	describe('initValidateLine', () => {
		test('should set up validate link in td', () => {
			const { editTd, fm } = setupTableWithRow();

			ImportFromCsv.initValidateLine(fm, editTd);

			expect(editTd.querySelector('a.import_validate_line')).not.toBeNull();
		});

		test('should convert inputs back to text on click', () => {
			const { editTd, fm } = setupTableWithRow(['John']);

			// First enter edit mode
			ImportFromCsv.initEditLink(fm, editTd);
			editTd.querySelector('a.import_edit_line').click();

			// Now validate
			editTd.querySelector('a.import_validate_line').click();

			const dataCell = document.querySelector('td[data-key="0"]');
			expect(dataCell.querySelector('input')).toBeNull();
			expect(dataCell.textContent).toBe('John');
		});

		test('should use input value when restoring cell content', () => {
			const { editTd, fm } = setupTableWithRow(['John']);

			ImportFromCsv.initEditLink(fm, editTd);
			editTd.querySelector('a.import_edit_line').click();

			// Change input value
			document.querySelector('td[data-key="0"] input').value = 'Jane';

			editTd.querySelector('a.import_validate_line').click();

			expect(document.querySelector('td[data-key="0"]').textContent).toBe('Jane');
		});

		test('should re-enable submit button when no inputs remain', () => {
			const { editTd, fm } = setupTableWithRow(['John']);
			fm.querySelector('button[type="submit"]').disabled = true;

			ImportFromCsv.initEditLink(fm, editTd);
			editTd.querySelector('a.import_edit_line').click();
			editTd.querySelector('a.import_validate_line').click();

			expect(fm.querySelector('button[type="submit"]').disabled).toBe(false);
		});

		test('should replace validate link with edit link after click', () => {
			const { editTd, fm } = setupTableWithRow(['John']);

			ImportFromCsv.initEditLink(fm, editTd);
			editTd.querySelector('a.import_edit_line').click();
			editTd.querySelector('a.import_validate_line').click();

			expect(editTd.querySelector('a.import_validate_line')).toBeNull();
			expect(editTd.querySelector('a.import_edit_line')).not.toBeNull();
		});
	});
});