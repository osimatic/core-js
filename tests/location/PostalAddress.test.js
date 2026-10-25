import { PostalAddress } from '../../location/PostalAddress.js';

describe('PostalAddress', () => {
	describe('format', () => {
		test('should return a string', () => {
			const result = PostalAddress.format({
				streetAddress: '10 Rue de la Paix',
				postalCode: '75001',
				locality: 'Paris',
				countryCode: 'FR',
			});
			expect(typeof result).toBe('string');
		});

		test('should contain streetAddress, postalCode and locality', () => {
			const result = PostalAddress.format({
				streetAddress: '10 Rue de la Paix',
				postalCode: '75001',
				locality: 'Paris',
				countryCode: 'FR',
			});
			expect(result).toContain('10 Rue de la Paix');
			expect(result).toContain('75001');
			expect(result).toContain('Paris');
		});

		test('should use <br/> as default separator', () => {
			const result = PostalAddress.format({
				streetAddress: '10 Rue de la Paix',
				postalCode: '75001',
				locality: 'Paris',
				countryCode: 'FR',
			});
			expect(result).toContain('<br/>');
			expect(result).not.toContain('\n');
		});

		test('should use custom separator when provided', () => {
			const result = PostalAddress.format({
				streetAddress: '10 Rue de la Paix',
				postalCode: '75001',
				locality: 'Paris',
				countryCode: 'FR',
			}, ', ');
			expect(result).toContain(', ');
			expect(result).not.toContain('\n');
		});

		test('should include additionalAddress on a separate line', () => {
			const result = PostalAddress.format({
				streetAddress: '10 Rue de la Paix',
				additionalAddress: 'Bât. B',
				postalCode: '75001',
				locality: 'Paris',
				countryCode: 'FR',
			});
			expect(result).toContain('10 Rue de la Paix');
			expect(result).toContain('Bât. B');
		});

		test('should use suburb as locality fallback when locality is null', () => {
			const result = PostalAddress.format({
				streetAddress: '5 High Street',
				postalCode: 'SW1A 1AA',
				suburb: 'Westminster',
				countryCode: 'GB',
			});
			expect(result).toContain('Westminster');
		});

		test('should use stateDistrict as locality fallback when locality and suburb are null', () => {
			const result = PostalAddress.format({
				streetAddress: '5 High Street',
				postalCode: 'SW1A 1AA',
				stateDistrict: 'Greater London',
				countryCode: 'GB',
			});
			expect(result).toContain('Greater London');
		});

		test('should handle null/undefined optional fields without throwing', () => {
			expect(() => PostalAddress.format({
				streetAddress: null,
				additionalAddress: null,
				postalCode: null,
				locality: null,
				state: null,
				countryCode: null,
			})).not.toThrow();
		});

		test('should handle empty strings for optional fields', () => {
			expect(() => PostalAddress.format({
				streetAddress: '',
				additionalAddress: '',
				postalCode: '',
				locality: '',
				state: '',
				countryCode: '',
			})).not.toThrow();
		});

		test('should include state/region in the formatted address', () => {
			const result = PostalAddress.format({
				streetAddress: '1600 Amphitheatre Pkwy',
				locality: 'Mountain View',
				state: 'CA',
				postalCode: '94043',
				countryCode: 'US',
			});
			expect(result).toContain('CA');
			expect(result).toContain('Mountain View');
			expect(result).toContain('94043');
		});

		test('should place postalCode before locality for FR (countryCode)', () => {
			const result = PostalAddress.format({
				streetAddress: '10 Rue de la Paix',
				postalCode: '75001',
				locality: 'Paris',
				countryCode: 'FR',
			}, '\n');
			expect(result.indexOf('75001')).toBeLessThan(result.indexOf('Paris'));
		});

		test('should place postalCode before locality for FR (locale parameter, no countryCode)', () => {
			const result = PostalAddress.format({
				streetAddress: '10 Rue de la Paix',
				postalCode: '75001',
				locality: 'Paris',
			}, '\n', 'fr-FR');
			expect(result.indexOf('75001')).toBeLessThan(result.indexOf('Paris'));
		});

		test('should place postalCode before locality for FR (locale parameter and countryCode)', () => {
			const result = PostalAddress.format({
				streetAddress: '10 Rue de la Paix',
				postalCode: '75001',
				locality: 'Paris',
				countryCode: 'FR',
			}, '\n', 'fr-FR');
			expect(result.indexOf('75001')).toBeLessThan(result.indexOf('Paris'));
		});

		test('should place postalCode after locality for US', () => {
			const result = PostalAddress.format({
				streetAddress: '1600 Amphitheatre Pkwy',
				postalCode: '94043',
				locality: 'Mountain View',
				state: 'CA',
				countryCode: 'US',
			}, '\n');
			expect(result.indexOf('94043')).toBeGreaterThan(result.indexOf('Mountain View'));
		});
	});
});