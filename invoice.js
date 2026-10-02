class ChorusPro {
	// La structure de facturation Chorus Pro du destinataire, qui détermine quelles références sont obligatoires sur les factures déposées (cf. Osimatic\Invoice\ChorusProInvoiceCategory côté PHP)
	static getInvoiceCategoryList() {
		return {
			TYPE_1: 'Type 1 (n° d’engagement obligatoire)',
			TYPE_2: 'Type 2 (code service obligatoire)',
			TYPE_3: 'Type 3 (aucune référence requise)',
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
