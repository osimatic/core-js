/**
 * @jest-environment jsdom
 */
import { jest } from '@jest/globals';
import { Pagination } from '../../table/Pagination.js';

function makeItems(n) {
	return Array.from({ length: n }, (_, i) => {
		const el = document.createElement('div');
		el.textContent = 'Item ' + i;
		document.body.appendChild(el);
		return el;
	});
}

function setupDiv(nbItems = 5, hasPaginationLinks = false) {
	const div = document.createElement('div');
	if (hasPaginationLinks) {
		const pl = document.createElement('div');
		pl.className = 'pagination_links';
		div.appendChild(pl);
	}
	for (let i = 0; i < nbItems; i++) {
		const item = document.createElement('div');
		item.className = 'pagination_item';
		div.appendChild(item);
	}
	document.body.appendChild(div);
	return div;
}

function setupTable(nbRows = 5, maxRows = 10) {
	const table = document.createElement('table');
	table.dataset.max_rows = String(maxRows);
	const tbody = document.createElement('tbody');
	for (let i = 0; i < nbRows; i++) {
		const tr = document.createElement('tr');
		tr.innerHTML = '<td>Row ' + i + '</td>';
		tbody.appendChild(tr);
	}
	table.appendChild(tbody);
	document.body.appendChild(table);
	return table;
}

function setupSelect(opts = {}) {
	const select = document.createElement('select');
	if (opts.nb_rows_list != null) select.dataset.nb_rows_list = opts.nb_rows_list;
	if (opts.default_nb_rows != null) select.dataset.default_nb_rows = String(opts.default_nb_rows);
	document.body.appendChild(select);
	return select;
}

afterEach(() => {
	document.body.innerHTML = '';
	jest.clearAllMocks();
	delete global.bootstrap;
});

describe('Pagination', () => {

	describe('paginateCards', () => {
		test('should call paginate with correct parameters', () => {
			const div = setupDiv(5);
			const spy = jest.spyOn(Pagination, 'paginate').mockImplementation(() => {});

			Pagination.paginateCards(div, 10);

			expect(spy).toHaveBeenCalledWith(div, expect.anything(), 10, null);
			spy.mockRestore();
		});

		test('should pass pagination_item elements as items', () => {
			const div = setupDiv(3);
			const spy = jest.spyOn(Pagination, 'paginate').mockImplementation(() => {});

			Pagination.paginateCards(div, 5);

			const items = spy.mock.calls[0][1];
			expect(items.length).toBe(3);
			spy.mockRestore();
		});
	});

	describe('paginateTable', () => {
		test('should call paginate with table rows', () => {
			const table = setupTable(5, 10);
			const spy = jest.spyOn(Pagination, 'paginate').mockImplementation(() => {});

			Pagination.paginateTable(table);

			expect(spy).toHaveBeenCalledWith(table, expect.anything(), 10, null);
			spy.mockRestore();
		});

		test('should pass visible tbody rows as items', () => {
			const table = setupTable(4, 10);
			const spy = jest.spyOn(Pagination, 'paginate').mockImplementation(() => {});

			Pagination.paginateTable(table);

			const items = spy.mock.calls[0][1];
			expect(items.length).toBe(4);
			spy.mockRestore();
		});

		test('should pass select when provided', () => {
			const table = setupTable(5, 10);
			const select = setupSelect();
			const spy = jest.spyOn(Pagination, 'paginate').mockImplementation(() => {});

			Pagination.paginateTable(table, select);

			expect(spy).toHaveBeenCalledWith(table, expect.anything(), 10, select);
			spy.mockRestore();
		});
	});

	describe('paginate', () => {
		test('should return early if div is undefined', () => {
			expect(() => Pagination.paginate(undefined, [], 10)).not.toThrow();
		});

		test('should return early if div is null', () => {
			expect(() => Pagination.paginate(null, [], 10)).not.toThrow();
		});

		test('should initialize select with options when empty', () => {
			const div = setupDiv(0);
			const select = setupSelect({ nb_rows_list: '5,10,25,50' });

			Pagination.paginate(div, [], 10, select);

			expect(select.options.length).toBe(5); // 'Afficher tout' + 4 options
			expect(select.options[0].textContent).toBe('Afficher tout');
			expect(select.options[0].value).toBe('0');
		});

		test('should use custom labelDisplayAll', () => {
			const div = setupDiv(0);
			const select = setupSelect();

			Pagination.paginate(div, [], 10, select, 'Show all');

			expect(select.options[0].textContent).toBe('Show all');
		});

		test('should set default value when data-default_nb_rows is present', () => {
			const div = setupDiv(0);
			const select = setupSelect({ nb_rows_list: '5,10,25,50', default_nb_rows: 10 });

			Pagination.paginate(div, [], 10, select);

			expect(select.value).toBe('10');
		});

		test('should not re-initialize select if already has options', () => {
			const div = setupDiv(0);
			const select = setupSelect({ nb_rows_list: '5,10,25,50' });

			Pagination.paginate(div, [], 10, select);
			const optCount = select.options.length;
			Pagination.paginate(div, [], 10, select);

			expect(select.options.length).toBe(optCount);
		});

		test('should always initialize both top and bottom pagination', () => {
			const div = setupDiv(0);
			const spy = jest.spyOn(Pagination, 'initPaginationDiv').mockImplementation(() => {});

			Pagination.paginate(div, [], 10);

			expect(spy).toHaveBeenCalledTimes(2);
			expect(spy).toHaveBeenCalledWith(div, true);
			expect(spy).toHaveBeenCalledWith(div, false);
			spy.mockRestore();
		});

		test('should remove existing pagination ULs before re-rendering', () => {
			const div = setupDiv(0);
			const staleUl = document.createElement('ul');
			staleUl.className = 'pagination';
			document.body.appendChild(staleUl);

			const spy = jest.spyOn(Pagination, 'initPaginationDiv').mockImplementation(() => {});
			Pagination.paginate(div, [], 10);

			expect(document.querySelectorAll('ul.pagination').length).toBe(0);
			spy.mockRestore();
		});
	});

	describe('initPaginationDiv', () => {
		test('should create a pagination ul element', () => {
			const div = setupDiv(0);
			Pagination.initPaginationDiv(div, false);
			expect(document.querySelector('ul.pagination')).not.toBeNull();
		});

		test('should insert ul after div when onTop is false and no pagination_links', () => {
			const div = setupDiv(0);
			Pagination.initPaginationDiv(div, false);
			expect(div.nextElementSibling.tagName).toBe('UL');
			expect(div.nextElementSibling.classList.contains('pagination')).toBe(true);
		});

		test('should insert ul before div when onTop is true and no pagination_links', () => {
			const div = setupDiv(0);
			Pagination.initPaginationDiv(div, true);
			expect(div.previousElementSibling.tagName).toBe('UL');
			expect(div.previousElementSibling.classList.contains('pagination')).toBe(true);
		});

		test('should append ul to pagination_links when onTop is false', () => {
			const div = setupDiv(0, true);
			const paginationLinks = div.querySelector('.pagination_links');

			Pagination.initPaginationDiv(div, false);

			expect(paginationLinks.lastElementChild.tagName).toBe('UL');
		});

		test('should prepend ul to pagination_links when onTop is true', () => {
			const div = setupDiv(0, true);
			const paginationLinks = div.querySelector('.pagination_links');

			Pagination.initPaginationDiv(div, true);

			expect(paginationLinks.firstElementChild.tagName).toBe('UL');
		});
	});

	describe('initPaginationItems', () => {
		function setupPaginationUls(n = 2) {
			const uls = [];
			for (let i = 0; i < n; i++) {
				const ul = document.createElement('ul');
				ul.className = 'pagination';
				document.body.appendChild(ul);
				uls.push(ul);
			}
			return uls;
		}

		test('should show items up to maxItems', () => {
			setupPaginationUls();
			const items = makeItems(5);

			Pagination.initPaginationItems(items, 3);

			expect(items[0].style.display).toBe('');
			expect(items[1].style.display).toBe('');
			expect(items[2].style.display).toBe('');
			expect(items[3].style.display).toBe('none');
			expect(items[4].style.display).toBe('none');
		});

		test('should show all items when maxItems is 0', () => {
			setupPaginationUls();
			const items = makeItems(5);

			Pagination.initPaginationItems(items, 0);

			items.forEach(item => expect(item.style.display).toBe(''));
		});

		test('should hide pagination when maxItems is 0', () => {
			const [ul] = setupPaginationUls(1);
			const items = makeItems(5);

			Pagination.initPaginationItems(items, 0);

			expect(ul.classList.contains('hide')).toBe(true);
		});

		test('should hide pagination when totalItems < maxItems', () => {
			const [ul] = setupPaginationUls(1);
			const items = makeItems(5);

			Pagination.initPaginationItems(items, 10);

			expect(ul.classList.contains('hide')).toBe(true);
		});

		test('should create page items when totalItems >= maxItems', () => {
			const [ul] = setupPaginationUls(1);
			const items = makeItems(25);

			Pagination.initPaginationItems(items, 10);

			const pages = ul.querySelectorAll('li.page-item');
			expect(pages.length).toBe(3); // ceil(25/10) = 3
		});

		test('should show pagination when pages are created', () => {
			const [ul] = setupPaginationUls(1);
			const items = makeItems(25);

			Pagination.initPaginationItems(items, 10);

			expect(ul.classList.contains('hide')).toBe(false);
		});

		test('should set first page as active', () => {
			const [ul] = setupPaginationUls(1);
			const items = makeItems(25);

			Pagination.initPaginationItems(items, 10);

			expect(ul.querySelector('li:first-child').classList.contains('active')).toBe(true);
		});

		test('should set data-page attribute on page items', () => {
			const [ul] = setupPaginationUls(1);
			const items = makeItems(25);

			Pagination.initPaginationItems(items, 10);

			expect(ul.querySelector('li[data-page="1"]')).not.toBeNull();
			expect(ul.querySelector('li[data-page="2"]')).not.toBeNull();
			expect(ul.querySelector('li[data-page="3"]')).not.toBeNull();
		});

		test('should sync pages across multiple pagination uls', () => {
			const uls = setupPaginationUls(2);
			const items = makeItems(20);

			Pagination.initPaginationItems(items, 10);

			uls.forEach(ul => expect(ul.querySelectorAll('li').length).toBe(2));
		});

		test('should clear existing li items before adding new ones', () => {
			const [ul] = setupPaginationUls(1);
			ul.innerHTML = '<li>stale</li>';
			const items = makeItems(25);

			Pagination.initPaginationItems(items, 10);

			const liTexts = [...ul.querySelectorAll('li')].map(l => l.textContent.trim());
			expect(liTexts).not.toContain('stale');
		});

		test('should show correct items on page click', () => {
			setupPaginationUls(1);
			const items = makeItems(25);

			Pagination.initPaginationItems(items, 10);

			// Click page 2
			const page2 = document.querySelector('li[data-page="2"]');
			page2.click();

			// Items 11-20 (index 10-19) should be visible, others hidden
			expect(items[9].style.display).toBe('none');  // item 10 (page 1)
			expect(items[10].style.display).toBe('');      // item 11 (page 2)
			expect(items[19].style.display).toBe('');      // item 20 (page 2)
			expect(items[20].style.display).toBe('none'); // item 21 (page 3)
		});

		test('should mark clicked page as active and deactivate others', () => {
			const [ul] = setupPaginationUls(1);
			const items = makeItems(25);

			Pagination.initPaginationItems(items, 10);

			document.querySelector('li[data-page="2"]').click();

			expect(ul.querySelector('li[data-page="1"]').classList.contains('active')).toBe(false);
			expect(ul.querySelector('li[data-page="2"]').classList.contains('active')).toBe(true);
		});
	});
});