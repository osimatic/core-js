const { toEl, toJquery } = require('./util');
const { SelectBox } = require('./select_box');

class FormHelper {
	static init(form, onSubmitCallback, submitButton=null) {
		const wasJQuery = form && form.jquery;
		form = toEl(form);
		if (!form) {
			return;
		}

		FormHelper.reset(form, submitButton);
		submitButton = null != submitButton ? toEl(submitButton) : form.querySelector('button[name="validate"]');
		if (!submitButton) {
			return wasJQuery ? toJquery(form) : form;
		}
		submitButton.onclick = function(e) {
			e.preventDefault();
			FormHelper.buttonLoader(this, 'loading');
			FormHelper.hideFormErrors(form);
			if (typeof onSubmitCallback == 'function') {
				onSubmitCallback(wasJQuery ? toJquery(form) : form, wasJQuery ? toJquery(submitButton) : submitButton);
			}
		};
		return wasJQuery ? toJquery(form) : form;
	}

	static reset(form, submitButton=null) {
		const wasJQuery = form && form.jquery;
		form = toEl(form);
		if (!form) {
			return;
		}

		submitButton = null != submitButton ? toEl(submitButton) : form.querySelector('button[name="validate"]');
		form.querySelectorAll('input[name]:not([type="checkbox"]):not([type="radio"]), select, textarea').forEach(el => {
			el.value = '';
			el.onchange = null;
			if (el.tagName === 'SELECT') {
				SelectBox.clear(el);
			}
		});
		FormHelper.buttonLoader(submitButton, 'reset');
		FormHelper.hideFormErrors(form);
		return wasJQuery ? toJquery(form) : form;
	}

	static populateForm(form, data) {
		form = toEl(form);
		if (!form) {
			return;
		}

		const employeesDisplayType = form.querySelector('[name="employees_display_type"][value="NONE"]');
		if (employeesDisplayType) employeesDisplayType.checked = true; //todo à retirer

		Object.entries(data).forEach(([key, value]) => {
			if (value == null) {
				return;
			}

			if (typeof value == 'object') {
				let select = form.querySelector('[name="'+key+'[]"]');
				if (select) {
					select.querySelectorAll('option').forEach(o => o.selected = false);
					select.dataset.default_id = value.join(',');
					value.forEach(val => {
						const opt = select.querySelector('option[value="'+val+'"]');
						if (opt) {
							opt.selected = true;
						}
					});
					//SelectBox.refresh(select);
				}
				return;
			}

			const inputs = form.querySelectorAll('[name="'+key+'"]');
			if (!inputs.length) {
				return;
			}

			if (inputs[0].type === 'radio' || inputs[0].type === 'checkbox') {
				inputs.forEach(i => i.checked = false);
				const target = form.querySelector('[name="'+key+'"][value="'+value+'"]');
				if (target) {
					target.checked = true;
				}
				return;
			}

			inputs[0].value = value;
			// console.log(form.querySelectorAll('[name="'+key+'"]').length);
		});
	}


	static getFormData(form) {
		form = toEl(form);
		if (!form) {
			return null;
		}
		return new FormData(form);
	}

	static getDataFromFormData(formData) {
		let data = {};
		for (let pair of formData.entries()) {
			//console.log(pair[0]+ ', '+ pair[1]);
			data[pair[0]] = pair[1];
		}
		return data;
	}

	static getFormDataQueryString(form) {
		form = toEl(form);
		if (!form) {
			return null;
		}
		return new URLSearchParams(new FormData(form)).toString();
	}



	// ------------------------------------------------------------
	// Input text
	// ------------------------------------------------------------

	static getInputValue(input) {
		input = toEl(input);
		if (!input) {
			return null;
		}
		let value = input.value;
		if (value === null || value === '') {
			return null;
		}
		return value;
	}

	static getLinesOfTextarea(textarea) {
		textarea = toEl(textarea);
		if (!textarea) {
			return null;
		}
		return textarea.value.replace(/(\r\n|\n|\r)/g, "\n").split("\n").filter(word => word.length > 0);
	}

	static setOnInputChange(input, callback, doneTypingInterval=700) {
		input = toEl(input);
		if (!input) {
			return null;
		}

		// setup before functions
		let typingTimer;  // timer identifier

		// on keyup, start the countdown
		input.addEventListener('keyup', function () {
			clearTimeout(typingTimer);
			typingTimer = setTimeout(callback, doneTypingInterval); // time in ms
		});

		// on keydown, clear the countdown
		input.addEventListener('keydown', function () {
			clearTimeout(typingTimer);
		});

		// on focusout, clear the countdown and call callback
		input.addEventListener('focusout', function () {
			clearTimeout(typingTimer);
			callback();
		});
	}

	// ------------------------------------------------------------
	// Select
	// ------------------------------------------------------------

	static resetSelectOption(form, selectName) {
		form = toEl(form);
		if (!form) {
			return null;
		}

		form.querySelectorAll('select[name="'+selectName+'"] option').forEach(o => {
			o.disabled = false;
			o.selected = false;
		});
	}
	static setSelectedSelectOption(form, selectName, optionValue) {
		form = toEl(form);
		if (!form) {
			return;
		}

		const opt = form.querySelector('select[name="'+selectName+'"] option[value="'+optionValue+'"]');
		if (opt) {
			opt.selected = true;
		}
	}
	static setSelectedSelectOptions(form, selectName, optionValues) {
		form = toEl(form);
		if (!form) {
			return;
		}

		optionValues.forEach(id => FormHelper.setSelectedSelectOption(form, selectName, id));
	}
	static disableSelectOption(form, selectName, optionValue) {
		form = toEl(form);
		if (!form) {
			return;
		}

		const opt = form.querySelector('select[name="'+selectName+'"] option[value="'+optionValue+'"]');
		if (opt) {
			opt.disabled = true;
		}
	}
	static disableSelectOptions(form, selectName, optionValues) {
		form = toEl(form);
		if (!form) {
			return;
		}

		optionValues.forEach(id => FormHelper.disableSelectOption(form, selectName, id));
	}
	static countSelectOptions(form, selectName) {
		form = toEl(form);
		if (!form) {
			return null;
		}

		return form.querySelectorAll('select[name="'+selectName+'"] option:not([disabled])').length;
	}


	// ------------------------------------------------------------
	// Checkbox
	// ------------------------------------------------------------

	static getCheckedValues(inputs) {
		return [...inputs].filter(i => i.checked).map(i => i.value);
	}

	static setCheckedValues(inputs, defaultValues) {
		const values = defaultValues.map(String);
		[...inputs].forEach(input => {
			input.checked = values.includes(input.value);
		});
	}

	static getInputListValues(inputs) {
		return [...inputs].map(i => i.value).filter(word => word.length > 0);
	}


	// ------------------------------------------------------------
	// Champs
	// ------------------------------------------------------------

	static initTypeFields(form) {
		form = toEl(form);
		if (!form) {
			return;
		}

		// Show/Hide password
		form.querySelectorAll('input[type="password"]').forEach(inputEl => {
			const wrapper = document.createElement('div');
			wrapper.className = 'input-group password';
			inputEl.parentNode.insertBefore(wrapper, inputEl);
			wrapper.appendChild(inputEl);
			const span = document.createElement('span');
			span.className = 'input-group-text';
			span.innerHTML = '<i class="fas fa-eye toggle_password"></i>';
			span.querySelector('i').addEventListener('click', function(e) {
				e.preventDefault();
				const inp = this.closest('.input-group').querySelector('input');
				const passwordHidden = inp.type === 'password';
				inp.type = passwordHidden ? 'text' : 'password';
				this.classList.remove('fa-eye', 'fa-eye-slash');
				this.classList.add(passwordHidden ? 'fa-eye-slash' : 'fa-eye');
			});
			wrapper.appendChild(span);
		});
	}

	static hideField(inputOrSelect) {
		inputOrSelect = toEl(inputOrSelect);
		if (!inputOrSelect) {
			return;
		}
		inputOrSelect.closest('.form-group')?.classList.add('hide');
	}

	// ------------------------------------------------------------
	// Messages erreur
	// ------------------------------------------------------------

	static extractErrorKeyOfJson(json, onlyIfUniqueError=false) {
		if (typeof json == 'undefined' || json == null) {
			return null;
		}

		if (typeof json.error != 'undefined') {
			return json.error;
		}

		if (onlyIfUniqueError && (!json.length || json.length > 1)) {
			return null;
		}

		if (typeof json[0] != 'undefined' && typeof json[0].error != 'undefined') {
			return json[0].error;
		}

		if (typeof json[0] != 'undefined' && Array.isArray(json[0]) && json[0].length === 2) {
			return json[0][0];
		}

		return null;
	}

	static extractErrorMessageOfJson(json, onlyIfUniqueError=false) {
		if (typeof json == 'undefined' || json == null) {
			return null;
		}

		if (typeof json.error != 'undefined') {
			return json.error;
		}

		if (onlyIfUniqueError && (!json.length || json.length > 1)) {
			return null;
		}

		if (typeof json[0] != 'undefined' && typeof json[0].error != 'undefined') {
			return json[0].error;
		}

		if (typeof json[0] != 'undefined' && Array.isArray(json[0]) && json[0].length === 2) {
			return json[0][1];
		}

		return null;
	}

	static hideFormErrors(form) {
		const wasJQuery = form && form.jquery;
		form = toEl(form);
		if (!form) {
			return null;
		}
		form.querySelectorAll('div.form_errors').forEach(el => el.remove());
		return wasJQuery ? toJquery(form) : form;
	}

	static getFormErrorText(errors) {
		let errorLabels = [];
		for (let property in errors) {
			// console.log(property);
			if (typeof errors[property] == 'function') {
				continue;
			}
			if (errors[property] != null && typeof errors[property]['error_description'] !== 'undefined') {
				errorLabels.push(errors[property]['error_description']);
				continue;
			}
			if (Array.isArray(errors[property]) && errors[property].length === 2) {
				errorLabels.push(errors[property][1]);
				continue;
			}
			errorLabels.push(errors[property]);
		}
		return errorLabels.removeEmptyValues().map(errorLabel => '<span>' + errorLabel + '</span>').join('<br/>');
	}

	static displayFormErrors(form, btnSubmit, errors, errorWrapperDiv=null) {
		form = toEl(form); btnSubmit = toEl(btnSubmit); errorWrapperDiv = toEl(errorWrapperDiv);
		this.displayFormErrorsFromText(form, this.getFormErrorText(errors), errorWrapperDiv);
		if (btnSubmit != null) {
			FormHelper.buttonLoader(btnSubmit, 'reset');
		}
	}

	static displayFormErrorsFromText(form, errorLabels, errorWrapperDiv=null) {
		form = toEl(form); errorWrapperDiv = toEl(errorWrapperDiv);
		if (!form) {
			return;
		}

		let errorDiv = '<div class="alert alert-danger form_errors">'+errorLabels+'</div>';

		if (null != errorWrapperDiv) {
			errorWrapperDiv.insertAdjacentHTML('beforeend', errorDiv);
			return;
		}

		const formErrorsContent = form.querySelector('.form_errors_content');
		if (formErrorsContent) {
			formErrorsContent.insertAdjacentHTML('beforeend', errorDiv);
			return;
		}

		let errorsParentDiv = form;
		const modalBody = form.querySelector('.modal-body');
		if (modalBody) {
			errorsParentDiv = modalBody;
		}

		const firstFormGroup = errorsParentDiv.querySelector('.form-group');
		if (firstFormGroup) {
			if (firstFormGroup.parentElement?.parentElement?.classList.contains('row')) {
				firstFormGroup.parentElement.parentElement.insertAdjacentHTML('beforebegin', errorDiv);
			}
			else {
				firstFormGroup.insertAdjacentHTML('beforebegin', errorDiv);
			}
			return;
		}

		errorsParentDiv.insertAdjacentHTML('afterbegin', errorDiv);
	}


	// ------------------------------------------------------------
	// Bouton valider
	// ------------------------------------------------------------

	static buttonLoader(button, action) {
		const wasJQuery = button && button.jquery;
		button = toEl(button);
		if (!button) {
			return null;
		}

		if (action === 'start' || action === 'loading') {
			if (button.disabled) {
				return wasJQuery ? toJquery(button) : button;
			}
			button.disabled = true;
			button.dataset.btnText = button.innerHTML;
			//let text = '<span class="spinner"><i class=\'fa fa-circle-notch fa-spin\'></i></span>Traitement en cours…';
			let text = '<i class=\'fa fa-circle-notch fa-spin\'></i> Traitement en cours…';
			if (button.dataset.loadText != null && button.dataset.loadText !== '') {
				text = button.dataset.loadText;
			}
			if (button.dataset.loadingText != null && button.dataset.loadingText !== '') {
				text = button.dataset.loadingText;
			}
			button.innerHTML = text;
			button.classList.add('disabled');
		}
		if (action === 'stop' || action === 'reset') {
			if (button.dataset.btnText !== undefined) {
				button.innerHTML = button.dataset.btnText;
			}
			button.classList.remove('disabled');
			button.disabled = false;
		}
		return wasJQuery ? toJquery(button) : button;
	}


}

class ArrayField {
	static init(formGroupDiv, defaultValues=[], options = {
		entering_field_in_table: true,
		item_name: null,
		nb_min_lines: 5,
		nb_max_lines: null,
		list_empty_text: null,
		add_one_button_enabled: true,
		add_one_button_label: null,
		add_multi_button_enabled: false,
		add_multi_button_label: null,
		input_name: null,
		init_callback: null,
		update_list_callback: null,
		get_errors_callback: null,

	}) {
		const wasJQuery = formGroupDiv && formGroupDiv.jquery;
		formGroupDiv = toEl(formGroupDiv);
		if (!formGroupDiv) {
			return;
		}
		function isOptionDefined(optionName) {
			return typeof options[optionName] != 'undefined' && null !== options[optionName];
		}

		function createElement(html) {
			const tmpDiv = document.createElement('div');
			tmpDiv.innerHTML = html.trim();
			return tmpDiv.firstElementChild;
		}

		let itemsList = defaultValues;

		if (!formGroupDiv.querySelector('table')) {
			formGroupDiv.insertAdjacentHTML('beforeend', '<table class="table table-sm"><tbody></tbody></table>');
		}
		if (!formGroupDiv.querySelector('.list_empty')) {
			formGroupDiv.insertAdjacentHTML('beforeend', '<div class="list_empty">'+(isOptionDefined('list_empty_text') ? options['list_empty_text'] : '<em>aucun</em>')+'</div>');
		}
		if (!options['entering_field_in_table'] && !formGroupDiv.querySelector('.add_one, .add_multi')) {
			let divLinks = formGroupDiv.querySelector('.links');
			if (!divLinks) {
				divLinks = createElement('<div class="links text-center"></div>');
				formGroupDiv.appendChild(divLinks);
			}

			if (options['add_one_button_enabled']) {
				divLinks.insertAdjacentHTML('beforeend', '<a href="#" class="add_one btn btn-sm btn-success">'+(isOptionDefined('add_one_button_label') ? options['add_one_button_label'] : 'Ajouter')+'</a>');
			}
			if (options['add_multi_button_enabled']) {
				divLinks.insertAdjacentHTML('beforeend', '<a href="#" class="add_multi btn btn-sm btn-success">'+(isOptionDefined('add_multi_button_label') ? options['add_multi_button_label'] : 'Ajout multiple')+'</a>');
			}
			formGroupDiv.appendChild(divLinks);
		}

		function addLine(item) {
			const table = formGroupDiv.querySelector('table');
			table.classList.remove('hide');
			let tr;
			const baseTr = table.querySelector('tbody tr.base');
			if (baseTr) {
				tr = baseTr.cloneNode(true);
				tr.classList.remove('hide', 'base');
			}
			else {
				let links = '';
				if (options['entering_field_in_table']) {
					links += '<a href="#" title="Ajouter" class="add btn btn-sm btn-success ms-1"><i class="fas fa-plus"></i></a>';
				}
				links += '<a href="#" title="Supprimer" class="remove btn btn-sm btn-danger ms-1"><i class="fas fa-times"></i></a>';

				tr = createElement(
					'<tr>' +
						'<td class="table-input" style="vertical-align: middle">' +
							(options['entering_field_in_table'] ? '<input type="text" name="'+options['input_name']+'" class="form-control pt-1 pb-1">' : '<input type="hidden" name="'+options['input_name']+'"> <span class="value"></span>') +
						'</td>' +
						'<td class="table-links text-end" style="vertical-align: middle">'+links+'</td>' +
					'</tr>'
				);
			}

			const addLink = tr.querySelector('a.add');
			if (addLink) {
				addLink.onclick = function () {
					const trEl = this.closest('tr');
					const tableBody = trEl.closest('tbody');

					if (isOptionDefined('nb_max_lines') && tableBody.querySelectorAll('tr').length >= options['nb_max_lines']) {
						return false;
					}
					addLine();
					onUpdateList();
					return false;
				};
			}
			const removeLink = tr.querySelector('a.remove');
			if (removeLink) {
				removeLink.onclick = function () {
					const trEl = this.closest('tr');
					const tableBody = trEl.closest('tbody');
					if (options['entering_field_in_table'] && tableBody.querySelectorAll('tr').length <= 1) {
						return false;
					}

					if (!options['entering_field_in_table'] || '' !== trEl.dataset.item) {
						itemsList.unsetVal(trEl.dataset.item);
					}

					trEl.remove();
					onUpdateList();
					return false;
				};
			}

			if (typeof item != 'undefined' && null !== item) {
				tr.dataset.item = item ?? '';
				const inputEl = tr.querySelector('input');
				if (inputEl) {
					inputEl.value = item;
				}
				const spanEl = tr.querySelector('span.value');
				if (spanEl) {
					spanEl.textContent = item;
				}
			}

			table.querySelector('tbody').appendChild(tr);
			return tr;
		}

		function onUpdateList() {
			formGroupDiv.querySelectorAll('.list_empty, table').forEach(el => el.classList.add('hide'));

			// Maj tableau
			let table = formGroupDiv.querySelector('table');
			const tableLines = [...table.querySelectorAll('tbody tr:not(.base)')];
			if ((options['entering_field_in_table'] && tableLines.length ) || (!options['entering_field_in_table'] && itemsList.length)) {
				table.classList.remove('hide');
			}
			else {
				formGroupDiv.querySelector('.list_empty')?.classList.remove('hide');
			}

			tableLines.forEach(line => {
				line.querySelectorAll('a').forEach(a => {
					a.disabled = false;
					a.classList.remove('disabled');
				});
			});
			if (isOptionDefined('nb_max_lines') && tableLines.length >= options['nb_max_lines']) {
				tableLines.forEach(line => {
					line.querySelectorAll('a.add').forEach(a => {
						a.disabled = true;
						a.classList.add('disabled');
					});
				});
			}
			if (options['entering_field_in_table'] && tableLines.length <= 1) {
				tableLines.forEach(line => {
					line.querySelectorAll('a.remove').forEach(a => {
						a.disabled = true;
						a.classList.add('disabled');
					});
				});
			}

			if (typeof options['update_list_callback'] == 'function') {
				options['update_list_callback'](itemsList);
			}

			cancelAdd();
		}

		function startAdd() {
			formGroupDiv.querySelectorAll('a.add_one, a.add_multi').forEach(el => {
				el.classList.add('hide');
				el.closest('.links')?.classList.add('hide');
			});
			formGroupDiv.querySelectorAll('.item_add_one, .item_add_multi').forEach(el => el.classList.add('hide'));
			formGroupDiv.querySelectorAll('.item_add_one input[type="text"], .item_add_multi textarea').forEach(el => el.value = '');
			formGroupDiv.querySelectorAll('.item_add_one .errors, .item_add_multi .errors').forEach(el => el.classList.add('hide'));
		}
		function cancelAdd() {
			formGroupDiv.querySelectorAll('a.add_one, a.add_multi').forEach(el => {
				el.classList.remove('hide');
				el.closest('.links')?.classList.remove('hide');
			});
			formGroupDiv.querySelectorAll('.item_add_one, .item_add_multi').forEach(el => el.classList.add('hide'));
		}

		function addItemsInList(items) {
			if (!Array.isArray(items)) {
				items = [items];
			}

			for (let i = 0; i < items.length; i++) {
				if (itemsList.indexOf(items[i]) === -1) {
					itemsList.push(items[i]);
					addLine(items[i]);
				}
			}

			onUpdateList();
		}

		function submitAddNewItem(item, divAdd) {
			let items = Array.isArray(item) ? item : [item];

			if (typeof options['format_entered_value_callback'] == 'function') {
				items = items.map(item => options['format_entered_value_callback'](item, wasJQuery ? toJquery(divAdd) : divAdd));
			}

			if (typeof options['get_errors_callback'] == 'function') {
				const errors = options['get_errors_callback'](items, itemsList, wasJQuery ? toJquery(divAdd) : divAdd);
				if (null !== errors && errors.length) {
					displayErrors(divAdd, errors);
					return;
				}
			}

			addItemsInList(items);
		}

		function displayErrors(divAdd, errors) {
			if (!Array.isArray(errors)) {
				errors = [errors];
			}
			const errorsEl = divAdd.querySelector('.errors');
			if (errorsEl) {
				errorsEl.textContent = errors.join('<br/>');
				errorsEl.classList.remove('hide');
			}
		}

		function initLinkAddOne() {
			if (!formGroupDiv.querySelector('a.add_one') || !formGroupDiv.querySelector('a.add_one:not([disabled])')) {
				return;
			}

			let divAdd = formGroupDiv.querySelector('.item_add_one');
			if (!divAdd) {
				divAdd = createElement(
					'<div class="item_add_one">' +
						'<div class="alert alert-danger pt-1 pb-1 errors hide"></div>' +
						'<div class="form-inline">' +
							'<input type="text" class="form-control" placeholder="'+options['item_name']+'" value="" /> &nbsp;' +
							'<a href="#" title="Ajouter" class="add btn btn-success"><i class="fas fa-plus"></i></a> &nbsp;' +
							'<a href="#" class="cancel">Annuler</a>' +
						'</div>' +
						(isOptionDefined('form_desc')?'<br><span class="form-text">'+options['form_desc']+'</span>':'') +
					'</div>'
				);
				formGroupDiv.appendChild(divAdd);
			}

			divAdd.querySelector('a.cancel').onclick = function () {
				cancelAdd();
				return false;
			};
			divAdd.querySelector('a.add').onclick = function () {
				submitAddNewItem(divAdd.querySelector('input.form-control[type="text"]').value, divAdd);
				return false;
			};

			formGroupDiv.querySelector('a.add_one').onclick = function () {
				startAdd();
				formGroupDiv.querySelector('.item_add_one').classList.remove('hide');
				return false;
			};
		}

		function initLinkAddMulti() {
			if (!formGroupDiv.querySelector('a.add_multi') || !formGroupDiv.querySelector('a.add_multi:not([disabled])')) {
				return;
			}

			let divAdd = formGroupDiv.querySelector('.item_add_multi');
			if (!divAdd) {
				divAdd = createElement(
					'<div class="item_add_multi">' +
						'<div class="alert alert-danger pt-1 pb-1 errors hide"></div>' +
						'<div class="form-group">' +
							'<label>Liste à ajouter :</label>' +
							'<textarea name="emails" class="form-control" rows="10"></textarea>' +
							'<span class="form-text">Un élément par ligne.</span>' +
						'</div>' +
						'<div class="form-inline">' +
							'<a href="#" title="Ajouter" class="add btn btn-success"><i class="fas fa-plus"></i></a> &nbsp;' +
							'<a href="#" class="cancel">Annuler</a>' +
						'</div>' +
					'</div>'
				);
				formGroupDiv.appendChild(divAdd);
			}

			divAdd.querySelector('a.cancel').onclick = function () {
				cancelAdd();
				return false;
			};
			divAdd.querySelector('a.add').onclick = function () {
				const items = divAdd.querySelector('textarea').value.normalizeBreaks("\n").split(/\n/ms).filter(value => value.length > 0);
				submitAddNewItem(items, divAdd);
				return false;
			};

			formGroupDiv.querySelector('a.add_multi').onclick = function () {
				startAdd();
				formGroupDiv.querySelector('.item_add_multi').classList.remove('hide');
				return false;
			};
		}

		initLinkAddOne();
		initLinkAddMulti();

		itemsList.forEach(item => addLine(item));
		if (options['entering_field_in_table']) {
			for (let i=itemsList.length; i <= options['nb_min_lines']; i++) {
				addLine();
			}
		}

		onUpdateList();

		if (typeof options['init_callback'] == 'function') {
			options['init_callback'](wasJQuery ? toJquery(formGroupDiv) : formGroupDiv, onUpdateList, addItemsInList);
		}
	}
}

class EditValue {
	static init(valueDiv, onSubmitCallback, getInputCallback) {
		valueDiv = toEl(valueDiv);
		if (!valueDiv) {
			return;
		}
		const link = document.createElement('a');
		link.href = '#';
		link.className = 'text-warning';
		link.innerHTML = '<i class="fas fa-pencil-alt"></i>';
		valueDiv.parentElement.insertAdjacentHTML('beforeend', '&nbsp;');
		valueDiv.parentElement.appendChild(link);

		function cancelEdit(valueParentDiv) {
			valueParentDiv.querySelectorAll('a, span').forEach(el => el.classList.remove('hide'));
			const formEl = valueParentDiv.querySelector('form');
			if (formEl) formEl.remove();
		}

		link.addEventListener('click', function (e) {
			e.preventDefault();

			let parent = this.parentElement;

			parent.querySelectorAll('a, span').forEach(el => el.classList.add('hide'));

			let form = document.createElement('form');
			form.className = 'form-inline';

			const spanEl = parent.querySelector('span');
			let value = spanEl?.dataset.value || spanEl?.textContent || '';
			let inputEl;
			if (typeof getInputCallback == 'function') {
				const tmpDiv = document.createElement('div');
				tmpDiv.innerHTML = getInputCallback(value).trim();
				inputEl = tmpDiv.firstElementChild;
			} else {
				inputEl = document.createElement('input');
				inputEl.type = 'text';
			}
			inputEl.classList.add('form-control');
			inputEl.style.width = 'auto';
			inputEl.value = value;
			form.appendChild(inputEl);

			let button = document.createElement('button');
			button.type = 'submit';
			button.className = 'btn btn-success ms-2';
			button.dataset.loadingText = '<i class=\'fa fa-circle-notch fa-spin\'></i>';
			button.style.verticalAlign = 'baseline';
			button.innerHTML = '<i class="fas fa-check"></i>';
			button.addEventListener('click', function (e) {
				FormHelper.buttonLoader(parent.querySelector('button'), 'loading');
				let newValue = parent.querySelector('input').value;
				onSubmitCallback(newValue, parent,
					(isSuccess, valueFormatCallback) => {
						cancelEdit(parent);
						if (isSuccess) {
							const sp = parent.querySelector('span');
							if (sp) {
								sp.dataset.value = newValue;
								sp.textContent = typeof valueFormatCallback == 'function' ? valueFormatCallback(newValue) : newValue;
							}
						}
					}
				);
			});
			form.appendChild(button);

			parent.appendChild(form);
			return false;
		});
	}
}

module.exports = { FormHelper, ArrayField, EditValue };