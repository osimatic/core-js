import { toEl } from '../utils/util.js';

export class MultipleActionInDivList {
// init checkbox
	static init(contentDiv, options = {}) {
		contentDiv = toEl(contentDiv);
		if (!contentDiv) {
			return;
		}

		const { imgArrow = '' } = options;

		let buttonsDiv = MultipleActionInDivList.getButtonsDiv(contentDiv);
		if (buttonsDiv == null) {
			return;
		}

		buttonsDiv.classList.add('hide');

		// If no selectable div, we do not apply the plugin
		if (!contentDiv.querySelectorAll('.multiple_action').length) {
			return;
		}

		if (!buttonsDiv.dataset.action_multiple_buttons_initialized) {
			buttonsDiv.insertAdjacentHTML('afterbegin', '<img src="'+imgArrow+'" alt="" /> &nbsp;');
			buttonsDiv.insertAdjacentHTML('beforeend', '<br/><br/>');
			buttonsDiv.dataset.action_multiple_buttons_initialized = '1';
		}

		// Add a checkbox for each selectable div
		contentDiv.querySelectorAll('.multiple_action').forEach(div => {
			if (!div.querySelector('div.multi_select')) {
				div.insertAdjacentHTML('afterbegin', '<div class="multi_select float-start me-2"><input type="checkbox" class="action_multiple_checkbox" name="'+div.dataset.action_multiple_input_name+'" value="'+div.dataset.action_multiple_item_id+'"></div>');
			}
		});

		// Add select all checkbox
		if (!contentDiv.querySelector('input.action_multiple_check_all')) {
			contentDiv.insertAdjacentHTML('afterbegin', '<p class="mb-2"><input type="checkbox" class="action_multiple_check_all" /> Tout sélectionner</p>');
		}

		contentDiv.querySelectorAll('input.action_multiple_checkbox').forEach(cb => {
			cb.addEventListener('change', () => {
				MultipleActionInDivList.updateCheckbox(contentDiv);
			});
		});

		const checkAll = contentDiv.querySelector('input.action_multiple_check_all');
		if (checkAll) {
			const checkAllClone = checkAll.cloneNode(true);
			checkAll.parentElement.replaceChild(checkAllClone, checkAll);
			checkAllClone.addEventListener('click', function() {
				const checkboxes = contentDiv.querySelectorAll('input.action_multiple_checkbox');
				const checked = contentDiv.querySelectorAll('input.action_multiple_checkbox:checked');
				const newState = checkboxes.length !== checked.length;
				checkboxes.forEach(cb => { cb.checked = newState; });
				MultipleActionInDivList.updateCheckbox(contentDiv);
			});
		}

		MultipleActionInDivList.updateCheckbox(contentDiv);
	}

	static updateCheckbox(contentDiv) {
		contentDiv = toEl(contentDiv);
		if (!contentDiv) {
			return;
		}
		
		MultipleActionInDivList.showButtonsAction(contentDiv);

		const allCheckbox = contentDiv.querySelectorAll('input.action_multiple_checkbox');
		const allCheckboxChecked = contentDiv.querySelectorAll('input.action_multiple_checkbox:checked');
		const checkboxSelectAll = contentDiv.querySelector('input.action_multiple_check_all');

		if (!checkboxSelectAll) {
			return;
		}

		if (allCheckbox.length === 0) {
			checkboxSelectAll.classList.add('hide');
			return;
		}

		checkboxSelectAll.classList.remove('hide');
		checkboxSelectAll.checked = allCheckbox.length === allCheckboxChecked.length;
	}

	static getButtonsDiv(contentDiv) {
		contentDiv = toEl(contentDiv);
		if (!contentDiv) {
			return null;
		}
		
		const buttonsDiv = contentDiv.nextElementSibling;
		if (buttonsDiv && buttonsDiv.classList.contains('action_multiple_buttons')) {
			return buttonsDiv;
		}
		return null;
	}

	static showButtonsAction(contentDiv) {
		contentDiv = toEl(contentDiv);
		if (!contentDiv) {
			return;
		}
		
		const buttonsDiv = MultipleActionInDivList.getButtonsDiv(contentDiv);
		if (buttonsDiv == null) {
			return;
		}

		const nbItems = contentDiv.querySelectorAll('input.action_multiple_checkbox:checked').length;
		const isHidden = buttonsDiv.classList.contains('hide');
		const isVisible = !isHidden;

		if (nbItems > 0 && isHidden) {
			buttonsDiv.classList.remove('hide');
		}
		// 13/04/2021: if the table is hidden, it means it is being initialized (after loading the data), so if no rows are selected, we hide the buttons div
		else if ((nbItems === 0 && isVisible) || (nbItems === 0 && contentDiv.classList.contains('hide'))) {
			buttonsDiv.classList.add('hide');
		}

		// display no action possible if no button is visible
		if (!buttonsDiv.classList.contains('hide')) {
			buttonsDiv.querySelectorAll('span.no_button').forEach(el => el.remove());
			if (buttonsDiv.querySelectorAll('button:not(.hide), a:not(.hide)').length === 0) {
				const img = buttonsDiv.querySelector('img');
				if (img) {
					img.insertAdjacentHTML('afterend', '<span class="no_button"><em>aucune action possible</em></span>');
				}
			}
		}
	}
}
