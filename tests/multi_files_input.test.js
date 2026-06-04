/**
 * @jest-environment jsdom
 */
import { MultiFilesInput } from '../multi_files_input.js';
import { FlashMessage } from '../flash_message.js';

// Mock FileReader
class MockFileReader {
	constructor() {
		this.readAsDataURL = jest.fn(function(file) {
			setTimeout(() => {
				if (file.type && file.type.startsWith('image/')) {
					this.result = 'data:image/png;base64,iVBORw0KGgoAAAANS';
				}
				if (this.onload) {
					this.onload({ target: this });
				}
			}, 0);
		});
	}
}

global.FileReader = MockFileReader;

let mockRandomCounter = 0;
const originalMathRandom = Math.random;
const MB = 1024 * 1024;

describe('MultiFilesInput', () => {
	let setFilesListSpy;

	function setupDOM(nbMaxFiles = 5, maxFileSize = MB) {
		document.body.innerHTML = `
			<div class="form-group">
				<input type="file" id="fileInput" />
			</div>
		`;
		const fileInput = document.getElementById('fileInput');
		const formGroup = document.querySelector('.form-group');
		setFilesListSpy = jest.fn();
		MultiFilesInput.init(fileInput, setFilesListSpy, nbMaxFiles, maxFileSize);
		return {
			fileInput,
			formGroup,
			get dropzone() { return formGroup.querySelector('.multi_files_input_dropzone'); },
			get filesPreview() { return formGroup.querySelector('.multi_files_input_files_preview'); },
			get activeInput() { return formGroup.querySelector('input[type="file"]'); },
		};
	}

	function triggerChange(activeInput, files) {
		Object.defineProperty(activeInput, 'files', { value: files, configurable: true });
		activeInput.dispatchEvent(new Event('change'));
	}

	function makeMockFile(name, size, type = 'text/plain') {
		const f = new File(['x'], name, { type });
		Object.defineProperty(f, 'size', { value: size });
		Object.defineProperty(f, 'name', { value: name });
		Object.defineProperty(f, 'type', { value: type });
		return f;
	}

	beforeEach(() => {
		jest.spyOn(FlashMessage, 'displayError');
		mockRandomCounter = 0;
		Math.random = jest.fn(() => {
			mockRandomCounter++;
			return 0.123456789 + mockRandomCounter * 0.001;
		});
	});

	afterEach(() => {
		jest.restoreAllMocks();
		Math.random = originalMathRandom;
		jest.clearAllTimers();
		document.body.innerHTML = '';
	});

	describe('init', () => {
		test('should create dropzone when it does not exist', () => {
			const { formGroup } = setupDOM();
			const dropzone = formGroup.querySelector('.multi_files_input_dropzone');
			expect(dropzone).not.toBeNull();
			expect(dropzone.textContent).toContain('Glissez-déposez vos fichiers ici');
		});

		test('should not create dropzone when it already exists', () => {
			document.body.innerHTML = `
				<div class="form-group">
					<input type="file" id="fileInput" />
					<div class="multi_files_input_dropzone"></div>
				</div>
			`;
			const fileInput = document.getElementById('fileInput');
			const formGroup = document.querySelector('.form-group');
			MultiFilesInput.init(fileInput, jest.fn(), 5, MB);
			expect(formGroup.querySelectorAll('.multi_files_input_dropzone')).toHaveLength(1);
		});

		test('should create files preview container when it does not exist', () => {
			const { formGroup } = setupDOM();
			expect(formGroup.querySelector('.multi_files_input_files_preview')).not.toBeNull();
		});

		test('should not create preview container when it already exists', () => {
			document.body.innerHTML = `
				<div class="form-group">
					<input type="file" id="fileInput" />
					<div class="multi_files_input_files_preview"></div>
				</div>
			`;
			const fileInput = document.getElementById('fileInput');
			const formGroup = document.querySelector('.form-group');
			MultiFilesInput.init(fileInput, jest.fn(), 5, MB);
			expect(formGroup.querySelectorAll('.multi_files_input_files_preview')).toHaveLength(1);
		});

		test('should hide file input element', () => {
			const { activeInput } = setupDOM();
			expect(activeInput.classList.contains('hide')).toBe(true);
		});

		test('should empty files preview container on init', () => {
			const { formGroup } = setupDOM();
			const filesPreview = formGroup.querySelector('.multi_files_input_files_preview');
			filesPreview.innerHTML = '<div>old content</div>';

			// Re-init
			const activeInput = formGroup.querySelector('input[type="file"]');
			MultiFilesInput.init(activeInput, jest.fn(), 5, MB);

			expect(formGroup.querySelector('.multi_files_input_files_preview').innerHTML).toBe('');
		});

		test('should setup click handler on dropzone', () => {
			document.body.innerHTML = `
				<div class="form-group">
					<input type="file" id="fileInput" />
				</div>
			`;
			const fileInput = document.getElementById('fileInput');
			const formGroup = document.querySelector('.form-group');
			const clickSpy = jest.spyOn(fileInput, 'click');

			MultiFilesInput.init(fileInput, jest.fn(), 5, MB);

			const dropzone = formGroup.querySelector('.multi_files_input_dropzone');
			dropzone.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

			expect(clickSpy).toHaveBeenCalled();
		});

		test('should setup dragover handler on dropzone', () => {
			const { dropzone } = setupDOM();
			dropzone.dispatchEvent(new Event('dragover', { cancelable: true }));
			expect(dropzone.classList.contains('border-primary')).toBe(true);
		});

		test('should setup dragleave handler on dropzone', () => {
			const { dropzone } = setupDOM();
			dropzone.classList.add('border-primary');
			dropzone.dispatchEvent(new Event('dragleave', { cancelable: true }));
			expect(dropzone.classList.contains('border-primary')).toBe(false);
		});

		test('should setup drop handler on dropzone', () => {
			const { dropzone } = setupDOM();
			const mockFile = makeMockFile('test.txt', 500);

			const dropEvent = new Event('drop', { cancelable: true });
			Object.defineProperty(dropEvent, 'dataTransfer', { value: { files: [mockFile] } });
			dropzone.dispatchEvent(dropEvent);

			expect(setFilesListSpy).toHaveBeenCalled();
		});

		test('should setup change handler on file input', () => {
			const { activeInput } = setupDOM();
			const mockFile = makeMockFile('test.txt', 500);

			triggerChange(activeInput, [mockFile]);

			expect(setFilesListSpy).toHaveBeenCalled();
		});
	});

	describe('dropzone interactions', () => {
		test('should trigger file input click when dropzone is clicked', () => {
			document.body.innerHTML = `
				<div class="form-group">
					<input type="file" id="fileInput" />
				</div>
			`;
			const fileInput = document.getElementById('fileInput');
			const formGroup = document.querySelector('.form-group');
			const clickSpy = jest.spyOn(fileInput, 'click');

			MultiFilesInput.init(fileInput, jest.fn(), 5, MB);

			const dropzone = formGroup.querySelector('.multi_files_input_dropzone');
			dropzone.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

			expect(clickSpy).toHaveBeenCalled();
		});

		test('should add border-primary class on dragover', () => {
			const { dropzone } = setupDOM();
			dropzone.dispatchEvent(new Event('dragover', { cancelable: true }));
			expect(dropzone.classList.contains('border-primary')).toBe(true);
		});

		test('should remove border-primary class on dragleave', () => {
			const { dropzone } = setupDOM();
			dropzone.classList.add('border-primary');
			dropzone.dispatchEvent(new Event('dragleave', { cancelable: true }));
			expect(dropzone.classList.contains('border-primary')).toBe(false);
		});

		test('should handle file drop', () => {
			const { dropzone } = setupDOM();
			const mockFile = makeMockFile('test.txt', 500);

			const dropEvent = new Event('drop', { cancelable: true });
			Object.defineProperty(dropEvent, 'dataTransfer', { value: { files: [mockFile] } });
			dropzone.dispatchEvent(dropEvent);

			expect(setFilesListSpy).toHaveBeenCalledWith([mockFile]);
		});

		test('should handle drop with no files', () => {
			const { dropzone } = setupDOM();

			const dropEvent = new Event('drop', { cancelable: true });
			Object.defineProperty(dropEvent, 'dataTransfer', { value: {} });

			expect(() => {
				dropzone.dispatchEvent(dropEvent);
			}).not.toThrow();

			expect(setFilesListSpy).not.toHaveBeenCalled();
		});
	});

	describe('file handling', () => {
		test('should add valid file to files list', () => {
			const { activeInput } = setupDOM(3, MB);
			const mockFile = makeMockFile('test.txt', 500);

			triggerChange(activeInput, [mockFile]);

			expect(setFilesListSpy).toHaveBeenCalledWith([mockFile]);
		});

		test('should not exceed maximum number of files', () => {
			const { activeInput } = setupDOM(3, MB);
			const files = [
				makeMockFile('test1.txt', 500),
				makeMockFile('test2.txt', 500),
				makeMockFile('test3.txt', 500),
				makeMockFile('test4.txt', 500),
			];

			triggerChange(activeInput, files);

			expect(setFilesListSpy).toHaveBeenCalledTimes(3);
			expect(FlashMessage.displayError).toHaveBeenCalledWith('Maximum 3 fichiers autorisés.');
		});

		test('should reject file exceeding max size', () => {
			const { activeInput } = setupDOM(3, MB);
			const mockFile = makeMockFile('large.txt', 2 * MB);

			triggerChange(activeInput, [mockFile]);

			expect(FlashMessage.displayError).toHaveBeenCalledWith('Le fichier large.txt dépasse la taille maximale.');
			expect(setFilesListSpy).not.toHaveBeenCalled();
		});

		test('should handle multiple valid files', () => {
			const { activeInput } = setupDOM(3, MB);
			const f1 = makeMockFile('test1.txt', 500);
			const f2 = makeMockFile('test2.txt', 600);

			triggerChange(activeInput, [f1, f2]);

			expect(setFilesListSpy).toHaveBeenCalledTimes(2);
			const lastCall = setFilesListSpy.mock.calls[1][0];
			expect(lastCall).toHaveLength(2);
			expect(lastCall).toContain(f1);
			expect(lastCall).toContain(f2);
		});

		test('should skip oversized file and continue with valid files', () => {
			const { activeInput } = setupDOM(3, MB);
			const f1 = makeMockFile('small.txt', 500);
			const f2 = makeMockFile('large.txt', 2 * MB);
			const f3 = makeMockFile('small2.txt', 600);

			triggerChange(activeInput, [f1, f2, f3]);

			expect(setFilesListSpy).toHaveBeenCalledTimes(2);
			const lastCall = setFilesListSpy.mock.calls[1][0];
			expect(lastCall).toHaveLength(2);
			expect(lastCall).toContain(f1);
			expect(lastCall).toContain(f3);
			expect(lastCall).not.toContain(f2);
			expect(FlashMessage.displayError).toHaveBeenCalledWith('Le fichier large.txt dépasse la taille maximale.');
		});
	});

	describe('file preview rendering', () => {
		test('should render preview for non-image file', () => {
			const { activeInput, filesPreview } = setupDOM(3, MB);
			const mockFile = makeMockFile('document.pdf', 500, 'application/pdf');

			triggerChange(activeInput, [mockFile]);

			expect(filesPreview.querySelector('[data-file-id]')).not.toBeNull();
			expect(filesPreview.classList.contains('hide')).toBe(false);
			expect(filesPreview.querySelector('.preview-thumb').innerHTML).toContain('fas fa-file');
		});

		test('should render preview with image thumbnail for image file', (done) => {
			const { activeInput, filesPreview } = setupDOM(3, MB);
			const mockFile = makeMockFile('photo.png', 500, 'image/png');

			triggerChange(activeInput, [mockFile]);

			setTimeout(() => {
				expect(filesPreview.querySelector('.preview-thumb').innerHTML).toContain('<img src="data:image/png;base64,');
				done();
			}, 10);
		});

		test('should generate unique file ID', () => {
			const { activeInput, filesPreview } = setupDOM(3, MB);
			const mockFile = makeMockFile('test.txt', 500);

			triggerChange(activeInput, [mockFile]);

			const wrap = filesPreview.querySelector('[data-file-id]');
			expect(wrap).not.toBeNull();
			expect(wrap.dataset.fileId).toMatch(/^f_/);
		});

		test('should setup close button handler', () => {
			const { activeInput, filesPreview } = setupDOM(3, MB);
			const mockFile = makeMockFile('test.txt', 500);

			triggerChange(activeInput, [mockFile]);

			expect(filesPreview.querySelector('.btn-close')).not.toBeNull();
		});
	});

	describe('file removal', () => {
		test('should remove file from list when close button clicked', () => {
			const { activeInput, filesPreview } = setupDOM(3, MB);
			const mockFile = makeMockFile('test.txt', 500);

			triggerChange(activeInput, [mockFile]);

			const btnClose = filesPreview.querySelector('.btn-close');
			btnClose.dispatchEvent(new Event('click'));

			expect(setFilesListSpy).toHaveBeenLastCalledWith([]);
			expect(filesPreview.querySelector('[data-file-id]')).toBeNull();
		});

		test('should hide preview container when last file is removed', () => {
			const { activeInput, filesPreview } = setupDOM(3, MB);
			const mockFile = makeMockFile('test.txt', 500);

			triggerChange(activeInput, [mockFile]);

			const btnClose = filesPreview.querySelector('.btn-close');
			btnClose.dispatchEvent(new Event('click'));

			expect(filesPreview.classList.contains('hide')).toBe(true);
		});

		test('should not hide preview container when files remain', () => {
			const { activeInput, filesPreview } = setupDOM(3, MB);
			const f1 = makeMockFile('test1.txt', 500);
			const f2 = makeMockFile('test2.txt', 600);

			triggerChange(activeInput, [f1, f2]);
			setFilesListSpy.mockClear();

			// Remove first file
			const btnClose = filesPreview.querySelectorAll('.btn-close')[0];
			btnClose.dispatchEvent(new Event('click'));

			expect(setFilesListSpy).toHaveBeenLastCalledWith([f2]);
			expect(filesPreview.classList.contains('hide')).toBe(false);
		});

		test('should remove file by name and size reference', () => {
			const { activeInput, filesPreview } = setupDOM(3, MB);
			const f1 = makeMockFile('test.txt', 500);
			const f2 = makeMockFile('test.txt', 600); // same name, different size
			const f3 = makeMockFile('other.txt', 700);

			triggerChange(activeInput, [f1, f2, f3]);
			setFilesListSpy.mockClear();

			// Remove the first wrap (corresponds to f1)
			const btnClose = filesPreview.querySelectorAll('.btn-close')[0];
			btnClose.dispatchEvent(new Event('click'));

			const lastCall = setFilesListSpy.mock.calls[setFilesListSpy.mock.calls.length - 1];
			expect(lastCall[0]).toHaveLength(2);
		});
	});

	describe('XSS protection', () => {
		test('should escape HTML tags in filename', () => {
			const { activeInput, filesPreview } = setupDOM(3, MB);
			const mockFile = makeMockFile('<script>alert("xss")</script>.txt', 500);

			triggerChange(activeInput, [mockFile]);

			const nameDiv = filesPreview.querySelector('.small.text-truncate');
			expect(nameDiv.innerHTML).toContain('&lt;script&gt;');
			expect(nameDiv.innerHTML).not.toContain('<script>');
		});

		test('should escape quotes in filename', () => {
			const { activeInput, filesPreview } = setupDOM(3, MB);
			const mockFile = makeMockFile('file"with\'quotes.txt', 500);

			triggerChange(activeInput, [mockFile]);

			const nameDiv = filesPreview.querySelector('.small.text-truncate');
			expect(nameDiv.textContent).toContain('"');
			expect(nameDiv.textContent).toContain("'");
		});

		test('should escape ampersand in filename', () => {
			const { activeInput, filesPreview } = setupDOM(3, MB);
			const mockFile = makeMockFile('file&name.txt', 500);

			triggerChange(activeInput, [mockFile]);

			const nameDiv = filesPreview.querySelector('.small.text-truncate');
			expect(nameDiv.innerHTML).toContain('&amp;');
			expect(nameDiv.innerHTML).not.toMatch(/file&name\.txt/);
		});

		test('should handle filename with all dangerous characters', () => {
			const { activeInput, filesPreview } = setupDOM(3, MB);
			const mockFile = makeMockFile('<>"&\'/test.txt', 500);

			triggerChange(activeInput, [mockFile]);

			const nameDiv = filesPreview.querySelector('.small.text-truncate');
			expect(nameDiv.innerHTML).toContain('&lt;');
			expect(nameDiv.innerHTML).toContain('&gt;');
			expect(nameDiv.textContent).toContain('"');
			expect(nameDiv.innerHTML).toContain('&amp;');
			expect(nameDiv.textContent).toContain("'");
			expect(nameDiv.textContent).toContain('/');
		});
	});

	describe('edge cases', () => {
		test('should handle empty file selection', () => {
			const { activeInput } = setupDOM(3, MB);

			triggerChange(activeInput, []);

			expect(setFilesListSpy).not.toHaveBeenCalled();
		});

		test('should handle file with zero size', () => {
			const { activeInput } = setupDOM(3, MB);
			const mockFile = makeMockFile('empty.txt', 0);

			triggerChange(activeInput, [mockFile]);

			expect(setFilesListSpy).toHaveBeenCalledWith([mockFile]);
		});

		test('should handle file at exact max size', () => {
			const { activeInput } = setupDOM(3, MB);
			const mockFile = makeMockFile('exact.txt', MB);

			triggerChange(activeInput, [mockFile]);

			expect(setFilesListSpy).toHaveBeenCalledWith([mockFile]);
			expect(FlashMessage.displayError).not.toHaveBeenCalled();
		});

		test('should handle file one byte over max size', () => {
			const { activeInput } = setupDOM(3, MB);
			const mockFile = makeMockFile('oversize.txt', MB + 1);

			triggerChange(activeInput, [mockFile]);

			expect(FlashMessage.displayError).toHaveBeenCalledWith('Le fichier oversize.txt dépasse la taille maximale.');
			expect(setFilesListSpy).not.toHaveBeenCalled();
		});

		test('should handle special characters in filename', () => {
			const { activeInput, filesPreview } = setupDOM(3, MB);
			const mockFile = makeMockFile('file with spaces & special#chars.txt', 500);

			triggerChange(activeInput, [mockFile]);

			expect(setFilesListSpy).toHaveBeenCalledWith([mockFile]);
			const nameDiv = filesPreview.querySelector('.small.text-truncate');
			expect(nameDiv.innerHTML).toContain('&amp;');
		});

		test('should handle various image types', () => {
			const imageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];

			imageTypes.forEach((type) => {
				document.body.innerHTML = `
					<div class="form-group">
						<input type="file" id="fileInput" />
					</div>
				`;
				const fileInput = document.getElementById('fileInput');
				const formGroup = document.querySelector('.form-group');
				const spy = jest.fn();
				MultiFilesInput.init(fileInput, spy, 3, MB);
				const activeInput = formGroup.querySelector('input[type="file"]');

				const mockFile = makeMockFile(`photo.${type.split('/')[1]}`, 500, type);
				triggerChange(activeInput, [mockFile]);

				expect(spy).toHaveBeenCalled();
				spy.mockClear();
			});
		});

		test('should handle max files limit of 0', () => {
			const { activeInput } = setupDOM(0, MB);
			const mockFile = makeMockFile('test.txt', 500);

			triggerChange(activeInput, [mockFile]);

			expect(FlashMessage.displayError).toHaveBeenCalledWith('Maximum 0 fichiers autorisés.');
			expect(setFilesListSpy).not.toHaveBeenCalled();
		});

		test('should handle max files limit of 1', () => {
			const { activeInput } = setupDOM(1, MB);
			const f1 = makeMockFile('test1.txt', 500);
			const f2 = makeMockFile('test2.txt', 600);

			triggerChange(activeInput, [f1, f2]);

			expect(setFilesListSpy).toHaveBeenCalledTimes(1);
			expect(setFilesListSpy).toHaveBeenCalledWith([f1]);
			expect(FlashMessage.displayError).toHaveBeenCalledWith('Maximum 1 fichiers autorisés.');
		});

		test('should handle file with null name', () => {
			const { activeInput, filesPreview } = setupDOM(3, MB);
			const mockFile = makeMockFile(null, 500);

			triggerChange(activeInput, [mockFile]);

			expect(setFilesListSpy).toHaveBeenCalledWith([mockFile]);
			const nameDiv = filesPreview.querySelector('.small.text-truncate');
			expect(nameDiv).not.toBeNull();
		});

		test('should handle file with undefined name', () => {
			const { activeInput, filesPreview } = setupDOM(3, MB);
			const mockFile = makeMockFile(undefined, 500);

			triggerChange(activeInput, [mockFile]);

			expect(setFilesListSpy).toHaveBeenCalledWith([mockFile]);
			const nameDiv = filesPreview.querySelector('.small.text-truncate');
			expect(nameDiv).not.toBeNull();
		});
	});
});