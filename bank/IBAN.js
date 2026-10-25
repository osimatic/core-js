class IBAN {
	static format(iban) {
		return iban.toUpperCase().replace(/[^\dA-Z]/g, '').replace(/(.{4})/g, '$1 ').trim();
	}
}

export { IBAN };