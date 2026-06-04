/**
 * @jest-environment jsdom
 */
import { SortableList } from '../sortable_list.js';

function setupList(nbItems = 3) {
	document.body.innerHTML = `
		<ul id="sortable">
			${Array.from({ length: nbItems }, (_, i) => `<li draggable="true" id="item${i}">Item ${i}</li>`).join('')}
		</ul>`;

	const container = document.getElementById('sortable');
	const items = [...container.querySelectorAll('[draggable="true"]')];

	// jsdom doesn't compute layout — mock offsetTop/offsetHeight
	items.forEach((item, i) => {
		Object.defineProperty(item, 'offsetTop', { value: i * 50, configurable: true });
		Object.defineProperty(item, 'offsetHeight', { value: 50, configurable: true });
	});

	return { container, items };
}

afterEach(() => {
	document.body.innerHTML = '';
	jest.useRealTimers();
});

describe('SortableList', () => {

	describe('init', () => {
		test('should add dragover event listener to container', () => {
			const { container } = setupList();
			const spy = jest.spyOn(container, 'addEventListener');
			SortableList.init(container);
			expect(spy).toHaveBeenCalledWith('dragover', expect.any(Function));
		});

		test('should add dragenter event listener to container', () => {
			const { container } = setupList();
			const spy = jest.spyOn(container, 'addEventListener');
			SortableList.init(container);
			expect(spy).toHaveBeenCalledWith('dragenter', expect.any(Function));
		});

		test('should add event listeners to all draggable items', () => {
			const { container, items } = setupList(3);
			SortableList.init(container);
			const spies = items.map(item => jest.spyOn(item, 'addEventListener'));
			// Re-init to capture calls
			SortableList.init(container);
			spies.forEach(spy => {
				expect(spy).toHaveBeenCalledWith('dragstart', expect.any(Function));
				expect(spy).toHaveBeenCalledWith('dragend', expect.any(Function));
			});
		});

		test('should initialize with default clientYOffset of 0', () => {
			const { container } = setupList();
			expect(() => SortableList.init(container)).not.toThrow();
		});

		test('should initialize with custom clientYOffset', () => {
			const { container } = setupList();
			expect(() => SortableList.init(container, 100)).not.toThrow();
		});

		test('should handle empty item list', () => {
			const { container } = setupList(0);
			expect(() => SortableList.init(container)).not.toThrow();
		});
	});

	describe('drag events on items', () => {
		beforeEach(() => {
			jest.useFakeTimers();
		});

		test('should add dragging class after dragstart timeout', () => {
			const { container, items } = setupList();
			SortableList.init(container);

			items[0].dispatchEvent(new Event('dragstart'));
			expect(items[0].classList.contains('dragging')).toBe(false);

			jest.runAllTimers();
			expect(items[0].classList.contains('dragging')).toBe(true);
		});

		test('should not add dragging class immediately on dragstart', () => {
			const { container, items } = setupList();
			SortableList.init(container);

			items[0].dispatchEvent(new Event('dragstart'));
			expect(items[0].classList.contains('dragging')).toBe(false);
		});

		test('should remove dragging class on dragend', () => {
			const { container, items } = setupList();
			SortableList.init(container);

			items[1].classList.add('dragging');
			items[1].dispatchEvent(new Event('dragend'));
			expect(items[1].classList.contains('dragging')).toBe(false);
		});

		test('should add and remove dragging class in sequence', () => {
			const { container, items } = setupList();
			SortableList.init(container);

			items[2].dispatchEvent(new Event('dragstart'));
			jest.runAllTimers();
			expect(items[2].classList.contains('dragging')).toBe(true);

			items[2].dispatchEvent(new Event('dragend'));
			expect(items[2].classList.contains('dragging')).toBe(false);
		});

		test('should handle multiple items dragged in sequence', () => {
			const { container, items } = setupList();
			SortableList.init(container);

			items[0].dispatchEvent(new Event('dragstart'));
			jest.runAllTimers();
			expect(items[0].classList.contains('dragging')).toBe(true);
			items[0].dispatchEvent(new Event('dragend'));
			expect(items[0].classList.contains('dragging')).toBe(false);

			items[1].dispatchEvent(new Event('dragstart'));
			jest.runAllTimers();
			expect(items[1].classList.contains('dragging')).toBe(true);
			items[1].dispatchEvent(new Event('dragend'));
			expect(items[1].classList.contains('dragging')).toBe(false);
		});
	});

	describe('dragenter event', () => {
		test('should prevent default on dragenter', () => {
			const { container } = setupList();
			SortableList.init(container);

			const event = new Event('dragenter', { cancelable: true });
			container.dispatchEvent(event);
			expect(event.defaultPrevented).toBe(true);
		});

		test('should handle dragenter without error', () => {
			const { container } = setupList();
			SortableList.init(container);

			expect(() => {
				container.dispatchEvent(new Event('dragenter', { cancelable: true }));
			}).not.toThrow();
		});
	});

	describe('dragover and reordering', () => {
		test('should prevent default on dragover', () => {
			const { container } = setupList();
			SortableList.init(container);

			const event = new Event('dragover', { cancelable: true });
			container.dispatchEvent(event);
			expect(event.defaultPrevented).toBe(true);
		});

		test('should insert dragging item before correct sibling', () => {
			const { container, items } = setupList(3);
			SortableList.init(container);

			items[0].classList.add('dragging');
			const spy = jest.spyOn(container, 'insertBefore');

			// item1: offsetTop=50, height=50, midpoint=75 → clientY=74 ≤ 75 → insert before item1
			const event = Object.assign(new Event('dragover', { cancelable: true }), { clientY: 74 });
			container.dispatchEvent(event);

			expect(spy).toHaveBeenCalledWith(items[0], items[1]);
		});

		test('should insert at end when clientY is past all items', () => {
			const { container, items } = setupList(3);
			SortableList.init(container);

			items[0].classList.add('dragging');
			const spy = jest.spyOn(container, 'insertBefore').mockImplementation(() => {});

			const event = Object.assign(new Event('dragover', { cancelable: true }), { clientY: 999 });
			container.dispatchEvent(event);

			expect(spy).toHaveBeenCalledWith(items[0], undefined);
			spy.mockRestore();
		});

		test('should insert at exact midpoint of sibling', () => {
			const { container, items } = setupList(3);
			SortableList.init(container);

			items[0].classList.add('dragging');
			const spy = jest.spyOn(container, 'insertBefore');

			// item1 midpoint = 50 + 50/2 = 75 → clientY=75 ≤ 75 → insert before item1
			const event = Object.assign(new Event('dragover', { cancelable: true }), { clientY: 75 });
			container.dispatchEvent(event);

			expect(spy).toHaveBeenCalledWith(items[0], items[1]);
		});

		test('should apply clientYOffset to position calculation', () => {
			const { container, items } = setupList(3);
			SortableList.init(container, 20);

			items[0].classList.add('dragging');
			const spy = jest.spyOn(container, 'insertBefore');

			// clientY=54 + offset=20 = 74 ≤ 75 → insert before item1
			const event = Object.assign(new Event('dragover', { cancelable: true }), { clientY: 54 });
			container.dispatchEvent(event);

			expect(spy).toHaveBeenCalledWith(items[0], items[1]);
		});

		test('should find dragging item via querySelector on dragover', () => {
			const { container, items } = setupList();
			SortableList.init(container);

			items[0].classList.add('dragging');
			const spy = jest.spyOn(container, 'querySelector');

			container.dispatchEvent(Object.assign(new Event('dragover', { cancelable: true }), { clientY: 0 }));

			expect(spy).toHaveBeenCalledWith('.dragging');
		});
	});

	describe('edge cases', () => {
		test('should handle single item', () => {
			const { container } = setupList(1);
			expect(() => SortableList.init(container)).not.toThrow();
		});

		test('should handle negative clientYOffset', () => {
			const { container, items } = setupList(3);
			SortableList.init(container, -50);

			items[0].classList.add('dragging');
			const event = Object.assign(new Event('dragover', { cancelable: true }), { clientY: 100 });
			expect(() => container.dispatchEvent(event)).not.toThrow();
		});

		test('should handle very large clientYOffset', () => {
			const { container } = setupList(3);
			expect(() => SortableList.init(container, 10000)).not.toThrow();
		});

		test('should handle items with zero height', () => {
			const { container, items } = setupList(3);
			Object.defineProperty(items[1], 'offsetHeight', { value: 0, configurable: true });
			SortableList.init(container);

			items[0].classList.add('dragging');
			const event = Object.assign(new Event('dragover', { cancelable: true }), { clientY: 50 });
			expect(() => container.dispatchEvent(event)).not.toThrow();
		});

		test('should handle items with varying heights', () => {
			const { container, items } = setupList(3);
			Object.defineProperty(items[0], 'offsetHeight', { value: 30, configurable: true });
			Object.defineProperty(items[1], 'offsetHeight', { value: 70, configurable: true });
			Object.defineProperty(items[2], 'offsetHeight', { value: 100, configurable: true });
			SortableList.init(container);

			items[0].classList.add('dragging');
			const event = Object.assign(new Event('dragover', { cancelable: true }), { clientY: 50 });
			expect(() => container.dispatchEvent(event)).not.toThrow();
		});
	});
});