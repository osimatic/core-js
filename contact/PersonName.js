class PersonName {

	static format(firstName, lastName) {
		let str = '';
		if (firstName != null && firstName !== '') {
			str += ' '+firstName.trim();
		}
		if (lastName != null && lastName !== '') {
			str += ' '+lastName.trim();
		}
		return str.trim();
	}

	static checkFirstName(firstName) {
		if (firstName.length < 2 || firstName.length > 64) {
			return false;
		}

		let regEx = /^([a-zA-Z'àâäéèêëìîïòôöùûüçÀÂÄÉÈÊËÌÎÏÒÔÖÙÛÜÇ\s-]+)$/;
		return regEx.exec(firstName) != null;
	}

	static checkLastName(lastName) {
		if (lastName.length < 2 || lastName.length > 64) {
			return false;
		}

		let regEx = /^([a-zA-Z'àâäéèêëìîïòôöùûüçÀÂÄÉÈÊËÌÎÏÒÔÖÙÛÜÇ\s-]+)$/;
		return regEx.exec(lastName) != null;
	}
}

export { PersonName };
