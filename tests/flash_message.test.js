/**
 * @jest-environment jsdom
 */
import { FlashMessage } from '../flash_message.js';

describe('FlashMessage', () => {
	beforeEach(() => {
		jest.useFakeTimers();
		document.body.innerHTML = '';
	});

	afterEach(() => {
		jest.clearAllTimers();
		jest.useRealTimers();
	});

	describe('displaySuccess', () => {
		test('should call display with success type', () => {
			const displaySpy = jest.spyOn(FlashMessage, 'display');
			FlashMessage.displaySuccess('Test message');
			expect(displaySpy).toHaveBeenCalledWith('success', 'Test message', false, null, null, null);
			displaySpy.mockRestore();
		});

		test('should pass reload parameter', () => {
			const displaySpy = jest.spyOn(FlashMessage, 'display');
			FlashMessage.displaySuccess('Test message', true);
			expect(displaySpy).toHaveBeenCalledWith('success', 'Test message', true, null, null, null);
			displaySpy.mockRestore();
		});

		test('should pass all parameters', () => {
			const displaySpy = jest.spyOn(FlashMessage, 'display');
			const mockModal = { modal: jest.fn() };
			const mockCallback = jest.fn();
			FlashMessage.displaySuccess('Test', false, mockModal, mockCallback, 'test-id');
			expect(displaySpy).toHaveBeenCalledWith('success', 'Test', false, mockModal, mockCallback, 'test-id');
			displaySpy.mockRestore();
		});
	});

	describe('displayWarning', () => {
		test('should call display with warning type', () => {
			const displaySpy = jest.spyOn(FlashMessage, 'display');
			FlashMessage.displayWarning('Warning message');
			expect(displaySpy).toHaveBeenCalledWith('warning', 'Warning message', false, null, null, null);
			displaySpy.mockRestore();
		});
	});

	describe('displayError', () => {
		test('should call display with danger type', () => {
			const displaySpy = jest.spyOn(FlashMessage, 'display');
			FlashMessage.displayError('Error message');
			expect(displaySpy).toHaveBeenCalledWith('danger', 'Error message', false, null, null, null);
			displaySpy.mockRestore();
		});
	});

	describe('display', () => {
		test('should remove existing snackbars', () => {
			document.body.innerHTML = '<div class="snackbar show">old</div>';
			FlashMessage.display('success', 'Test message');
			expect(document.querySelectorAll('div.snackbar')).toHaveLength(1);
			expect(document.querySelector('div.snackbar').innerHTML).toBe('Test message');
		});

		test('should create snackbar with correct type', () => {
			FlashMessage.display('success', 'Test message');
			expect(document.querySelector('div.snackbar.success')).not.toBeNull();
		});

		test('should create snackbar with danger type', () => {
			FlashMessage.display('danger', 'Error message');
			expect(document.querySelector('div.snackbar.danger')).not.toBeNull();
		});

		test('should create snackbar with warning type', () => {
			FlashMessage.display('warning', 'Warning message');
			expect(document.querySelector('div.snackbar.warning')).not.toBeNull();
		});

		test('should set message content', () => {
			FlashMessage.display('success', 'Test message');
			expect(document.querySelector('div.snackbar').innerHTML).toBe('Test message');
		});

		test('should add show class', () => {
			FlashMessage.display('success', 'Test message');
			expect(document.querySelector('div.snackbar').classList.contains('show')).toBe(true);
		});

		test('should append snackbar to body', () => {
			FlashMessage.display('success', 'Test message');
			expect(document.body.contains(document.querySelector('div.snackbar'))).toBe(true);
		});

		test('should include domId when provided', () => {
			FlashMessage.display('success', 'Test', false, null, null, 'my-id');
			expect(document.querySelector('div.snackbar').id).toBe('my-id');
		});

		test('should not include id attribute when domId is null', () => {
			FlashMessage.display('success', 'Test', false, null, null, null);
			expect(document.querySelector('div.snackbar').id).toBe('');
		});

		test('should hide modal if provided', () => {
			const mockModal = { modal: jest.fn() };
			FlashMessage.display('success', 'Test', false, mockModal);
			expect(mockModal.modal).toHaveBeenCalledWith('hide');
		});

		test('should not call modal when null', () => {
			expect(() => {
				FlashMessage.display('success', 'Test', false, null);
			}).not.toThrow();
		});

		test('should call onMessageHidden callback after timeout', () => {
			const mockCallback = jest.fn();
			FlashMessage.display('success', 'Test', false, null, mockCallback);
			expect(mockCallback).not.toHaveBeenCalled();
			jest.advanceTimersByTime(6000);
			expect(mockCallback).toHaveBeenCalledTimes(1);
		});

		test('should not call callback if not provided', () => {
			expect(() => {
				FlashMessage.display('success', 'Test', false, null, null);
				jest.advanceTimersByTime(6000);
			}).not.toThrow();
		});

		test('should remove snackbar after 6 seconds', () => {
			FlashMessage.display('success', 'Test');
			expect(document.querySelector('div.snackbar')).not.toBeNull();
			jest.advanceTimersByTime(6000);
			expect(document.querySelector('div.snackbar')).toBeNull();
		});

		test('should handle HTML message content', () => {
			const htmlMessage = '<strong>Bold</strong> message';
			FlashMessage.display('success', htmlMessage);
			expect(document.querySelector('div.snackbar').innerHTML).toBe(htmlMessage);
		});

		test('should handle empty message', () => {
			FlashMessage.display('success', '');
			expect(document.querySelector('div.snackbar').innerHTML).toBe('');
		});

		test('should handle all parameters together', () => {
			const mockModal = { modal: jest.fn() };
			const mockCallback = jest.fn();
			FlashMessage.display('warning', 'Test message', false, mockModal, mockCallback, 'test-id');
			expect(mockModal.modal).toHaveBeenCalledWith('hide');
			expect(document.querySelector('div.snackbar.warning')).not.toBeNull();
			expect(document.querySelector('div.snackbar').innerHTML).toBe('Test message');
			expect(document.querySelector('div.snackbar').classList.contains('show')).toBe(true);
			jest.advanceTimersByTime(6000);
			expect(mockCallback).toHaveBeenCalled();
		});
	});
});