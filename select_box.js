const TomSelect = require('tom-select').default;
const { toEl } = require('./util');

// Plugin: select-all / deselect-all (for multiple selects with data-actions-box)
TomSelect.define('actions_box', function() {
	const self = this;
	let injected = false;
	this.on('dropdown_open', function(dropdown) {
		if (injected) {
			return;
		}
		injected = true;
		const div = document.createElement('div');
		div.className = 'ts-actions-box d-flex gap-1 p-1 border-bottom';
		div.innerHTML = ''
			+ '<button type="button" class="btn btn-sm btn-outline-secondary flex-fill">Tout s\u00e9lectionner</button>'
			+ '<button type="button" class="btn btn-sm btn-outline-secondary flex-fill">Tout d\u00e9s\u00e9lectionner</button>';
		div.children[0].addEventListener('mousedown', e => {
			e.preventDefault();
			Object.keys(self.options).forEach(v => { if (!self.options[v].disabled) self.addItem(v, true); });
			self.refreshItems();
		});
		div.children[1].addEventListener('mousedown', e => { e.preventDefault(); self.clear(true); });
		dropdown.insertBefore(div, dropdown.firstChild);
	});
});

class SelectBox {

	/**
	 * Initialize Tom Select on a select element.
	 * Reads data attributes from the element to configure the instance.
	 * If already initialized, syncs options instead.
	 * @param {HTMLElement|jQuery} el
	 * @returns {TomSelect|null}
	 */
	static init(el) {
		el = toEl(el);
		if (!el) {
			return null;
		}

		if (el.tomselect) {
			SelectBox.refresh(el);
			return el.tomselect;
		}

		const isMultiple = el.multiple;
		const searchDisabled = el.dataset.search === 'false';
		
		const plugins = [];
		if (isMultiple && (el.dataset.actionsBox || el.dataset.actions_box)) {
			plugins.push('actions_box');
		}
		if (!isMultiple && el.dataset.allowClear !== 'false' && el.dataset.allow_clear !== 'false') {
			plugins.push('clear_button');
		}
		if (isMultiple) {
			plugins.push('remove_button');
		}
		if (!isMultiple && !searchDisabled && el.dataset.dropdownInput !== 'false' && el.dataset.dropdown_input !== 'false') {
			plugins.push('dropdown_input');
		}

		const placeholder = el.getAttribute('title') || 'Choisissez\u2026';
		const maxOptions = el.dataset.maxOptions ?? el.dataset.max_options ?? null;

		const ts = new TomSelect(el, {
			maxOptions: maxOptions !== null ? parseInt(maxOptions, 10) : null,
			allowEmptyOption: !isMultiple,
			placeholder: placeholder,
			plugins,
			wrapperClass: 'ts-wrapper' + (isMultiple ? ' multi' : ' single form-select'),
			onItemAdd: isMultiple ? undefined : function() { this.setTextboxValue(''); this.blur(); },
			...(searchDisabled ? { controlInput: null } : {}),
			render: {
				// Use data-content attribute (set e.g. by Country.fillSelectWithFlags) as raw HTML
				// for both the dropdown option and the selected item display.
				option: (data, escape) => data.content
					? '<div>' + data.content + '</div>'
					: '<div>' + escape(data.text) + '</div>',
				item: (data, escape) => data.content
					? '<div>' + data.content + '</div>'
					: '<div>' + escape(data.text) + '</div>',
			},
		});

		if (!isMultiple && !el.querySelector('option[selected]')) {
			ts.clear(true);
		}

		// Keep placeholder in the control, not in the dropdown search input
		if (plugins.includes('dropdown_input')) {
			const dropdownInput = ts.dropdown.querySelector('input');
			if (dropdownInput) {
				dropdownInput.placeholder = el.dataset.searchPlaceholder ?? el.dataset.search_placeholder ?? '';
			}
		}

		// When search is disabled, Tom Select omits .items-placeholder — inject it manually
		if (searchDisabled && !isMultiple) {
			const placeholderEl = document.createElement('input');
			placeholderEl.className = 'items-placeholder';
			placeholderEl.placeholder = placeholder;
			placeholderEl.readOnly = true;
			placeholderEl.tabIndex = -1;
			ts.control.appendChild(placeholderEl);
			const syncPlaceholder = () => {
				if (ts.getValue()) {
					placeholderEl.remove();
				} else if (!ts.control.contains(placeholderEl)) {
					ts.control.appendChild(placeholderEl);
				}
			};
			syncPlaceholder();
			ts.on('change', syncPlaceholder);
		}

		if ((el.dataset.hide_if_empty || el.dataset.hideIfEmpty)) {
			SelectBox._checkHideIfEmpty(ts);
		}

		return ts;
	}

	static reset(el) {
		el = toEl(el);
		if (!el) {
			return;
		}
		const tsWrapper = el.nextElementSibling;
		if (!el.tomselect && tsWrapper && tsWrapper.classList.contains('ts-wrapper')) {
			tsWrapper.remove();
			el.classList.remove('ts-hidden-accessible', 'tomselected');
		}
		SelectBox.init(el);
	}

	static resetAll(container) {
		container = toEl(container);
		container.querySelectorAll('select.ts-select').forEach(el => SelectBox.reset(el));
	}

	/**
	 * Sync Tom Select options for all ts-select elements inside a container.
	 * @param {HTMLElement|jQuery} container
	 */
	static refreshAll(container) {
		container = toEl(container);
		if (!container) {
			return;
		}

		container.querySelectorAll('select.ts-select').forEach(el => SelectBox.refresh(el));
	}

	/**
	 * Sync Tom Select options from the underlying <select> element.
	 * @param {HTMLElement|jQuery} el
	 */
	static refresh(el) {
		const ts = SelectBox.getInstance(el);
		if (!ts) {
			return;
		}

		const rawVal = ts.getValue();
		const prevVal = Array.isArray(rawVal) ? [...rawVal] : rawVal;
		el = toEl(el);

		// Tom Select's updateOriginalInput() inserts <option value=""> (no text, selected) into
		// the DOM when nothing is selected in single mode. With allowEmptyOption: true, sync()
		// would read it back, add it to the option store as selected, display a blank first item
		// in the dropdown, and suppress the placeholder. Remove it before sync() if it has no
		// text content (auto-generated). Intentional "none" options (e.g. "- Aucun -") are kept.
		if (ts.settings.mode === 'single') {
			const emptyOption = el ? el.querySelector('option[value=""]') : null;
			if (emptyOption && !emptyOption.textContent.trim()) {
				emptyOption.remove();
			}
		}

		ts.sync();
		// sync() with allowEmptyOption: true may re-add the auto-generated empty option to the store.
		// Remove it if it has no text (auto-generated); intentional empty options (e.g. "- Aucun -") are kept.
		if (ts.settings.mode === 'single' && '' in ts.options && !ts.options[''].text?.trim()) {
			ts.removeOption('');
		}
		if (prevVal && prevVal !== '' && !(Array.isArray(prevVal) && prevVal.length === 0)) {
			ts.setValue(prevVal, true); // restore selection, ignore values not in options
		}
		else {
			// When there was no previous selection, honor option[selected] set before refresh()
			// (e.g. by updateSelectEmployeeCompanyTask, which appends options with selected="selected").
			// Use hasAttribute('selected') — not o.selected — to distinguish an explicit selection from
			// the browser's implicit default (first option has .selected=true by default but no attribute).
			const selectedValues = el
				? [...el.options].filter(o => o.hasAttribute('selected') && o.value !== '').map(o => o.value)
				: [];
			selectedValues.length > 0 ? ts.setValue(selectedValues, true) : ts.clear(true);
		}
		if (el && (el.dataset.hide_if_empty || el.dataset.hideIfEmpty)) {
			SelectBox._checkHideIfEmpty(ts);
		}
	}

	/**
	 * Set the selected value(s). Pass null/undefined/'' to clear.
	 * @param {HTMLElement|jQuery} el
	 * @param {string|string[]|null} val
	 */
	static setValue(el, val) {
		el = toEl(el);
		if (!el) {
			return;
		}

		const ts = el.tomselect;
		if (!ts) {
			el.value = (val === null || val === undefined) ? '' : val;
			return;
		}

		if (val === null || val === undefined || val === '') {
			ts.clear();
		}
		else {
			ts.setValue(val);
		}
	}

	/**
	 * Clear the selected value(s).
	 * @param {HTMLElement|jQuery} el
	 */
	static clear(el) {
		el = toEl(el);
		if (!el) {
			return;
		}

		if (el.tomselect) {
			el.tomselect.clear(true);
		}
		else {
			el.value = '';
		}
	}

	/**
	 * Destroy the Tom Select instance and restore the original <select>.
	 * @param {HTMLElement|jQuery} el
	 */
	static destroy(el) {
		const ts = SelectBox.getInstance(el);
		if (!ts) {
			return;
		}

		ts.destroy();
	}

	static getInstance(el) {
		return toEl(el)?.tomselect ?? null;
	}

	static _checkHideIfEmpty(ts) {
		const hasOptions = Object.keys(ts.options).filter(v => v !== '').length > 0;
		ts.wrapper.closest('.form-group')?.classList.toggle('hide', !hasOptions);
	}
}

module.exports = { SelectBox };