import { toEl } from './util.js';
import { FormHelper } from './form_helper.js';
import { HTTPClient } from './http_client.js';
import { UAParser } from 'ua-parser-js';

class AudioMedia {

	static getPlayer(playUrl) {
		return '<audio controls preload="none"><source src="' + playUrl + '" type="audio/x-wav"></audio>';
	}

	static initPlayLinks(div) {
		div = toEl(div);
		if (!div) {
			return;
		}

		// Affiche un lecteur audio
		div.querySelectorAll('.play_link').forEach(link => {
			link.addEventListener('click', function(e) {
				e.preventDefault();
				const template = document.createElement('template');
				template.innerHTML = AudioMedia.getPlayer(this.dataset.play_url);
				const audio = template.content.firstChild;
				audio.play();
				this.insertAdjacentElement('afterend', audio);
				this.remove();
			});
		});

		div.querySelectorAll('.play_asynchronously_link').forEach(link => {
			link.addEventListener('click', function(e) {
				e.preventDefault();
				let button = FormHelper.buttonLoader(this, 'loading');
				AudioMedia.playAudioUrl(this.dataset.url, () => FormHelper.buttonLoader(button, 'reset'));
			});
		});

		div.querySelectorAll('.modal_play_link').forEach(link => {
			link.addEventListener('click', function(e) {
				e.preventDefault();
				const modalEl = document.getElementById('modal_voice_message_play');
				if (!modalEl) return;
				const currentLink = this;
				modalEl.addEventListener('show.bs.modal', function handler(event) {
					modalEl.removeEventListener('show.bs.modal', handler);
					const player = modalEl.querySelector('audio');
					if (player) {
						player.src = (event.relatedTarget || currentLink).dataset.play_url;
						player.play();
					}
				});
				bootstrap.Modal.getOrCreateInstance(modalEl).show(this);
			});
		});
	}

	static playAudioUrl(url, onPlayed) {
		try {
			let context = new (window.AudioContext || window.webkitAudioContext)();
			let request = new XMLHttpRequest();
			request.open("GET", url, true);
			Object.entries(HTTPClient.getHeaders(true)).forEach(([key, value]) => request.setRequestHeader(key, value));
			request.responseType = "arraybuffer";

			request.onload = function () {
				context.decodeAudioData(request.response, function (buffer) {
					let source = context.createBufferSource();
					source.buffer = buffer;
					source.connect(context.destination);
					// auto play
					source.start(0); // start was previously noteOn

					source.onended = function (event) {
						if (typeof onPlayed == 'function') {
							onPlayed(event);
						}
					}
				});
			};
			request.send();
		}
		catch (e) {
			console.error('web audio api not supported', e);
		}
	}

	static initAudioVisualization(canvas, audioStream) {
		let canvasCtx = canvas.getContext("2d");
		let canvasWidth = canvas.width;
		let canvasHeight = canvas.height;
		let audioCtx = new (window.AudioContext || window.webkitAudioContext)();
		let analyser = audioCtx.createAnalyser();

		let distortion = audioCtx.createWaveShaper();
		let source = audioCtx.createMediaStreamSource(audioStream);
		source.connect(analyser);
		analyser.connect(distortion);
		distortion.connect(audioCtx.destination);

		analyser.fftSize = 256;
		let bufferLength = analyser.frequencyBinCount;
		//console.log(bufferLength);
		let dataArray = new Uint8Array(bufferLength);

		canvasCtx.clearRect(0, 0, canvasWidth, canvasHeight);

		function draw() {
			requestAnimationFrame(draw);

			analyser.getByteFrequencyData(dataArray);

			canvasCtx.fillStyle = 'rgb(0, 0, 0)';
			canvasCtx.fillRect(0, 0, canvasWidth, canvasHeight);

			let barWidth = (canvasWidth / bufferLength) * 2.5;
			let barHeight;
			let x = 0;
			for (let i = 0; i < bufferLength; i++) {
				barHeight = dataArray[i] / 2;

				canvasCtx.fillStyle = 'rgb(' + (barHeight + 100) + ',50,50)';
				canvasCtx.fillRect(x, canvasHeight - barHeight / 2, barWidth, barHeight);

				x += barWidth + 1;
			}
		}

		draw();
	}
}

class VideoMedia {
	static initPlayPauseClick(videoElement) {
		videoElement = toEl(videoElement);
		if (!videoElement) {
			return;
		}
		
		videoElement.addEventListener('click', function(e) {
			// handle click if not Firefox (Firefox supports this feature natively)
			if (typeof InstallTrigger === 'undefined') {
				// get click position
				let clickY = e.pageY - (this.getBoundingClientRect().top + window.scrollY);
				let height = this.offsetHeight;

				// avoids interference with controls
				if (clickY > 0.82*height) return;

				// toggles play / pause
				this.paused ? this.play() : this.pause();
			}
		});
	}
}

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

export { AudioMedia, VideoMedia, UserMedia };
