import { jest } from '@jest/globals';
import { File } from '../../file/File.js';

describe('File', () => {
	describe('formatFileSize', () => {
		test('should format zero bytes', () => {
			const result = File.formatFileSize(0);
			expect(result).toBe('0 kB');
		});

		test('should format bytes to kB', () => {
			const result = File.formatFileSize(1024);
			expect(result).toContain('1');
			expect(result).toContain('kB');
		});

		test('should format bytes to MB', () => {
			const result = File.formatFileSize(1024 * 1024);
			expect(result).toContain('1');
			expect(result).toContain('MB');
		});

		test('should format bytes to GB', () => {
			const result = File.formatFileSize(1024 * 1024 * 1024);
			expect(result).toContain('1');
			expect(result).toContain('GB');
		});

		test('should format bytes to TB', () => {
			const result = File.formatFileSize(1024 * 1024 * 1024 * 1024);
			expect(result).toContain('1');
			expect(result).toContain('TB');
		});

		test('should format with custom fraction digits', () => {
			const result = File.formatFileSize(1536, 0); // 1.5 kB
			expect(result).toContain('kB');
		});

		test('should format with default 2 fraction digits', () => {
			const result = File.formatFileSize(1536); // 1.5 kB
			expect(result).toContain('1,5');
			expect(result).toContain('kB');
		});

		test('should handle small values (min 0.1)', () => {
			const result = File.formatFileSize(50);
			expect(result).toContain('0,1');
			expect(result).toContain('kB');
		});

		test('should format with en-US locale', () => {
			const result = File.formatFileSize(1536, 2, 'en-US');
			expect(result).toContain('1.5');
			expect(result).toContain('kB');
		});

		test('should handle very large files', () => {
			const result = File.formatFileSize(1024 * 1024 * 1024 * 1024 * 1024); // 1 PB
			expect(result).toContain('PB');
		});

		test('should format complex size', () => {
			const result = File.formatFileSize(5242880); // 5 MB
			expect(result).toContain('5');
			expect(result).toContain('MB');
		});

		test('should format with 3 fraction digits', () => {
			const result = File.formatFileSize(1536, 3);
			expect(result).toContain('1,5');
			expect(result).toContain('kB');
		});
	});

	describe('blobToBase64', () => {
		beforeEach(() => {
			// Mock FileReader
			global.FileReader = jest.fn(function() {
				this.readAsDataURL = jest.fn(function(blob) {
					// Simulate async read
					setTimeout(() => {
						this.result = 'data:text/plain;base64,SGVsbG8=';
						if (this.onload) {
							this.onload();
						}
					}, 0);
				});
			});
		});

		test('should convert blob to base64', (done) => {
			const mockBlob = new Blob(['Hello'], { type: 'text/plain' });

			File.blobToBase64(mockBlob, (result) => {
				expect(result).toBe('data:text/plain;base64,SGVsbG8=');
				done();
			});
		});

		test('should call callback with result', (done) => {
			const mockBlob = new Blob(['Test'], { type: 'text/plain' });
			const callback = jest.fn((result) => {
				expect(callback).toHaveBeenCalledWith('data:text/plain;base64,SGVsbG8=');
				done();
			});

			File.blobToBase64(mockBlob, callback);
		});
	});

	describe('download', () => {
		let mockBlob, mockURL, mockA;

		beforeEach(() => {
			// Mock Blob
			global.Blob = jest.fn((content, options) => ({
				content,
				type: options.type
			}));

			// Mock URL.createObjectURL and revokeObjectURL
			mockURL = {
				createObjectURL: jest.fn(() => 'blob:mock-url'),
				revokeObjectURL: jest.fn()
			};

			// Mock document.createElement
			mockA = {
				href: '',
				download: '',
				click: jest.fn(),
				setAttribute: jest.fn()
			};

			global.document = {
				createElement: jest.fn(() => mockA),
				body: {
					appendChild: jest.fn()
				}
			};

			global.window = {
				URL: mockURL,
				navigator: {
					msSaveBlob: undefined
				}
			};

			jest.useFakeTimers();
		});

		afterEach(() => {
			jest.useRealTimers();
		});

		test('should create blob with correct content type', () => {
			File.download('test data', 'text/plain', 'attachment; filename="test.txt"');

			expect(global.Blob).toHaveBeenCalledWith(['test data'], { type: 'text/plain' });
		});

		test('should extract filename from content disposition', () => {
			File.download('data', 'text/plain', 'attachment; filename="document.pdf"');

			expect(mockA.download).toBe('document.pdf');
		});

		test('should handle inline disposition', () => {
			File.download('data', 'text/plain', 'inline; filename="image.png"');

			expect(mockA.download).toBe('image.png');
		});

		test('should use default filename when none provided', () => {
			File.download('data', 'application/pdf', '');

			expect(mockA.download).toBe('file.pdf');
		});

		test('should create download link and trigger click', () => {
			File.download('data', 'text/plain', 'attachment; filename="test.txt"');

			expect(mockURL.createObjectURL).toHaveBeenCalled();
			expect(mockA.href).toBe('blob:mock-url');
			expect(document.body.appendChild).toHaveBeenCalledWith(mockA);
			expect(mockA.click).toHaveBeenCalled();
		});

		test('should revoke object URL after timeout', () => {
			File.download('data', 'text/plain', 'attachment; filename="test.txt"');

			jest.advanceTimersByTime(100);

			expect(mockURL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
		});

		test('should handle filename with quotes', () => {
			File.download('data', 'text/plain', 'attachment; filename="test\'s file.txt"');

			expect(mockA.download).toBe("tests file.txt");
		});

		test('should handle IE with msSaveBlob', () => {
			window.navigator.msSaveBlob = jest.fn();

			File.download('data', 'text/plain', 'attachment; filename="test.txt"');

			expect(window.navigator.msSaveBlob).toHaveBeenCalled();
		});
	});
});