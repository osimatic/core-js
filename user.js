import { toEl } from './util.js';

class Password {
	static getPasswordStrength(password) {
		let score = 0;

		if (password.length >= 8) score++;
		if (/[A-Z]/.test(password)) score++;
		if (/[a-z]/.test(password)) score++;
		if (/[0-9]/.test(password)) score++;
		if (/[^A-Za-z0-9]/.test(password)) score++;

		if (password.length > 12 && score >= 4) score++; // Bonus pour long mot de passe

		return score;
	}

	static displayPasswordStrength(input) {
		input = toEl(input);
		if (!input) {
			return;
		}
		function update(input) {
			const password = input.value;
			const div = input.closest('.form-group').querySelector('.password_strength_content');
			const score = Password.getPasswordStrength(password);

			const strengthBar = div.querySelector('.password_strength_bar');
			const strengthText = div.querySelector('.password_strength_text');

			const conditions = {
				length: password.length >= 8,
				uppercase: /[A-Z]/.test(password),
				lowercase: /[a-z]/.test(password),
				number: /[0-9]/.test(password),
				special: /[^A-Za-z0-9]/.test(password),
			};

			// Mise à jour des conditions
			div.querySelectorAll('.password_strength_conditions li').forEach(li => {
				const cond = li.dataset.condition;
				li.classList.remove('text-success', 'text-danger');
				li.classList.add(conditions[cond] ? 'text-success' : 'text-danger');
			});

			let width = (score / 6) * 100;
			let color = 'danger';
			let text = 'Très faible';

			if (score >= 2) { color = 'danger'; text = 'Faible'; }
			if (score >= 4) { color = 'warning'; text = 'Moyen'; }
			if (score >= 5) { color = 'success'; text = 'Fort'; }

			strengthBar.classList.remove('bg-danger', 'bg-warning', 'bg-success');
			strengthBar.classList.add('bg-' + color);
			strengthText.classList.remove('text-bg-danger', 'text-bg-warning', 'text-bg-success', 'hide');
			strengthText.classList.add(password === '' ? 'hide' : 'text-bg-' + color);
			strengthBar.style.width = width + '%';
			strengthText.textContent = text;
		}

		const formGroup = input.closest('.form-group');
		formGroup.querySelector('.password_strength_content')?.remove();
		formGroup.insertAdjacentHTML('beforeend', ''
			+ '<div class="password_strength_content mt-1">'
			+ '	<div class="progress" style="height: 6px;">'
			+ '		<div class="password_strength_bar progress-bar" role="progressbar"></div>'
			+ '	</div>'
			+ '	<div class="d-flex justify-content-between align-items-start mt-2">'
			+ '		<ul class="password_strength_conditions mb-0 ps-0" style="list-style: none;">'
			+ '			<li data-condition="length">✔ Au moins 8 caractères</li>'
			+ '			<li data-condition="uppercase">✔ Une majuscule</li>'
			+ '			<li data-condition="lowercase">✔ Une minuscule</li>'
			+ '			<li data-condition="number">✔ Un chiffre</li>'
			+ '			<li data-condition="special">✔ Un caractère spécial</li>'
			+ '		</ul>'
			+ '		<div class="ms-3 text-end">'
			+ '			<span class="badge password_strength_text" style="font-size: 10pt; font-weight: normal">New</span>'
			+ '		</div>'
			+ '	</div>'
			+ '</div>'
		);
		input.onchange = () => update(input);
		input.oninput = () => update(input);
		update(input);
	}
}

export { Password };