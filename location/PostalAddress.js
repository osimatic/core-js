import Address from 'ilib/lib/Address.js';
import AddressFmt from 'ilib/lib/AddressFmt.js';
import { toEl } from '../utils/util.js';

class PostalAddress {
	static setAutocomplete(input, onPlaceChanged) {
		input = toEl(input);
		if (!input) {
			return;
		}

		const autocompleteElement = new google.maps.places.PlaceAutocompleteElement({
			types: ['geocode'],
		});

		if (input.id) autocompleteElement.id = input.id;
		if (input.className) autocompleteElement.className = input.className;
		if (input.placeholder) autocompleteElement.setAttribute('placeholder', input.placeholder);
		input.replaceWith(autocompleteElement);

		if (typeof onPlaceChanged == 'function') {
			autocompleteElement.addEventListener('gmp-placeselect', async (event) => {
				const place = event.place;
				await place.fetchFields({fields: ['formattedAddress', 'addressComponents', 'adrFormatAddress', 'location']});
				onPlaceChanged(place);
			});
		}

		return autocompleteElement;
	}

	static getInputValue(input) {
		input = toEl(input);
		if (!input) {
			return null;
		}
		const value = 'inputValue' in input ? input.inputValue : input.value;
		return value ?? null;
	}

	static setInputValue(input, value) {
		input = toEl(input);
		if (!input) {
			return;
		}
		if ('inputValue' in input) {
			input.inputValue = value;
		} else {
			input.value = value;
		}
	}

	static format(addressData, separator='<br/>', locale=null) {
		function empty(value) {
			return typeof value == 'undefined' || value == null || value === '';
		}

		/*
		var address = new Address({
			country: "USA",
			countryCode: "US",
			postalCode: "95054",
			region: "CA",
			locality: "Santa Clara",
			streetAddress: "LG Silicon Valley Lab, 5150 Great America Pkwy"
		});
		var af = new AddressFmt();
		var formatted = af.format(address);
		console.log(formatted);
		 */

		addressData['countryCode'] = !empty(addressData['countryCode'])?addressData['countryCode']:null;

		let addressDataForPluging = {
			streetAddress: (!empty(addressData['streetAddress'])?addressData['streetAddress']:'')+(!empty(addressData['additionalAddress'])?"\n"+addressData['additionalAddress']:''),
			postalCode: !empty(addressData['postalCode'])?addressData['postalCode']:null,
			locality: !empty(addressData['locality'])?addressData['locality']:null,
			region: !empty(addressData['state'])?addressData['state']:null,
			countryCode: addressData['countryCode'],
			country: Country.getCountryName(addressData['countryCode']),
		};
		if (addressDataForPluging['locality'] == null && !empty(addressData['suburb'])) {
			addressDataForPluging['locality'] = addressData['suburb'];
		}
		if (addressDataForPluging['locality'] == null && !empty(addressData['stateDistrict'])) {
			addressDataForPluging['locality'] = addressData['stateDistrict'];
		}

		const afLocale = locale || (addressDataForPluging['countryCode'] ? `und-${addressDataForPluging['countryCode']}` : null);
		let af = new AddressFmt(afLocale ? {locale: afLocale} : {});
		let formattedAddress = af.format(new Address(addressDataForPluging));
		return formattedAddress.replace(/\n+/g, separator);
	}

	static getComponentsFromGoogleApi(googleApiResult) {
		// Supports both old Places API (address_components / adr_address)
		// and new Places API (addressComponents / adrFormatAddress)
		const isNewApi = Array.isArray(googleApiResult.addressComponents);
		const components = isNewApi
			? googleApiResult.addressComponents
			: (googleApiResult.address_components || []);

		let streetNumber = null;
		let route = null;

		const addressData = {};
		components.forEach(function(c) {
			const longName  = isNewApi ? c.longText  : c.long_name;
			const shortName = isNewApi ? c.shortText : c.short_name;
			const types = c.types || [];
			if (types.indexOf('street_number') !== -1) {
				streetNumber = longName;
			}
			if (types.indexOf('route') !== -1) {
				route = longName;
			}
			if (types.indexOf('sublocality_level_1') !== -1) {
				addressData.suburb = longName;
			}
			if (types.indexOf('locality') !== -1) {
				addressData.locality = longName;
			}
			if (types.indexOf('postal_town') !== -1) {
				addressData.locality = longName;
			}
			if (types.indexOf('postal_code') !== -1) {
				addressData.postalCode = longName;
			}
			if (types.indexOf('administrative_area_level_3') !== -1) {
				addressData.locality = longName;
			}
			if (types.indexOf('administrative_area_level_2') !== -1) {
				addressData.stateDistrict = longName;
			}
			if (types.indexOf('administrative_area_level_1') !== -1) {
				addressData.state = longName;
			}
			if (types.indexOf('country') !== -1) {
				addressData.countryCode = shortName;
			}
		});

		const adrAddress = isNewApi ? googleApiResult.adrFormatAddress : googleApiResult.adr_address;
		const tmp = document.createElement('div');
		tmp.innerHTML = adrAddress || '';
		if (tmp.children.length > 0) {
			addressData.streetAddress = tmp.children[0].textContent;
		}
		else {
			addressData.streetAddress = (streetNumber ? streetNumber + ' ' : '') + (route || '');
		}

		return addressData;
	}
}

export { PostalAddress };
