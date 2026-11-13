export class Organization {
	// Formats a French SIREN number for display, grouped by blocks of 3 digits, e.g. "217 402 379" (see Osimatic\Organization\Company::formatFranceSiren() on the PHP side)
	static formatFranceSiren(siren) {
		const digits = (siren ?? '').replace(/\s/g, '');
		if (digits.length !== 9) {
			return digits;
		}
		return digits.substring(0, 3)+' '+digits.substring(3, 6)+' '+digits.substring(6);
	}

	// Formats a French SIRET number for display, grouped as the 9-digit SIREN followed by the 5-digit NIC, e.g. "217 402 379 00069" (see Osimatic\Organization\Company::formatFranceSiret() on the PHP side)
	static formatFranceSiret(siret) {
		const digits = (siret ?? '').replace(/\s/g, '');
		if (digits.length !== 14) {
			return digits;
		}
		return digits.substring(0, 3)+' '+digits.substring(3, 6)+' '+digits.substring(6, 9)+' '+digits.substring(9);
	}

	// Formats a SIRET number for display as RCS (Trade and Companies Register), e.g. "B 217 402 379" (see Osimatic\Organization\Company::formatFranceRcs() on the PHP side)
	static formatFranceRcs(siret) {
		const siren = (siret ?? '').replace(/\s/g, '').substring(0, 9);
		return 'B '+Organization.formatFranceSiren(siren);
	}
}
