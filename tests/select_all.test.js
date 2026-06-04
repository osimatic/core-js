/**
 * @jest-environment jsdom
 */
import { SelectAll } from '../select_all.js';

// ─── helpers ────────────────────────────────────────────────────────────────

function setupFormGroup({ nbCheckboxes = 3, nbChecked = 0 } = {}) {
	const checkboxes = Array.from({ length: nbCheckboxes }, (_, i) => {
		const checked = i < nbChecked ? ' checked' : '';
		return `<input type="checkbox" name="item[]" value="${i + 1}"${checked}>`;
	}).join('');

	document.body.innerHTML = `
		<div class="form-group">
			<a class="check_all" href="#">Tout sélectionner</a>
			${checkboxes}
		</div>`;

	return document.querySelector('.form-group');
}

function setupTable({ nbRows = 2, nbChecked = 0 } = {}) {
	const rows = Array.from({ length: nbRows }, (_, i) => {
		const checked = i < nbChecked ? ' checked' : '';
		return `<tr><td><input type="checkbox" value="${i + 1}"${checked}></td></tr>`;
	}).join('');

	document.body.innerHTML = `
		<table>
			<thead><tr><th><input type="checkbox" class="check_all"></th></tr></thead>
			<tbody>${rows}</tbody>
		</table>`;

	return document.querySelector('table');
}

function setupDivWithCheckAll({ nbItems = 3, nbChecked = 0 } = {}) {
	const items = Array.from({ length: nbItems }, (_, i) => {
		const checked = i < nbChecked ? ' checked' : '';
		return `<div class="form-check"><input type="checkbox" value="${i + 1}"${checked}></div>`;
	}).join('');

	document.body.innerHTML = `
		<div class="checkbox_with_check_all">
			<input type="checkbox" class="check_all">
			${items}
		</div>`;

	return document.querySelector('.checkbox_with_check_all');
}

// ─── tests ───────────────────────────────────────────────────────────────────

afterEach(() => {
	document.body.innerHTML = '';
});

describe('SelectAll', () => {

	describe('updateFormGroup', () => {
		test('should set link text to "Tout désélectionner" when all checkboxes are checked', () => {
			const formGroup = setupFormGroup({ nbCheckboxes: 3, nbChecked: 3 });
			SelectAll.updateFormGroup(formGroup);
			expect(formGroup.querySelector('a.check_all').textContent).toBe('Tout désélectionner');
		});

		test('should set link text to "Tout sélectionner" when partially checked', () => {
			const formGroup = setupFormGroup({ nbCheckboxes: 3, nbChecked: 1 });
			SelectAll.updateFormGroup(formGroup);
			expect(formGroup.querySelector('a.check_all').textContent).toBe('Tout sélectionner');
		});

		test('should set link text to "Tout sélectionner" when none checked', () => {
			const formGroup = setupFormGroup({ nbCheckboxes: 3, nbChecked: 0 });
			SelectAll.updateFormGroup(formGroup);
			expect(formGroup.querySelector('a.check_all').textContent).toBe('Tout sélectionner');
		});

		test('should do nothing when no a.check_all found', () => {
			document.body.innerHTML = `<div class="form-group"><input type="checkbox"></div>`;
			const formGroup = document.querySelector('.form-group');
			expect(() => SelectAll.updateFormGroup(formGroup)).not.toThrow();
		});

		test('should do nothing when formGroup is null', () => {
			expect(() => SelectAll.updateFormGroup(null)).not.toThrow();
		});
	});

	describe('initLinkInFormGroup', () => {
		test('should show "Tout sélectionner" initially when none checked', () => {
			const formGroup = setupFormGroup({ nbCheckboxes: 3, nbChecked: 0 });
			SelectAll.initLinkInFormGroup(formGroup.querySelector('a.check_all'));
			expect(formGroup.querySelector('a.check_all').textContent).toBe('Tout sélectionner');
		});

		test('should show "Tout désélectionner" initially when all checked', () => {
			const formGroup = setupFormGroup({ nbCheckboxes: 3, nbChecked: 3 });
			SelectAll.initLinkInFormGroup(formGroup.querySelector('a.check_all'));
			expect(formGroup.querySelector('a.check_all').textContent).toBe('Tout désélectionner');
		});

		test('clicking link should check all checkboxes when none checked', () => {
			const formGroup = setupFormGroup({ nbCheckboxes: 3, nbChecked: 0 });
			SelectAll.initLinkInFormGroup(formGroup.querySelector('a.check_all'));
			formGroup.querySelector('a.check_all').click();
			const checkboxes = formGroup.querySelectorAll('input[type="checkbox"]:not(.check_all)');
			checkboxes.forEach(cb => expect(cb.checked).toBe(true));
		});

		test('clicking link should uncheck all when all are checked', () => {
			const formGroup = setupFormGroup({ nbCheckboxes: 3, nbChecked: 3 });
			SelectAll.initLinkInFormGroup(formGroup.querySelector('a.check_all'));
			formGroup.querySelector('a.check_all').click();
			const checkboxes = formGroup.querySelectorAll('input[type="checkbox"]:not(.check_all)');
			checkboxes.forEach(cb => expect(cb.checked).toBe(false));
		});

		test('clicking link updates the link text', () => {
			const formGroup = setupFormGroup({ nbCheckboxes: 3, nbChecked: 0 });
			SelectAll.initLinkInFormGroup(formGroup.querySelector('a.check_all'));
			formGroup.querySelector('a.check_all').click();
			expect(formGroup.querySelector('a.check_all').textContent).toBe('Tout désélectionner');
		});

		test('changing a checkbox updates the link text', () => {
			const formGroup = setupFormGroup({ nbCheckboxes: 2, nbChecked: 0 });
			SelectAll.initLinkInFormGroup(formGroup.querySelector('a.check_all'));
			const checkboxes = formGroup.querySelectorAll('input[type="checkbox"]');
			checkboxes.forEach(cb => {
				cb.checked = true;
				cb.dispatchEvent(new Event('change'));
			});
			expect(formGroup.querySelector('a.check_all').textContent).toBe('Tout désélectionner');
		});

		test('should not throw when checkbox has no .form-group ancestor', () => {
			// Simule une checkbox hors de tout .form-group (le cas du bug en prod)
			document.body.innerHTML = `
				<div>
					<a class="check_all" href="#">Tout sélectionner</a>
					<input type="checkbox" id="orphan">
				</div>`;
			const link = document.querySelector('a.check_all');
			SelectAll.initLinkInFormGroup(link);
			const cb = document.getElementById('orphan');
			cb.checked = true;
			expect(() => cb.dispatchEvent(new Event('change'))).not.toThrow();
		});
	});

	describe('updateTable', () => {
		test('should check select-all when all checkboxes are checked', () => {
			const table = setupTable({ nbRows: 3, nbChecked: 3 });
			SelectAll.updateTable(table);
			expect(table.querySelector('thead input.check_all').checked).toBe(true);
		});

		test('should uncheck select-all when partially checked', () => {
			const table = setupTable({ nbRows: 3, nbChecked: 2 });
			SelectAll.updateTable(table);
			expect(table.querySelector('thead input.check_all').checked).toBe(false);
		});

		test('should uncheck select-all when none checked', () => {
			const table = setupTable({ nbRows: 3, nbChecked: 0 });
			SelectAll.updateTable(table);
			expect(table.querySelector('thead input.check_all').checked).toBe(false);
		});

		test('should do nothing when no check_all input in thead', () => {
			document.body.innerHTML = `
				<table>
					<thead><tr><th></th></tr></thead>
					<tbody><tr><td><input type="checkbox"></td></tr></tbody>
				</table>`;
			expect(() => SelectAll.updateTable(document.querySelector('table'))).not.toThrow();
		});

		test('should do nothing when table is null', () => {
			expect(() => SelectAll.updateTable(null)).not.toThrow();
		});
	});

	describe('initInTable', () => {
		test('should return early when no check_all input found', () => {
			document.body.innerHTML = `
				<table>
					<thead><tr><th></th></tr></thead>
					<tbody><tr><td><input type="checkbox"></td></tr></tbody>
				</table>`;
			expect(() => SelectAll.initInTable(document.querySelector('table'))).not.toThrow();
		});

		test('clicking check-all should check all row checkboxes', () => {
			const table = setupTable({ nbRows: 2, nbChecked: 0 });
			SelectAll.initInTable(table);
			table.querySelector('thead input.check_all').click();
			const checkboxes = table.querySelectorAll('tbody input[type="checkbox"]');
			checkboxes.forEach(cb => expect(cb.checked).toBe(true));
		});

		test('clicking check-all should uncheck all when all are checked', () => {
			const table = setupTable({ nbRows: 2, nbChecked: 2 });
			SelectAll.initInTable(table);
			table.querySelector('thead input.check_all').click();
			const checkboxes = table.querySelectorAll('tbody input[type="checkbox"]');
			checkboxes.forEach(cb => expect(cb.checked).toBe(false));
		});

		test('changing a row checkbox updates check-all state', () => {
			const table = setupTable({ nbRows: 2, nbChecked: 0 });
			SelectAll.initInTable(table);
			const checkboxes = table.querySelectorAll('tbody input[type="checkbox"]');
			checkboxes.forEach(cb => {
				cb.checked = true;
				cb.dispatchEvent(new Event('change'));
			});
			expect(table.querySelector('thead input.check_all').checked).toBe(true);
		});

		test('should do nothing when table is null', () => {
			expect(() => SelectAll.initInTable(null)).not.toThrow();
		});
	});

	describe('updateDiv', () => {
		test('should check select-all when all checkboxes are checked', () => {
			const div = setupDivWithCheckAll({ nbItems: 3, nbChecked: 3 });
			SelectAll.updateDiv(div);
			expect(div.querySelector('input.check_all').checked).toBe(true);
		});

		test('should uncheck select-all when partially checked', () => {
			const div = setupDivWithCheckAll({ nbItems: 3, nbChecked: 2 });
			SelectAll.updateDiv(div);
			expect(div.querySelector('input.check_all').checked).toBe(false);
		});

		test('should uncheck select-all when none checked', () => {
			const div = setupDivWithCheckAll({ nbItems: 3, nbChecked: 0 });
			SelectAll.updateDiv(div);
			expect(div.querySelector('input.check_all').checked).toBe(false);
		});

		test('should do nothing when no check_all input found', () => {
			document.body.innerHTML = `<div class="checkbox_with_check_all"><div class="form-check"><input type="checkbox"></div></div>`;
			expect(() => SelectAll.updateDiv(document.querySelector('.checkbox_with_check_all'))).not.toThrow();
		});

		test('should do nothing when div is null', () => {
			expect(() => SelectAll.updateDiv(null)).not.toThrow();
		});
	});

	describe('initDiv', () => {
		test('should do nothing when no check_all inputs found', () => {
			document.body.innerHTML = `<div id="content"><div class="form-check"><input type="checkbox"></div></div>`;
			expect(() => SelectAll.initDiv(document.getElementById('content'))).not.toThrow();
		});

		test('clicking check-all should check all items', () => {
			const div = setupDivWithCheckAll({ nbItems: 2, nbChecked: 0 });
			document.body.innerHTML = `<div id="content">${div.outerHTML}</div>`;
			const contentDiv = document.getElementById('content');
			SelectAll.initDiv(contentDiv);
			contentDiv.querySelector('input.check_all').click();
			const checkboxes = contentDiv.querySelectorAll('input[type="checkbox"]:not(.check_all)');
			checkboxes.forEach(cb => expect(cb.checked).toBe(true));
		});

		test('clicking check-all should uncheck all when all are checked', () => {
			const div = setupDivWithCheckAll({ nbItems: 2, nbChecked: 2 });
			document.body.innerHTML = `<div id="content">${div.outerHTML}</div>`;
			const contentDiv = document.getElementById('content');
			SelectAll.initDiv(contentDiv);
			contentDiv.querySelector('input.check_all').click();
			const checkboxes = contentDiv.querySelectorAll('input[type="checkbox"]:not(.check_all)');
			checkboxes.forEach(cb => expect(cb.checked).toBe(false));
		});

		test('changing an item checkbox updates check-all state', () => {
			const div = setupDivWithCheckAll({ nbItems: 2, nbChecked: 0 });
			document.body.innerHTML = `<div id="content">${div.outerHTML}</div>`;
			const contentDiv = document.getElementById('content');
			SelectAll.initDiv(contentDiv);
			const checkboxes = contentDiv.querySelectorAll('input[type="checkbox"]:not(.check_all)');
			checkboxes.forEach(cb => {
				cb.checked = true;
				cb.dispatchEvent(new Event('change'));
			});
			expect(contentDiv.querySelector('input.check_all').checked).toBe(true);
		});

		test('should set initial check-all state based on checked items', () => {
			const div = setupDivWithCheckAll({ nbItems: 2, nbChecked: 2 });
			document.body.innerHTML = `<div id="content">${div.outerHTML}</div>`;
			const contentDiv = document.getElementById('content');
			SelectAll.initDiv(contentDiv);
			expect(contentDiv.querySelector('input.check_all').checked).toBe(true);
		});

		test('should do nothing when contentDiv is null', () => {
			expect(() => SelectAll.initDiv(null)).not.toThrow();
		});

		test('should not throw when checkbox has no .checkbox_with_check_all ancestor', () => {
			// check_all orpheline — closest('div.checkbox_with_check_all') retourne null
			document.body.innerHTML = `
				<div id="content">
					<input type="checkbox" class="check_all">
					<div class="form-check"><input type="checkbox" id="orphan"></div>
				</div>`;
			const contentDiv = document.getElementById('content');
			SelectAll.initDiv(contentDiv);
			const cb = document.getElementById('orphan');
			cb.checked = true;
			expect(() => cb.dispatchEvent(new Event('change'))).not.toThrow();
		});
	});
});