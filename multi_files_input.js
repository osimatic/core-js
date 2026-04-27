import './string.js';
import { FlashMessage } from './flash_message.js';
import { toEl } from './util.js';

class MultiFilesInput {
	static init(fileInput, setFilesList, nbMaxFiles, maxFileSize) {
		fileInput = toEl(fileInput);
		if (!fileInput) {
			return;
		}

		let filesList = [];
		const formGroup = fileInput.closest('.form-group');
		if (!formGroup) {
			return;
		}

		if (!formGroup.querySelector('.multi_files_input_dropzone')) {
			fileInput.insertAdjacentHTML('afterend', `
					<div class="multi_files_input_dropzone border rounded p-3 text-center" style="background:#fafafa; cursor: pointer;">
						<i class="fas fa-cloud-upload-alt fa-2x text-muted mb-1"></i>
						<div class="small text-muted">Glissez-déposez vos fichiers ici ou cliquez pour sélectionner</div>
					</div>
				`);
		}

		if (!formGroup.querySelector('.multi_files_input_files_preview')) {
			formGroup.insertAdjacentHTML('beforeend', `
					<div class="multi_files_input_files_preview mt-2 d-flex flex-wrap gap-2 hide"></div>
				`);
		}

		const dropzone = fileInput.parentElement.querySelector('.multi_files_input_dropzone');
		const filesPreview = fileInput.parentElement.querySelector('.multi_files_input_files_preview');
		filesPreview.innerHTML = '';

		fileInput.classList.add('hide');

		// Dropzone interactions
		const dropzoneClone = dropzone.cloneNode(true);
		dropzone.parentElement.replaceChild(dropzoneClone, dropzone);
		const activeDropzone = dropzoneClone;

		activeDropzone.addEventListener('click', (e) => {
			e.preventDefault();
			e.stopPropagation();
			fileInput.click();
		});
		activeDropzone.addEventListener('dragover', (e) => {
			e.preventDefault();
			e.stopPropagation();
			activeDropzone.classList.add('border-primary');
		});
		activeDropzone.addEventListener('dragleave', (e) => {
			e.preventDefault();
			e.stopPropagation();
			activeDropzone.classList.remove('border-primary');
		});
		activeDropzone.addEventListener('drop', (e) => {
			e.preventDefault();
			e.stopPropagation();
			activeDropzone.classList.remove('border-primary');
			const dtFiles = (e.dataTransfer || {}).files || [];
			handleFiles(Array.from(dtFiles));
		});

		const fileInputClone = fileInput.cloneNode(true);
		fileInput.parentElement.replaceChild(fileInputClone, fileInput);
		fileInputClone.addEventListener('change', (e) => {
			handleFiles(Array.from(e.target.files));
			fileInputClone.value = '';
		});

		function handleFiles(selected) {
			for (const f of selected) {
				if (filesList.length >= nbMaxFiles) {
					FlashMessage.displayError('Maximum '+nbMaxFiles+' fichiers autorisés.');
					break;
				}
				if (f.size > maxFileSize) {
					FlashMessage.displayError('Le fichier '+f.name+' dépasse la taille maximale.');
					continue;
				}
				filesList.push(f);
				setFilesList(filesList);
				renderPreview(f);
			}
		}

		function renderPreview(file) {
			const id = 'f_' + Math.random().toString(36).slice(2, 9);
			const wrap = document.createElement('div');
			wrap.className = 'border rounded p-2 d-inline-flex align-items-center';
			wrap.dataset.fileId = id;
			wrap.style.background = 'white';
			wrap.innerHTML = `
				<div class="me-2 preview-thumb" style="width:64px; height:48px; display:flex; align-items:center; justify-content:center; overflow:hidden;"></div>
				<div class="small text-truncate" style="max-width:160px;">${(file.name || '').escapeHtml()}</div>
				<button type="button" class="btn-close btn-close-small ms-2" aria-label="Supprimer" style="margin-left:8px;"></button>
			`;
			filesPreview.appendChild(wrap);
			filesPreview.classList.remove('hide');

			// thumbnail for images
			if (file.type.startsWith('image/')) {
				const reader = new FileReader();
				reader.onload = function (e) {
					wrap.querySelector('.preview-thumb').innerHTML = `<img src="${e.target.result}" alt="" style="max-width:100%; max-height:100%;" />`;
				};
				reader.readAsDataURL(file);
			} else {
				wrap.querySelector('.preview-thumb').innerHTML = `<i class="fas fa-file fa-2x text-muted"></i>`;
			}

			wrap.querySelector('.btn-close').addEventListener('click', () => {
				const name = file.name, size = file.size;
				filesList = filesList.filter(f => !(f.name === name && f.size === size));
				setFilesList(filesList);
				wrap.remove();

				if (filesList.length === 0) {
					filesPreview.classList.add('hide');
				}
			});
		}
	}
}

export { MultiFilesInput };