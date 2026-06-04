/**
 * @jest-environment jsdom
 */
import { ListBox } from '../list_box.js';

describe('ListBox', () => {
	describe('selectall', () => {
		test('should select all options when isSelect is true', () => {
			// Create a mock select element
			const mockSelect = document.createElement('select');
			mockSelect.id = 'testList';
			mockSelect.multiple = true;

			// Add options
			for (let i = 0; i < 3; i++) {
				const option = document.createElement('option');
				option.value = `value${i}`;
				option.text = `Option ${i}`;
				mockSelect.appendChild(option);
			}

			document.body.appendChild(mockSelect);

			// Select all options
			ListBox.selectall('testList', true);

			// Verify all options are selected
			expect(mockSelect.options[0].selected).toBe(true);
			expect(mockSelect.options[1].selected).toBe(true);
			expect(mockSelect.options[2].selected).toBe(true);

			document.body.removeChild(mockSelect);
		});

		test('should deselect all options when isSelect is false', () => {
			const mockSelect = document.createElement('select');
			mockSelect.id = 'testList';
			mockSelect.multiple = true;

			// Add options and select them
			for (let i = 0; i < 3; i++) {
				const option = document.createElement('option');
				option.value = `value${i}`;
				option.text = `Option ${i}`;
				option.selected = true;
				mockSelect.appendChild(option);
			}

			document.body.appendChild(mockSelect);

			// Deselect all options
			ListBox.selectall('testList', false);

			// Verify all options are deselected
			expect(mockSelect.options[0].selected).toBe(false);
			expect(mockSelect.options[1].selected).toBe(false);
			expect(mockSelect.options[2].selected).toBe(false);

			document.body.removeChild(mockSelect);
		});

		test('should handle empty listbox', () => {
			const mockSelect = document.createElement('select');
			mockSelect.id = 'emptyList';
			document.body.appendChild(mockSelect);

			expect(() => {
				ListBox.selectall('emptyList', true);
			}).not.toThrow();

			document.body.removeChild(mockSelect);
		});
	});

	describe('move', () => {
		let mockSelect;
		let alertSpy;

		beforeEach(() => {
			mockSelect = document.createElement('select');
			mockSelect.id = 'testList';

			// Add 4 options
			for (let i = 0; i < 4; i++) {
				const option = document.createElement('option');
				option.value = `value${i}`;
				option.text = `Option ${i}`;
				mockSelect.appendChild(option);
			}

			document.body.appendChild(mockSelect);

			// Mock alert
			alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
		});

		afterEach(() => {
			document.body.removeChild(mockSelect);
			alertSpy.mockRestore();
		});

		test('should move option up', () => {
			// Select the second option (index 1)
			mockSelect.selectedIndex = 1;

			ListBox.move('testList', 'up');

			// Verify the values were swapped
			expect(mockSelect.options[0].value).toBe('value1');
			expect(mockSelect.options[0].text).toBe('Option 1');
			expect(mockSelect.options[1].value).toBe('value0');
			expect(mockSelect.options[1].text).toBe('Option 0');
			// Selected index should move up too
			expect(mockSelect.selectedIndex).toBe(0);
		});

		test('should move option down', () => {
			// Select the second option (index 1)
			mockSelect.selectedIndex = 1;

			ListBox.move('testList', 'down');

			// Verify the values were swapped
			expect(mockSelect.options[1].value).toBe('value2');
			expect(mockSelect.options[1].text).toBe('Option 2');
			expect(mockSelect.options[2].value).toBe('value1');
			expect(mockSelect.options[2].text).toBe('Option 1');
			// Selected index should move down too
			expect(mockSelect.selectedIndex).toBe(2);
		});

		test('should not move first option up', () => {
			mockSelect.selectedIndex = 0;
			const originalValue = mockSelect.options[0].value;

			ListBox.move('testList', 'up');

			// Nothing should change
			expect(mockSelect.options[0].value).toBe(originalValue);
			expect(mockSelect.selectedIndex).toBe(0);
		});

		test('should not move last option down', () => {
			mockSelect.selectedIndex = 3; // Last option
			const originalValue = mockSelect.options[3].value;

			ListBox.move('testList', 'down');

			// Nothing should change
			expect(mockSelect.options[3].value).toBe(originalValue);
			expect(mockSelect.selectedIndex).toBe(3);
		});

		test('should alert when no option is selected', () => {
			mockSelect.selectedIndex = -1;

			ListBox.move('testList', 'up');

			expect(alertSpy).toHaveBeenCalledWith('Please select an option to move.');
		});
	});

	describe('moveacross', () => {
		let sourceSelect;
		let destSelect;

		beforeEach(() => {
			// Create source listbox
			sourceSelect = document.createElement('select');
			sourceSelect.id = 'sourceList';
			sourceSelect.multiple = true;

			for (let i = 0; i < 4; i++) {
				const option = document.createElement('option');
				option.value = `src${i}`;
				option.text = `Source ${i}`;
				sourceSelect.appendChild(option);
			}

			// Create destination listbox
			destSelect = document.createElement('select');
			destSelect.id = 'destList';
			destSelect.multiple = true;

			document.body.appendChild(sourceSelect);
			document.body.appendChild(destSelect);
		});

		afterEach(() => {
			document.body.removeChild(sourceSelect);
			document.body.removeChild(destSelect);
		});

		test('should move selected option from source to destination', () => {
			// Select one option in source
			sourceSelect.options[1].selected = true;

			ListBox.moveacross('sourceList', 'destList');

			// Verify option was moved
			expect(sourceSelect.options.length).toBe(3);
			expect(destSelect.options.length).toBe(1);
			expect(destSelect.options[0].value).toBe('src1');
			expect(destSelect.options[0].text).toBe('Source 1');
			expect(destSelect.options[0].selected).toBe(true);
		});

		test('should move multiple selected options', () => {
			// Select multiple options
			sourceSelect.options[0].selected = true;
			sourceSelect.options[2].selected = true;

			ListBox.moveacross('sourceList', 'destList');

			// Verify options were moved
			expect(sourceSelect.options.length).toBe(2);
			expect(destSelect.options.length).toBe(2);
			expect(destSelect.options[0].value).toBe('src0');
			expect(destSelect.options[1].value).toBe('src2');
		});

		test('should not move unselected options', () => {
			// Don't select any options
			ListBox.moveacross('sourceList', 'destList');

			// Nothing should change
			expect(sourceSelect.options.length).toBe(4);
			expect(destSelect.options.length).toBe(0);
		});

		test('should handle moving all options', () => {
			// Select all options
			for (let i = 0; i < sourceSelect.options.length; i++) {
				sourceSelect.options[i].selected = true;
			}

			ListBox.moveacross('sourceList', 'destList');

			// All options should be moved
			expect(sourceSelect.options.length).toBe(0);
			expect(destSelect.options.length).toBe(4);
		});

		test('should preserve option properties', () => {
			sourceSelect.options[0].selected = true;

			ListBox.moveacross('sourceList', 'destList');

			const movedOption = destSelect.options[0];
			expect(movedOption.value).toBe('src0');
			expect(movedOption.text).toBe('Source 0');
			expect(movedOption.selected).toBe(true);
		});
	});
});