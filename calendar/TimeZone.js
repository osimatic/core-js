import '../utils/string.js';

class TimeZone {
	static default = 'Europe/Paris';

	static getDefault() {
		return TimeZone.default;
	}
	
	static setDefault(tz) {
		TimeZone.default = tz || 'Europe/Paris';
	}
}

export { TimeZone };
