import { UserMedia } from './media.js';
import { FlashMessage } from './flash_message.js';
import { toEl } from './util.js';

class MultiPhotoInput {
	/**
	 * Initialize a multi-photo input component inside the given container.
	 * Supports camera capture via getUserMedia and file picker.
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
	 *
	 * @param {HTMLElement|string} container - Container element or CSS selector
	 * @param {function} onPhotosChange - Callback called with the updated File[] array on every change
	 * @param {number} nbMaxPhotos - Maximum number of photos allowed
	 * @param {number} maxPhotoSize - Maximum photo file size in bytes (0 = no limit)
	 */
	static init(container, onPhotosChange, nbMaxPhotos, maxPhotoSize) {
		container = toEl(container);
		if (!container) {
			return;
		}

		let photosList = [];
		let stream = null;

		container.innerHTML = `
			<div class="multi_photo_input_actions d-flex gap-2 mb-2">
				<button type="button" class="btn btn-secondary btn-sm multi_photo_input_camera_btn">
					<i class="fas fa-camera"></i> Prendre une photo
				</button>
				<label class="btn btn-secondary btn-sm mb-0 multi_photo_input_file_label">
					<i class="fas fa-images"></i> Choisir depuis la galerie
					<input type="file" accept="image/*" multiple class="hide multi_photo_input_file_input">
				</label>
			</div>
			<div class="multi_photo_input_camera_area hide">
				<video class="multi_photo_input_video w-100" autoplay playsinline muted style="max-height:300px; border-radius:4px; background:#000;"></video>
				<div class="d-flex gap-2 mt-2">
					<button type="button" class="btn btn-primary btn-sm multi_photo_input_capture_btn">
						<i class="fas fa-camera"></i> Capturer
					</button>
					<button type="button" class="btn btn-outline-secondary btn-sm multi_photo_input_cancel_camera_btn">
						Annuler
					</button>
				</div>
			</div>
			<div class="multi_photo_input_photos_preview d-flex flex-wrap gap-2 mt-2 hide"></div>
		`;

		const cameraBtn = container.querySelector('.multi_photo_input_camera_btn');
		const fileInput = container.querySelector('.multi_photo_input_file_input');
		const cameraArea = container.querySelector('.multi_photo_input_camera_area');
		const video = container.querySelector('.multi_photo_input_video');
		const captureBtn = container.querySelector('.multi_photo_input_capture_btn');
		const cancelCameraBtn = container.querySelector('.multi_photo_input_cancel_camera_btn');
		const photosPreview = container.querySelector('.multi_photo_input_photos_preview');

		function stopCamera() {
			if (stream) {
				stream.getTracks().forEach(t => t.stop());
				stream = null;
			}
			video.srcObject = null;
			cameraArea.classList.add('hide');
		}

		cameraBtn.addEventListener('click', (e) => {
			e.preventDefault();
			if (photosList.length >= nbMaxPhotos) {
				FlashMessage.displayError('Maximum ' + nbMaxPhotos + ' photos autorisées.');
				return;
			}
			UserMedia.requestMutedVideoPermissions().then((s) => {
				stream = s;
				video.srcObject = stream;
				cameraArea.classList.remove('hide');
			}).catch(() => {
				FlashMessage.displayError('Impossible d\'accéder à la caméra.');
			});
		});

		cancelCameraBtn.addEventListener('click', (e) => {
			e.preventDefault();
			stopCamera();
		});

		captureBtn.addEventListener('click', (e) => {
			e.preventDefault();
			if (!stream) {
				return;
			}
			const canvas = document.createElement('canvas');
			canvas.width = video.videoWidth;
			canvas.height = video.videoHeight;
			canvas.getContext('2d').drawImage(video, 0, 0);
			const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
			canvas.toBlob((blob) => {
				if (!blob) {
					return;
				}
				if (maxPhotoSize && blob.size > maxPhotoSize) {
					FlashMessage.displayError('La photo dépasse la taille maximale.');
					return;
				}
				stopCamera();
				const file = new File([blob], 'photo_' + (photosList.length + 1) + '.jpg', { type: 'image/jpeg' });
				photosList.push(file);
				onPhotosChange(photosList);
				renderPreview(file, dataUrl);
			}, 'image/jpeg', 0.9);
		});

		fileInput.addEventListener('change', (e) => {
			handleFiles(Array.from(e.target.files));
			fileInput.value = '';
		});

		function handleFiles(selected) {
			for (const f of selected) {
				if (photosList.length >= nbMaxPhotos) {
					FlashMessage.displayError('Maximum ' + nbMaxPhotos + ' photos autorisées.');
					break;
				}
				if (maxPhotoSize && f.size > maxPhotoSize) {
					FlashMessage.displayError('Le fichier ' + f.name + ' dépasse la taille maximale.');
					continue;
				}
				photosList.push(f);
				onPhotosChange(photosList);
				renderPreview(f, null);
			}
		}

		function renderPreview(file, dataUrl) {
			const wrap = document.createElement('div');
			wrap.className = 'border rounded p-1 position-relative';
			wrap.style.background = 'white';
			wrap.innerHTML = `
				<div class="multi_photo_input_thumb" style="width:80px; height:80px; display:flex; align-items:center; justify-content:center; overflow:hidden;"></div>
				<button type="button" class="btn-close position-absolute top-0 end-0" aria-label="Supprimer" style="font-size:0.6rem;"></button>
			`;
			photosPreview.appendChild(wrap);
			photosPreview.classList.remove('hide');

			const thumb = wrap.querySelector('.multi_photo_input_thumb');
			if (dataUrl) {
				thumb.innerHTML = `<img src="${dataUrl}" alt="" style="max-width:100%; max-height:100%; object-fit:cover;" />`;
			} else {
				const reader = new FileReader();
				reader.onload = function(evt) {
					thumb.innerHTML = `<img src="${evt.target.result}" alt="" style="max-width:100%; max-height:100%; object-fit:cover;" />`;
				};
				reader.readAsDataURL(file);
			}

			wrap.querySelector('.btn-close').addEventListener('click', () => {
				const name = file.name, size = file.size;
				photosList = photosList.filter(f => !(f.name === name && f.size === size));
				onPhotosChange(photosList);
				wrap.remove();
				if (photosList.length === 0) {
					photosPreview.classList.add('hide');
				}
			});
		}
	}
}

export { MultiPhotoInput };