import isoCountries from 'i18n-iso-countries/entry-node.js';
import { toEl } from '../utils/util.js';
import { Locale } from './Locale.js';
import { SelectBox } from '../form/SelectBox.js';

class Country {
	static getCountryName(countryCode, locale=Locale.getDefault()) {
		const baseLang = Locale.getBaseLang(locale);
		Country.getCountries(locale); // ensure locale is registered
		const name = isoCountries.getName(countryCode, baseLang);
		return name || countryCode;
	}
	static getCountries(locale = 'en') {
		const baseLang = Locale.getBaseLang(locale);
		return isoCountries.getNames(baseLang) || {};
	}

	static getContinents() {
		return {
			1: "Europe",
			2: "Moyen-Orient",
			3: "Afrique",
			4: "Amérique du Nord",
			5: "Amérique du Sud",
			6: "Asie",
			7: "Océanie",
		};
	}

	static setFlagsPath(flagsPath) {
		Country.flagsPath = flagsPath;
	}

	static getFlagPath(countryCode) {
		return typeof Country.flagsPath !== 'undefined' && countryCode ? Country.flagsPath + countryCode.toLowerCase() + '.png' : null;
	}
	static getFlagImg(countryCode, locale=Locale.getDefault()) {
		if (!countryCode) {
			return '';
		}
		if (typeof Country.flagsPath !== 'undefined') {
			return '<span><img src="'+Country.getFlagPath(countryCode)+'" alt="" title="'+Country.getCountryName(countryCode, locale)+'" class="flag" /></span>';
		}
		return '<span class="fi fi-' + countryCode.toLowerCase() + '"></span>';
	}
	static getFlagEmoji(countryCode) {
		if (!countryCode) {
			return '';
		}
		return [...countryCode.toUpperCase()].map(c => String.fromCodePoint(0x1F1E6 - 65 + c.charCodeAt(0))).join('');
	}

	static fillSelect(select, defaultValue=null, locale=Locale.getDefault(), showFlags=false, countriesList=null, addNoneValue=false, noneLabel='- Aucun -') {
		select = toEl(select);
		if (!select) {
			return;
		}
		SelectBox.reset(select, true);
		if (addNoneValue) {
			select.insertAdjacentHTML('beforeend', '<option value="">'+noneLabel+'</option>');
		}
		const allCountries = Country.getCountries(locale);
		const entries = countriesList != null
			? countriesList.map(code => [code, allCountries[code] || code])
			: Object.entries(allCountries);
		entries.forEach(([countryCode, countryName]) => {
			let attrs = '';
			if (showFlags && countryCode) {
				/*if (typeof Country.flagsPath !== 'undefined') {
					attrs = ' data-thumbnail="' + Country.getFlagPath(countryCode) + '"';
				} else {*/
				attrs = ' data-content="<span class=&quot;fi fi-' + countryCode.toLowerCase() + '&quot;></span> ' + countryName + '"';
			}
			select.insertAdjacentHTML('beforeend', '<option value="' + countryCode + '"' + attrs + '>' + countryName + '</option>');
		});

		SelectBox.refresh(select);
		if (null != defaultValue) {
			SelectBox.setValue(select, defaultValue);
		}
	}

	static fillSelectWithFlags(select, defaultValue=null, locale=Locale.getDefault(), countriesList=null, addNoneValue=false, noneLabel='- Aucun -') {
		return Country.fillSelect(select, defaultValue, locale, true, countriesList, addNoneValue, noneLabel);
	}

	/** @deprecated Use fillSelect instead **/
	static fillCountrySelect(select, defaultValue=null, countriesList=null, addNoneValue=false, noneLabel='- Aucun -') {
		select = toEl(select);
		if (!select) {
			return;
		}
		SelectBox.reset(select, true);
		if (addNoneValue) {
			select.insertAdjacentHTML('beforeend', '<option value="">'+noneLabel+'</option>');
		}
		Object.entries(null != countriesList ? countriesList : Country.getCountries()).forEach(([countryCode, countryName]) => {
			select.insertAdjacentHTML('beforeend', '<option value="' + countryCode + '">' + countryName + '</option>');
		});
		SelectBox.refresh(select);
		if (null != defaultValue) {
			SelectBox.setValue(select, defaultValue);
		}
	}

	/** @deprecated Use getCountries instead **/
	static getCountryList() {
		return Country.getCountries();
	}

}

export { Country };
