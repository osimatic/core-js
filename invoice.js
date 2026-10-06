class ChorusPro {
	// La/les référence(s) obligatoire(s) sur les factures déposées pour la structure destinataire (cf. Osimatic\Invoice\ChorusProInvoiceReferenceRequirement côté PHP)
	static getInvoiceReferenceRequirementList() {
		return {
			ENGAGEMENT_REQUIRED: 'Numéro d’engagement obligatoire',
			SERVICE_CODE_REQUIRED: 'Code service obligatoire',
			NONE: 'Aucune référence requise',
		};
	}

	// Le statut de dépôt d'une facture (cf. Osimatic\Invoice\ChorusProSubmissionStatus côté PHP) ; mise en forme (HTML/couleur) laissée à l'appelant
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

export { ChorusPro };