import { CSV } from '../../file/CSV.js';

describe('CSV', () => {
	describe('checkFile', () => {
		test('should return true for valid CSV file with text/csv type', () => {
			expect(CSV.checkFile('data.csv', 'text/csv')).toBe(true);
		});

		test('should return true for valid CSV file with application/vnd.ms-excel type', () => {
			expect(CSV.checkFile('report.csv', 'application/vnd.ms-excel')).toBe(true);
		});

		test('should return false for CSV file with wrong mime type', () => {
			expect(CSV.checkFile('data.csv', 'application/json')).toBe(false);
		});

		test('should return false for non-CSV file with CSV mime type', () => {
			expect(CSV.checkFile('data.txt', 'text/csv')).toBe(false);
		});

		test('should return false for xlsx file', () => {
			expect(CSV.checkFile('data.xlsx', 'application/vnd.ms-excel')).toBe(false);
		});

		test('should handle uppercase extension', () => {
			expect(CSV.checkFile('data.CSV', 'text/csv')).toBe(true);
		});

		test('should handle mixed case extension', () => {
			expect(CSV.checkFile('data.CsV', 'text/csv')).toBe(true);
		});

		test('should handle filename with multiple dots', () => {
			expect(CSV.checkFile('my.data.file.csv', 'text/csv')).toBe(true);
		});

		test('should return true for application/octet-stream', () => {
			expect(CSV.checkFile('data.csv', 'application/octet-stream')).toBe(true);
		});

		test('should return true for text/plain', () => {
			expect(CSV.checkFile('data.csv', 'text/plain')).toBe(true);
		});

		test('should return false for empty filename', () => {
			expect(CSV.checkFile('', 'text/csv')).toBe(false);
		});

		test('should return false for filename without extension', () => {
			expect(CSV.checkFile('data', 'text/csv')).toBe(false);
		});
	});
});