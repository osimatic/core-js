const { toEl } = require('./util');

class Modal {
	/**
	 * Hide a Bootstrap modal while preventing the "Blocked aria-hidden on focused element"
	 * browser warning. Bootstrap sets aria-hidden after the CSS transition while its focus
	 * trap may still hold focus inside; blurring the active element first moves focus to
	 * document, which the focus trap ignores (it only intercepts focus on real elements).
	 *
	 * @param {bootstrap.Modal} modal - Bootstrap Modal instance
	 * @param {Element|jQuery} modalElement - The modal DOM element (or jQuery wrapper)
	 */
	static hide(modal, modalElement=null) {
		const el = toEl(modalElement || modal._element);
		if (el.contains(document.activeElement)) {
			document.activeElement.blur();
		}
		modal.hide();
	}

	/**
	 * Attach a one-time-registered listener on the modal element that blurs the active
	 * element before Bootstrap sets aria-hidden="true", preventing the browser warning
	 * "Blocked aria-hidden on an element because its descendant retained focus".
	 * This covers dismissals triggered by data-bs-dismiss="modal" or Bootstrap internals,
	 * which bypass Modal.hide(). Call this once when the modal DOM element is initialised.
	 *
	 * @param {Element|jQuery} modalElement - The modal DOM element (or jQuery wrapper)
	 */
	static initAriaHiddenFix(modalElement) {
		const el = toEl(modalElement);
		if (el._ariaHiddenFixInitialised) {
			return;
		}
		el._ariaHiddenFixInitialised = true;
		el.addEventListener('hide.bs.modal', function () {
			if (el.contains(document.activeElement)) {
				document.activeElement.blur();
			}
		});
	}
}

module.exports = { Modal };