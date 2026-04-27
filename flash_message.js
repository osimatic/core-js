class FlashMessage {
	static displaySuccess(message, reload=false, modal=null, onMessageHidden=null, domId=null) {
		this.display('success', message, reload, modal, onMessageHidden, domId);
	}
	static displayWarning(message, modal=null, onMessageHidden=null, domId=null) {
		this.display('warning', message, false, modal, onMessageHidden, domId);
	}
	static displayError(message, modal=null, onMessageHidden=null, domId=null) {
		this.display('danger', message, false, modal, onMessageHidden, domId);
	}

	static display(type, message, reload=false, modal=null, onMessageHidden=null, domId=null) {
		if (null !== modal) {
			modal.modal('hide');
		}

		document.querySelectorAll('div.snackbar').forEach(el => el.remove());
		const snackbar = document.createElement('div');
		snackbar.className = 'snackbar ' + type;
		if (null !== domId) {
			snackbar.id = domId;
		}
		snackbar.innerHTML = message;
		snackbar.classList.add('show');
		document.querySelector('body').appendChild(snackbar);

		setTimeout(function () {
			document.querySelectorAll('div.snackbar').forEach(el => el.remove());
			if (typeof onMessageHidden == 'function') {
				onMessageHidden();
			}
		}, 6000);

		if (true === reload) {
			document.location.reload();
		}
	}
}

export { FlashMessage };