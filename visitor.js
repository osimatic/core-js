import { UAParser } from 'ua-parser-js';

class Browser {
	static isOpera() {
		return (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
	}
	static isFirefox() {
		return typeof InstallTrigger !== 'undefined';
	}
	static isSafari() {
		return Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
	}
	static isChrome() {
		return !!window.chrome && !!window.chrome.webstore;
	}
	static isIE() {
		//return window.navigator.userAgent.indexOf("MSIE ") > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./);
		return /*@cc_on!@*/false || !!document.documentMode;
	}
	static isEdge() {
		return !Browser.isIE() && !!window.StyleMedia;
	}
}

class UserAgent {
	static getInfosDisplay(userAgentData, separator=' — ') {
		let components = [];
		if (null !== userAgentData['os']) {
			components.push(userAgentData['os']);
		}
		if (null !== userAgentData['browser']) {
			components.push(userAgentData['browser']);
		}
		if (null !== userAgentData['device']) {
			components.push(userAgentData['device']);
		}
		return components.join(separator);
	}

	static getData(userAgent) {
		const parsedData = UAParser(userAgent);

		let os = null;
		if (typeof parsedData['os']['name'] != 'undefined') {
			os = parsedData['os']['name'];
			if (typeof parsedData['os']['version'] != 'undefined') {
				os += ' '+parsedData['os']['version'];
			}

			os = os.trim();
		}

		let browser = null;
		if (typeof parsedData['browser']['name'] != 'undefined') {
			browser = parsedData['browser']['name'];
			if (typeof parsedData['browser']['major'] != 'undefined') {
				browser += ' '+parsedData['browser']['major'];
			}
			else if (typeof parsedData['browser']['version'] != 'undefined') {
				browser += ' '+parsedData['browser']['version'];
			}

			browser = browser.trim();
		}

		let device = null;
		if (typeof parsedData['device']['type'] != 'undefined') {
			device = parsedData['device']['type'];
			if (typeof parsedData['device']['vendor'] != 'undefined') {
				device += ' '+parsedData['device']['vendor'];
			}
			if (typeof parsedData['device']['model'] != 'undefined') {
				device += ' '+parsedData['device']['model'];
			}

			device = device.trim();
		}

		return {
			os: os !== null && os !== '' ? os : null,
			browser: browser !== null && browser !== '' ? browser : null,
			device: device !== null && device !== '' ? device : null,
		};
	}

	static getOsIcon(osName) {
		osName = osName.toUpperCase();
		if (osName === 'WINDOWS') {
			return '<i class="fab fa-windows"></i>';
		}
		if (osName === 'LINUX') {
			return '<i class="fab fa-linux"></i>';
		}
		if (osName === 'MACOS' || osName === 'IOS') {
			return '<i class="fab fa-apple"></i>';
		}
		if (osName === 'ANDROID') {
			return '<i class="fab fa-android"></i>';
		}
		return '';
	}

	static getOsDisplay(osName) {
		return (UserAgent.getOsIcon(osName)+' '+osName).trim();
	}
	
	static getBrowserIcon(browserName) {
		browserName = browserName.toUpperCase();
		if (browserName === 'CHROME') {
			return '<i class="fab fa-chrome"></i>';
		}
		if (browserName === 'FIREFOX') {
			return '<i class="fab fa-firefox"></i>';
		}
		if (browserName === 'EDGE') {
			return '<i class="fab fa-edge"></i>';
		}
		if (browserName === 'SAFARI') {
			return '<i class="fab fa-safari"></i>';
		}
		if (browserName === 'OPERA') {
			return '<i class="fab fa-opera"></i>';
		}
		return '';
	}
	static getBrowserDisplay(browserName) {
		return (UserAgent.getBrowserIcon(browserName)+' '+browserName).trim();
	}

	static getDeviceDisplay(device) {
		let str = '';
		if (device['type'] === 'desktop') {
			str += '<i class="fas fa-desktop"></i> Ordinateur';
		}
		else {
			if (device['is_mobile']) {
				str += '<i class="fas fa-mobile-alt"></i> '+(null == device['manufacturer'] && null == device['model'] ? 'Mobile' : '');
			}
			str += device['manufacturer']+' '+device['model'];
		}
		return str.trim();
	}
}

export { Browser, UserAgent };