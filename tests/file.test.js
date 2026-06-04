import { File, CSV, Img } from '../file.js';

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

describe('CSV', () => {
	describe('checkFile', () => {
		test('should return true for valid CSV file with text/csv type', () => {
			expect(CSV.checkFile('data.csv', 'text/csv')).toBe(true);
		});

		test('should return true for valid CSV file with application/vnd.ms-excel type', () => {
			expect(CSV.checkFile('report.csv', 'application/vnd.ms-excel')).toBe(true);
		});

		test('should return false for CSV file with wrong mime type', () => {
			expect(CSV.checkFile('data.csv', 'application/json')).toBe(false);
		});

		test('should return false for non-CSV file with CSV mime type', () => {
			expect(CSV.checkFile('data.txt', 'text/csv')).toBe(false);
		});

		test('should return false for xlsx file', () => {
			expect(CSV.checkFile('data.xlsx', 'application/vnd.ms-excel')).toBe(false);
		});

		test('should handle uppercase extension', () => {
			expect(CSV.checkFile('data.CSV', 'text/csv')).toBe(true);
		});

		test('should handle mixed case extension', () => {
			expect(CSV.checkFile('data.CsV', 'text/csv')).toBe(true);
		});

		test('should handle filename with multiple dots', () => {
			expect(CSV.checkFile('my.data.file.csv', 'text/csv')).toBe(true);
		});

		test('should return true for application/octet-stream', () => {
			expect(CSV.checkFile('data.csv', 'application/octet-stream')).toBe(true);
		});

		test('should return true for text/plain', () => {
			expect(CSV.checkFile('data.csv', 'text/plain')).toBe(true);
		});

		test('should return false for empty filename', () => {
			expect(CSV.checkFile('', 'text/csv')).toBe(false);
		});

		test('should return false for filename without extension', () => {
			expect(CSV.checkFile('data', 'text/csv')).toBe(false);
		});
	});
});

describe('Img', () => {
	describe('compress', () => {
		test('should compress data by extracting non-zero values', () => {
			const data = new Uint8Array([65, 0, 0, 0, 66, 0, 0, 0, 67, 0, 0, 0]);
			const result = Img.compress(data);
			expect(result).toBe('ABC');
		});

		test('should handle empty array', () => {
			const data = new Uint8Array([]);
			const result = Img.compress(data);
			expect(result).toBe('');
		});

		test('should handle all zero values', () => {
			const data = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0]);
			const result = Img.compress(data);
			expect(result).toBe('');
		});

		test('should handle array with one non-zero value', () => {
			const data = new Uint8Array([72, 0, 0, 0]);
			const result = Img.compress(data);
			expect(result).toBe('H');
		});

		test('should handle special characters', () => {
			const data = new Uint8Array([33, 0, 0, 0, 64, 0, 0, 0, 35, 0, 0, 0]);
			const result = Img.compress(data);
			expect(result).toBe('!@#');
		});

		test('should only read every 4th byte', () => {
			const data = new Uint8Array([65, 66, 67, 68, 69, 70, 71, 72]);
			const result = Img.compress(data);
			expect(result).toBe('AE');
		});

		test('should handle ASCII printable characters', () => {
			const data = new Uint8Array([72, 0, 0, 0, 101, 0, 0, 0, 108, 0, 0, 0, 108, 0, 0, 0, 111, 0, 0, 0]);
			const result = Img.compress(data);
			expect(result).toBe('Hello');
		});

		test('should skip zero values in first position', () => {
			const data = new Uint8Array([0, 0, 0, 0, 65, 0, 0, 0]);
			const result = Img.compress(data);
			expect(result).toBe('A');
		});
	});

	describe('setBlobToImg', () => {
		let mockImg;
		let mockURL;
		let consoleErrorSpy;
		let RealBlob;
		let MockBlob;

		beforeEach(() => {
			// Save real Blob before any mocking
			RealBlob = global.Blob;

			// Create a MockBlob class that passes instanceof checks
			MockBlob = class MockBlob {
				constructor(content, options) {
					this.content = content;
					this.type = options?.type || '';
					this.size = content && content.length ? content.reduce((sum, part) => sum + part.length, 0) : 0;
				}
			};

			// Set global.Blob to our MockBlob so instanceof checks pass
			global.Blob = MockBlob;

			mockImg = { src: '' };

			// Mock URL.createObjectURL
			mockURL = {
				createObjectURL: jest.fn(() => 'blob:mock-url-12345')
			};

			global.window = {
				URL: mockURL
			};

			// Spy on console.error
			consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
		});

		afterEach(() => {
			delete global.window;
			consoleErrorSpy.mockRestore();
			// Restore real Blob if it was changed
			if (RealBlob) {
				global.Blob = RealBlob;
			}
		});

		test('should create object URL from blob', () => {
			const mockBlob = new Blob(['test'], { type: 'image/png' });

			Img.setBlobToImg(mockImg, mockBlob);

			expect(mockURL.createObjectURL).toHaveBeenCalledWith(mockBlob);
		});

		test('should set img src attribute with created URL', () => {
			const mockBlob = new Blob(['test'], { type: 'image/png' });

			Img.setBlobToImg(mockImg, mockBlob);

			expect(mockImg.src).toBe('blob:mock-url-12345');
		});

		test('should handle different blob types', () => {
			const mockBlob = new Blob(['data'], { type: 'image/jpeg' });

			Img.setBlobToImg(mockImg, mockBlob);

			expect(mockURL.createObjectURL).toHaveBeenCalledWith(mockBlob);
			expect(mockImg.src).toBe('blob:mock-url-12345');
		});

		test('should use webkitURL as fallback when URL is not available', () => {
			const mockWebkitURL = {
				createObjectURL: jest.fn(() => 'blob:webkit-url-67890')
			};

			global.window = {
				URL: undefined,
				webkitURL: mockWebkitURL
			};

			const mockBlob = new Blob(['test'], { type: 'image/png' });

			Img.setBlobToImg(mockImg, mockBlob);

			expect(mockWebkitURL.createObjectURL).toHaveBeenCalledWith(mockBlob);
			expect(mockImg.src).toBe('blob:webkit-url-67890');
		});

		test('should return early and log error when img is null', () => {
			const mockBlob = new Blob(['test'], { type: 'image/png' });

			Img.setBlobToImg(null, mockBlob);

			expect(consoleErrorSpy).toHaveBeenCalledWith('Invalid img element provided to setBlobToImg');
			expect(mockURL.createObjectURL).not.toHaveBeenCalled();
		});

		test('should return early and log error when img is undefined', () => {
			const mockBlob = new Blob(['test'], { type: 'image/png' });

			Img.setBlobToImg(undefined, mockBlob);

			expect(consoleErrorSpy).toHaveBeenCalledWith('Invalid img element provided to setBlobToImg');
			expect(mockURL.createObjectURL).not.toHaveBeenCalled();
		});


		test('should return early and log error when blob is null', () => {
			Img.setBlobToImg(mockImg, null);

			expect(consoleErrorSpy).toHaveBeenCalledWith('Invalid blob provided to setBlobToImg', null);
			expect(mockURL.createObjectURL).not.toHaveBeenCalled();
		});

		test('should return early and log error when blob is undefined', () => {
			Img.setBlobToImg(mockImg, undefined);

			expect(consoleErrorSpy).toHaveBeenCalledWith('Invalid blob provided to setBlobToImg', undefined);
			expect(mockURL.createObjectURL).not.toHaveBeenCalled();
		});

		test('should return early and log error when blob is not a Blob instance', () => {
			const notABlob = { data: 'test' };

			Img.setBlobToImg(mockImg, notABlob);

			expect(consoleErrorSpy).toHaveBeenCalledWith('Invalid blob provided to setBlobToImg', notABlob);
			expect(mockURL.createObjectURL).not.toHaveBeenCalled();
		});

		test('should return early and log error when blob.size is 0', () => {
			const emptyBlob = new Blob([], { type: 'image/png' });

			Img.setBlobToImg(mockImg, emptyBlob);

			expect(consoleErrorSpy).toHaveBeenCalledWith('Invalid blob provided to setBlobToImg', emptyBlob);
			expect(mockURL.createObjectURL).not.toHaveBeenCalled();
		});


		test('should catch and log error when createObjectURL throws', () => {
			mockURL.createObjectURL = jest.fn(() => {
				throw new Error('Quota exceeded');
			});

			global.window = {
				URL: mockURL
			};

			const mockBlob = new Blob(['test'], { type: 'image/png' });

			Img.setBlobToImg(mockImg, mockBlob);

			expect(consoleErrorSpy).toHaveBeenCalledWith(
				'Error creating object URL from blob:',
				expect.objectContaining({ message: 'Quota exceeded' })
			);
			expect(mockImg.src).toBe('');
		});

		test('should catch and log error when setting img.src throws', () => {
			const throwingImg = {};
			Object.defineProperty(throwingImg, 'src', {
				set: () => { throw new Error('Invalid element'); },
				get: () => '',
			});

			const mockBlob = new Blob(['test'], { type: 'image/png' });

			Img.setBlobToImg(throwingImg, mockBlob);

			expect(consoleErrorSpy).toHaveBeenCalledWith(
				'Error creating object URL from blob:',
				expect.objectContaining({ message: 'Invalid element' })
			);
		});
	});

	describe('getBase64FromUrl', () => {
		beforeEach(() => {
			// Mock fetch
			global.fetch = jest.fn(() =>
				Promise.resolve({
					blob: () => Promise.resolve(new Blob(['test'], { type: 'text/plain' }))
				})
			);

			// Mock FileReader
			global.FileReader = jest.fn(function() {
				this.readAsDataURL = jest.fn(function(blob) {
					setTimeout(() => {
						this.result = 'data:text/plain;base64,dGVzdA==';
						if (this.onloadend) {
							this.onloadend();
						}
					}, 0);
				});
			});
		});

		test('should fetch and convert URL to base64', async () => {
			const result = await Img.getBase64FromUrl('https://example.com/image.png');

			expect(global.fetch).toHaveBeenCalledWith('https://example.com/image.png');
			expect(result).toBe('data:text/plain;base64,dGVzdA==');
		});

		test('should handle different URLs', async () => {
			const result = await Img.getBase64FromUrl('https://test.com/photo.jpg');

			expect(global.fetch).toHaveBeenCalledWith('https://test.com/photo.jpg');
			expect(result).toBeDefined();
		});

		test('should return a promise', () => {
			const result = Img.getBase64FromUrl('https://example.com/image.png');

			expect(result).toBeInstanceOf(Promise);
		});
	});
});