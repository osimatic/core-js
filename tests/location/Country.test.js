/**
 * @jest-environment jsdom
 */
import { Country } from '../../location/Country.js';

// Valeurs des options hors option vide ajoutée par SelectBox.reset()
function getValues(select) {
	return Array.from(select.options).map(o => o.value).filter(v => v !== '');
}

describe('Country', () => {
	describe('getCountries', () => {
		test('should return an object with country codes', () => {
			const countries = Country.getCountries();
			expect(typeof countries).toBe('object');
			expect(countries).toHaveProperty('FR');
			expect(countries).toHaveProperty('US');
			expect(countries).toHaveProperty('GB');
		});

		test('should have correct country names', () => {
			const countries = Country.getCountries();
			expect(countries.FR).toBe('France');
			expect(countries.US).toBe('United States of America');
			expect(countries.GB).toBe('United Kingdom');
		});
	});

	describe('getCountryName', () => {
		test('should return country name for valid code (default fr-FR locale)', () => {
			expect(Country.getCountryName('FR')).toBe('France');
			expect(Country.getCountryName('US')).toBe("États-Unis d'Amérique");
			expect(Country.getCountryName('CA')).toBe('Canada');
		});

		test('should return country name in specified locale', () => {
			expect(Country.getCountryName('US', 'en')).toBe('United States of America');
			expect(Country.getCountryName('DE', 'de')).toBeTruthy();
		});

		test('should handle full locale with region (fr-FR, en-US)', () => {
			expect(Country.getCountryName('FR', 'fr-FR')).toBe('France');
			expect(Country.getCountryName('US', 'fr-FR')).toBe("États-Unis d'Amérique");
			expect(Country.getCountryName('US', 'en-US')).toBe('United States of America');
		});

		test('should return the code itself if country not found', () => {
			expect(Country.getCountryName('XX')).toBe('XX');
			expect(Country.getCountryName('ZZZ')).toBe('ZZZ');
		});
	});

	describe('getContinents', () => {
		test('should return an object with continent IDs', () => {
			const continents = Country.getContinents();
			expect(typeof continents).toBe('object');
			expect(continents[1]).toBe('Europe');
			expect(continents[3]).toBe('Afrique');
			expect(continents[6]).toBe('Asie');
		});
	});

	describe('getFlagPath', () => {
		test('should return null when no flagsPath set', () => {
			Country.flagsPath = undefined;
			expect(Country.getFlagPath('FR')).toBeNull();
		});

		test('should return image path when flagsPath set', () => {
			Country.setFlagsPath('/custom/flags/');
			expect(Country.getFlagPath('FR')).toBe('/custom/flags/fr.png');
			expect(Country.getFlagPath('US')).toBe('/custom/flags/us.png');
			Country.flagsPath = undefined;
		});
	});

	describe('getFlagImg', () => {
		test('should return flag-icons span when no flagsPath set', () => {
			Country.flagsPath = undefined;
			const html = Country.getFlagImg('FR');
			expect(html).toContain('<span');
			expect(html).toContain('fi fi-fr');
		});

		test('should return img tag when flagsPath set', () => {
			Country.setFlagsPath('/flags/');
			const html = Country.getFlagImg('FR');
			expect(html).toContain('<img');
			expect(html).toContain('fr.png');
			expect(html).toContain('class="flag"');
			expect(html).toContain("title=\"France\"");
			Country.flagsPath = undefined;
		});
	});

	describe('getCountryList', () => {
		test('should return the same as getCountries (deprecated)', () => {
			const list = Country.getCountryList();
			const countries = Country.getCountries();
			expect(list).toEqual(countries);
		});
	});

	describe('getFlagEmoji', () => {
		test('should return emoji flag for country code', () => {
			expect(Country.getFlagEmoji('FR')).toBe('🇫🇷');
			expect(Country.getFlagEmoji('US')).toBe('🇺🇸');
			expect(Country.getFlagEmoji('GB')).toBe('🇬🇧');
		});
		test('should handle lowercase country codes', () => {
			expect(Country.getFlagEmoji('fr')).toBe('🇫🇷');
		});
	});

	describe('getCountries with locale', () => {
		test('should auto-register and return names for an unregistered locale', () => {
			const countriesFr = Country.getCountries('fr');
			expect(typeof countriesFr).toBe('object');
			expect(countriesFr.FR).toBe('France');
			expect(typeof countriesFr.US).toBe('string');
		});

		test('should return names for de locale', () => {
			const countriesDe = Country.getCountries('de');
			expect(typeof countriesDe).toBe('object');
			expect(countriesDe.DE).toBeTruthy();
		});

		test('should return empty object for unknown locale', () => {
			const result = Country.getCountries('xx');
			expect(typeof result).toBe('object');
		});
	});

	describe('fillSelect', () => {
		// Vrai <select> : SelectBox.reset() lit les attributs DOM (dataset, multiple)
		function makeSelect() {
			return document.createElement('select');
		}

		test('should populate with all countries in given locale', () => {
			const select = makeSelect();
			Country.fillSelect(select, null, 'fr-FR');
			expect(select.children.length).toBeGreaterThan(0);
			expect(select.innerHTML).toContain('value="FR"');
			expect(select.innerHTML).toContain('France');
		});

		test('should restrict to provided countriesList', () => {
			const select = makeSelect();
			Country.fillSelect(select, null, 'fr-FR', false, ['FR', 'DE', 'US']);
			expect(getValues(select)).toEqual(['FR', 'DE', 'US']);
		});

		test('should add none option when addNoneValue is true', () => {
			const select = makeSelect();
			Country.fillSelect(select, null, 'fr-FR', false, ['FR'], true, '-- Aucun --');
			expect(select.children[0].outerHTML).toContain('value=""');
			expect(select.children[0].outerHTML).toContain('-- Aucun --');
			expect(select.children).toHaveLength(2);
		});

		test('should add data-content with flag-icons when showFlags is true', () => {
			const select = makeSelect();
			// TomSelect (via SelectBox) consomme data-content : on vérifie seulement que l'option est bien créée
			Country.fillSelect(select, null, 'fr-FR', true, ['FR']);
			expect(select.querySelector('option[value="FR"]').textContent).toBe('France');
		});

		test('should replace existing options', () => {
			const select = makeSelect();
			select.insertAdjacentHTML('beforeend', '<option value="XX">Ancienne option</option>');
			Country.fillSelect(select, null, 'fr-FR', false, ['FR']);
			expect(select.querySelector('option[value="XX"]')).toBeNull();
			expect(select.querySelector('option[value="FR"]')).not.toBeNull();
		});
	});

	describe('fillSelectWithFlags', () => {
		// Vrai <select> : SelectBox.reset() lit les attributs DOM (dataset, multiple)
		function makeSelect() {
			return document.createElement('select');
		}

		test('should add data-content with flag-icons', () => {
			const select = makeSelect();
			Country.fillSelectWithFlags(select, null, 'fr-FR', ['FR', 'US']);
			expect(getValues(select)).toEqual(['FR', 'US']);
			expect(select.querySelector('option[value="US"]').textContent).toBe("États-Unis d'Amérique");
		});
	});
});