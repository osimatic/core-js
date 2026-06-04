/**
 * @jest-environment jsdom
 */
import { DetailsSubArray } from '../details_sub_array.js';
import { HTTPClient } from '../http_client.js';

function setupTable(nbLinks = 1) {
	document.body.innerHTML = `
		<table>
			<thead>
				<tr>
					<th>Col1</th><th>Col2</th><th>Col3</th><th>Col4</th><th>Col5</th>
				</tr>
			</thead>
			<tbody>
				${Array.from({ length: nbLinks }, (_, i) => `
				<tr id="tr${i}">
					<td><a class="details_link hide" data-url_details="http://example.com/details/${i}">Details</a></td>
				</tr>`).join('')}
			</tbody>
		</table>
	`;
	return document.querySelector('table');
}

describe('DetailsSubArray', () => {
	beforeEach(() => {
		jest.spyOn(HTTPClient, 'request').mockImplementation(() => {});
	});

	afterEach(() => {
		jest.restoreAllMocks();
		document.body.innerHTML = '';
	});

	describe('initDetailsLink', () => {
		test('should initialize details links and remove hide class', () => {
			const table = setupTable();
			DetailsSubArray.initDetailsLink(table);

			const link = table.querySelector('a.details_link');
			expect(link.classList.contains('hide')).toBe(false);
		});

		test('should show plus button initially', () => {
			const table = setupTable();
			DetailsSubArray.initDetailsLink(table);

			const link = table.querySelector('a.details_link');
			expect(link.innerHTML).toContain('glyphicon-plus');
		});

		test('should set showDetailsLabel as title initially', () => {
			const table = setupTable();
			DetailsSubArray.initDetailsLink(table, { showDetailsLabel: 'Show details' });

			const link = table.querySelector('a.details_link');
			expect(link.title).toBe('Show details');
		});

		test('should make HTTP request when link is clicked', () => {
			const table = setupTable();
			DetailsSubArray.initDetailsLink(table);

			const link = table.querySelector('a.details_link');
			link.click();

			expect(HTTPClient.request).toHaveBeenCalledWith(
				'GET',
				'http://example.com/details/0',
				null,
				expect.any(Function),
				expect.any(Function)
			);
		});

		test('should disable link while loading', () => {
			HTTPClient.request.mockImplementation(() => {
				// Don't call callbacks — simulate loading state
			});

			const table = setupTable();
			DetailsSubArray.initDetailsLink(table);

			const link = table.querySelector('a.details_link');
			link.click();

			expect(link.disabled).toBe(true);
		});

		test('should show loading row while request is pending', () => {
			HTTPClient.request.mockImplementation(() => {});

			const table = setupTable();
			DetailsSubArray.initDetailsLink(table);

			const link = table.querySelector('a.details_link');
			const tr = link.closest('tr');
			link.click();

			const loadingRow = tr.nextElementSibling;
			expect(loadingRow).not.toBeNull();
			expect(loadingRow.classList.contains('waiting_icon')).toBe(true);
		});

		test('should call success callback with JSON response', () => {
			const jsonResponse = { items: ['item1', 'item2'] };
			const successCallback = jest.fn(() => '<div>Details</div>');

			HTTPClient.request.mockImplementation((method, url, data, successCb) => {
				successCb(jsonResponse);
			});

			const table = setupTable();
			DetailsSubArray.initDetailsLink(table, { onSuccess: successCallback });

			const link = table.querySelector('a.details_link');
			link.click();

			expect(successCallback).toHaveBeenCalledWith(jsonResponse, link);
		});

		test('should show details row after successful request', () => {
			HTTPClient.request.mockImplementation((method, url, data, successCb) => {
				successCb({ data: 'test' });
			});

			const table = setupTable();
			DetailsSubArray.initDetailsLink(table, { onSuccess: jest.fn(() => '<div class="content">Details</div>') });

			const link = table.querySelector('a.details_link');
			const tr = link.closest('tr');
			link.click();

			const detailsRow = tr.nextElementSibling;
			expect(detailsRow).not.toBeNull();
			expect(detailsRow.classList.contains('participants')).toBe(true);
		});

		test('should show minus button after successful request', () => {
			HTTPClient.request.mockImplementation((method, url, data, successCb) => {
				successCb({ data: 'test' });
			});

			const table = setupTable();
			DetailsSubArray.initDetailsLink(table, { onSuccess: jest.fn(() => '') });

			const link = table.querySelector('a.details_link');
			link.click();

			expect(link.innerHTML).toContain('glyphicon-minus');
		});

		test('should set hideDetailsLabel as title after loading', () => {
			HTTPClient.request.mockImplementation((method, url, data, successCb) => {
				successCb({ data: 'test' });
			});

			const table = setupTable();
			DetailsSubArray.initDetailsLink(table, {
				onSuccess: jest.fn(() => ''),
				hideDetailsLabel: 'Hide details',
			});

			const link = table.querySelector('a.details_link');
			link.click();

			expect(link.title).toBe('Hide details');
		});

		test('should hide details row when clicking minus button', () => {
			HTTPClient.request.mockImplementation((method, url, data, successCb) => {
				successCb({ data: 'test' });
			});

			const table = setupTable();
			DetailsSubArray.initDetailsLink(table, { onSuccess: jest.fn(() => '<div>Details</div>') });

			const link = table.querySelector('a.details_link');
			const tr = link.closest('tr');
			link.click(); // open
			expect(tr.nextElementSibling?.classList.contains('participants')).toBe(true);

			link.click(); // close
			expect(tr.nextElementSibling?.classList.contains('participants')).toBeFalsy();
		});

		test('should display error row when response is null with no error callback', () => {
			HTTPClient.request.mockImplementation((method, url, data, successCb) => {
				successCb(null);
			});

			const table = setupTable();
			DetailsSubArray.initDetailsLink(table);

			const link = table.querySelector('a.details_link');
			const tr = link.closest('tr');
			link.click();

			expect(tr.nextElementSibling).not.toBeNull();
			expect(tr.nextElementSibling.classList.contains('text-error')).toBe(true);
		});

		test('should display error row when HTTP request fails with no error callback', () => {
			HTTPClient.request.mockImplementation((method, url, data, successCb, errorCb) => {
				errorCb();
			});

			const table = setupTable();
			DetailsSubArray.initDetailsLink(table);

			const link = table.querySelector('a.details_link');
			const tr = link.closest('tr');
			link.click();

			expect(tr.nextElementSibling).not.toBeNull();
			expect(tr.nextElementSibling.classList.contains('error')).toBe(true);
		});

		test('should call error callback when response is null', () => {
			const errorCallback = jest.fn();

			HTTPClient.request.mockImplementation((method, url, data, successCb) => {
				successCb(null);
			});

			const table = setupTable();
			DetailsSubArray.initDetailsLink(table, { onError: errorCallback });

			const link = table.querySelector('a.details_link');
			link.click();

			expect(errorCallback).toHaveBeenCalledWith(link);
		});

		test('should call error callback on HTTP error', () => {
			const errorCallback = jest.fn();

			HTTPClient.request.mockImplementation((method, url, data, successCb, errorCb) => {
				errorCb();
			});

			const table = setupTable();
			DetailsSubArray.initDetailsLink(table, { onError: errorCallback });

			const link = table.querySelector('a.details_link');
			link.click();

			expect(errorCallback).toHaveBeenCalledWith(link);
		});

		test('should use before send callback instead of HTTP request', () => {
			const beforeSendCallback = jest.fn(() => '<div>Immediate content</div>');

			const table = setupTable();
			DetailsSubArray.initDetailsLink(table, { onBeforeSend: beforeSendCallback });

			const link = table.querySelector('a.details_link');
			link.click();

			expect(beforeSendCallback).toHaveBeenCalledWith(link);
			expect(HTTPClient.request).not.toHaveBeenCalled();
		});

		test('should show details row when using before send callback', () => {
			const table = setupTable();
			DetailsSubArray.initDetailsLink(table, { onBeforeSend: jest.fn(() => '<div>Immediate</div>') });

			const link = table.querySelector('a.details_link');
			const tr = link.closest('tr');
			link.click();

			const detailsRow = tr.nextElementSibling;
			expect(detailsRow).not.toBeNull();
			expect(detailsRow.classList.contains('participants')).toBe(true);
		});

		test('should handle multiple links independently', () => {
			const table = setupTable(2);
			DetailsSubArray.initDetailsLink(table);

			const links = table.querySelectorAll('a.details_link');
			expect(links.length).toBe(2);
			links.forEach(link => {
				expect(link.innerHTML).toContain('glyphicon-plus');
				expect(link.classList.contains('hide')).toBe(false);
			});
		});

		test('should use colspan matching number of columns', () => {
			HTTPClient.request.mockImplementation((method, url, data, successCb) => {
				successCb(null);
			});

			const table = setupTable();
			DetailsSubArray.initDetailsLink(table);

			const link = table.querySelector('a.details_link');
			const tr = link.closest('tr');
			link.click();

			const errorRow = tr.nextElementSibling;
			expect(errorRow.querySelector('td').getAttribute('colspan')).toBe('5');
		});

		test('should use custom error label', () => {
			HTTPClient.request.mockImplementation((method, url, data, successCb) => {
				successCb(null);
			});

			const table = setupTable();
			DetailsSubArray.initDetailsLink(table, { labelErrorOccurred: 'Custom error' });

			const link = table.querySelector('a.details_link');
			const tr = link.closest('tr');
			link.click();

			const errorRow = tr.nextElementSibling;
			expect(errorRow.textContent).toContain('Custom error');
		});
	});
});