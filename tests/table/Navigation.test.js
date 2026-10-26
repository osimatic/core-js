/**
 * @jest-environment jsdom
 */
import { jest } from '@jest/globals';
import { Navigation } from '../../table/Navigation.js';
import { UrlAndQueryString } from '../../network/UrlAndQueryString.js';

function setupNav() {
	document.body.innerHTML = `
		<div>
			<ul class="nav">
				<a class="nav-link active" href="#tab1">Tab 1</a>
				<a class="nav-link" href="#tab2">Tab 2</a>
			</ul>
			<div class="tab-content">
				<div id="tab1" class="active show">Content 1</div>
				<div id="tab2">Content 2</div>
			</div>
		</div>`;
	return {
		link1: document.querySelector('a[href="#tab1"]'),
		link2: document.querySelector('a[href="#tab2"]'),
		pane1: document.getElementById('tab1'),
		pane2: document.getElementById('tab2'),
	};
}

afterEach(() => {
	document.body.innerHTML = '';
	jest.clearAllMocks();
	delete global.bootstrap;
});

describe('Navigation', () => {

	describe('activateTab', () => {
		test('should add active class to clicked link', () => {
			const { link2 } = setupNav();

			Navigation.activateTab(link2);

			expect(link2.classList.contains('active')).toBe(true);
		});

		test('should remove active class from other nav links', () => {
			const { link1, link2 } = setupNav();

			Navigation.activateTab(link2);

			expect(link1.classList.contains('active')).toBe(false);
		});

		test('should show the corresponding tab pane', () => {
			const { link2, pane2 } = setupNav();

			Navigation.activateTab(link2);

			expect(pane2.classList.contains('active')).toBe(true);
			expect(pane2.classList.contains('show')).toBe(true);
		});

		test('should hide other tab panes', () => {
			const { link2, pane1 } = setupNav();

			Navigation.activateTab(link2);

			expect(pane1.classList.contains('active')).toBe(false);
			expect(pane1.classList.contains('show')).toBe(false);
		});

		test('should only process links with # href', () => {
			// Add a link with external href to ensure it is skipped
			const { link2 } = setupNav();
			const externalLink = document.createElement('a');
			externalLink.className = 'nav-link';
			externalLink.href = 'http://example.com';
			document.querySelector('.nav').appendChild(externalLink);

			expect(() => Navigation.activateTab(link2)).not.toThrow();
		});
	});

	describe('showTab', () => {
		test('should return early if bootstrap is undefined', () => {
			const { link1 } = setupNav();
			delete global.bootstrap;

			expect(() => Navigation.showTab(link1)).not.toThrow();
		});

		test('should create and show bootstrap tab when available', () => {
			const { link1 } = setupNav();
			const mockTab = { show: jest.fn() };
			global.bootstrap = { Tab: jest.fn(() => mockTab) };

			Navigation.showTab(link1);

			expect(global.bootstrap.Tab).toHaveBeenCalledWith(link1);
			expect(mockTab.show).toHaveBeenCalled();
		});
	});

	describe('addTabInHistory', () => {
		let setParamOfUrlSpy;

		beforeEach(() => {
			setParamOfUrlSpy = jest.spyOn(UrlAndQueryString, 'setParamOfUrl').mockImplementation((key, value, url) => `${url}&${key}=${value}`);
			jest.spyOn(window.history, 'replaceState').mockImplementation(() => {});
			jest.spyOn(window.history, 'pushState').mockImplementation(() => {});
		});

		afterEach(() => {
			setParamOfUrlSpy.mockRestore();
		});

		test('should call UrlAndQueryString.setParamOfUrl with correct parameters', () => {
			Navigation.addTabInHistory('tab1', 'tab', true);

			expect(setParamOfUrlSpy).toHaveBeenCalledWith('tab', 'tab1', expect.any(String));
		});

		test('should use default queryStringKey if not provided', () => {
			Navigation.addTabInHistory('tab1');

			expect(setParamOfUrlSpy).toHaveBeenCalledWith('tab', 'tab1', expect.any(String));
		});

		test('should use replaceState when replace is true', () => {
			Navigation.addTabInHistory('tab1', 'tab', true);

			expect(window.history.replaceState).toHaveBeenCalled();
			expect(window.history.pushState).not.toHaveBeenCalled();
		});

		test('should use pushState when replace is false', () => {
			Navigation.addTabInHistory('tab1', 'tab', false);

			expect(window.history.pushState).toHaveBeenCalled();
			expect(window.history.replaceState).not.toHaveBeenCalled();
		});

		test('should update URL with tab parameter', () => {
			Navigation.addTabInHistory('tab2', 'activeTab', true);

			expect(window.history.replaceState).toHaveBeenCalledWith(
				'',
				expect.any(String),
				expect.stringContaining('activeTab=tab2')
			);
		});
	});
});