import { UrlAndQueryString } from '../network/UrlAndQueryString.js';
import { toEl } from '../utils/util.js';

class Navigation {
	static activateTab(a) {
		a = toEl(a);
		if (!a) {
			return;
		}

		let ulNav = a.closest('.nav');
		if (!ulNav) {
			return;
		}
		let tabContent = ulNav.parentElement.querySelector('.tab-content');

		ulNav.querySelectorAll('a.nav-link').forEach(navLink => {
			navLink.classList.remove('active');
			const id = navLink.getAttribute('href');
			if (id && id.charAt(0) === '#') {
				const pane = tabContent.querySelector(id);
				if (pane) {
					pane.classList.remove('active');
					pane.classList.remove('show');
				}
			}
		});

		a.classList.add('active');
		const targetPane = tabContent.querySelector(a.getAttribute('href'));
		if (targetPane) {
			targetPane.classList.add('active');
			targetPane.classList.add('show');
		}
	}

	static showTab(a) {
		a = toEl(a);
		if (!a || typeof bootstrap == 'undefined') {
			return;
		}

		let tab = new bootstrap.Tab(a);
		tab.show();
	}

	static removeTabFromHistory(queryStringKey='tab') {
		let url = window.location.href;
		url = UrlAndQueryString.deleteParamOfUrl(queryStringKey, url);
		window.history.replaceState('', document.title, url);
	}

	static addTabInHistory(tabId, queryStringKey='tab', replace=true) {
		let url = window.location.href;
		url = UrlAndQueryString.setParamOfUrl(queryStringKey, tabId, url);
		if (replace) {
			window.history.replaceState('', document.title, url);
		}
		else {
			window.history.pushState("", "", url);
		}
	}
}

export { Navigation };
