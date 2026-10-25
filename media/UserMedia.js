import { UAParser } from 'ua-parser-js';

//Source : https://www.npmjs.com/package/mic-check
class UserMedia {
	static hasGetUserMedia() {
		return !!(typeof navigator !== 'undefined' && (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia));
	}

	/** SystemPermissionDenied => (macOS) browser does not have permission to access cam/mic */
	/** UserPermissionDenied => user denied permission for site to access cam/mic */
	/** CouldNotStartVideoSource = > (Windows) browser does not have permission to access cam/mic OR camera is in use by another application or browser tab */
	/** Generic => all other errors */

	static requestMediaPermissions(constraints) {
		return new Promise((resolve, reject) => {
			const browserName = new UAParser(window.navigator.userAgent).getBrowser().name;

			navigator.mediaDevices.getUserMedia(typeof constraints !== 'undefined' ? constraints : { audio: true, video: true })
			.then((stream) => resolve(stream))
			.catch((error) => {
				const errName = error.name;
				const errMessage = error.message;
				let errorType = "Generic";

				if (browserName === 'Chrome') {
					if (errName === 'NotAllowedError') {
						if (errMessage === 'Permission denied by system') {
							errorType = "SystemPermissionDenied";
						} else if (errMessage === 'Permission denied') {
							errorType = "UserPermissionDenied";
						}
					} else if (errName === 'NotReadableError') {
						errorType = "CouldNotStartVideoSource";
					}
				} else if (browserName === 'Safari') {
					if (errName === 'NotAllowedError') {
						errorType = "UserPermissionDenied";
					}
				} else if (browserName === 'Edge') {
					if (errName === 'NotAllowedError') {
						errorType = "UserPermissionDenied";
					} else if (errName === 'NotReadableError') {
						errorType = "CouldNotStartVideoSource";
					}
				} else if (browserName === 'Firefox') {
					// https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia#exceptions
					if (errName === 'NotFoundError') {
						errorType = "SystemPermissionDenied";
					} else if (errName === 'NotReadableError') {
						errorType = "SystemPermissionDenied";
					} else if (errName === 'NotAllowedError') {
						errorType = "UserPermissionDenied";
					} else if (errName === 'AbortError') {
						errorType = "CouldNotStartVideoSource";
					}
				}

				reject({ type: errorType, name: error.name, message: error.message });
			});
		});
	}

	static requestAudioPermissions(audioConstraints) {
		return this.requestMediaPermissions({ audio: (typeof audioConstraints !== 'undefined' ? audioConstraints : true), video: false });
	}

	static requestVideoPermissions(audioConstraints, videoConstraints) {
		return this.requestMediaPermissions({ audio: (typeof audioConstraints !== 'undefined' ? audioConstraints : true), video: (typeof videoConstraints !== 'undefined' ? videoConstraints : true )});
	}

	static requestMutedVideoPermissions(videoConstraints) {
		return this.requestMediaPermissions({ audio: false, video: (typeof videoConstraints !== 'undefined' ? videoConstraints : true )});
	}
}

export { UserMedia };
