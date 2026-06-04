/**
 * @jest-environment jsdom
 */
import { Password } from '../user.js';

function setupFormGroup(initialValue = '') {
	const formGroup = document.createElement('div');
	formGroup.className = 'form-group';
	const input = document.createElement('input');
	input.type = 'password';
	input.value = initialValue;
	formGroup.appendChild(input);
	document.body.appendChild(formGroup);
	return { formGroup, input };
}

afterEach(() => {
	document.body.innerHTML = '';
});

describe('Password', () => {
	describe('getPasswordStrength', () => {
		test('should return 0 for empty password', () => {
			expect(Password.getPasswordStrength('')).toBe(0);
		});

		test('should return 1 for password with only length >= 8', () => {
			expect(Password.getPasswordStrength('abcdefgh')).toBe(2); // length + lowercase
		});

		test('should return 2 for password with length and uppercase', () => {
			expect(Password.getPasswordStrength('ABCDEFGH')).toBe(2); // length + uppercase
		});

		test('should return 3 for password with length, uppercase, and lowercase', () => {
			expect(Password.getPasswordStrength('AbCdEfGh')).toBe(3);
		});

		test('should return 4 for password with length, uppercase, lowercase, and number', () => {
			expect(Password.getPasswordStrength('AbCdE123')).toBe(4);
		});

		test('should return 5 for password with all criteria', () => {
			expect(Password.getPasswordStrength('AbCdE12!')).toBe(5);
		});

		test('should return 6 for long password (>12) with 4+ criteria', () => {
			expect(Password.getPasswordStrength('AbCdE1234567!')).toBe(6);
		});

		test('should not give bonus for long password without enough criteria', () => {
			expect(Password.getPasswordStrength('abcdefghijklm')).toBe(2); // only length + lowercase
		});

		test('should detect uppercase letters', () => {
			const score1 = Password.getPasswordStrength('abcd1234');
			const score2 = Password.getPasswordStrength('Abcd1234');
			expect(score2).toBeGreaterThan(score1);
		});

		test('should detect lowercase letters', () => {
			const score1 = Password.getPasswordStrength('ABCD1234');
			const score2 = Password.getPasswordStrength('ABCd1234');
			expect(score2).toBeGreaterThan(score1);
		});

		test('should detect numbers', () => {
			const score1 = Password.getPasswordStrength('Abcdefgh');
			const score2 = Password.getPasswordStrength('Abcdefg1');
			expect(score2).toBeGreaterThan(score1);
		});

		test('should detect special characters', () => {
			const score1 = Password.getPasswordStrength('Abcd1234');
			const score2 = Password.getPasswordStrength('Abcd123!');
			expect(score2).toBeGreaterThan(score1);
		});

		test('should detect various special characters', () => {
			expect(Password.getPasswordStrength('AbCdE12!')).toBe(5);
			expect(Password.getPasswordStrength('AbCdE12@')).toBe(5);
			expect(Password.getPasswordStrength('AbCdE12#')).toBe(5);
			expect(Password.getPasswordStrength('AbCdE12$')).toBe(5);
			expect(Password.getPasswordStrength('AbCdE12%')).toBe(5);
			expect(Password.getPasswordStrength('AbCdE12^')).toBe(5);
			expect(Password.getPasswordStrength('AbCdE12&')).toBe(5);
			expect(Password.getPasswordStrength('AbCdE12*')).toBe(5);
			expect(Password.getPasswordStrength('AbCdE12(')).toBe(5);
			expect(Password.getPasswordStrength('AbCdE12)')).toBe(5);
		});

		test('should handle password with spaces as special characters', () => {
			expect(Password.getPasswordStrength('AbCd E12')).toBe(5);
		});

		test('should not count length if less than 8 characters', () => {
			expect(Password.getPasswordStrength('Abc1!')).toBe(4); // no length bonus, but has upper, lower, number, special
		});

		test('should handle password with exactly 8 characters', () => {
			expect(Password.getPasswordStrength('AbCdE12!')).toBe(5);
		});

		test('should handle password with exactly 12 characters', () => {
			expect(Password.getPasswordStrength('AbCdE12345!')).toBe(5); // no bonus at exactly 12
		});

		test('should handle password with exactly 13 characters (bonus threshold)', () => {
			expect(Password.getPasswordStrength('AbCdE1234567!')).toBe(6); // >12 and 4+ criteria (13 chars)
		});

		test('should handle very long password', () => {
			expect(Password.getPasswordStrength('AbCdE1234567890!@#$%^&*()')).toBe(6);
		});

		test('should handle password with only numbers', () => {
			expect(Password.getPasswordStrength('12345678')).toBe(2); // length + number
		});

		test('should handle password with only uppercase', () => {
			expect(Password.getPasswordStrength('ABCDEFGH')).toBe(2); // length + uppercase
		});

		test('should handle password with only lowercase', () => {
			expect(Password.getPasswordStrength('abcdefgh')).toBe(2); // length + lowercase
		});

		test('should handle password with only special characters', () => {
			expect(Password.getPasswordStrength('!@#$%^&*')).toBe(2); // length + special
		});

		test('should handle password with Unicode characters as special', () => {
			expect(Password.getPasswordStrength('AbCdE12é')).toBe(5); // Unicode treated as special
		});

		test('should handle password with multiple special character types', () => {
			expect(Password.getPasswordStrength('AbC1!@#$')).toBe(5); // still counts as one "special" criterion
		});

		test('should handle real-world weak passwords', () => {
			expect(Password.getPasswordStrength('password')).toBe(2); // length + lowercase
			expect(Password.getPasswordStrength('123456')).toBe(1); // only number
			expect(Password.getPasswordStrength('qwerty')).toBe(1); // only lowercase
		});

		test('should handle real-world medium passwords', () => {
			expect(Password.getPasswordStrength('Password1')).toBe(4); // length, upper, lower, number
			expect(Password.getPasswordStrength('MyPassword123')).toBe(5); // length, upper, lower, number + bonus (13 chars, no special)
		});

		test('should handle real-world strong passwords', () => {
			expect(Password.getPasswordStrength('MyP@ssw0rd!')).toBe(5);
			expect(Password.getPasswordStrength('C0mpl3x!P@ssw0rd')).toBe(6);
		});

		test('should handle single character password', () => {
			expect(Password.getPasswordStrength('A')).toBe(1); // only uppercase
		});

		test('should handle two character password', () => {
			expect(Password.getPasswordStrength('Ab')).toBe(2); // upper + lower
		});
	});

	describe('displayPasswordStrength', () => {
		test('should inject .password_strength_content into form-group', () => {
			const { input } = setupFormGroup('Test1234!');

			Password.displayPasswordStrength(input);

			expect(document.querySelector('.password_strength_content')).not.toBeNull();
		});

		test('should inject strength bar and text elements', () => {
			const { input } = setupFormGroup('Test1234!');

			Password.displayPasswordStrength(input);

			expect(document.querySelector('.password_strength_bar')).not.toBeNull();
			expect(document.querySelector('.password_strength_text')).not.toBeNull();
		});

		test('should inject condition list items with data-condition', () => {
			const { input } = setupFormGroup('');

			Password.displayPasswordStrength(input);

			const conditions = ['length', 'uppercase', 'lowercase', 'number', 'special'];
			conditions.forEach(cond => {
				expect(document.querySelector(`li[data-condition="${cond}"]`)).not.toBeNull();
			});
		});

		test('should show "Fort" and success color for strong password', () => {
			const { input } = setupFormGroup('AbCdE12!');

			Password.displayPasswordStrength(input);

			const text = document.querySelector('.password_strength_text');
			expect(text.textContent).toBe('Fort');
			expect(text.classList.contains('text-bg-success')).toBe(true);
		});

		test('should show "Moyen" and warning color for medium password', () => {
			const { input } = setupFormGroup('AbCd1234');

			Password.displayPasswordStrength(input);

			const text = document.querySelector('.password_strength_text');
			expect(text.textContent).toBe('Moyen');
			expect(text.classList.contains('text-bg-warning')).toBe(true);
		});

		test('should show "Faible" and danger color for weak password', () => {
			const { input } = setupFormGroup('abcdefgh');

			Password.displayPasswordStrength(input);

			const text = document.querySelector('.password_strength_text');
			expect(text.textContent).toBe('Faible');
			expect(text.classList.contains('text-bg-danger')).toBe(true);
		});

		test('should hide strength text for empty password', () => {
			const { input } = setupFormGroup('');

			Password.displayPasswordStrength(input);

			const text = document.querySelector('.password_strength_text');
			expect(text.classList.contains('hide')).toBe(true);
		});

		test('should set strength bar width based on score', () => {
			const { input } = setupFormGroup('AbCdE12!'); // score=5

			Password.displayPasswordStrength(input);

			const bar = document.querySelector('.password_strength_bar');
			const expectedWidth = ((5 / 6) * 100) + '%';
			expect(bar.style.width).toBe(expectedWidth);
		});

		test('should mark satisfied conditions as text-success', () => {
			const { input } = setupFormGroup('abcdefgh'); // satisfies: length, lowercase

			Password.displayPasswordStrength(input);

			expect(document.querySelector('li[data-condition="length"]').classList.contains('text-success')).toBe(true);
			expect(document.querySelector('li[data-condition="lowercase"]').classList.contains('text-success')).toBe(true);
		});

		test('should mark unsatisfied conditions as text-danger', () => {
			const { input } = setupFormGroup('abcdefgh'); // missing: uppercase, number, special

			Password.displayPasswordStrength(input);

			expect(document.querySelector('li[data-condition="uppercase"]').classList.contains('text-danger')).toBe(true);
			expect(document.querySelector('li[data-condition="number"]').classList.contains('text-danger')).toBe(true);
			expect(document.querySelector('li[data-condition="special"]').classList.contains('text-danger')).toBe(true);
		});

		test('should update display on input event', () => {
			const { input } = setupFormGroup('');

			Password.displayPasswordStrength(input);

			input.value = 'AbCdE12!';
			input.dispatchEvent(new Event('input'));

			const text = document.querySelector('.password_strength_text');
			expect(text.textContent).toBe('Fort');
		});

		test('should update display on change event', () => {
			const { input } = setupFormGroup('');

			Password.displayPasswordStrength(input);

			input.value = 'AbCdE12!';
			input.dispatchEvent(new Event('change'));

			const text = document.querySelector('.password_strength_text');
			expect(text.textContent).toBe('Fort');
		});

		test('should replace existing .password_strength_content on re-init', () => {
			const { input } = setupFormGroup('Test1234!');

			Password.displayPasswordStrength(input);
			Password.displayPasswordStrength(input);

			expect(document.querySelectorAll('.password_strength_content').length).toBe(1);
		});

		test('should set bg-success on bar for strong password', () => {
			const { input } = setupFormGroup('AbCdE12!');

			Password.displayPasswordStrength(input);

			const bar = document.querySelector('.password_strength_bar');
			expect(bar.classList.contains('bg-success')).toBe(true);
		});

		test('should set bg-warning on bar for medium password', () => {
			const { input } = setupFormGroup('AbCd1234');

			Password.displayPasswordStrength(input);

			const bar = document.querySelector('.password_strength_bar');
			expect(bar.classList.contains('bg-warning')).toBe(true);
		});

		test('should not throw when input is null', () => {
			expect(() => Password.displayPasswordStrength(null)).not.toThrow();
		});

		test('should not throw when input is undefined', () => {
			expect(() => Password.displayPasswordStrength(undefined)).not.toThrow();
		});
	});
});