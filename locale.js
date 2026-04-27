class Locale {
	static current = 'fr-FR';

	static getDefault() {
		return Locale.current;
	}

	static setDefault(locale) {
		Locale.update(locale);
	}

	static update(locale) {
		Locale.current = Locale.normalize(locale);
	}

	static getBaseLang(locale) {
		return Locale.normalize(locale).split('-')[0];
	}

	static getRegion(locale) {
		const parts = Locale.normalize(locale).split('-');
		return parts.length > 1 ? parts[1] : null;
	}

	static normalize(locale) {
		// Accept both 'fr_FR' and 'fr-fr', output 'fr-FR'
		const parts = locale.replace('_', '-').split('-');
		const lang = parts[0].toLowerCase();
		const region = parts[1] ? parts[1].toUpperCase() : null;
		return region ? lang + '-' + region : lang;
	}

	static isValid(locale) {
		return /^[a-zA-Z]{2,3}(-[a-zA-Z]{2,3})?$/.test(locale);
	}

	static toPOSIX(locale) {
		return Locale.normalize(locale).replace('-', '_');
	}
}

export { Locale };