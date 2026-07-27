/**
 * @jest-environment jsdom
 */
import { MultipleActionInTable, MultipleActionInDivList } from '../multiple_action_in_table.js';

// ─── helpers ────────────────────────────────────────────────────────────────

function setupTable({ nbRows = 1, withButtonsDiv = true, nested = false, tableClass = 'table-action_multiple' } = {}) {
	const rows = Array.from({ length: nbRows }, (_, i) => `
		<tr data-action_multiple_input_name="ids[]" data-action_multiple_item_id="${i + 1}">
			<td>Item ${i + 1}</td>
		</tr>`).join('');

	const buttonsDiv = withButtonsDiv
		? `<div class="action_multiple_buttons hide"><button>Action</button></div>`
		: '';

	if (nested) {
		// table.parentElement.parentElement.parentElement.nextElementSibling = buttons div
		document.body.innerHTML = `
			<div>
				<div>
					<div>
						<div>
							<div><table class="${tableClass}">
								<thead><tr><th>Name</th></tr></thead>
								<tbody>${rows}</tbody>
							</table></div>
						</div>
					</div>
				</div>
				${buttonsDiv}
			</div>`;
	} else {
		// table.parentElement.nextElementSibling = buttons div
		document.body.innerHTML = `
			<div>
				<div>
					<table class="${tableClass}">
						<thead><tr><th>Name</th></tr></thead>
						<tbody>${rows}</tbody>
					</table>
				</div>
				${buttonsDiv}
			</div>`;
	}

	return document.querySelector('table');
}

function setupDivList({ nbItems = 1, withButtonsDiv = true } = {}) {
	const items = Array.from({ length: nbItems }, (_, i) => `
		<div class="multiple_action" data-action_multiple_input_name="ids[]" data-action_multiple_item_id="${i + 1}">
			Item ${i + 1}
		</div>`).join('');

	const buttonsDiv = withButtonsDiv
		? `<div class="action_multiple_buttons"><button>Action</button></div>`
		: '';

	document.body.innerHTML = `
		<div id="content">
			${items}
		</div>
		${buttonsDiv}`;

	return document.getElementById('content');
}

// ─── MultipleActionInTable ───────────────────────────────────────────────────

describe('MultipleActionInTable', () => {
	afterEach(() => {
		document.body.innerHTML = '';
	});

	describe('getDivBtn', () => {
		test('should return button div when found as direct next sibling', () => {
			const table = setupTable();
			const result = MultipleActionInTable.getDivBtn(table);
			expect(result).not.toBeNull();
			expect(result.classList.contains('action_multiple_buttons')).toBe(true);
		});

		test('should return button div when found in nested structure', () => {
			const table = setupTable({ nested: true });
			const result = MultipleActionInTable.getDivBtn(table);
			expect(result).not.toBeNull();
			expect(result.classList.contains('action_multiple_buttons')).toBe(true);
		});

		test('should return null when button div not found', () => {
			const table = setupTable({ withButtonsDiv: false });
			const result = MultipleActionInTable.getDivBtn(table);
			expect(result).toBeNull();
		});
	});

	describe('initCols', () => {
		test('should do nothing if table lacks table-action_multiple class', () => {
			const table = setupTable({ tableClass: 'other-class' });
			MultipleActionInTable.initCols(table);
			expect(table.querySelector('th[data-key="select"]')).toBeNull();
		});

		test('should do nothing if no buttons div found', () => {
			const table = setupTable({ withButtonsDiv: false, tableClass: 'table-action_multiple' });
			MultipleActionInTable.initCols(table);
			expect(table.querySelector('th[data-key="select"]')).toBeNull();
		});

		test('should add select th to thead', () => {
			const table = setupTable();
			MultipleActionInTable.initCols(table);
			const th = table.querySelector('thead tr th[data-key="select"]');
			expect(th).not.toBeNull();
		});

		test('should add checkbox td to each tbody row', () => {
			const table = setupTable({ nbRows: 2 });
			MultipleActionInTable.initCols(table);
			const tds = table.querySelectorAll('tbody tr td.select');
			expect(tds.length).toBe(2);
		});

		test('should set correct name and value on checkboxes', () => {
			const table = setupTable({ nbRows: 1 });
			MultipleActionInTable.initCols(table);
			const cb = table.querySelector('input.action_multiple_checkbox');
			expect(cb.name).toBe('ids[]');
			expect(cb.value).toBe('1');
		});

		test('should be idempotent (no duplicate cols on second call)', () => {
			const table = setupTable({ nbRows: 2 });
			MultipleActionInTable.initCols(table);
			MultipleActionInTable.initCols(table);
			expect(table.querySelectorAll('th[data-key="select"]').length).toBe(1);
			expect(table.querySelectorAll('tbody tr td.select').length).toBe(2);
		});

		test('should not throw when table has no <thead>', () => {
			document.body.innerHTML = `
				<div>
					<div>
						<table class="table-action_multiple">
							<tbody>
								<tr data-action_multiple_input_name="ids[]" data-action_multiple_item_id="1">
									<td>Item 1</td>
								</tr>
							</tbody>
						</table>
					</div>
					<div class="action_multiple_buttons hide"></div>
				</div>`;
			const table = document.querySelector('table');
			expect(() => MultipleActionInTable.initCols(table)).not.toThrow();
			expect(table.querySelector('th[data-key="select"]')).toBeNull();
		});

		test('should skip rows with no_items class', () => {
			document.body.innerHTML = `
				<div>
					<div>
						<table class="table-action_multiple">
							<thead><tr><th>Name</th></tr></thead>
							<tbody>
								<tr class="no_items"><td colspan="1">No items</td></tr>
							</tbody>
						</table>
					</div>
					<div class="action_multiple_buttons hide"></div>
				</div>`;
			const table = document.querySelector('table');
			MultipleActionInTable.initCols(table);
			expect(table.querySelector('tbody tr.no_items td.select')).toBeNull();
		});
	});

	describe('init', () => {
		test('should do nothing if table lacks table-action_multiple class', () => {
			const table = setupTable({ tableClass: 'other' });
			MultipleActionInTable.init(table);
			expect(table.querySelector('input.action_multiple_check_all')).toBeNull();
		});

		test('should do nothing if no buttons div found', () => {
			const table = setupTable({ withButtonsDiv: false });
			MultipleActionInTable.init(table);
			expect(table.querySelector('input.action_multiple_check_all')).toBeNull();
		});

		test('should add check-all input to first th', () => {
			const table = setupTable();
			MultipleActionInTable.init(table);
			expect(table.querySelector('thead tr th input.action_multiple_check_all')).not.toBeNull();
		});

		test('should add arrow image to buttons div once', () => {
			const table = setupTable();
			MultipleActionInTable.init(table);
			const divBtn = MultipleActionInTable.getDivBtn(table);
			expect(divBtn.querySelector('img')).not.toBeNull();
		});

		test('should not add arrow image twice when called again', () => {
			const table = setupTable();
			MultipleActionInTable.init(table);
			MultipleActionInTable.init(table);
			const divBtn = MultipleActionInTable.getDivBtn(table);
			expect(divBtn.querySelectorAll('img').length).toBe(1);
		});

		test('check-all toggles all checkboxes to checked when none checked', () => {
			const table = setupTable({ nbRows: 2 });
			MultipleActionInTable.init(table);

			const checkAll = table.querySelector('input.action_multiple_check_all');
			checkAll.click();

			const checkboxes = table.querySelectorAll('input.action_multiple_checkbox');
			checkboxes.forEach(cb => expect(cb.checked).toBe(true));
		});

		test('check-all unchecks all when all are checked', () => {
			const table = setupTable({ nbRows: 2 });
			MultipleActionInTable.init(table);

			const checkboxes = table.querySelectorAll('input.action_multiple_checkbox');
			checkboxes.forEach(cb => { cb.checked = true; });

			const checkAll = table.querySelector('input.action_multiple_check_all');
			checkAll.click();

			checkboxes.forEach(cb => expect(cb.checked).toBe(false));
		});

		test('checking a row checkbox updates check-all state', () => {
			const table = setupTable({ nbRows: 2 });
			MultipleActionInTable.init(table);

			const checkboxes = table.querySelectorAll('input.action_multiple_checkbox');
			checkboxes.forEach(cb => {
				cb.checked = true;
				cb.dispatchEvent(new Event('change', { bubbles: true }));
			});

			const checkAll = table.querySelector('input.action_multiple_check_all');
			expect(checkAll.checked).toBe(true);
		});

		test('checking a row checkbox added after init (ex : réinsérée par la pagination DataTables) met bien à jour les boutons', () => {
			const table = setupTable({ nbRows: 1 });
			MultipleActionInTable.init(table);

			// Simule une ligne réinsérée dans le DOM par DataTables après un changement de page/longueur de page,
			// donc absente du DOM au moment de l'appel à init().
			table.querySelector('tbody').insertAdjacentHTML('beforeend', `
				<tr data-action_multiple_input_name="ids[]" data-action_multiple_item_id="2">
					<td class="select"><input type="checkbox" class="action_multiple_checkbox" name="ids[]" value="2"></td>
					<td>Item 2</td>
				</tr>`);

			const newCheckbox = table.querySelector('input.action_multiple_checkbox[value="2"]');
			newCheckbox.checked = true;
			newCheckbox.dispatchEvent(new Event('change', { bubbles: true }));

			const divBtn = MultipleActionInTable.getDivBtn(table);
			expect(divBtn.classList.contains('hide')).toBe(false);
		});
	});

	describe('updateCheckbox', () => {
		test('should hide check-all when no checkboxes exist', () => {
			document.body.innerHTML = `
				<div>
					<div>
						<table class="table-action_multiple">
							<thead><tr><th><input type="checkbox" class="action_multiple_check_all" /></th></tr></thead>
							<tbody></tbody>
						</table>
					</div>
					<div class="action_multiple_buttons hide"></div>
				</div>`;
			const table = document.querySelector('table');
			MultipleActionInTable.updateCheckbox(table);
			const checkAll = table.querySelector('input.action_multiple_check_all');
			expect(checkAll.classList.contains('hide')).toBe(true);
		});

		test('should check check-all when all checkboxes are checked', () => {
			const table = setupTable({ nbRows: 2 });
			MultipleActionInTable.init(table);
			const checkboxes = table.querySelectorAll('input.action_multiple_checkbox');
			checkboxes.forEach(cb => { cb.checked = true; });
			MultipleActionInTable.updateCheckbox(table);
			expect(table.querySelector('input.action_multiple_check_all').checked).toBe(true);
		});

		test('should uncheck check-all when not all checkboxes are checked', () => {
			const table = setupTable({ nbRows: 2 });
			MultipleActionInTable.init(table);
			const checkboxes = table.querySelectorAll('input.action_multiple_checkbox');
			checkboxes[0].checked = true;
			MultipleActionInTable.updateCheckbox(table);
			expect(table.querySelector('input.action_multiple_check_all').checked).toBe(false);
		});
	});

	describe('showButtonsAction', () => {
		test('should return early when button div is null', () => {
			const table = setupTable({ withButtonsDiv: false });
			expect(() => MultipleActionInTable.showButtonsAction(table)).not.toThrow();
		});

		test('should show buttons div when a checkbox is checked', () => {
			const table = setupTable({ nbRows: 1 });
			MultipleActionInTable.init(table);
			const cb = table.querySelector('input.action_multiple_checkbox');
			cb.checked = true;
			MultipleActionInTable.showButtonsAction(table);
			const divBtn = MultipleActionInTable.getDivBtn(table);
			expect(divBtn.classList.contains('hide')).toBe(false);
		});

		test('should hide buttons div when no checkbox is checked', () => {
			const table = setupTable({ nbRows: 1 });
			MultipleActionInTable.init(table);
			const divBtn = MultipleActionInTable.getDivBtn(table);
			divBtn.classList.remove('hide'); // force visible
			MultipleActionInTable.showButtonsAction(table);
			expect(divBtn.classList.contains('hide')).toBe(true);
		});

		test('should show "no action" message when div is visible but has no visible buttons', () => {
			document.body.innerHTML = `
				<div>
					<div>
						<table class="table-action_multiple">
							<thead><tr><th>Name</th></tr></thead>
							<tbody>
								<tr data-action_multiple_input_name="ids[]" data-action_multiple_item_id="1">
									<td>Item 1</td>
								</tr>
							</tbody>
						</table>
					</div>
					<div class="action_multiple_buttons">
						<img src="" alt="" />
					</div>
				</div>`;
			const table = document.querySelector('table');
			MultipleActionInTable.init(table);
			const cb = table.querySelector('input.action_multiple_checkbox');
			cb.checked = true;
			MultipleActionInTable.showButtonsAction(table);
			const divBtn = MultipleActionInTable.getDivBtn(table);
			expect(divBtn.querySelector('span.no_button')).not.toBeNull();
		});
	});
});

// ─── MultipleActionInDivList ─────────────────────────────────────────────────

describe('MultipleActionInDivList', () => {
	afterEach(() => {
		document.body.innerHTML = '';
	});

	describe('getButtonsDiv', () => {
		test('should return buttons div when found as next sibling', () => {
			const contentDiv = setupDivList();
			const result = MultipleActionInDivList.getButtonsDiv(contentDiv);
			expect(result).not.toBeNull();
			expect(result.classList.contains('action_multiple_buttons')).toBe(true);
		});

		test('should return null when buttons div not found', () => {
			const contentDiv = setupDivList({ withButtonsDiv: false });
			const result = MultipleActionInDivList.getButtonsDiv(contentDiv);
			expect(result).toBeNull();
		});
	});

	describe('init', () => {
		test('should return early when no buttons div found', () => {
			const contentDiv = setupDivList({ withButtonsDiv: false });
			MultipleActionInDivList.init(contentDiv);
			expect(contentDiv.querySelector('input.action_multiple_check_all')).toBeNull();
		});

		test('should return early when no .multiple_action divs found', () => {
			document.body.innerHTML = `
				<div id="content"></div>
				<div class="action_multiple_buttons"></div>`;
			const contentDiv = document.getElementById('content');
			MultipleActionInDivList.init(contentDiv);
			expect(contentDiv.querySelector('input.action_multiple_check_all')).toBeNull();
		});

		test('should add checkbox to each .multiple_action div', () => {
			const contentDiv = setupDivList({ nbItems: 2 });
			MultipleActionInDivList.init(contentDiv);
			expect(contentDiv.querySelectorAll('input.action_multiple_checkbox').length).toBe(2);
		});

		test('should set correct name and value on checkboxes', () => {
			const contentDiv = setupDivList({ nbItems: 1 });
			MultipleActionInDivList.init(contentDiv);
			const cb = contentDiv.querySelector('input.action_multiple_checkbox');
			expect(cb.name).toBe('ids[]');
			expect(cb.value).toBe('1');
		});

		test('should add check-all input', () => {
			const contentDiv = setupDivList();
			MultipleActionInDivList.init(contentDiv);
			expect(contentDiv.querySelector('input.action_multiple_check_all')).not.toBeNull();
		});

		test('should add arrow image to buttons div once', () => {
			const contentDiv = setupDivList();
			MultipleActionInDivList.init(contentDiv);
			const buttonsDiv = MultipleActionInDivList.getButtonsDiv(contentDiv);
			expect(buttonsDiv.querySelector('img')).not.toBeNull();
		});

		test('should not add arrow image twice when called again', () => {
			const contentDiv = setupDivList();
			MultipleActionInDivList.init(contentDiv);
			MultipleActionInDivList.init(contentDiv);
			const buttonsDiv = MultipleActionInDivList.getButtonsDiv(contentDiv);
			expect(buttonsDiv.querySelectorAll('img').length).toBe(1);
		});

		test('check-all toggles all checkboxes to checked when none checked', () => {
			const contentDiv = setupDivList({ nbItems: 2 });
			MultipleActionInDivList.init(contentDiv);
			const checkAll = contentDiv.querySelector('input.action_multiple_check_all');
			checkAll.click();
			const checkboxes = contentDiv.querySelectorAll('input.action_multiple_checkbox');
			checkboxes.forEach(cb => expect(cb.checked).toBe(true));
		});

		test('check-all unchecks all when all are checked', () => {
			const contentDiv = setupDivList({ nbItems: 2 });
			MultipleActionInDivList.init(contentDiv);
			const checkboxes = contentDiv.querySelectorAll('input.action_multiple_checkbox');
			checkboxes.forEach(cb => { cb.checked = true; });
			const checkAll = contentDiv.querySelector('input.action_multiple_check_all');
			checkAll.click();
			checkboxes.forEach(cb => expect(cb.checked).toBe(false));
		});

		test('checking a checkbox updates check-all state', () => {
			const contentDiv = setupDivList({ nbItems: 2 });
			MultipleActionInDivList.init(contentDiv);
			const checkboxes = contentDiv.querySelectorAll('input.action_multiple_checkbox');
			checkboxes.forEach(cb => {
				cb.checked = true;
				cb.dispatchEvent(new Event('change'));
			});
			expect(contentDiv.querySelector('input.action_multiple_check_all').checked).toBe(true);
		});

		test('should hide buttons div initially', () => {
			const contentDiv = setupDivList();
			const buttonsDiv = MultipleActionInDivList.getButtonsDiv(contentDiv);
			buttonsDiv.classList.remove('hide');
			MultipleActionInDivList.init(contentDiv);
			expect(buttonsDiv.classList.contains('hide')).toBe(true);
		});
	});

	describe('updateCheckbox', () => {
		test('should hide check-all when no checkboxes exist', () => {
			document.body.innerHTML = `
				<div id="content">
					<p class="mb-2"><input type="checkbox" class="action_multiple_check_all" /> Tout sélectionner</p>
				</div>
				<div class="action_multiple_buttons hide"></div>`;
			const contentDiv = document.getElementById('content');
			MultipleActionInDivList.updateCheckbox(contentDiv);
			expect(contentDiv.querySelector('input.action_multiple_check_all').classList.contains('hide')).toBe(true);
		});

		test('should check check-all when all checkboxes are checked', () => {
			const contentDiv = setupDivList({ nbItems: 2 });
			MultipleActionInDivList.init(contentDiv);
			contentDiv.querySelectorAll('input.action_multiple_checkbox').forEach(cb => { cb.checked = true; });
			MultipleActionInDivList.updateCheckbox(contentDiv);
			expect(contentDiv.querySelector('input.action_multiple_check_all').checked).toBe(true);
		});

		test('should uncheck check-all when not all checkboxes are checked', () => {
			const contentDiv = setupDivList({ nbItems: 2 });
			MultipleActionInDivList.init(contentDiv);
			contentDiv.querySelectorAll('input.action_multiple_checkbox')[0].checked = true;
			MultipleActionInDivList.updateCheckbox(contentDiv);
			expect(contentDiv.querySelector('input.action_multiple_check_all').checked).toBe(false);
		});
	});

	describe('showButtonsAction', () => {
		test('should return early when buttons div is null', () => {
			const contentDiv = setupDivList({ withButtonsDiv: false });
			expect(() => MultipleActionInDivList.showButtonsAction(contentDiv)).not.toThrow();
		});

		test('should show buttons div when a checkbox is checked', () => {
			const contentDiv = setupDivList({ nbItems: 1 });
			MultipleActionInDivList.init(contentDiv);
			const cb = contentDiv.querySelector('input.action_multiple_checkbox');
			cb.checked = true;
			MultipleActionInDivList.showButtonsAction(contentDiv);
			const buttonsDiv = MultipleActionInDivList.getButtonsDiv(contentDiv);
			expect(buttonsDiv.classList.contains('hide')).toBe(false);
		});

		test('should hide buttons div when no checkbox is checked', () => {
			const contentDiv = setupDivList({ nbItems: 1 });
			MultipleActionInDivList.init(contentDiv);
			const buttonsDiv = MultipleActionInDivList.getButtonsDiv(contentDiv);
			buttonsDiv.classList.remove('hide');
			MultipleActionInDivList.showButtonsAction(contentDiv);
			expect(buttonsDiv.classList.contains('hide')).toBe(true);
		});
	});
});