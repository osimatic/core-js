const { toEl } = require('./util');
const { DateTime } = require('./date_time');
const {Locale} = require('./locale');
const {SelectBox} = require('./select_box');

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


	static selectToday(link) {
		let date = new Date();
		this.selectPeriod(link, date, date);
	}

	static selectPreviousDay(lien, nbDays) {
		this.selectFollowingDay(lien, -nbDays);
	}
	static selectFollowingDay(lien, nbDays) {
		let date = new Date();
		date.setUTCDate(date.getUTCDate() + nbDays);
		this.selectPeriod(lien, date, date);
	}

	static selectCurrentWeek(lien) {
		let date = new Date();
		this.selectPeriod(lien, DateTime.getFirstDayOfWeek(date), DateTime.getLastDayOfWeek(date));
	}
	static selectPreviousWeek(lien, nbWeeks) {
		this.selectFollowingWeek(lien, -nbWeeks);
	}
	static selectFollowingWeek(lien, nbWeeks) {
		let date = new Date();
		date.setUTCDate(date.getUTCDate() + (7*nbWeeks));
		this.selectPeriod(lien, DateTime.getFirstDayOfWeek(date), DateTime.getLastDayOfWeek(date));
	}

	static selectCurrentMonth(lien) {
		let date = new Date();
		this.selectPeriod(lien, DateTime.getFirstDayOfMonth(date), DateTime.getLastDayOfMonth(date));
	}
	static selectPreviousMonth(lien, nbMonths) {
		this.selectFollowingMonth(lien, -nbMonths);
	}
	static selectFollowingMonth(lien, nbMonths) {
		let date = new Date();
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
		let date = new Date();
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

		inputPeriodStart.value = DateTime.getDateForInputDate(startDate);
		inputPeriodEnd.value = DateTime.getDateForInputDate(endDate);
	}

}

// input period de type : <select class="period">Aujourd'hui / Ce mois-ci / etc. / Personnalisé</select>
class FormDate {

	static fillYearSelect(select, nbYearsBefore=5, nbYearsAfter=0) {
		select = toEl(select);
		if (!select) {
			return;
		}
		SelectBox.reset(select, true);
		const currentDate = new Date();
		for (let year=currentDate.getUTCFullYear()-nbYearsBefore; year<=(currentDate.getUTCFullYear()+nbYearsAfter); year++) {
			select.insertAdjacentHTML('beforeend', '<option value="'+year+'">'+year+'</option>');
		}
		SelectBox.refresh(select);
	}

	static fillMonthSelect(select, locale=Locale.getDefault()) {
		select = toEl(select);
		if (!select) {
			return;
		}
		SelectBox.reset(select, true);
		for (let month=1; month<=12; month++) {
			select.insertAdjacentHTML('beforeend', '<option value="'+month+'">'+DateTime.getMonthNameByMonth(month, locale).capitalize()+'</option>');
		}
		SelectBox.refresh(select);
	}

	static fillDayOfWeekSelect(select, locale=Locale.getDefault()) {
		select = toEl(select);
		if (!select) {
			return;
		}
		SelectBox.reset(select, true);
		for (let dayOfWeek=1; dayOfWeek<=7; dayOfWeek++) {
			select.insertAdjacentHTML('beforeend', '<option value="'+dayOfWeek+'">'+DateTime.getDayNameByDayOfWeek(dayOfWeek, locale).capitalize()+'</option>');
		}
		SelectBox.refresh(select);
	}

	static fillDayOfMonthSelect(select, maxDay=31) {
		select = toEl(select);
		if (!select) {
			return;
		}
		SelectBox.reset(select, true);
		for (let dayOfMonth=1; dayOfMonth<=maxDay; dayOfMonth++) {
			select.insertAdjacentHTML('beforeend', '<option value="'+dayOfMonth+'">'+dayOfMonth+'</option>');
		}
		SelectBox.refresh(select);
	}

	static initForm(form) {
		form = toEl(form);
		if (!form) {
			return;
		}

		function fillPeriodSelect(select) {
			Object.entries(FormDate.getPeriodList()).forEach(([idx, tabListPeriode]) => {
				let html = '<optgroup label="'+tabListPeriode['label']+'">';
				Object.entries(tabListPeriode['list']).forEach(([key, label]) => {
					html += '<option value="'+key+'">'+label+'</option>';
				});
				html += '</optgroup>';
				select.insertAdjacentHTML('beforeend', html);
			});
			SelectBox.refresh(select);
			if (select.dataset.default_value) {
				SelectBox.setValue(select, select.dataset.default_value);
			}
		}

		function updatePeriodSelect(select) {
			if (select.value === 'perso') {
				select.closest('.form-group').nextElementSibling.classList.remove('hide');
			}
			else {
				select.closest('.form-group').nextElementSibling.classList.add('hide');
			}
		}

		function updateForm(form) {
			let periodSelect = form.querySelector('select.periode');
			if (!periodSelect) {
				return;
			}

			updatePeriodSelect(periodSelect);

			let comparedPeriodSelect = form.querySelector('select.periodeCompare');
			if (!comparedPeriodSelect) {
				return;
			}

			let listValues = [];
			let valueDefault = null;

			comparedPeriodSelect.querySelectorAll('option').forEach(o => o.disabled = false);

			Object.entries(FormDate.getPeriodList()).forEach(([idx, tabListPeriode]) => {
				if (idx != 0) {
					let listKeyPeriode = Object.entries(tabListPeriode['list']).map(([key, value]) => key);
					if (listKeyPeriode.indexOf(periodSelect.value) !== -1) {
						listValues = listKeyPeriode;
						valueDefault = listKeyPeriode[1];
					}
					else {
						const optgroup = comparedPeriodSelect.querySelector('option[value="' + listKeyPeriode[0] + '"]')?.parentElement;
						if (optgroup) { Array.from(optgroup.children).forEach(o => o.disabled = true); }
					}
				}
			});

			if (periodSelect.value === 'perso') {
				valueDefault = 'perso';
			}
			else if (comparedPeriodSelect.value !== 'perso' && listValues.indexOf(comparedPeriodSelect.value) !== -1) {
				valueDefault = comparedPeriodSelect.value;
			}
			comparedPeriodSelect.value = valueDefault;

			updatePeriodSelect(comparedPeriodSelect);
		}

		// ---------- Choix période (new) ----------

		const periodeSelect = form.querySelector('select.periode');
		if (periodeSelect) {
			fillPeriodSelect(periodeSelect);
			periodeSelect.addEventListener('change', () => { updateForm(form); });
		}

		const periodeCompareSelect = form.querySelector('select.periodeCompare');
		if (periodeCompareSelect) {
			fillPeriodSelect(periodeCompareSelect);
			periodeCompareSelect.addEventListener('change', () => { updateForm(form); });
		}

		updateForm(form);

		// ---------- Choix période (old) ----------

		if (form.querySelector('select.day') && form.querySelector('select.month') && form.querySelector('select.year')) {
			form.querySelector('select.year').insertAdjacentHTML('afterend',
				'<br/>'+
				'<p class="select_date_fastly">'+
				'	<a href="#" class="lien_form_today">Auj.</a> - '+
				'	<a href="#" class="lien_form_yesterday">Hier</a> - '+
				'	<a href="#" class="lien_form_current_month">Ce mois-ci</a> - '+
				'	<a href="#" class="lien_form_last_month">Le mois dernier</a> - '+
				'	<a href="#" class="lien_form_current_year">Cette année</a>'+
				'	- '+
				'	<a href="#" class="lien_form_date_prev_day">Jour précédent</a>'+
				'	- '+
				'	<a href="#" class="lien_form_date_next_day">Jour suivant</a>'+
				'</p>'
			);
		}
		else if (form.querySelector('select.month') && form.querySelector('select.year')) {
			form.querySelector('select.year').insertAdjacentHTML('afterend',
				'<br/>'+
				'<p class="select_date_fastly">'+
				'	<a href="#" class="lien_form_current_month">Ce mois-ci</a> - '+
				'	<a href="#" class="lien_form_last_month">Le mois dernier</a> - '+
				'	<a href="#" class="lien_form_current_year">Cette année</a>'+
				'</p>'
			);
		}

		if (form.querySelector('select.dayCompare') && form.querySelector('select.monthCompare') && form.querySelector('select.yearCompare')) {
			form.querySelector('select.yearCompare').insertAdjacentHTML('afterend',
				'<br/>'+
				'<p class="select_date_fastly">'+
				'	<a href="#" class="lien_form_yesterday">Hier</a> - '+
				'	<a href="#" class="lien_form_day_moins_7">J-7</a> - '+
				'	<a href="#" class="lien_form_day_moins_8">J-8</a> - '+
				'	<a href="#" class="lien_form_last_month">Le mois dernier</a> - '+
				'	<a href="#" class="lien_form_month_moins_2">Mois M-2</a> - '+
				'	<a href="#" class="lien_form_last_year">L\'année dernière</a>'+
				'</p>'
			);
		}

		// Lien de sélection de date

		const lienToday = form.querySelector('a.lien_form_today');
		if (lienToday) {
			lienToday.addEventListener('click', (e) => { e.preventDefault(); FormDate.setTodaySelected(lienToday.closest('.form-group')); });
		}
		const lienYesterday = form.querySelector('a.lien_form_yesterday');
		if (lienYesterday) {
			lienYesterday.addEventListener('click', (e) => { e.preventDefault(); FormDate.addNbDaysToToday(lienYesterday.closest('.form-group'), -1); });
		}
		const lienDayMoins7 = form.querySelector('a.lien_form_day_moins_7');
		if (lienDayMoins7) {
			lienDayMoins7.addEventListener('click', (e) => { e.preventDefault(); FormDate.addNbDaysToToday(lienDayMoins7.closest('.form-group'), -7); });
		}
		const lienDayMoins8 = form.querySelector('a.lien_form_day_moins_8');
		if (lienDayMoins8) {
			lienDayMoins8.addEventListener('click', (e) => { e.preventDefault(); FormDate.addNbDaysToToday(lienDayMoins8.closest('.form-group'), -8); });
		}

		const lienCurrentMonth = form.querySelector('a.lien_form_current_month');
		if (lienCurrentMonth) {
			lienCurrentMonth.addEventListener('click', (e) => { e.preventDefault(); FormDate.setCurrentMonthSelected(lienCurrentMonth.closest('.form-group')); });
		}
		const lienLastMonth = form.querySelector('a.lien_form_last_month');
		if (lienLastMonth) {
			lienLastMonth.addEventListener('click', (e) => { e.preventDefault(); FormDate.addNbMonthsToToday(lienLastMonth.closest('.form-group'), -1); });
		}
		const lienMonthMoins2 = form.querySelector('a.lien_form_month_moins_2');
		if (lienMonthMoins2) {
			lienMonthMoins2.addEventListener('click', (e) => { e.preventDefault(); FormDate.addNbMonthsToToday(lienMonthMoins2.closest('.form-group'), -2); });
		}

		const lienCurrentYear = form.querySelector('a.lien_form_current_year');
		if (lienCurrentYear) {
			lienCurrentYear.addEventListener('click', (e) => { e.preventDefault(); FormDate.setCurrentYearSelected(lienCurrentYear.closest('.form-group')); });
		}
		const lienLastYear = form.querySelector('a.lien_form_last_year');
		if (lienLastYear) {
			lienLastYear.addEventListener('click', (e) => { e.preventDefault(); FormDate.addNbYearsToToday(lienLastYear.closest('.form-group'), -1); });
		}

		const lienPrevDay = form.querySelector('a.lien_form_date_prev_day');
		if (lienPrevDay) {
			lienPrevDay.addEventListener('click', (e) => { e.preventDefault(); FormDate.addNbDaysToSelectedDate(lienPrevDay.closest('.form-group'), -1); });
		}
		const lienNextDay = form.querySelector('a.lien_form_date_next_day');
		if (lienNextDay) {
			lienNextDay.addEventListener('click', (e) => { e.preventDefault(); FormDate.addNbDaysToSelectedDate(lienNextDay.closest('.form-group'), 1); });
		}

		//if ($('form select[name=select_date_fastly]').length > 0) {
		//	$('form select[name=select_date_fastly]').change(function() {
		//		valueOptionSelected = $('form select[name=select_date_fastly] option:selected').attr('value');
		//		if (valueOptionSelected == 'today') {
		//			selectFormDateToday();
		//		}
		//		else if (valueOptionSelected == 'current_month') {
		//			selectFormDateCurrentMonth();
		//		}
		//	});
		//}
	}

	static getPeriodList() {
		return {
			other: {label: 'Autre', list: {
				perso: 						'Personnalisé',
			}},
			'1d': {label: 'Un jour', list: { // 1 jour
				'ajd': 									'Aujourd\u2019hui',
				'hier': 								'Hier',
				'jourMoins2': 							'Avant-hier',
				'jourMoins3': 							'J-3',
				'jourMoins7': 							'J-7',
				'jourMoins8': 							'J-8',
				'same_day_last_year': 					'Même jour l\u2019année dernière',
				'same_day_least_2_years': 				'Même jour l\u2019année A-2',
				'same_day_as_yesterday_last_year': 		'Même jour qu\u2019hier l\u2019année dernière',
				'same_day_as_yesterday_least_2_years': 	'Même jour qu\u2019hier l\u2019année A-2'
			}},
			'1w': {label: 'Une semaine', list: { // 1 semaine
				'curr_week': 					'Cette semaine',
				'last_week': 					'La semaine dernière',
				'weekMoins2': 					'Semaine S-2',
				'weekMoins3': 					'Semaine S-3',
				'weekMoins4': 					'Semaine S-4',
			}},
			'7d': {label: '7 jours', list: { // 7 jours
				'last_7_days': 					'Les 7 derniers jours',
				'last_7_days_before': 			'Les 7 jours avant',
				'last_7_days_least_1_year': 	'Les mêmes 7 jours l\u2019année dernière',
				'last_7_days_least_2_years': 	'Les mêmes 7 jours l\u2019année A-2',
			}},
			'14d': {label: '14 jours', list: { // 14 jours
				'last_14_days': 				'Les 14 derniers jours',
				'last_14_days_before': 			'Les 14 jours avant',
				'last_14_days_least_1_year': 	'Les mêmes 14 jours l\u2019année dernière',
				'last_14_days_least_2_years': 	'Les mêmes 14 jours l\u2019année A-2',
			}},
			// 30 jours
			'30d': {label: '30 jours', list: {
				'last_30_days': 				'Les 30 derniers jours',
				'last_30_days_before': 			'Les 30 jours avant',
				'last_30_days_least_1_year': 	'Les mêmes 30 jours l\u2019année dernière',
				'last_30_days_least_2_years': 	'Les mêmes 30 jours l\u2019année A-2',
			}},
			'60d': {label: '60 jours', list: { // 60 jours
				'last_60_days': 				'Les 60 derniers jours',
				'last_60_days_before': 			'Les 60 jours avant',
				'last_60_days_least_1_year': 	'Les mêmes 60 jours l\u2019année dernière',
				'last_60_days_least_2_years': 	'Les mêmes 60 jours l\u2019année A-2',
			}},
			'1m': {label: 'Un mois', list: { // 1 mois
				'curr_month': 					'Ce mois-ci',
				'last_month': 					'Le mois dernier',
				'monthMoins2': 					'Mois M-2',
				'monthMoins3': 					'Mois M-3',
				'monthMoins4': 					'Mois M-4',
				'monthMoins5': 					'Mois M-5',
				'monthMoins6': 					'Mois M-6',
				'same_month_last_year': 		'Même mois l\u2019année dernière',
				'same_month_least_2_years': 	'Même mois l\u2019année A-2',
			}},
			'3m': {label: '3 mois', list: { // 3 mois
				'last_3_month': 				'Les 3 derniers mois',
				'last_3_month_before': 			'Les 3 mois avant',
				'last_3_month_least_1_year': 	'Les mêmes 3 mois l\u2019année dernière',
				'last_3_month_least_2_years': 	'Les mêmes 3 mois l\u2019année A-2',
			}},
			'6m': {label: '6 mois', list: { // 6 mois
				'last_6_month': 				'Les 6 derniers mois',
				'last_6_month_before': 			'Les 6 mois avant',
				'last_6_month_least_1_year': 	'Les mêmes 6 mois l\u2019année dernière',
				'last_6_month_least_2_years': 	'Les mêmes 6 mois l\u2019année A-2',
			}},
			'12m': {label: '12 mois', list: { // 12 mois
				'last_12_month': 				'Les 12 derniers mois',
				'last_12_month_before': 		'Les 12 mois avant',
				'last_12_month_least_1_year': 	'Les mêmes 12 mois l\u2019année dernière',
				'last_12_month_least_2_years': 	'Les mêmes 12 mois l\u2019année A-2',
			}},
			'24m': {label: '24 mois', list: { // 24 mois
				'last_24_month': 				'Les 24 derniers mois',
				'last_24_month_before': 		'Les 24 mois avant',
				'last_24_month_least_1_year': 	'Les mêmes 24 mois l\u2019année dernière',
				'last_24_month_least_2_years': 	'Les mêmes 24 mois l\u2019année A-2',
			}},
			'1y': {label: 'Une année', list: { // 1 année
				'curr_year': 					'Cette année',
				'last_year': 					'L\u2019année dernière',
				'yearMoins2': 					'Année A-2',
				'yearMoins3': 					'Année A-3',
				'yearMoins4': 					'Année A-4',
			}},
		};
	}
	static setTodaySelected(periodFormGroup) {
		let date = new Date();
		FormDate.setSelectedDate(periodFormGroup, date.getDate(), (date.getMonth() + 1), date.getFullYear());
	}
	static setCurrentMonthSelected(periodFormGroup) {
		let date = new Date();
		FormDate.setSelectedDate(periodFormGroup, -1, (date.getMonth() + 1), date.getFullYear());
	}
	static setCurrentYearSelected(periodFormGroup) {
		let today = new Date();
		FormDate.setSelectedDate(periodFormGroup, -1, -1, today.getFullYear());
	}

	static addNbDaysToToday(periodFormGroup, nbDays) {
		FormDate.addNbDaysToSelectedDate(periodFormGroup, nbDays, false);
	}
	static addNbMonthsToToday(periodFormGroup, nbMonths) {
		FormDate.addNbMonthsToSelectedDate(periodFormGroup, nbMonths, false);
	}
	static addNbYearsToToday(periodFormGroup, nbYears) {
		FormDate.addNbYearsToSelectedDate(periodFormGroup, nbYears, false);
	}

	static addNbDaysToSelectedDate(periodFormGroup, nbDays, fromSelectedDate) {
		let date = typeof fromSelectedDate == 'undefined' || fromSelectedDate ? FormDate.getSelectedDate(periodFormGroup) : new Date();
		date.setDate(date.getDate() + nbDays);
		FormDate.setSelectedDate(periodFormGroup, date.getDate(), (date.getMonth() + 1), date.getFullYear());
	}
	static addNbMonthsToSelectedDate(periodFormGroup, nbMonths, fromSelectedDate) {
		let date = typeof fromSelectedDate == 'undefined' || fromSelectedDate ? FormDate.getSelectedDate(periodFormGroup) : new Date();
		date.setDate(1);
		date.setMonth(date.getMonth() - nbMonths);
		FormDate.setSelectedDate(periodFormGroup, -1, (date.getMonth() + 1), date.getFullYear());
	}
	static addNbYearsToSelectedDate(periodFormGroup, nbYears, fromSelectedDate) {
		let date = typeof fromSelectedDate == 'undefined' || fromSelectedDate ? FormDate.getSelectedDate(periodFormGroup) : new Date();
		FormDate.setSelectedDate(periodFormGroup, -1, -1, date.getFullYear() - nbYears);
	}

	static getSelectedDate(periodFormGroup) {
		let day = periodFormGroup.querySelector('select.day')?.value;
		let month = periodFormGroup.querySelector('select.month')?.value;
		let year = periodFormGroup.querySelector('select.year')?.value;
		if (null != day && null != month && null != year) {
			return new Date(year, month - 1, day);
		}
		return new Date();
	}

	static setSelectedDate(periodFormGroup, day, month, year) {
		const daySelect = periodFormGroup.querySelector('select.day');
		const monthSelect = periodFormGroup.querySelector('select.month');
		const yearSelect = periodFormGroup.querySelector('select.year');
		if (daySelect) daySelect.value = day;
		if (monthSelect) monthSelect.value = month;
		if (yearSelect) yearSelect.value = year;
	}
}

module.exports = { FormDate, InputPeriod };