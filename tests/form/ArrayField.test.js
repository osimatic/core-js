/**
 * @jest-environment jsdom
 */
import { jest } from '@jest/globals';
import '../../utils/array.js'; // For removeEmptyValues method
import '../../utils/string.js'; // For normalizeBreaks method
import { ArrayField } from '../../form/ArrayField.js';

afterEach(() => {
	document.body.innerHTML = '';
	jest.clearAllMocks();
	delete global.$;
});

describe('ArrayField', () => {
	let container;

	beforeEach(() => {
		container = document.createElement('div');
		document.body.appendChild(container);
	});

	afterEach(() => {
		document.body.innerHTML = '';
	});

	function makeOptions(overrides = {}) {
		return Object.assign({
			entering_field_in_table: false,
			add_one_button_enabled: true,
			add_multi_button_enabled: false,
			input_name: 'items[]',
			item_name: 'Item',
		}, overrides);
	}

	// jsdom applies HTML5 foster-parenting: <tr> inside <div>.innerHTML gets stripped.
	// ArrayField.init falls back to cloneNode when a .base template row exists,
	// so we pre-populate the container with a base row to make row tests work.
	function addBaseRow(opts = {}) {
		const enteringInTable = opts.entering_field_in_table ?? false;
		const inputName = opts.input_name ?? 'items[]';
		let tdContent, links;
		if (enteringInTable) {
			tdContent = `<input type="text" name="${inputName}" class="form-control">`;
			links = '<a href="#" class="add btn btn-sm btn-success ms-1"></a><a href="#" class="remove btn btn-sm btn-danger ms-1"></a>';
		} else {
			tdContent = `<input type="hidden" name="${inputName}"> <span class="value"></span>`;
			links = '<a href="#" class="remove btn btn-sm btn-danger ms-1"></a>';
		}
		container.innerHTML = `<table class="table table-sm"><tbody><tr class="base hide"><td class="table-input">${tdContent}</td><td class="table-links">${links}</td></tr></tbody></table>`;
	}

	test('creates table and list_empty if not present', () => {
		ArrayField.init(container, [], makeOptions());
		expect(container.querySelector('table')).not.toBeNull();
		expect(container.querySelector('.list_empty')).not.toBeNull();
	});

	test('shows list_empty and hides table when no items', () => {
		ArrayField.init(container, [], makeOptions());
		expect(container.querySelector('.list_empty').classList.contains('hide')).toBe(false);
		expect(container.querySelector('table').classList.contains('hide')).toBe(true);
	});

	test('populates default values as rows', () => {
		addBaseRow();
		ArrayField.init(container, ['foo', 'bar'], makeOptions());
		const rows = container.querySelectorAll('table tbody tr:not(.base)');
		expect(rows).toHaveLength(2);
	});

	test('table is visible when items are present', () => {
		addBaseRow();
		ArrayField.init(container, ['item1'], makeOptions());
		expect(container.querySelector('table').classList.contains('hide')).toBe(false);
		expect(container.querySelector('.list_empty').classList.contains('hide')).toBe(true);
	});

	test('row contains hidden input and span.value for entering_field_in_table=false', () => {
		addBaseRow({ entering_field_in_table: false });
		ArrayField.init(container, ['hello'], makeOptions({ entering_field_in_table: false }));
		const row = container.querySelector('table tbody tr:not(.base)');
		expect(row.querySelector('input[type="hidden"]')).not.toBeNull();
		expect(row.querySelector('span.value')).not.toBeNull();
		expect(row.querySelector('input[type="hidden"]').value).toBe('hello');
		expect(row.querySelector('span.value').textContent).toBe('hello');
	});

	test('row contains text input for entering_field_in_table=true', () => {
		addBaseRow({ entering_field_in_table: true });
		ArrayField.init(container, ['hello'], makeOptions({ entering_field_in_table: true, nb_min_lines: 0 }));
		const row = container.querySelector('table tbody tr:not(.base)');
		expect(row.querySelector('input[type="text"]')).not.toBeNull();
	});

	test('creates add_one button when add_one_button_enabled', () => {
		ArrayField.init(container, [], makeOptions({ add_one_button_enabled: true }));
		expect(container.querySelector('a.add_one')).not.toBeNull();
	});

	test('does not create add_one button when disabled', () => {
		ArrayField.init(container, [], makeOptions({ add_one_button_enabled: false }));
		expect(container.querySelector('a.add_one')).toBeNull();
	});

	test('clicking add_one shows item_add_one div', () => {
		ArrayField.init(container, [], makeOptions({ add_one_button_enabled: true }));
		container.querySelector('a.add_one').click();
		expect(container.querySelector('.item_add_one').classList.contains('hide')).toBe(false);
	});

	test('clicking cancel in add_one hides item_add_one div', () => {
		ArrayField.init(container, [], makeOptions({ add_one_button_enabled: true }));
		container.querySelector('a.add_one').click();
		container.querySelector('.item_add_one a.cancel').click();
		expect(container.querySelector('.item_add_one').classList.contains('hide')).toBe(true);
	});

	test('clicking add in item_add_one adds a new row', () => {
		addBaseRow();
		ArrayField.init(container, [], makeOptions({ add_one_button_enabled: true }));
		container.querySelector('a.add_one').click();
		container.querySelector('.item_add_one input.form-control').value = 'newitem';
		container.querySelector('.item_add_one a.add').click();
		const rows = container.querySelectorAll('table tbody tr:not(.base)');
		expect(rows).toHaveLength(1);
		expect(rows[0].querySelector('span.value').textContent).toBe('newitem');
	});

	test('remove button removes a row', () => {
		addBaseRow();
		ArrayField.init(container, ['a', 'b'], makeOptions());
		expect(container.querySelectorAll('table tbody tr:not(.base)')).toHaveLength(2);
		container.querySelector('table tbody tr:not(.base) a.remove').click();
		expect(container.querySelectorAll('table tbody tr:not(.base)')).toHaveLength(1);
	});

	test('calls update_list_callback on changes', () => {
		addBaseRow();
		const cb = jest.fn();
		ArrayField.init(container, ['x'], makeOptions({ update_list_callback: cb }));
		expect(cb).toHaveBeenCalled();
	});

	test('calls init_callback with container after init', () => {
		const cb = jest.fn();
		ArrayField.init(container, [], makeOptions({ init_callback: cb }));
		expect(cb).toHaveBeenCalledWith(container, expect.any(Function), expect.any(Function));
	});

	test('uses custom list_empty_text', () => {
		ArrayField.init(container, [], makeOptions({ list_empty_text: 'Nothing here' }));
		expect(container.querySelector('.list_empty').textContent).toBe('Nothing here');
	});

	test('calls get_errors_callback and shows errors on invalid input', () => {
		addBaseRow();
		ArrayField.init(container, [], makeOptions({
			add_one_button_enabled: true,
			get_errors_callback: () => ['Invalid value'],
		}));
		container.querySelector('a.add_one').click();
		container.querySelector('.item_add_one input.form-control').value = 'bad';
		container.querySelector('.item_add_one a.add').click();
		expect(container.querySelectorAll('table tbody tr:not(.base)')).toHaveLength(0);
	});

	test('does not add duplicate items', () => {
		addBaseRow();
		ArrayField.init(container, ['dup'], makeOptions({ add_one_button_enabled: true }));
		container.querySelector('a.add_one').click();
		container.querySelector('.item_add_one input.form-control').value = 'dup';
		container.querySelector('.item_add_one a.add').click();
		expect(container.querySelectorAll('table tbody tr:not(.base)')).toHaveLength(1);
	});

	test('applies nb_max_lines limit: disables add button when reached', () => {
		addBaseRow({ entering_field_in_table: true });
		ArrayField.init(container, ['a', 'b'], makeOptions({
			entering_field_in_table: true,
			nb_max_lines: 2,
			nb_min_lines: 0,
		}));
		const addLinks = container.querySelectorAll('table tbody tr:not(.base) a.add');
		addLinks.forEach(a => expect(a.classList.contains('disabled')).toBe(true));
	});

	test('creates add_multi button when add_multi_button_enabled', () => {
		ArrayField.init(container, [], makeOptions({ add_multi_button_enabled: true, add_one_button_enabled: false }));
		expect(container.querySelector('a.add_multi')).not.toBeNull();
	});

	test('clicking add_multi shows item_add_multi div', () => {
		ArrayField.init(container, [], makeOptions({ add_multi_button_enabled: true, add_one_button_enabled: false }));
		container.querySelector('a.add_multi').click();
		expect(container.querySelector('.item_add_multi').classList.contains('hide')).toBe(false);
	});

	test('clicking cancel in add_multi hides item_add_multi', () => {
		ArrayField.init(container, [], makeOptions({ add_multi_button_enabled: true, add_one_button_enabled: false }));
		container.querySelector('a.add_multi').click();
		container.querySelector('.item_add_multi a.cancel').click();
		expect(container.querySelector('.item_add_multi').classList.contains('hide')).toBe(true);
	});

	test('add_multi adds multiple items from textarea', () => {
		addBaseRow();
		ArrayField.init(container, [], makeOptions({ add_multi_button_enabled: true, add_one_button_enabled: false }));
		container.querySelector('a.add_multi').click();
		container.querySelector('.item_add_multi textarea').value = 'alpha\nbeta\ngamma';
		container.querySelector('.item_add_multi a.add').click();
		expect(container.querySelectorAll('table tbody tr:not(.base)')).toHaveLength(3);
	});

	test('applies format_entered_value_callback on add', () => {
		addBaseRow();
		ArrayField.init(container, [], makeOptions({
			add_one_button_enabled: true,
			format_entered_value_callback: v => v.toUpperCase(),
		}));
		container.querySelector('a.add_one').click();
		container.querySelector('.item_add_one input.form-control').value = 'hello';
		container.querySelector('.item_add_one a.add').click();
		const row = container.querySelector('table tbody tr:not(.base)');
		expect(row.querySelector('span.value').textContent).toBe('HELLO');
	});

	test('entering_field_in_table: remove disabled when only 1 row remains', () => {
		addBaseRow({ entering_field_in_table: true });
		ArrayField.init(container, ['only'], makeOptions({ entering_field_in_table: true, nb_min_lines: 0 }));
		const removeLink = container.querySelector('table tbody tr:not(.base) a.remove');
		expect(removeLink.classList.contains('disabled')).toBe(true);
	});
});