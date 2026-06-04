/**
 * @jest-environment jsdom
 */
import '../array.js'; // For removeEmptyValues method
import '../string.js'; // For normalizeBreaks method
import { FormHelper, ArrayField, EditValue } from '../form_helper.js';

// Helper functions
function setupForm() {
	const form = document.createElement('form');
	document.body.appendChild(form);
	return form;
}

function addButton(form, name = 'validate', label = 'Submit') {
	const btn = document.createElement('button');
	btn.type = 'submit';
	btn.name = name;
	btn.textContent = label;
	form.appendChild(btn);
	return btn;
}

function addInput(form, name, type = 'text', value = '') {
	const input = document.createElement('input');
	input.name = name;
	input.type = type;
	input.value = value;
	form.appendChild(input);
	return input;
}

function addSelect(form, name, options = []) {
	const select = document.createElement('select');
	select.name = name;
	options.forEach(({ value, text, disabled }) => {
		const opt = document.createElement('option');
		opt.value = value;
		opt.textContent = text;
		if (disabled) opt.disabled = true;
		select.appendChild(opt);
	});
	form.appendChild(select);
	return select;
}

// Simule un objet jQuery wrappant un élément DOM natif
function mockJQuery(el) {
	return { jquery: '3.0', 0: el, length: 1 };
}

afterEach(() => {
	document.body.innerHTML = '';
	jest.clearAllMocks();
	delete global.$;
});

describe('FormHelper', () => {
	describe('init', () => {
		test('should initialize form with default submit button and return form', () => {
			const form = setupForm();
			addButton(form, 'validate', 'Submit');
			const onSubmitCallback = jest.fn();

			const result = FormHelper.init(form, onSubmitCallback);

			expect(result).toBe(form);
		});

		test('should call callback on button click', () => {
			const form = setupForm();
			const btn = addButton(form, 'validate', 'Submit');
			const onSubmitCallback = jest.fn();

			FormHelper.init(form, onSubmitCallback);

			btn.click();

			expect(onSubmitCallback).toHaveBeenCalledWith(form, btn);
		});

		test('should use custom submit button when provided', () => {
			const form = setupForm();
			addInput(form, 'name');
			const customBtn = document.createElement('button');
			customBtn.type = 'button';
			customBtn.name = 'custom';
			customBtn.textContent = 'Custom';
			document.body.appendChild(customBtn);
			const onSubmitCallback = jest.fn();

			FormHelper.init(form, onSubmitCallback, customBtn);
			customBtn.click();

			expect(onSubmitCallback).toHaveBeenCalledWith(form, customBtn);
		});

		test('should return jQuery wrapper when passed a jQuery object', () => {
			const form = setupForm();
			addButton(form, 'validate', 'Submit');
			const jqForm = mockJQuery(form);
			global.$ = jest.fn(el => mockJQuery(el));

			const result = FormHelper.init(jqForm, jest.fn());

			expect(result).toHaveProperty('jquery');
			expect(result[0]).toBe(form);
		});

		test('should call buttonLoader with loading on submit', () => {
			const form = setupForm();
			const btn = addButton(form, 'validate', 'Submit');
			const loaderSpy = jest.spyOn(FormHelper, 'buttonLoader');

			FormHelper.init(form, jest.fn());
			btn.click();

			expect(loaderSpy).toHaveBeenCalledWith(btn, 'loading');
			loaderSpy.mockRestore();
		});
	});

	describe('reset', () => {
		test('should reset text input values', () => {
			const form = setupForm();
			addButton(form, 'validate', 'Submit');
			const input = addInput(form, 'name', 'text', 'hello');

			const result = FormHelper.reset(form);

			expect(input.value).toBe('');
			expect(result).toBe(form);
		});

		test('should reset textarea values', () => {
			const form = setupForm();
			addButton(form, 'validate', 'Submit');
			const textarea = document.createElement('textarea');
			textarea.name = 'bio';
			textarea.value = 'some text';
			form.appendChild(textarea);

			FormHelper.reset(form);

			expect(textarea.value).toBe('');
		});

		test('should not reset checkbox/radio inputs', () => {
			const form = setupForm();
			addButton(form, 'validate', 'Submit');
			const checkbox = addInput(form, 'agree', 'checkbox');
			checkbox.checked = true;

			FormHelper.reset(form);

			// checkboxes should not be cleared by reset (they match :not([type="checkbox"]) exclusion)
			// The selector explicitly excludes them
			expect(checkbox.checked).toBe(true);
		});

		test('should reset with custom submit button', () => {
			const form = setupForm();
			const customBtn = document.createElement('button');
			customBtn.type = 'button';
			customBtn.innerHTML = 'Save';
			document.body.appendChild(customBtn);
			const input = addInput(form, 'name', 'text', 'hello');

			FormHelper.reset(form, customBtn);

			expect(input.value).toBe('');
		});
	});

	describe('populateForm', () => {
		test('should skip null values', () => {
			const form = setupForm();
			const input = addInput(form, 'field1', 'text', 'original');

			FormHelper.populateForm(form, { field1: null });

			expect(input.value).toBe('original');
		});

		test('should set text input value', () => {
			const form = setupForm();
			const input = addInput(form, 'name', 'text', '');

			FormHelper.populateForm(form, { name: 'John' });

			expect(input.value).toBe('John');
		});

		test('should handle radio button values', () => {
			const form = setupForm();
			const radio1 = addInput(form, 'gender', 'radio', 'male');
			const radio2 = addInput(form, 'gender', 'radio', 'female');

			FormHelper.populateForm(form, { gender: 'female' });

			expect(radio1.checked).toBe(false);
			expect(radio2.checked).toBe(true);
		});

		test('should handle checkbox values', () => {
			const form = setupForm();
			const cb1 = addInput(form, 'terms', 'checkbox', 'accepted');
			const cb2 = addInput(form, 'terms', 'checkbox', 'declined');

			FormHelper.populateForm(form, { terms: 'accepted' });

			expect(cb1.checked).toBe(true);
			expect(cb2.checked).toBe(false);
		});

		test('should handle object values as array select', () => {
			const form = setupForm();
			const select = document.createElement('select');
			select.name = 'tags[]';
			select.multiple = true;
			['tag1', 'tag2', 'tag3'].forEach(v => {
				const opt = document.createElement('option');
				opt.value = v;
				opt.textContent = v;
				select.appendChild(opt);
			});
			form.appendChild(select);

			FormHelper.populateForm(form, { tags: ['tag1', 'tag3'] });

			expect(select.querySelector('option[value="tag1"]').selected).toBe(true);
			expect(select.querySelector('option[value="tag2"]').selected).toBe(false);
			expect(select.querySelector('option[value="tag3"]').selected).toBe(true);
			expect(select.dataset.default_id).toBe('tag1,tag3');
		});
	});

	describe('getFormData', () => {
		test('should return FormData from native form element', () => {
			const form = setupForm();
			addInput(form, 'name', 'text', 'John');

			const result = FormHelper.getFormData(form);

			expect(result).toBeInstanceOf(FormData);
		});
	});

	describe('getFormDataQueryString', () => {
		test('should return query string from form data', () => {
			const form = setupForm();
			addInput(form, 'name', 'text', 'John');
			addInput(form, 'age', 'text', '30');

			const result = FormHelper.getFormDataQueryString(form);

			expect(result).toContain('name=John');
			expect(result).toContain('age=30');
		});
	});

	describe('setOnInputChange', () => {
		beforeEach(() => {
			jest.useFakeTimers();
		});

		afterEach(() => {
			jest.useRealTimers();
		});

		test('should call callback after keyup + timeout', () => {
			const form = setupForm();
			const input = addInput(form, 'search');
			const callback = jest.fn();

			FormHelper.setOnInputChange(input, callback, 500);

			input.dispatchEvent(new KeyboardEvent('keyup'));
			jest.advanceTimersByTime(500);

			expect(callback).toHaveBeenCalled();
		});

		test('should clear timeout on keydown after keyup', () => {
			const form = setupForm();
			const input = addInput(form, 'search');
			const callback = jest.fn();

			FormHelper.setOnInputChange(input, callback, 500);

			input.dispatchEvent(new KeyboardEvent('keyup'));
			input.dispatchEvent(new KeyboardEvent('keydown'));
			jest.advanceTimersByTime(500);

			expect(callback).not.toHaveBeenCalled();
		});

		test('should call callback immediately on focusout', () => {
			const form = setupForm();
			const input = addInput(form, 'search');
			const callback = jest.fn();

			FormHelper.setOnInputChange(input, callback);

			input.dispatchEvent(new Event('focusout'));

			expect(callback).toHaveBeenCalled();
		});

		test('should use default interval of 700ms', () => {
			const form = setupForm();
			const input = addInput(form, 'search');
			const callback = jest.fn();

			FormHelper.setOnInputChange(input, callback);

			input.dispatchEvent(new KeyboardEvent('keyup'));
			jest.advanceTimersByTime(699);
			expect(callback).not.toHaveBeenCalled();
			jest.advanceTimersByTime(1);
			expect(callback).toHaveBeenCalled();
		});
	});

	describe('Select methods', () => {
		test('resetSelectOption should reset all options', () => {
			const form = setupForm();
			const select = addSelect(form, 'category', [
				{ value: '', text: '-- choose --' },
				{ value: '1', text: 'One' },
				{ value: '2', text: 'Two', disabled: true },
			]);
			select.querySelector('option[value="1"]').selected = true;
			select.querySelector('option[value="2"]').disabled = true;

			FormHelper.resetSelectOption(form, 'category');

			expect(select.querySelector('option[value="1"]').disabled).toBe(false);
			expect(select.querySelector('option[value="1"]').selected).toBe(false);
			expect(select.querySelector('option[value="2"]').disabled).toBe(false);
		});

		test('setSelectedSelectOption should select specific option', () => {
			const form = setupForm();
			addSelect(form, 'category', [
				{ value: '1', text: 'One' },
				{ value: '5', text: 'Five' },
			]);

			FormHelper.setSelectedSelectOption(form, 'category', '5');

			expect(form.querySelector('select[name="category"] option[value="5"]').selected).toBe(true);
		});

		test('setSelectedSelectOptions should select multiple options', () => {
			const form = setupForm();
			const select = document.createElement('select');
			select.name = 'tags';
			select.multiple = true;
			['1', '2', '3'].forEach(v => {
				const opt = document.createElement('option');
				opt.value = v;
				select.appendChild(opt);
			});
			form.appendChild(select);

			FormHelper.setSelectedSelectOptions(form, 'tags', ['1', '3']);

			expect(select.querySelector('option[value="1"]').selected).toBe(true);
			expect(select.querySelector('option[value="2"]').selected).toBe(false);
			expect(select.querySelector('option[value="3"]').selected).toBe(true);
		});

		test('disableSelectOption should disable specific option', () => {
			const form = setupForm();
			addSelect(form, 'category', [
				{ value: '1', text: 'One' },
				{ value: '5', text: 'Five' },
			]);

			FormHelper.disableSelectOption(form, 'category', '5');

			expect(form.querySelector('select[name="category"] option[value="5"]').disabled).toBe(true);
			expect(form.querySelector('select[name="category"] option[value="1"]').disabled).toBe(false);
		});

		test('disableSelectOptions should disable multiple options', () => {
			const form = setupForm();
			addSelect(form, 'category', [
				{ value: '1', text: 'One' },
				{ value: '2', text: 'Two' },
				{ value: '3', text: 'Three' },
			]);

			FormHelper.disableSelectOptions(form, 'category', ['1', '2']);

			expect(form.querySelector('option[value="1"]').disabled).toBe(true);
			expect(form.querySelector('option[value="2"]').disabled).toBe(true);
			expect(form.querySelector('option[value="3"]').disabled).toBe(false);
		});

		test('countSelectOptions should count non-disabled options', () => {
			const form = setupForm();
			addSelect(form, 'category', [
				{ value: '1', text: 'One' },
				{ value: '2', text: 'Two', disabled: true },
				{ value: '3', text: 'Three' },
				{ value: '4', text: 'Four', disabled: true },
				{ value: '5', text: 'Five' },
			]);

			const count = FormHelper.countSelectOptions(form, 'category');

			expect(count).toBe(3);
		});
	});

	describe('Checkbox methods', () => {
		test('getCheckedValues should return checked values', () => {
			const form = setupForm();
			const cb1 = addInput(form, 'opt', 'checkbox', 'option1');
			const cb2 = addInput(form, 'opt', 'checkbox', 'option2');
			const cb3 = addInput(form, 'opt', 'checkbox', 'option3');
			cb1.checked = true;
			cb3.checked = true;

			const result = FormHelper.getCheckedValues(form.querySelectorAll('[name="opt"]'));

			expect(result).toEqual(['option1', 'option3']);
		});

		test('setCheckedValues should check specified values', () => {
			const form = setupForm();
			const container = document.createElement('div');
			form.appendChild(container);
			const cb1 = document.createElement('input');
			cb1.type = 'checkbox'; cb1.value = 'value1';
			const cb2 = document.createElement('input');
			cb2.type = 'checkbox'; cb2.value = 'value2';
			const cb3 = document.createElement('input');
			cb3.type = 'checkbox'; cb3.value = 'value3';
			container.appendChild(cb1);
			container.appendChild(cb2);
			container.appendChild(cb3);

			FormHelper.setCheckedValues(container.querySelectorAll('input'), ['value1', 'value3']);

			expect(cb1.checked).toBe(true);
			expect(cb2.checked).toBe(false);
			expect(cb3.checked).toBe(true);
		});

		test('getInputListValues should return non-empty input values', () => {
			const form = setupForm();
			const i1 = addInput(form, 'item', 'text', 'value1');
			const i2 = addInput(form, 'item', 'text', 'value2');
			const i3 = addInput(form, 'item', 'text', '');

			const result = FormHelper.getInputListValues(form.querySelectorAll('[name="item"]'));

			expect(result).toEqual(['value1', 'value2']);
		});
	});

	describe('initTypeFields', () => {
		test('should wrap password fields with input-group.password', () => {
			const form = setupForm();
			const input = addInput(form, 'password', 'password');

			FormHelper.initTypeFields(form);

			const wrapper = form.querySelector('.input-group.password');
			expect(wrapper).not.toBeNull();
			expect(wrapper.querySelector('input[type="password"]')).not.toBeNull();
		});

		test('should add toggle button span inside wrapper', () => {
			const form = setupForm();
			addInput(form, 'password', 'password');

			FormHelper.initTypeFields(form);

			const span = form.querySelector('.input-group.password .input-group-text');
			expect(span).not.toBeNull();
			expect(span.querySelector('i.fa-eye')).not.toBeNull();
		});

		test('should toggle password visibility on icon click', () => {
			const form = setupForm();
			addInput(form, 'password', 'password');

			FormHelper.initTypeFields(form);

			const icon = form.querySelector('.input-group.password i.fa-eye');
			const passwordInput = form.querySelector('.input-group.password input');

			expect(passwordInput.type).toBe('password');
			icon.click();
			expect(passwordInput.type).toBe('text');
			icon.click();
			expect(passwordInput.type).toBe('password');
		});

		test('should skip Modernizr block when Modernizr not defined', () => {
			const form = setupForm();
			addInput(form, 'password', 'password');

			// Should not throw when Modernizr is undefined
			expect(() => FormHelper.initTypeFields(form)).not.toThrow();
		});
	});

	describe('hideField', () => {
		test('should add hide class to closest .form-group', () => {
			const form = setupForm();
			const formGroup = document.createElement('div');
			formGroup.className = 'form-group';
			form.appendChild(formGroup);
			const input = document.createElement('input');
			formGroup.appendChild(input);

			FormHelper.hideField(input);

			expect(formGroup.classList.contains('hide')).toBe(true);
		});
	});

	describe('hideFormErrors', () => {
		test('should remove all div.form_errors elements', () => {
			const form = setupForm();
			const err1 = document.createElement('div');
			err1.className = 'form_errors';
			const err2 = document.createElement('div');
			err2.className = 'form_errors';
			form.appendChild(err1);
			form.appendChild(err2);

			const result = FormHelper.hideFormErrors(form);

			expect(form.querySelectorAll('div.form_errors').length).toBe(0);
			expect(result).toBe(form);
		});

		test('should return jQuery wrapper when passed a jQuery object', () => {
			const form = setupForm();
			const jqForm = mockJQuery(form);
			global.$ = jest.fn(el => mockJQuery(el));

			const result = FormHelper.hideFormErrors(jqForm);

			expect(result).toHaveProperty('jquery');
			expect(result[0]).toBe(form);
		});
	});

	describe('displayFormErrorsFromText', () => {
		test('should insert into errorWrapperDiv when provided', () => {
			const form = setupForm();
			const wrapper = document.createElement('div');
			document.body.appendChild(wrapper);

			FormHelper.displayFormErrorsFromText(form, 'Error text', wrapper);

			expect(wrapper.querySelector('.form_errors')).not.toBeNull();
			expect(wrapper.querySelector('.form_errors').textContent).toBe('Error text');
		});

		test('should insert into .form_errors_content when exists', () => {
			const form = setupForm();
			const container = document.createElement('div');
			container.className = 'form_errors_content';
			form.appendChild(container);

			FormHelper.displayFormErrorsFromText(form, 'Error text');

			expect(container.querySelector('.form_errors')).not.toBeNull();
		});

		test('should insert before first .form-group when present', () => {
			const form = setupForm();
			const fg = document.createElement('div');
			fg.className = 'form-group';
			form.appendChild(fg);

			FormHelper.displayFormErrorsFromText(form, 'Error text');

			const errors = form.querySelector('.form_errors');
			expect(errors).not.toBeNull();
			// The error div should be before the form-group
			expect(form.children[0].classList.contains('form_errors')).toBe(true);
		});

		test('should insert before row grandparent when form-group is inside a .row', () => {
			const form = setupForm();
			const row = document.createElement('div');
			row.className = 'row';
			form.appendChild(row);
			const col = document.createElement('div');
			col.className = 'col';
			row.appendChild(col);
			const fg = document.createElement('div');
			fg.className = 'form-group';
			col.appendChild(fg);

			FormHelper.displayFormErrorsFromText(form, 'Error text');

			// Error should be inserted before the .row
			const errors = form.querySelector('.form_errors');
			expect(errors).not.toBeNull();
			expect(form.children[0].classList.contains('form_errors')).toBe(true);
		});

		test('should prepend to form when no other location found', () => {
			const form = setupForm();

			FormHelper.displayFormErrorsFromText(form, 'Error text');

			expect(form.children[0].classList.contains('form_errors')).toBe(true);
		});

		test('should place errors inside modal-body when present', () => {
			const form = setupForm();
			const modalBody = document.createElement('div');
			modalBody.className = 'modal-body';
			form.appendChild(modalBody);

			FormHelper.displayFormErrorsFromText(form, 'Error text');

			// The form_errors should be inside modal-body (prepended)
			expect(modalBody.querySelector('.form_errors')).not.toBeNull();
		});
	});

	describe('buttonLoader', () => {
		test('should disable button and set loading text on loading action', () => {
			const form = setupForm();
			const btn = addButton(form, 'validate', 'Submit');

			FormHelper.buttonLoader(btn, 'loading');

			expect(btn.disabled).toBe(true);
			expect(btn.classList.contains('disabled')).toBe(true);
			expect(btn.innerHTML).toContain('fa-spin');
		});

		test('should not process if already disabled', () => {
			const form = setupForm();
			const btn = addButton(form, 'validate', 'Submit');
			btn.disabled = true;
			const originalHTML = btn.innerHTML;

			FormHelper.buttonLoader(btn, 'loading');

			expect(btn.innerHTML).toBe(originalHTML);
		});

		test('should restore original text on reset', () => {
			const form = setupForm();
			const btn = addButton(form, 'validate', 'Submit');

			FormHelper.buttonLoader(btn, 'loading');
			FormHelper.buttonLoader(btn, 'reset');

			expect(btn.innerHTML).toBe('Submit');
			expect(btn.disabled).toBe(false);
			expect(btn.classList.contains('disabled')).toBe(false);
		});

		test('should use data-load-text when provided', () => {
			const form = setupForm();
			const btn = addButton(form, 'validate', 'Submit');
			btn.dataset.loadText = 'Loading...';

			FormHelper.buttonLoader(btn, 'start');

			expect(btn.innerHTML).toBe('Loading...');
		});

		test('should use data-loading-text when provided', () => {
			const form = setupForm();
			const btn = addButton(form, 'validate', 'Submit');
			btn.dataset.loadingText = 'Custom...';

			FormHelper.buttonLoader(btn, 'start');

			expect(btn.innerHTML).toBe('Custom...');
		});

		test('should return the button element', () => {
			const form = setupForm();
			const btn = addButton(form, 'validate', 'Submit');

			const result = FormHelper.buttonLoader(btn, 'reset');

			expect(result).toBe(btn);
		});

		test('should not overwrite innerHTML with "undefined" when reset called before loading', () => {
			const form = setupForm();
			const btn = addButton(form, 'validate', 'Submit');

			FormHelper.buttonLoader(btn, 'reset');

			expect(btn.innerHTML).toBe('Submit');
		});
	});

	describe('getInputValue', () => {
		test('should return null for undefined input', () => {
			expect(FormHelper.getInputValue(undefined)).toBeNull();
		});

		test('should return null for null input', () => {
			expect(FormHelper.getInputValue(null)).toBeNull();
		});

		test('should return null for empty string value', () => {
			const form = setupForm();
			const input = addInput(form, 'name', 'text', '');

			expect(FormHelper.getInputValue(input)).toBeNull();
		});

		test('should return value when present', () => {
			const form = setupForm();
			const input = addInput(form, 'name', 'text', 'test value');

			expect(FormHelper.getInputValue(input)).toBe('test value');
		});
	});

	describe('getLinesOfTextarea', () => {
		test('should split textarea by newlines and filter empty', () => {
			const form = setupForm();
			const textarea = document.createElement('textarea');
			textarea.value = 'line1\nline2\nline3';
			form.appendChild(textarea);

			const result = FormHelper.getLinesOfTextarea(textarea);

			expect(result).toEqual(['line1', 'line2', 'line3']);
		});

		test('should handle Windows line endings', () => {
			const form = setupForm();
			const textarea = document.createElement('textarea');
			textarea.value = 'line1\r\nline2\r\nline3';
			form.appendChild(textarea);

			const result = FormHelper.getLinesOfTextarea(textarea);

			expect(result).toEqual(['line1', 'line2', 'line3']);
		});
	});

	describe('extractErrorKeyOfJson', () => {
		test('should return null for undefined', () => {
			expect(FormHelper.extractErrorKeyOfJson(undefined)).toBeNull();
		});

		test('should return null for null', () => {
			expect(FormHelper.extractErrorKeyOfJson(null)).toBeNull();
		});

		test('should extract error from json.error', () => {
			expect(FormHelper.extractErrorKeyOfJson({ error: 'invalid_data' })).toBe('invalid_data');
		});

		test('should extract error from json[0].error', () => {
			expect(FormHelper.extractErrorKeyOfJson([{ error: 'field_error' }])).toBe('field_error');
		});

		test('should extract error from json[0][0] when array format', () => {
			expect(FormHelper.extractErrorKeyOfJson([['error_key', 'error message']])).toBe('error_key');
		});

		test('should return null when onlyIfUniqueError=true and multiple errors', () => {
			expect(FormHelper.extractErrorKeyOfJson([{ error: 'err1' }, { error: 'err2' }], true)).toBeNull();
		});

		test('should return error when onlyIfUniqueError=true and single error', () => {
			expect(FormHelper.extractErrorKeyOfJson([{ error: 'err1' }], true)).toBe('err1');
		});

		test('should handle empty array', () => {
			expect(FormHelper.extractErrorKeyOfJson([])).toBeNull();
		});
	});

	describe('extractErrorMessageOfJson', () => {
		test('should return null for undefined', () => {
			expect(FormHelper.extractErrorMessageOfJson(undefined)).toBeNull();
		});

		test('should return null for null', () => {
			expect(FormHelper.extractErrorMessageOfJson(null)).toBeNull();
		});

		test('should extract error message from json.error', () => {
			expect(FormHelper.extractErrorMessageOfJson({ error: 'Invalid data' })).toBe('Invalid data');
		});

		test('should extract error message from json[0].error', () => {
			expect(FormHelper.extractErrorMessageOfJson([{ error: 'Field error' }])).toBe('Field error');
		});

		test('should extract error message from json[0][1] when array format', () => {
			expect(FormHelper.extractErrorMessageOfJson([['error_key', 'Error message']])).toBe('Error message');
		});

		test('should return null when onlyIfUniqueError=true and multiple errors', () => {
			expect(FormHelper.extractErrorMessageOfJson([{ error: 'err1' }, { error: 'err2' }], true)).toBeNull();
		});

		test('should return error when onlyIfUniqueError=true and single error', () => {
			expect(FormHelper.extractErrorMessageOfJson([{ error: 'err1' }], true)).toBe('err1');
		});
	});

	describe('getDataFromFormData', () => {
		test('should convert FormData to object', () => {
			const formData = new FormData();
			formData.append('name', 'John');
			formData.append('email', 'john@example.com');

			const result = FormHelper.getDataFromFormData(formData);

			expect(result).toEqual({
				name: 'John',
				email: 'john@example.com'
			});
		});

		test('should handle empty FormData', () => {
			const formData = new FormData();
			const result = FormHelper.getDataFromFormData(formData);

			expect(result).toEqual({});
		});
	});

	describe('getFormErrorText', () => {
		test('should convert errors object to HTML text', () => {
			const errors = {
				field1: 'Error message 1',
				field2: 'Error message 2'
			};

			const result = FormHelper.getFormErrorText(errors);

			expect(result).toContain('<span>Error message 1</span>');
			expect(result).toContain('<span>Error message 2</span>');
			expect(result).toContain('<br/>');
		});

		test('should handle error_description format', () => {
			const errors = {
				field1: { error_description: 'Detailed error' }
			};

			const result = FormHelper.getFormErrorText(errors);

			expect(result).toBe('<span>Detailed error</span>');
		});

		test('should handle array format [key, message]', () => {
			const errors = {
				field1: ['error_key', 'Error message']
			};

			const result = FormHelper.getFormErrorText(errors);

			expect(result).toBe('<span>Error message</span>');
		});

		test('should skip function properties', () => {
			const errors = {
				field1: 'Error 1',
				someFunction: function() {}
			};

			const result = FormHelper.getFormErrorText(errors);

			expect(result).toBe('<span>Error 1</span>');
		});
	});

	describe('displayFormErrors', () => {
		test('should display errors and reset button', () => {
			const form = setupForm();
			const btn = addButton(form, 'validate', 'Submit');
			const errors = { field: 'Error message' };
			const displaySpy = jest.spyOn(FormHelper, 'displayFormErrorsFromText');
			const getTextSpy = jest.spyOn(FormHelper, 'getFormErrorText').mockReturnValue('<span>Error</span>');
			const buttonLoaderSpy = jest.spyOn(FormHelper, 'buttonLoader');

			FormHelper.displayFormErrors(form, btn, errors);

			expect(getTextSpy).toHaveBeenCalledWith(errors);
			expect(displaySpy).toHaveBeenCalledWith(form, '<span>Error</span>', null);
			expect(buttonLoaderSpy).toHaveBeenCalledWith(btn, 'reset');

			displaySpy.mockRestore();
			getTextSpy.mockRestore();
			buttonLoaderSpy.mockRestore();
		});

		test('should work without button', () => {
			const form = setupForm();
			const errors = { field: 'Error message' };
			const displaySpy = jest.spyOn(FormHelper, 'displayFormErrorsFromText');
			const getTextSpy = jest.spyOn(FormHelper, 'getFormErrorText').mockReturnValue('<span>Error</span>');

			FormHelper.displayFormErrors(form, null, errors);

			expect(displaySpy).toHaveBeenCalledWith(form, '<span>Error</span>', null);

			displaySpy.mockRestore();
			getTextSpy.mockRestore();
		});

		test('should use custom error wrapper', () => {
			const form = setupForm();
			const btn = addButton(form, 'validate', 'Submit');
			const errors = { field: 'Error message' };
			const wrapper = document.createElement('div');
			document.body.appendChild(wrapper);
			const displaySpy = jest.spyOn(FormHelper, 'displayFormErrorsFromText');
			const getTextSpy = jest.spyOn(FormHelper, 'getFormErrorText').mockReturnValue('<span>Error</span>');

			FormHelper.displayFormErrors(form, btn, errors, wrapper);

			expect(displaySpy).toHaveBeenCalledWith(form, '<span>Error</span>', wrapper);

			displaySpy.mockRestore();
			getTextSpy.mockRestore();
		});
	});
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