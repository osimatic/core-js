import { toEl } from './util.js';

class MultipleActionInTable {

	// Ajoute les colonnes select (thead th + tbody td) dans le DOM.
	// Idempotent : sans effet si les colonnes existent déjà.
	// Doit être appelé AVANT l'initialisation DataTable.
	static initCols(table, cellSelector = 'select') {
		table = toEl(table);
		if (!table || !table.classList.contains('table-action_multiple')) {
			return;
		}
		if (MultipleActionInTable.getDivBtn(table) == null) {
			return;
		}

		const theadTr = table.querySelector(':scope > thead > tr');
		if (theadTr && !theadTr.querySelector('th[data-key="select"]')) {
			theadTr.insertAdjacentHTML('afterbegin', '<th class="' + cellSelector + '" data-key="select"></th>');
		}
		table.querySelectorAll(':scope > tbody > tr:not(.no_items)').forEach(tr => {
			if (!tr.querySelector('td.select')) {
				tr.insertAdjacentHTML('afterbegin', '<td class="select"><input type="checkbox" class="action_multiple_checkbox" name="' + tr.dataset.action_multiple_input_name + '" value="' + tr.dataset.action_multiple_item_id + '"></td>');
			}
		});
	}

	// Initialise les colonnes (via initCols) puis branche les event handlers.
	// Peut être appelé après l'initialisation DataTable.
	static init(table, options = {}) {
		table = toEl(table);
		if (!table || !table.classList.contains('table-action_multiple')) {
			return;
		}

		const { cellSelector = 'select', imgArrow = '' } = options;

		let divBtn = MultipleActionInTable.getDivBtn(table);
		if (divBtn == null) {
			return;
		}

		MultipleActionInTable.initCols(table, cellSelector);

		if (!divBtn.classList.contains('action_multiple_buttons_initialized')) {
			divBtn.insertAdjacentHTML('afterbegin', '<img src="'+imgArrow+'" alt="" /> &nbsp;');
			divBtn.insertAdjacentHTML('beforeend', '<br/><br/>');
			divBtn.classList.add('action_multiple_buttons_initialized');
		}

		const firstTh = table.querySelector('thead tr th');
		if (firstTh && !firstTh.querySelector('input')) {
			firstTh.innerHTML = '<input type="checkbox" class="action_multiple_check_all" />';
		}

		table.querySelectorAll('input.action_multiple_checkbox').forEach(cb => {
			cb.addEventListener('change', () => {
				MultipleActionInTable.updateCheckbox(table);
			});
		});

		const checkAll = table.querySelector('input.action_multiple_check_all');
		if (checkAll) {
			const checkAllClone = checkAll.cloneNode(true);
			checkAll.parentElement.replaceChild(checkAllClone, checkAll);
			checkAllClone.addEventListener('click', function() {
				const t = this.closest('table');
				const checkboxes = t.querySelectorAll('input.action_multiple_checkbox');
				const checked = t.querySelectorAll('input.action_multiple_checkbox:checked');
				const newState = checkboxes.length !== checked.length;
				checkboxes.forEach(cb => { cb.checked = newState; });
				MultipleActionInTable.updateCheckbox(t);
			});
		}

		MultipleActionInTable.updateCheckbox(table);
	}

	static updateCheckbox(table) {
		table = toEl(table);
		if (!table) {
			return;
		}
		
		MultipleActionInTable.showButtonsAction(table);

		const allCheckbox = table.querySelectorAll('input.action_multiple_checkbox');
		const allCheckboxChecked = table.querySelectorAll('input.action_multiple_checkbox:checked');
		const checkboxSelectAll = table.querySelector('thead tr th input.action_multiple_check_all');

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

	static getDivBtn(table) {
		const isJquery = typeof jQuery !== 'undefined' && table instanceof jQuery;
		table = toEl(table);
		if (!table) {
			return null;
		}
		const divTableResponsive = table.parentElement;
		let divBtn = divTableResponsive.nextElementSibling;
		if (divBtn && divBtn.classList.contains('action_multiple_buttons')) {
			return isJquery ? jQuery(divBtn) : divBtn;
		}
		divBtn = divTableResponsive.parentElement?.parentElement?.parentElement?.nextElementSibling;
		if (divBtn && divBtn.classList.contains('action_multiple_buttons')) {
			return isJquery ? jQuery(divBtn) : divBtn;
		}
		return null;
	}

	static showButtonsAction(table) {
		table = toEl(table);
		if (!table) {
			return;
		}
		
		const divBtn = MultipleActionInTable.getDivBtn(table);
		if (divBtn == null) {
			return;
		}

		const nbItems = table.querySelectorAll('input.action_multiple_checkbox:checked').length;
		const isHidden = divBtn.classList.contains('hide');
		const isVisible = !isHidden;

		if (nbItems > 0 && isHidden) {
			divBtn.classList.remove('hide');
		}
		// 13/04/2021 : si le tableau est caché cela veut dire qu'il est en train de s'initialiser (après avoir chargé les données) et donc s'il n'y a pas de ligne sélectionnées, on cache la div buttons
		else if ((nbItems === 0 && isVisible) || (nbItems === 0 && table.classList.contains('hide'))) {
			divBtn.classList.add('hide');
		}

		// affichage aucune action possible si aucun bouton n'est visible
		if (!divBtn.classList.contains('hide')) {
			divBtn.querySelectorAll('span.no_button').forEach(el => el.remove());
			if (divBtn.querySelectorAll('button:not(.hide), a:not(.hide)').length === 0) {
				const img = divBtn.querySelector('img');
				if (img) {
					img.insertAdjacentHTML('afterend', '<span class="no_button"><em>aucune action possible</em></span>');
				}
			}
		}
	}

}

class MultipleActionInDivList {
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

		// Si aucune div sélectionnable, on n'applique pas le plugin
		if (!contentDiv.querySelectorAll('.multiple_action').length) {
			return;
		}

		if (!buttonsDiv.dataset.action_multiple_buttons_initialized) {
			buttonsDiv.insertAdjacentHTML('afterbegin', '<img src="'+imgArrow+'" alt="" /> &nbsp;');
			buttonsDiv.insertAdjacentHTML('beforeend', '<br/><br/>');
			buttonsDiv.dataset.action_multiple_buttons_initialized = '1';
		}

		// Ajout checkbox pour chaque div sélectionnable
		contentDiv.querySelectorAll('.multiple_action').forEach(div => {
			if (!div.querySelector('div.multi_select')) {
				div.insertAdjacentHTML('afterbegin', '<div class="multi_select float-start me-2"><input type="checkbox" class="action_multiple_checkbox" name="'+div.dataset.action_multiple_input_name+'" value="'+div.dataset.action_multiple_item_id+'"></div>');
			}
		});

		// Ajout checkbox select all
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
		// 13/04/2021 : si le tableau est caché cela veut dire qu'il est en train de s'initialiser (après avoir chargé les données) et donc s'il n'y a pas de ligne sélectionnées, on cache la div buttons
		else if ((nbItems === 0 && isVisible) || (nbItems === 0 && contentDiv.classList.contains('hide'))) {
			buttonsDiv.classList.add('hide');
		}

		// affichage aucune action possible si aucun bouton n'est visible
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

export { MultipleActionInTable, MultipleActionInDivList };