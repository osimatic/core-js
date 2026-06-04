import { AudioMedia, VideoMedia, UserMedia } from '../media.js';

describe('media.js', () => {
	describe('AudioMedia', () => {
		describe('getPlayer', () => {
			test('should return audio element HTML string', () => {
				const result = AudioMedia.getPlayer('http://example.com/audio.wav');
				expect(typeof result).toBe('string');
				expect(result).toContain('<audio');
				expect(result).toContain('</audio>');
			});

			test('should include the playUrl in source src', () => {
				const playUrl = 'http://example.com/test.wav';
				const result = AudioMedia.getPlayer(playUrl);
				expect(result).toContain(`src="${playUrl}"`);
			});

			test('should include controls attribute', () => {
				const result = AudioMedia.getPlayer('http://example.com/audio.wav');
				expect(result).toContain('controls');
			});

			test('should include preload="none" attribute', () => {
				const result = AudioMedia.getPlayer('http://example.com/audio.wav');
				expect(result).toContain('preload="none"');
			});

			test('should set audio type to audio/x-wav', () => {
				const result = AudioMedia.getPlayer('http://example.com/audio.wav');
				expect(result).toContain('type="audio/x-wav"');
			});

			test('should handle URLs with special characters', () => {
				const playUrl = 'http://example.com/audio file with spaces.wav';
				const result = AudioMedia.getPlayer(playUrl);
				expect(result).toContain(playUrl);
			});
		});
	});

	describe('VideoMedia', () => {
		describe('class structure', () => {
			test('should have initPlayPauseClick method', () => {
				expect(typeof VideoMedia.initPlayPauseClick).toBe('function');
			});
		});
	});

	describe('UserMedia', () => {
		let originalNavigator;

		beforeEach(() => {
			// Save original navigator
			originalNavigator = global.navigator;
		});

		afterEach(() => {
			// Restore original navigator
			global.navigator = originalNavigator;
			jest.clearAllMocks();
		});

		describe('hasGetUserMedia', () => {
			test('should return true when navigator.getUserMedia exists', () => {
				global.navigator = { getUserMedia: jest.fn() };
				expect(UserMedia.hasGetUserMedia()).toBe(true);
			});

			test('should return true when navigator.webkitGetUserMedia exists', () => {
				global.navigator = { webkitGetUserMedia: jest.fn() };
				expect(UserMedia.hasGetUserMedia()).toBe(true);
			});

			test('should return true when navigator.mozGetUserMedia exists', () => {
				global.navigator = { mozGetUserMedia: jest.fn() };
				expect(UserMedia.hasGetUserMedia()).toBe(true);
			});

			test('should return true when navigator.msGetUserMedia exists', () => {
				global.navigator = { msGetUserMedia: jest.fn() };
				expect(UserMedia.hasGetUserMedia()).toBe(true);
			});

			test('should return false when no getUserMedia available', () => {
				global.navigator = {};
				expect(UserMedia.hasGetUserMedia()).toBe(false);
			});

			test('should return false when navigator is undefined', () => {
				global.navigator = undefined;
				expect(UserMedia.hasGetUserMedia()).toBe(false);
			});
		});

		const UA_CHROME = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
		const UA_FIREFOX = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0';
		const UA_SAFARI = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15';
		const UA_EDGE = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0';
		const UA_OPERA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 OPR/106.0.0.0';

		describe('requestMediaPermissions', () => {
			beforeEach(() => {
				global.navigator = {
					mediaDevices: {
						getUserMedia: jest.fn()
					}
				};
				global.window = {
					navigator: { userAgent: UA_CHROME }
				};
			});

			test('should resolve with stream on success', async () => {
				const mockStream = { id: 'test-stream' };
				global.navigator.mediaDevices.getUserMedia.mockResolvedValue(mockStream);

				const result = await UserMedia.requestMediaPermissions({ audio: true, video: true });

				expect(result).toBe(mockStream);
				expect(global.navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({ audio: true, video: true });
			});

			test('should use default constraints when not provided', async () => {
				const mockStream = { id: 'test-stream' };
				global.navigator.mediaDevices.getUserMedia.mockResolvedValue(mockStream);

				await UserMedia.requestMediaPermissions();

				expect(global.navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({ audio: true, video: true });
			});

			test('should handle Chrome NotAllowedError with system permission denied', async () => {
				const error = new Error('Permission denied by system');
				error.name = 'NotAllowedError';
				global.navigator.mediaDevices.getUserMedia.mockRejectedValue(error);

				await expect(UserMedia.requestMediaPermissions({ audio: true }))
					.rejects.toEqual({
						type: 'SystemPermissionDenied',
						name: 'NotAllowedError',
						message: 'Permission denied by system'
					});
			});

			test('should handle Chrome NotAllowedError with user permission denied', async () => {
				const error = new Error('Permission denied');
				error.name = 'NotAllowedError';
				global.navigator.mediaDevices.getUserMedia.mockRejectedValue(error);

				await expect(UserMedia.requestMediaPermissions({ audio: true }))
					.rejects.toEqual({
						type: 'UserPermissionDenied',
						name: 'NotAllowedError',
						message: 'Permission denied'
					});
			});

			test('should handle Chrome NotReadableError', async () => {
				const error = new Error('Could not start video source');
				error.name = 'NotReadableError';
				global.navigator.mediaDevices.getUserMedia.mockRejectedValue(error);

				await expect(UserMedia.requestMediaPermissions({ video: true }))
					.rejects.toEqual({
						type: 'CouldNotStartVideoSource',
						name: 'NotReadableError',
						message: 'Could not start video source'
					});
			});

			test('should handle Safari NotAllowedError', async () => {
				const error = new Error('Permission denied');
				error.name = 'NotAllowedError';
				global.navigator.mediaDevices.getUserMedia.mockRejectedValue(error);
				global.window.navigator.userAgent = UA_SAFARI;

				await expect(UserMedia.requestMediaPermissions({ audio: true }))
					.rejects.toEqual({
						type: 'UserPermissionDenied',
						name: 'NotAllowedError',
						message: 'Permission denied'
					});
			});

			test('should handle Microsoft Edge NotAllowedError', async () => {
				const error = new Error('Permission denied');
				error.name = 'NotAllowedError';
				global.navigator.mediaDevices.getUserMedia.mockRejectedValue(error);
				global.window.navigator.userAgent = UA_EDGE;

				await expect(UserMedia.requestMediaPermissions({ audio: true }))
					.rejects.toEqual({
						type: 'UserPermissionDenied',
						name: 'NotAllowedError',
						message: 'Permission denied'
					});
			});

			test('should handle Microsoft Edge NotReadableError', async () => {
				const error = new Error('Could not start video source');
				error.name = 'NotReadableError';
				global.navigator.mediaDevices.getUserMedia.mockRejectedValue(error);
				global.window.navigator.userAgent = UA_EDGE;

				await expect(UserMedia.requestMediaPermissions({ video: true }))
					.rejects.toEqual({
						type: 'CouldNotStartVideoSource',
						name: 'NotReadableError',
						message: 'Could not start video source'
					});
			});

			test('should handle Firefox NotFoundError', async () => {
				const error = new Error('Requested device not found');
				error.name = 'NotFoundError';
				global.navigator.mediaDevices.getUserMedia.mockRejectedValue(error);
				global.window.navigator.userAgent = UA_FIREFOX;

				await expect(UserMedia.requestMediaPermissions({ audio: true }))
					.rejects.toEqual({
						type: 'SystemPermissionDenied',
						name: 'NotFoundError',
						message: 'Requested device not found'
					});
			});

			test('should handle Firefox NotReadableError', async () => {
				const error = new Error('Media device not readable');
				error.name = 'NotReadableError';
				global.navigator.mediaDevices.getUserMedia.mockRejectedValue(error);
				global.window.navigator.userAgent = UA_FIREFOX;

				await expect(UserMedia.requestMediaPermissions({ audio: true }))
					.rejects.toEqual({
						type: 'SystemPermissionDenied',
						name: 'NotReadableError',
						message: 'Media device not readable'
					});
			});

			test('should handle Firefox NotAllowedError', async () => {
				const error = new Error('Permission denied');
				error.name = 'NotAllowedError';
				global.navigator.mediaDevices.getUserMedia.mockRejectedValue(error);
				global.window.navigator.userAgent = UA_FIREFOX;

				await expect(UserMedia.requestMediaPermissions({ audio: true }))
					.rejects.toEqual({
						type: 'UserPermissionDenied',
						name: 'NotAllowedError',
						message: 'Permission denied'
					});
			});

			test('should handle Firefox AbortError', async () => {
				const error = new Error('Operation aborted');
				error.name = 'AbortError';
				global.navigator.mediaDevices.getUserMedia.mockRejectedValue(error);
				global.window.navigator.userAgent = UA_FIREFOX;

				await expect(UserMedia.requestMediaPermissions({ audio: true }))
					.rejects.toEqual({
						type: 'CouldNotStartVideoSource',
						name: 'AbortError',
						message: 'Operation aborted'
					});
			});

			test('should handle generic error for unknown browser', async () => {
				const error = new Error('Unknown error');
				error.name = 'UnknownError';
				global.navigator.mediaDevices.getUserMedia.mockRejectedValue(error);
				global.window.navigator.userAgent = UA_OPERA;

				await expect(UserMedia.requestMediaPermissions({ audio: true }))
					.rejects.toEqual({
						type: 'Generic',
						name: 'UnknownError',
						message: 'Unknown error'
					});
			});

			test('should handle generic error for unknown error type', async () => {
				const error = new Error('Weird error');
				error.name = 'WeirdError';
				global.navigator.mediaDevices.getUserMedia.mockRejectedValue(error);

				await expect(UserMedia.requestMediaPermissions({ audio: true }))
					.rejects.toEqual({
						type: 'Generic',
						name: 'WeirdError',
						message: 'Weird error'
					});
			});
		});

		describe('requestAudioPermissions', () => {
			beforeEach(() => {
				global.navigator = {
					mediaDevices: {
						getUserMedia: jest.fn()
					}
				};
				global.window = {
					navigator: { userAgent: UA_CHROME }
				};
			});

			test('should call requestMediaPermissions with audio:true, video:false', async () => {
				const mockStream = { id: 'audio-stream' };
				global.navigator.mediaDevices.getUserMedia.mockResolvedValue(mockStream);

				const result = await UserMedia.requestAudioPermissions();

				expect(result).toBe(mockStream);
				expect(global.navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({
					audio: true,
					video: false
				});
			});

			test('should pass audio constraints when provided', async () => {
				const mockStream = { id: 'audio-stream' };
				global.navigator.mediaDevices.getUserMedia.mockResolvedValue(mockStream);
				const audioConstraints = { echoCancellation: true };

				await UserMedia.requestAudioPermissions(audioConstraints);

				expect(global.navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({
					audio: audioConstraints,
					video: false
				});
			});
		});

		describe('requestVideoPermissions', () => {
			beforeEach(() => {
				global.navigator = {
					mediaDevices: {
						getUserMedia: jest.fn()
					}
				};
				global.window = {
					navigator: { userAgent: UA_CHROME }
				};
			});

			test('should call requestMediaPermissions with audio and video', async () => {
				const mockStream = { id: 'video-stream' };
				global.navigator.mediaDevices.getUserMedia.mockResolvedValue(mockStream);

				const result = await UserMedia.requestVideoPermissions();

				expect(result).toBe(mockStream);
				expect(global.navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({
					audio: true,
					video: true
				});
			});

			test('should pass audio and video constraints when provided', async () => {
				const mockStream = { id: 'video-stream' };
				global.navigator.mediaDevices.getUserMedia.mockResolvedValue(mockStream);
				const audioConstraints = { echoCancellation: true };
				const videoConstraints = { width: 1280, height: 720 };

				await UserMedia.requestVideoPermissions(audioConstraints, videoConstraints);

				expect(global.navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({
					audio: audioConstraints,
					video: videoConstraints
				});
			});
		});

		describe('requestMutedVideoPermissions', () => {
			beforeEach(() => {
				global.navigator = {
					mediaDevices: {
						getUserMedia: jest.fn()
					}
				};
				global.window = {
					navigator: { userAgent: UA_CHROME }
				};
			});

			test('should call requestMediaPermissions with audio:false, video:true', async () => {
				const mockStream = { id: 'muted-video-stream' };
				global.navigator.mediaDevices.getUserMedia.mockResolvedValue(mockStream);

				const result = await UserMedia.requestMutedVideoPermissions();

				expect(result).toBe(mockStream);
				expect(global.navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({
					audio: false,
					video: true
				});
			});

			test('should pass video constraints when provided', async () => {
				const mockStream = { id: 'muted-video-stream' };
				global.navigator.mediaDevices.getUserMedia.mockResolvedValue(mockStream);
				const videoConstraints = { facingMode: 'user' };

				await UserMedia.requestMutedVideoPermissions(videoConstraints);

				expect(global.navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({
					audio: false,
					video: videoConstraints
				});
			});
		});
	});
});