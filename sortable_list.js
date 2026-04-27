import { toEl } from './util.js';

class SortableList {
	static init(sortableList, clientYOffset=0) {
		sortableList = toEl(sortableList);
		if (!sortableList) {
			return;
		}

		sortableList.querySelectorAll('[draggable="true"]').forEach(item => {
			item.addEventListener('dragstart', () => {
				// Adding dragging class to an item after a delay
				setTimeout(() => item.classList.add('dragging'), 0);
			});

			// Removing dragging class from the item on the dragend event
			item.addEventListener('dragend', () => item.classList.remove('dragging'));
		});

		const initSortableList = (e) => {
			e.preventDefault();

			const draggingItem = sortableList.querySelector('.dragging');

			// Getting all items except currently dragging and making an array of them
			const siblings = [...sortableList.querySelectorAll('[draggable="true"]:not(.dragging)')];

			// Finding the sibling after which the dragging item should be placed
			let nextSibling = siblings.find(sibling => {
				return e.clientY + clientYOffset <= sibling.offsetTop + sibling.offsetHeight / 2;
			});

			// Inserting the dragging item before the found sibling
			if (draggingItem) {
				sortableList.insertBefore(draggingItem, nextSibling);
			}
		};

		sortableList.addEventListener('dragover', initSortableList);
		sortableList.addEventListener('dragenter', e => e.preventDefault());
	}
}

export { SortableList };