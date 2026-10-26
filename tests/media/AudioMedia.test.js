import { AudioMedia } from '../../media/AudioMedia.js';

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