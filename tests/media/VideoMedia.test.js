import { VideoMedia } from '../../media/VideoMedia.js';

describe('VideoMedia', () => {
	describe('class structure', () => {
		test('should have initPlayPauseClick method', () => {
			expect(typeof VideoMedia.initPlayPauseClick).toBe('function');
		});
	});
});