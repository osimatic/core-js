export class GoogleRecaptcha {
	static setConfig(config) {
		this.config = config;
	}

	// Retourne true si l'API est prête ; sinon, exécute callback dès qu'elle l'est (api.js peut être chargé sans être prête)
	static whenReady(callback) {
		if (typeof grecaptcha == 'undefined') {
			console.log('var grecaptcha undefined');
			return false;
		}
		if (typeof grecaptcha.render != 'function') {
			console.log('grecaptcha pas encore prêt, attente de ready');
			if (typeof grecaptcha.ready == 'function') {
				grecaptcha.ready(callback);
			}
			return false;
		}
		return true;
	}

	static onLoad() {
		console.log('GoogleRecaptcha.onLoad');
		if (!GoogleRecaptcha.whenReady(() => GoogleRecaptcha.onLoad())) {
			return;
		}

		if (typeof GoogleRecaptcha.googleCaptchaRendersCallback == 'undefined') {
			GoogleRecaptcha.googleCaptchaRendersCallback = [];
		}

		GoogleRecaptcha.googleCaptchaRendersCallback.forEach(callback => callback());
		GoogleRecaptcha.googleCaptchaRendersCallback = [];

		/*document.querySelectorAll('.grecaptcha').forEach(element => {
			try {
				console.log(element.id);
				//grecaptchaWidgets[element.id] = grecaptcha.render(element.id, googleReCaptchaDatas);
			}
			catch (e) {
				console.log('Exception during grecaptcha.render', e);
			}
		});*/
	}

	static render(id) {
		GoogleRecaptcha.addRenderCallback(() => {
			GoogleRecaptcha.reset(id);
		});
	}

	static reset(id) {
		if (!GoogleRecaptcha.whenReady(() => GoogleRecaptcha.reset(id))) {
			return;
		}

		if (typeof GoogleRecaptcha.grecaptchaWidgets == 'undefined') {
			GoogleRecaptcha.grecaptchaWidgets = [];
		}

		if (typeof GoogleRecaptcha.grecaptchaWidgets[id] == 'undefined') {
			try {
				GoogleRecaptcha.grecaptchaWidgets[id] = grecaptcha.render(id, this.config);
			}
			catch (e) {
				console.error('Exception during grecaptcha.render', e);
			}
		}
		else {
			grecaptcha.reset(GoogleRecaptcha.grecaptchaWidgets[id]);
		}
	}

	static addRenderCallback(callback) {
		if (typeof GoogleRecaptcha.googleCaptchaRendersCallback == 'undefined') {
			GoogleRecaptcha.googleCaptchaRendersCallback = [];
		}

		GoogleRecaptcha.googleCaptchaRendersCallback.push(callback);
		console.log('GoogleRecaptcha.addRenderCallback');
		GoogleRecaptcha.onLoad();
	}
}

/*
var grecaptchaWidgets = [];

function grecaptchaOnload () {
	if (typeof grecaptcha == 'undefined') {
		console.log('var grecaptcha undefined');
		return;
	}
	document.querySelectorAll('.grecaptcha').forEach(element => {
		grecaptchaWidgets[element.id] = grecaptcha.render(element.id, googleReCaptchaDatas);
	});
	//$('.grecaptcha').each(function(idx, el) {
	//	grecaptchaWidgets[$(el).attr('id')] = grecaptcha.render($(el).attr('id'), googleReCaptchaDatas);
	//});
}
*/
