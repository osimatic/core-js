import { SelectBox } from './SelectBox.js';
import { toEl, toJquery } from '../utils/util.js';

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

export { FormHelper };
