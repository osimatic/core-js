import * as libphonenumber from 'libphonenumber-js/max';
import { Country } from '../location/Country.js';

class TelephoneNumber {
	static setLocalCountryCode(countryCode) {
		TelephoneNumber.localCountryCode = countryCode;
	}

	static formatNational(phoneNumber, localCountryIsoCode=TelephoneNumber.localCountryCode) {
		try {
			const number = libphonenumber.parsePhoneNumber(phoneNumber, localCountryIsoCode.toUpperCase());
			return number != null ? number.formatNational() : '';
		} catch (error) {
			console.error(error);
		}
		return '';
		//return libphonenumber.parsePhoneNumber(phoneNumber, localCountryIsoCode.toUpperCase()).formatNational();
	}
	static formatInternational(phoneNumber, localCountryIsoCode=TelephoneNumber.localCountryCode) {
		try {
			const number = libphonenumber.parsePhoneNumber(phoneNumber, localCountryIsoCode.toUpperCase());
			return number != null ? number.formatInternational() : '';
		} catch (error) {
			console.error(error);
		}
		return '';
		//return libphonenumber.parsePhoneNumber(phoneNumber, localCountryIsoCode).formatInternational();
	}
	static formatInternationalWithTelLink(phoneNumber, localCountryIsoCode=TelephoneNumber.localCountryCode) {
		return '<a href="tel:'+phoneNumber+'">'+TelephoneNumber.formatInternational(phoneNumber, localCountryIsoCode)+'</a>';
	}
	static formatNationalWithFlagImg(phoneNumber, localCountryIsoCode=TelephoneNumber.localCountryCode) {
		return TelephoneNumber.getFlagImg(phoneNumber, localCountryIsoCode)+'&nbsp;'+TelephoneNumber.formatNational(phoneNumber, localCountryIsoCode);
	}
	static formatNationalWithFlagImgAndTelLink(phoneNumber, localCountryIsoCode=TelephoneNumber.localCountryCode) {
		return TelephoneNumber.getFlagImg(phoneNumber, localCountryIsoCode)+'&nbsp;<a href="tel:'+phoneNumber+'">'+TelephoneNumber.formatNational(phoneNumber, localCountryIsoCode)+'</a>';
	}

	static parse(phoneNumber, localCountryIsoCode=TelephoneNumber.localCountryCode) {
		try {
			const number = libphonenumber.parsePhoneNumber(phoneNumber, localCountryIsoCode.toUpperCase());
			return number != null ? number.formatInternational() : null;
		} catch (error) {
			console.error(error);
		}
		return null;
	}

	static check(phoneNumber, localCountryIsoCode=TelephoneNumber.localCountryCode) {
		try {
			const number = libphonenumber.parsePhoneNumber(phoneNumber, localCountryIsoCode.toUpperCase());
			return number != null ? number.isValid() : false;
		} catch (error) { }
		return false;
		//var numberObject = libphonenumber.parse(phoneNumber, localCountryIsoCode.toUpperCase());
		//return (typeof numberObject.country !== 'undefined');
	}

	static checkSyntaxe(phoneNumber) {
		let verifPhoneFr = /^(0)[1-9]{1}[ \.\-]?[0-9]{2}[ \.\-]?[0-9]{2}[ \.\-]?[0-9]{2}[ \.\-]?[0-9]{2}$/;
		let verifPhoneInt = /^((\+)|(00))[1-9]{1}[0-9]{0,3}([ \.\-\/]?[0-9]{1}){4,20}$/;
		if (verifPhoneFr.exec(phoneNumber) != null) {
			return true;
		}
		return verifPhoneInt.exec(phoneNumber) != null;
	}
	
	static getType(phoneNumber, localCountryIsoCode=TelephoneNumber.localCountryCode) {
		if (phoneNumber == null || phoneNumber.length === 0) {
			return 'MASKED';
		}
		
		try {
			const number = libphonenumber.parsePhoneNumber(phoneNumber, localCountryIsoCode.toUpperCase());
			return number != null ? number.getType() : null;
		} catch (error) {
			console.error(error);
		}
		return null;
	}

	static getTypeLabelList() {
		return {
			FIXED_LINE: 'Fixe',
			MOBILE: 'Mobile',
			FIXED_LINE_OR_MOBILE: 'Fixe ou Mobile',
			TOLL_FREE: 'Vert',
			PREMIUM_RATE: 'Surtaxé',
			SHARED_COST: 'Coût partagé',
			VOIP: 'VOIP',
			PERSONAL_NUMBER: 'Personnel',
			PAGER: 'Pager',
			UAN: 'UAN',
			UNKNOWN: 'Inconnu',
			MASKED: 'Masqué',
		};
	}

	static getTypeLabel(phoneNumberType) {
		return TelephoneNumber.getTypeLabelList()[phoneNumberType] || 'Inconnu';
	}

	static getCountryIsoCode(phoneNumber, localCountryIsoCode=TelephoneNumber.localCountryCode) {
		try {
			const number = libphonenumber.parsePhoneNumber(phoneNumber, localCountryIsoCode.toUpperCase());
			return number != null ? number.country : null;
		} catch (error) {
			console.error(error);
		}
		return null;
		//return libphonenumber.parsePhoneNumber(phoneNumber, localCountryIsoCode.toUpperCase()).country || '';
	}
	static getCountryName(phoneNumber, localCountryIsoCode=TelephoneNumber.localCountryCode) {
		return Country.getCountryName(this.getCountryIsoCode(phoneNumber, localCountryIsoCode));
	}
	static getFlagImg(phoneNumber, localCountryIsoCode=TelephoneNumber.localCountryCode) {
		return Country.getFlagImg(this.getCountryIsoCode(phoneNumber, localCountryIsoCode));
	}
}

export { TelephoneNumber };
