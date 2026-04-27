import { toEl } from './util.js';

class CountDown {

	static init(div, options = {}) {
		div = toEl(div);
		if (!div) {
			return;
		}

		const {
			onRefreshData,
			labelNextUpdate = 'Prochaine mise à jour',
			labelDoUpdate = 'Mettre à jour',
		} = options;

		div.insertAdjacentHTML('beforeend', '<div class="count_down_title">'+labelNextUpdate+'</div>');
		div.insertAdjacentHTML('beforeend', '<div class="count_down_progress"><div class="count_down_current"></div></div>');
		div.insertAdjacentHTML('beforeend', '<div class="count_down_text"></div>');
		div.insertAdjacentHTML('beforeend', '<div class="count_down_link"><a href="#">'+labelDoUpdate+'</a></div>');

		let alreadyMakingRequest = false;
		let secondsBefRefresh = 10;
		let refreshIntervalMillis = 60;
		let currentMillis = 0;
		let currentSecond = 0;

		function getLinkA() {
			return div.querySelector('.count_down_link a');
		}

		function refreshData() {
			currentMillis = 0;

			//Pour ne pas relancer une requête si la précédente n'est pas encore finie
			if (true === alreadyMakingRequest) {
				console.log('Already making request, no new request lauched.');
				return;
			}

			if (typeof onRefreshData == 'function') {
				alreadyMakingRequest = true;
				const linkA = getLinkA();
				if (linkA) linkA.disabled = true;

				onRefreshData(
					// completeCallback
					() => {
						alreadyMakingRequest = false;
						const linkA = getLinkA();
						if (linkA) linkA.disabled = false;
					}
				);
			}
		}

		const linkA = getLinkA();
		if (linkA) {
			linkA.addEventListener('click', (e) => {
				e.preventDefault();
				refreshData();
			});
		}

		setInterval(() => {
			const linkA = getLinkA();
			if (!linkA || !linkA.disabled) {
				currentMillis += refreshIntervalMillis;
			}
			else {
				currentMillis = 0;
			}

			currentSecond = parseInt(currentMillis / 1000);

			let divCountDownText;
			let divCountDownCurrentSizePx;

			if (currentSecond >= secondsBefRefresh) {
				divCountDownCurrentSizePx = 120;
				divCountDownText = '0s';
			}
			else {
				divCountDownCurrentSizePx = Math.round((120/(secondsBefRefresh*1000)) * currentMillis);
				divCountDownText = (secondsBefRefresh-currentSecond) + 's';
			}

			const countDownCurrent = div.querySelector('.count_down_current');
			if (countDownCurrent) {
				countDownCurrent.style.width = divCountDownCurrentSizePx + 'px';
			}
			const countDownText = div.querySelector('.count_down_text');
			if (countDownText) {
				countDownText.innerHTML = divCountDownText;
			}

			if (currentSecond >= secondsBefRefresh) {
				currentMillis = 0;
				setTimeout(() => {
					refreshData();
				}, 100);
			}
		}, refreshIntervalMillis);

		refreshData();
	}

}

export { CountDown };