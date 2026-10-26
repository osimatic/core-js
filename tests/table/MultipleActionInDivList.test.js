/**
 * @jest-environment jsdom
 */
import { MultipleActionInDivList } from '../../table/MultipleActionInDivList.js';

// ─── helpers ────────────────────────────────────────────────────────────────

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