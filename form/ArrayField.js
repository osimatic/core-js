import { toEl, toJquery } from '../utils/util.js';

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

export { ArrayField };
