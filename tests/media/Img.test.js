import { jest } from '@jest/globals';
import { Img } from '../../media/Img.js';

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