/**
 * @jest-environment jsdom
 */
import { jest } from '@jest/globals';
import '../../utils/array.js'; // For removeEmptyValues method
import '../../utils/string.js'; // For normalizeBreaks method
import { EditValue } from '../../form/EditValue.js';

afterEach(() => {
	document.body.innerHTML = '';
	jest.clearAllMocks();
	delete global.$;
});

describe('EditValue', () => {
	let valueDiv, parent;

	beforeEach(() => {
		parent = document.createElement('div');
		valueDiv = document.createElement('span');
		valueDiv.textContent = 'original';
		parent.appendChild(valueDiv);
		document.body.appendChild(parent);
	});

	afterEach(() => {
		document.body.innerHTML = '';
	});

	test('appends a pencil link next to valueDiv', () => {
		EditValue.init(valueDiv, jest.fn());
		expect(parent.querySelector('a')).not.toBeNull();
	});

	test('clicking pencil link hides spans and links and shows a form', () => {
		EditValue.init(valueDiv, jest.fn());
		parent.querySelector('a').click();
		expect(parent.querySelector('form')).not.toBeNull();
		expect(valueDiv.classList.contains('hide')).toBe(true);
	});

	test('form contains input pre-filled with current text', () => {
		valueDiv.textContent = 'current value';
		EditValue.init(valueDiv, jest.fn());
		parent.querySelector('a').click();
		const input = parent.querySelector('form input');
		expect(input.value).toBe('current value');
	});

	test('form uses data-value attribute when present', () => {
		valueDiv.dataset.value = 'raw-value';
		valueDiv.textContent = 'Formatted value';
		EditValue.init(valueDiv, jest.fn());
		parent.querySelector('a').click();
		expect(parent.querySelector('form input').value).toBe('raw-value');
	});

	test('calls onSubmitCallback with new value when submit button clicked', () => {
		const cb = jest.fn();
		EditValue.init(valueDiv, cb);
		parent.querySelector('a').click();
		parent.querySelector('form input').value = 'new val';
		parent.querySelector('form button').click();
		expect(cb).toHaveBeenCalledWith('new val', parent, expect.any(Function));
	});

	test('on success callback updates span value', () => {
		let capturedCallback;
		const cb = jest.fn((newVal, par, done) => { capturedCallback = done; });
		EditValue.init(valueDiv, cb);
		parent.querySelector('a').click();
		parent.querySelector('form input').value = 'updated';
		parent.querySelector('form button').click();
		capturedCallback(true);
		expect(valueDiv.textContent).toBe('updated');
	});

	test('on failure callback does not update span value', () => {
		let capturedCallback;
		const cb = jest.fn((newVal, par, done) => { capturedCallback = done; });
		EditValue.init(valueDiv, cb);
		parent.querySelector('a').click();
		parent.querySelector('form input').value = 'updated';
		parent.querySelector('form button').click();
		capturedCallback(false);
		expect(valueDiv.textContent).toBe('original');
	});

	test('uses getInputCallback for custom input element', () => {
		const getInput = jest.fn(() => '<select><option value="x">X</option></select>');
		EditValue.init(valueDiv, jest.fn(), getInput);
		parent.querySelector('a').click();
		expect(parent.querySelector('form select')).not.toBeNull();
		expect(getInput).toHaveBeenCalled();
	});
});