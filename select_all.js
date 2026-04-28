import { toEl } from './util.js';

class SelectAll {

	// Dans un form-group

	static initLinkInFormGroup(link) {
		link = toEl(link);
		if (!link) {
			return;
		}

		const linkClone = link.cloneNode(true);
		link.parentElement.replaceChild(linkClone, link);
		linkClone.addEventListener('click', function(e) {
			e.preventDefault();
			const formGroup = this.closest('.form-group');
			if (!formGroup) {
				return;
			}
			const allCheckbox = formGroup.querySelectorAll('input[type="checkbox"]:not(.check_all)');
			const allCheckboxChecked = formGroup.querySelectorAll('input[type="checkbox"]:not(.check_all):checked');
			const allCheckboxWithCheckAll = formGroup.querySelectorAll('input[type="checkbox"]');
			const newState = allCheckbox.length !== allCheckboxChecked.length;
			allCheckboxWithCheckAll.forEach(cb => { cb.checked = newState; });
			SelectAll.updateFormGroup(formGroup);
		});

		const formGroup = linkClone.closest('.form-group');
		if (!formGroup) {
			return;
		}
		formGroup.querySelectorAll('input[type="checkbox"]').forEach(cb => {
			cb.addEventListener('change', () => {
				SelectAll.updateFormGroup(cb.closest('.form-group'));
			});
		});
		SelectAll.updateFormGroup(formGroup);
	}

	static updateFormGroup(formGroup) {
		formGroup = toEl(formGroup);
		if (!formGroup) {
			return;
		}

		const allCheckbox = formGroup.querySelectorAll('input[type="checkbox"]:not(.check_all)');
		const allCheckboxChecked = formGroup.querySelectorAll('input[type="checkbox"]:not(.check_all):checked');
		const lienSelectAll = formGroup.querySelector('a.check_all');
		if (!lienSelectAll) {
			return;
		}
		if (allCheckboxChecked.length > 0 && allCheckbox.length === allCheckboxChecked.length) {
			lienSelectAll.textContent = 'Tout désélectionner';
		}
		else {
			lienSelectAll.textContent = 'Tout sélectionner';
		}
	}

	// Dans tableau

	static initInTable(table) {
		table = toEl(table);
		if (!table) {
			return;
		}

		const inputCheckAll = table.querySelector('tr input.check_all');
		if (!inputCheckAll) {
			return;
		}
		const checkAllClone = inputCheckAll.cloneNode(true);
		inputCheckAll.parentElement.replaceChild(checkAllClone, inputCheckAll);
		checkAllClone.addEventListener('click', function() {
			const allCheckbox = table.querySelectorAll('tbody input[type="checkbox"]');
			const allCheckboxChecked = table.querySelectorAll('tbody input[type="checkbox"]:checked');
			const newState = allCheckbox.length !== allCheckboxChecked.length;
			allCheckbox.forEach(cb => { cb.checked = newState; });
			SelectAll.updateTable(table);
		});

		table.querySelectorAll('tbody input[type="checkbox"]').forEach(cb => {
			cb.addEventListener('change', () => {
				SelectAll.updateTable(table);
			});
		});
		SelectAll.updateTable(table);
	}

	static updateTable(table) {
		table = toEl(table);
		if (!table) {
			return;
		}

		const allCheckbox = table.querySelectorAll('tbody input[type="checkbox"]');
		const allCheckboxChecked = table.querySelectorAll('tbody input[type="checkbox"]:checked');
		const checkboxSelectAll = table.querySelector('thead input.check_all');
		if (!checkboxSelectAll) {
			return;
		}
		checkboxSelectAll.checked = allCheckboxChecked.length > 0 && allCheckbox.length === allCheckboxChecked.length;
	}

	// Dans un div

	static initDiv(contentDiv) {
		contentDiv = toEl(contentDiv);
		if (!contentDiv) {
			return;
		}

		contentDiv.querySelectorAll('input.check_all').forEach(inputCheckAll => {
			const div = inputCheckAll.closest('div.checkbox_with_check_all');

			const clone = inputCheckAll.cloneNode(true);
			inputCheckAll.parentElement.replaceChild(clone, inputCheckAll);
			clone.addEventListener('click', function() {
				const d = this.closest('div.checkbox_with_check_all');
				if (!d) {
					return;
				}
				const allCheckbox = d.querySelectorAll('input[type="checkbox"]:not(.check_all)');
				const allCheckboxChecked = d.querySelectorAll('input[type="checkbox"]:not(.check_all):checked');
				const newState = allCheckbox.length !== allCheckboxChecked.length;
				allCheckbox.forEach(cb => { cb.checked = newState; });
				SelectAll.updateDiv(d);
			});

			if (!div) {
				return;
			}
			div.querySelectorAll('div.checkbox input[type="checkbox"], div.form-check input[type="checkbox"]').forEach(cb => {
				cb.addEventListener('change', () => {
					SelectAll.updateDiv(cb.closest('div.checkbox_with_check_all'));
				});
			});
			SelectAll.updateDiv(div);
		});
	}

	static updateDiv(div) {
		div = toEl(div);
		if (!div) {
			return;
		}

		// 22/11/2021 : rajout :not(.check_all) sinon si toutes les cases sont coché, la case select all n'est pas coché à l'initialisation
		const allCheckbox = div.querySelectorAll('div.checkbox input[type="checkbox"]:not(.check_all), div.form-check input[type="checkbox"]:not(.check_all)');
		const allCheckboxChecked = div.querySelectorAll('div.checkbox input[type="checkbox"]:not(.check_all):checked, div.form-check input[type="checkbox"]:not(.check_all):checked');
		const checkboxSelectAll = div.querySelector('input.check_all');
		if (!checkboxSelectAll) {
			return;
		}
		checkboxSelectAll.checked = allCheckboxChecked.length > 0 && allCheckbox.length === allCheckboxChecked.length;
	}
}

export { SelectAll };