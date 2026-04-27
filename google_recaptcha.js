class GoogleRecaptcha {
	static setConfig(config) {
		this.config = config;
	}

	static onLoad() {
		console.log('GoogleRecaptcha.onLoad');
		if (typeof grecaptcha == 'undefined' || typeof grecaptcha.render != 'function') {
			console.log('var grecaptcha undefined');
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
		if (typeof grecaptcha == 'undefined' || typeof grecaptcha.render != 'function') {
			console.log('var grecaptcha.render undefined');
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

export { GoogleRecaptcha };

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