import { DateTime } from '../calendar/DateTime.js';
import { toEl } from '../utils/util.js';

// input period de type : Du <input type="date" name="start_date" /> au <input type="date" name="end_date" />
class InputPeriod {

	static addLinks(form) {
		form = toEl(form);
		if (!form) {
			return;
		}

		const input = form.querySelector('input[type="date"][data-add_period_select_links]');
		if (!input) {
			return;
		}
		let divParent = input.parentElement;
		if (divParent.classList.contains('input-group')) {
			divParent = divParent.parentElement;
		}
		divParent.insertAdjacentHTML('beforeend', ''
			+'<div class="select_period_links">'
			+'<a href="#" class="period_select_yesterday">Hier</a> - '
			+'<a href="#" class="period_select_current_week">Cette semaine</a> - '
			+'<a href="#" class="period_select_last_week">La semaine dernière</a> - '
			+'<a href="#" class="period_select_current_month">Ce mois-ci</a> - '
			+'<a href="#" class="period_select_last_month">Le mois dernier</a> - '
			+'<a href="#" class="period_select_current_year">Cette année</a>'
			+'</div>'
		);
		this.init(form);
	}

	static init(form) {
		form = toEl(form);
		if (!form) {
			return;
		}
		//console.log(form.querySelector('a.period_select_current_week'));

		const linkToday = form.querySelector('a.period_select_today');
		if (linkToday) {
			linkToday.addEventListener('click', (e) => { e.preventDefault(); InputPeriod.selectToday(linkToday); });
		}
		const linkYesterday = form.querySelector('a.period_select_yesterday');
		if (linkYesterday) {
			linkYesterday.addEventListener('click', (e) => { e.preventDefault(); InputPeriod.selectPreviousDay(linkYesterday, 1); });
		}
		const linkTomorrow = form.querySelector('a.period_select_tomorrow');
		if (linkTomorrow) {
			linkTomorrow.addEventListener('click', (e) => { e.preventDefault(); InputPeriod.selectFollowingDay(linkTomorrow, 1); });
		}
		const linkCurrentWeek = form.querySelector('a.period_select_current_week');
		if (linkCurrentWeek) {
			linkCurrentWeek.addEventListener('click', (e) => { e.preventDefault(); InputPeriod.selectCurrentWeek(linkCurrentWeek); });
		}
		const linkLastWeek = form.querySelector('a.period_select_last_week');
		if (linkLastWeek) {
			linkLastWeek.addEventListener('click', (e) => { e.preventDefault(); InputPeriod.selectPreviousWeek(linkLastWeek, 1); });
		}
		const linkCurrentMonth = form.querySelector('a.period_select_current_month');
		if (linkCurrentMonth) {
			linkCurrentMonth.addEventListener('click', (e) => { e.preventDefault(); InputPeriod.selectCurrentMonth(linkCurrentMonth); });
		}
		const linkLastMonth = form.querySelector('a.period_select_last_month');
		if (linkLastMonth) {
			linkLastMonth.addEventListener('click', (e) => { e.preventDefault(); InputPeriod.selectPreviousMonth(linkLastMonth, 1); });
		}
		const linkCurrentYear = form.querySelector('a.period_select_current_year');
		if (linkCurrentYear) {
			linkCurrentYear.addEventListener('click', (e) => { e.preventDefault(); InputPeriod.selectCurrentYear(linkCurrentYear); });
		}
		const linkLastYear = form.querySelector('a.period_select_last_year');
		if (linkLastYear) {
			linkLastYear.addEventListener('click', (e) => { e.preventDefault(); InputPeriod.selectPreviousYear(linkLastYear, 1); });
		}
	}


	static todayUtc() {
		const now = new Date();
		return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
	}

	static selectToday(link) {
		this.selectFollowingDay(link, 0);
	}

	static selectPreviousDay(lien, nbDays) {
		this.selectFollowingDay(lien, -nbDays);
	}
	static selectFollowingDay(lien, nbDays) {
		let date = this.todayUtc();
		date.setUTCDate(date.getUTCDate() + nbDays);
		this.selectPeriod(lien, date, date);
	}

	static selectCurrentWeek(lien) {
		this.selectFollowingWeek(lien, 0);
	}
	static selectPreviousWeek(lien, nbWeeks) {
		this.selectFollowingWeek(lien, -nbWeeks);
	}
	static selectFollowingWeek(lien, nbWeeks) {
		let date = this.todayUtc();
		date.setUTCDate(date.getUTCDate() + (7*nbWeeks));
		this.selectPeriod(lien, DateTime.getFirstDayOfWeek(date), DateTime.getLastDayOfWeek(date));
	}

	static selectCurrentMonth(lien) {
		this.selectFollowingMonth(lien, 0);
	}
	static selectPreviousMonth(lien, nbMonths) {
		this.selectFollowingMonth(lien, -nbMonths);
	}
	static selectFollowingMonth(lien, nbMonths) {
		let date = this.todayUtc();
		date.setUTCDate(1);
		date.setUTCMonth(date.getUTCMonth() + nbMonths);
		this.selectPeriod(lien, DateTime.getFirstDayOfMonth(date), DateTime.getLastDayOfMonth(date));
	}

	static selectCurrentYear(lien) {
		this.selectFollowingYear(lien, 0);
	}
	static selectPreviousYear(lien, nbAnneesMoins) {
		this.selectFollowingYear(lien, -nbAnneesMoins);
	}
	static selectFollowingYear(lien, nbAnneesMoins) {
		let date = this.todayUtc();
		date.setUTCFullYear(date.getUTCFullYear() + nbAnneesMoins);
		this.selectPeriod(lien, DateTime.getFirstDayOfYear(date), DateTime.getLastDayOfYear(date));
	}


	static selectPeriod(link, startDate, endDate) {
		const container = link.parentElement.parentElement;
		const inputPeriodStart = container.querySelector('input[type="date"][name="date_start"], input[type="date"][name="start_date"], input[type="date"][name="start_period"], input[type="date"][name="period_start_date"]');
		const inputPeriodEnd = container.querySelector('input[type="date"][name="date_end"], input[type="date"][name="end_date"], input[type="date"][name="end_period"], input[type="date"][name="period_end_date"]');
		if (!inputPeriodStart || !inputPeriodEnd) {
			console.log('no period input found');
			return;
		}

		inputPeriodStart.value = DateTime.getDateForInputDate(startDate, 'UTC');
		inputPeriodEnd.value = DateTime.getDateForInputDate(endDate, 'UTC');
	}

}

export { InputPeriod };
