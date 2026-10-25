class Email {
	static validateEmail(email) {
		let re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return re.test(email);
	}

	static checkEmail(email) {
		let regExEmail = /^[\w.-]+@[\w.-]+\.[a-zA-Z]{2,5}$/;
		return regExEmail.exec(email) != null;
	}

	// Normalisation recommandée par Google avant hachage pour les enhanced conversions : https://support.google.com/google-ads/answer/13258081
	static normalize(email) {
		return email.trim().toLowerCase();
	}

	static getMailToLink(email) {
		return '<a href="mailto:'+email+'">'+email+'</a>';
	}

	// Formats a list of recipients (each either [address, name] or a plain address) as "Name <address>, address2, ...".
	// Set escapeHtml to true when the result is inserted as raw HTML rather than through .text().
	static formatRecipientList(recipients, separator = ', ', escapeHtml = false) {
		return (recipients ?? []).map(recipient => {
			const text = Array.isArray(recipient) ? (recipient[1] ? recipient[1]+' <'+recipient[0]+'>' : recipient[0]) : recipient;
			return escapeHtml ? text.escapeHtml() : text;
		}).join(separator);
	}
}

export { Email };
