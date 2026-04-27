import { Locale } from './locale.js';

class Duration {

	// -------------------------------------------------------------------------
	// Days formatting
	// -------------------------------------------------------------------------

	static formatDays(days, locale = Locale.getDefault()) {
		return new Intl.NumberFormat(locale, {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		}).format(days);
	}

	static formatDaysIfPositive(days) {
		return days < 0 ? '-' : this.formatDays(days);
	}

	static formatDaysWithColor(days) {
		return '<span class="text-' + (days < 0 ? 'danger' : 'success') + '">' + this.formatDays(days) + '</span>';
	}

	// -------------------------------------------------------------------------
	// Seconds — conversion
	// -------------------------------------------------------------------------

	static parseTimeInputToSeconds(timeInput) {
		if (null === timeInput || -1 === timeInput.indexOf(':')) {
			return 0;
		}
		let arrayTime = timeInput.split(':');
		const nbHours   = typeof arrayTime[0] != 'undefined' ? parseInt(arrayTime[0]) || 0 : 0;
		const nbMinutes = typeof arrayTime[1] != 'undefined' ? parseInt(arrayTime[1]) || 0 : 0;
		const nbSeconds = typeof arrayTime[2] != 'undefined' ? parseInt(arrayTime[2]) || 0 : 0;
		return nbHours * 3600 + nbMinutes * 60 + nbSeconds;
	}

	// -------------------------------------------------------------------------
	// Seconds — formatting
	// -------------------------------------------------------------------------

	static formatSecondsAsTimeInput(seconds) {
		return Duration.formatSecondsAsChrono(Math.abs(seconds), 'input_time');
	}

	static formatSecondsAsChrono(seconds, displayMode = 'chrono', withSeconds = true) {
		seconds = Math.round(seconds);
		const absoluteSeconds = Math.abs(seconds);

		let secs = absoluteSeconds % 60;
		let remainder = (absoluteSeconds % 3600) - secs;
		let minutes = remainder / 60;
		remainder = absoluteSeconds - (absoluteSeconds % 3600);
		let hours = remainder / 3600;

		hours = hours.toString().length < 2 ? '0' + hours : hours;
		minutes = minutes.toString().length < 2 ? '0' + minutes : minutes;

		let result = (seconds < 0 ? '- ' : '') + hours + ':' + minutes;
		if (withSeconds) {
			secs = secs.toString().length < 2 ? '0' + secs : secs;
			result += (displayMode === 'input_time' ? ':' : '.') + secs;
		}
		return result;
	}

	static formatSecondsAsString(seconds, withSeconds = true, withMinutes = true, withMinuteLabel = true, fullLabel = false, hideHourIfZero = false) {
		seconds = Math.round(seconds);

		// Hours
		let strHours = '';
		let nbHours = this.totalHours(seconds);
		if (!hideHourIfZero || nbHours > 0) {
			strHours += nbHours;
			if (fullLabel) {
				strHours += ' heure' + (nbHours > 1 ? 's' : '');
			} else {
				strHours += 'h';
			}
		}

		// Minutes
		let strMinutes = '';
		if (withMinutes) {
			let nbMinutes = this.remainingMinutes(seconds);
			strMinutes += ' ';
			if (fullLabel) {
				strMinutes += nbMinutes.toString() + (withMinuteLabel ? ' minute' + (nbMinutes > 1 ? 's' : '') : '');
			} else {
				strMinutes += nbMinutes.toString().padStart(2, '0') + (withMinuteLabel ? 'min' : '');
			}
		}

		// Seconds
		let strSeconds = '';
		if (withSeconds) {
			let nbSeconds = this.remainingSeconds(seconds);
			strSeconds += ' ';
			if (fullLabel) {
				strSeconds += nbSeconds.toString() + ' seconde' + (nbSeconds > 1 ? 's' : '');
			} else {
				strSeconds += nbSeconds.toString().padStart(2, '0') + 's';
			}
		}

		return (strHours + strMinutes + strSeconds).trim();
	}

	// -------------------------------------------------------------------------
	// Seconds — rounding
	// -------------------------------------------------------------------------

	static roundSeconds(seconds, precision, roundMode = 'close') {
		let hours   = Math.floor(seconds / 3600);
		let minutes = Math.floor((seconds % 3600) / 60);
		let secs    = seconds % 60;

		let hoursRounded   = hours;
		let minutesRounded = minutes;
		let secondsRounded = secs;

		if (precision > 0) {
			let minutesRemaining = minutes % precision;
			let minutesRemainingAndSecondsAsFraction = minutesRemaining + secs / 60;
			if (minutesRemainingAndSecondsAsFraction === 0) {
				// already aligned, no rounding needed
			} else {
				let halfPrecision = precision / 2;
				hoursRounded   = hours;
				secondsRounded = 0;
				if (roundMode === 'up' || (roundMode === 'close' && minutesRemainingAndSecondsAsFraction > halfPrecision)) {
					// Round up
					if (minutes > (60 - precision)) {
						minutesRounded = 0;
						hoursRounded++;
					} else {
						minutesRounded = (minutes - minutesRemaining) + precision;
					}
				} else {
					// Round down
					minutesRounded = minutes - minutesRemaining;
				}
			}
		}

		return hoursRounded * 3600 + minutesRounded * 60 + secondsRounded;
	}

	// -------------------------------------------------------------------------
	// Seconds — total extraction
	// -------------------------------------------------------------------------

	static totalDays(seconds) {
		return Math.floor(seconds / 86400);
	}

	static totalHours(seconds) {
		return Math.floor(seconds / 3600);
	}

	static totalMinutes(seconds) {
		return Math.floor(seconds / 60);
	}

	// -------------------------------------------------------------------------
	// Seconds — remaining extraction
	// -------------------------------------------------------------------------

	static remainingHours(seconds) {
		return this.totalHours(seconds % 86400);
	}

	static remainingMinutes(seconds) {
		return this.totalMinutes(seconds % 3600);
	}

	static remainingSeconds(seconds) {
		return seconds % 60;
	}

	// -------------------------------------------------------------------------
	// Decimal hours (hundredth of an hour)
	// -------------------------------------------------------------------------

	static toDecimalHours(seconds) {
		let hour    = Math.floor(seconds / 3600);
		let minutes = Math.floor((seconds % 3600) / 60);
		let centieme = Math.round((minutes / 60) * 100);
		return hour + (centieme / 100);
	}

	static getHoursFromDecimal(decimalHours) {
		return Math.trunc(decimalHours);
	}

	static getMinutesFromDecimal(decimalHours) {
		const decimal = decimalHours - Math.floor(decimalHours);
		return Math.floor(decimal * 60);
	}

	// -------------------------------------------------------------------------
	// Deprecated aliases — kept for backwards compatibility
	// -------------------------------------------------------------------------

	/** @deprecated Use {@link formatDays} instead */
	static formatNbDays(nbDays, locale = Locale.getDefault()) { return this.formatDays(nbDays, locale); }
	/** @deprecated Use {@link formatDaysIfPositive} instead */
	static formatNbDaysIfPositive(nbDays) { return this.formatDaysIfPositive(nbDays); }
	/** @deprecated Use {@link formatDaysWithColor} instead */
	static formatNbDaysWithColor(nbDays) { return this.formatDaysWithColor(nbDays); }

	/** @deprecated Use {@link parseTimeInputToSeconds} instead */
	static convertInputTimeValueToDuration(inputTimeValue) { return this.parseTimeInputToSeconds(inputTimeValue); }
	/** @deprecated Use {@link formatSecondsAsTimeInput} instead */
	static convertToDurationAsInputTimeValue(durationInSeconds) { return this.formatSecondsAsTimeInput(durationInSeconds); }
	/** @deprecated Use {@link formatSecondsAsChrono} instead */
	static convertToDurationInHourChronoDisplay(durationInSeconds, displayMode = 'chrono') { return this.formatSecondsAsChrono(durationInSeconds, displayMode); }
	/** @deprecated Use {@link formatSecondsAsString} instead */
	static convertToDurationInHourStringDisplay(durationInSeconds, withSeconds = true, withMinutes = true, withMinuteLabel = true, fullLabel = false, hideHourIfZeroHour = false) { return this.formatSecondsAsString(durationInSeconds, withSeconds, withMinutes, withMinuteLabel, fullLabel, hideHourIfZeroHour); }
	/** @deprecated Use {@link roundSeconds} instead */
	static roundNbSeconds(durationInSeconds, roundPrecision, roundMode = 'close') { return this.roundSeconds(durationInSeconds, roundPrecision, roundMode); }

	/** @deprecated Use {@link totalDays} instead */
	static getNbDaysOfDurationInSeconds(durationInSeconds) { return this.totalDays(durationInSeconds); }
	/** @deprecated Use {@link totalHours} instead */
	static getNbHoursOfDurationInSeconds(durationInSeconds) { return this.totalHours(durationInSeconds); }
	/** @deprecated Use {@link totalMinutes} instead */
	static getNbMinutesOfDurationInSeconds(durationInSeconds) { return this.totalMinutes(durationInSeconds); }

	/** @deprecated Use {@link remainingHours} instead */
	static getNbHoursRemainingOfDurationInSeconds(durationInSeconds) { return this.remainingHours(durationInSeconds); }
	/** @deprecated Use {@link remainingMinutes} instead */
	static getNbMinutesRemainingOfDurationInSeconds(durationInSeconds) { return this.remainingMinutes(durationInSeconds); }
	/** @deprecated Use {@link remainingSeconds} instead */
	static getNbSecondsRemainingOfDurationInSeconds(durationInSeconds) { return this.remainingSeconds(durationInSeconds); }

	/** @deprecated Use {@link toDecimalHours} instead */
	static convertToDurationAsHundredthOfAnHour(durationInSeconds) { return this.toDecimalHours(durationInSeconds); }
	/** @deprecated Use {@link getHoursFromDecimal} instead */
	static getNbHoursOfHundredthOfAnHour(durationAsHundredthOfAnHour) { return this.getHoursFromDecimal(durationAsHundredthOfAnHour); }
	/** @deprecated Use {@link getMinutesFromDecimal} instead */
	static getNbMinutesOfHundredthOfAnHour(durationAsHundredthOfAnHour) { return this.getMinutesFromDecimal(durationAsHundredthOfAnHour); }

}

export { Duration };