import { FormHelper } from './FormHelper.js';
import { toEl } from '../utils/util.js';

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

export { EditValue };
