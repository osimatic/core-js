import { toEl } from '../utils/util.js';

export class MultipleActionInTable {

	// Adds the select columns (thead th + tbody td) to the DOM.
	// Idempotent: no effect if the columns already exist.
	// Must be called BEFORE the DataTable initialization.
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

	// Initializes the columns (via initCols) then attaches the event handlers.
	// Can be called after the DataTable initialization.
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

		// Delegation on the table (and not on each checkbox): with DataTables pagination, rows outside the current page
		// are detached then re-inserted into the DOM, so a re-appearing checkbox would never have received its direct listener.
		if (!table.dataset.action_multiple_bound) {
			table.addEventListener('change', (e) => {
				if (e.target.matches('input.action_multiple_checkbox')) {
					MultipleActionInTable.updateCheckbox(table);
				}
			});
			table.dataset.action_multiple_bound = '1';
		}

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
		// 13/04/2021: if the table is hidden, it means it is being initialized (after loading the data), so if no rows are selected, we hide the buttons div
		else if ((nbItems === 0 && isVisible) || (nbItems === 0 && table.classList.contains('hide'))) {
			divBtn.classList.add('hide');
		}

		// display no action possible if no button is visible
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
