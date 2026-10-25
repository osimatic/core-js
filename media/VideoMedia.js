import { toEl } from '../utils/util.js';

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

export { VideoMedia };
