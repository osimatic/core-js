export class ChorusPro {
	// The mandatory reference(s) on invoices submitted for the recipient structure (see Osimatic\Invoice\ChorusProInvoiceReferenceRequirement on the PHP side)
	static getInvoiceReferenceRequirementList() {
		return {
			ENGAGEMENT_REQUIRED: 'Numéro d’engagement obligatoire',
			SERVICE_CODE_REQUIRED: 'Code service obligatoire',
			NONE: 'Aucune référence requise',
		};
	}

	// The submission status of an invoice (see Osimatic\Invoice\ChorusProSubmissionStatus on the PHP side); formatting (HTML/color) left to the caller
	static getSubmissionStatusList() {
		return {
			DISABLED: 'Désactivé',
			PENDING: 'En attente',
			SUBMITTED: 'Envoyée',
			ACCEPTED: 'Acceptée',
			REJECTED: 'Rejetée',
			ERROR: 'Erreur',
		};
	}
}
