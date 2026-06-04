import '../array.js';

describe('Array.prototype extensions', () => {
	describe('unset', () => {
		test('should remove element at given index', () => {
			const arr = [1, 2, 3, 4, 5];
			arr.unset(2);
			expect(arr).toEqual([1, 2, 4, 5]);
		});

		test('should not modify array if index is -1', () => {
			const arr = [1, 2, 3];
			arr.unset(-1);
			expect(arr).toEqual([1, 2, 3]);
		});

		test('should not modify array if index is out of bounds', () => {
			const arr = [1, 2, 3];
			arr.unset(10);
			expect(arr).toEqual([1, 2, 3]);
		});

		test('should remove first element', () => {
			const arr = [1, 2, 3];
			arr.unset(0);
			expect(arr).toEqual([2, 3]);
		});
	});

	describe('unsetVal', () => {
		test('should remove first occurrence of value', () => {
			const arr = [1, 2, 3, 2, 4];
			arr.unsetVal(2);
			expect(arr).toEqual([1, 3, 2, 4]);
		});

		test('should not modify array if value not found', () => {
			const arr = [1, 2, 3];
			arr.unsetVal(5);
			expect(arr).toEqual([1, 2, 3]);
		});

		test('should work with strings', () => {
			const arr = ['a', 'b', 'c'];
			arr.unsetVal('b');
			expect(arr).toEqual(['a', 'c']);
		});

		test('should work with objects', () => {
			const obj = { id: 1 };
			const arr = [obj, { id: 2 }];
			arr.unsetVal(obj);
			expect(arr).toEqual([{ id: 2 }]);
		});
	});

	describe('unsetValues', () => {
		test('should remove multiple values', () => {
			const arr = [1, 2, 3, 4, 5];
			arr.unsetValues([2, 4]);
			expect(arr).toEqual([1, 3, 5]);
		});

		test('should work with empty values array', () => {
			const arr = [1, 2, 3];
			arr.unsetValues([]);
			expect(arr).toEqual([1, 2, 3]);
		});

		test('should remove only first occurrence of duplicates', () => {
			const arr = [1, 2, 3, 2, 4, 3];
			arr.unsetValues([2, 3]);
			expect(arr).toEqual([1, 2, 4, 3]);
		});
	});

	describe('pushVal', () => {
		test('should add value if not present', () => {
			const arr = [1, 2, 3];
			arr.pushVal(4);
			expect(arr).toEqual([1, 2, 3, 4]);
		});

		test('should not add value if already present', () => {
			const arr = [1, 2, 3];
			arr.pushVal(2);
			expect(arr).toEqual([1, 2, 3]);
		});

		test('should work with strings', () => {
			const arr = ['a', 'b'];
			arr.pushVal('c');
			arr.pushVal('a');
			expect(arr).toEqual(['a', 'b', 'c']);
		});
	});

	describe('inArray', () => {
		test('should return true if value exists', () => {
			const arr = [1, 2, 3];
			expect(arr.inArray(2)).toBe(true);
		});

		test('should return false if value does not exist', () => {
			const arr = [1, 2, 3];
			expect(arr.inArray(5)).toBe(false);
		});

		test('should work with strings', () => {
			const arr = ['a', 'b', 'c'];
			expect(arr.inArray('b')).toBe(true);
			expect(arr.inArray('d')).toBe(false);
		});

		test('should return false for empty array', () => {
			const arr = [];
			expect(arr.inArray(1)).toBe(false);
		});
	});

	describe('unique', () => {
		test('should remove duplicate values', () => {
			const arr = [1, 2, 2, 3, 3, 4];
			expect(arr.unique()).toEqual([1, 2, 3, 4]);
		});

		test('should work with strings', () => {
			const arr = ['a', 'b', 'a', 'c', 'b'];
			expect(arr.unique()).toEqual(['a', 'b', 'c']);
		});

		test('should work with empty array', () => {
			const arr = [];
			expect(arr.unique()).toEqual([]);
		});

		test('should not modify original array', () => {
			const arr = [1, 2, 2, 3];
			arr.unique();
			expect(arr).toEqual([1, 2, 2, 3]);
		});
	});

	describe('removeEmptyValues', () => {
		test('should remove empty strings', () => {
			const arr = ['a', '', 'b', '', 'c'];
			expect(arr.removeEmptyValues()).toEqual(['a', 'b', 'c']);
		});

		test('should keep other falsy values', () => {
			const arr = ['a', '', 0, false, null, 'b'];
			expect(arr.removeEmptyValues()).toEqual(['a', 0, false, null, 'b']);
		});

		test('should work with empty array', () => {
			const arr = [];
			expect(arr.removeEmptyValues()).toEqual([]);
		});
	});

	describe('hasOwnIndex', () => {
		test('should return true for valid array indices', () => {
			const arr = ['a', 'b', 'c'];
			expect(arr.hasOwnIndex('0')).toBe(true);
			expect(arr.hasOwnIndex('1')).toBe(true);
			expect(arr.hasOwnIndex('2')).toBe(true);
		});

		test('should return false for out of bounds indices', () => {
			const arr = ['a', 'b', 'c'];
			expect(arr.hasOwnIndex('5')).toBe(false);
		});

		test('should return false for negative indices', () => {
			const arr = ['a', 'b', 'c'];
			expect(arr.hasOwnIndex('-1')).toBe(false);
		});

		test('should return false for non-numeric strings', () => {
			const arr = ['a', 'b', 'c'];
			expect(arr.hasOwnIndex('abc')).toBe(false);
		});
	});

	describe('cumulativeSum', () => {
		test('should calculate cumulative sum', () => {
			const arr = [1, 2, 3, 4];
			expect(arr.cumulativeSum()).toEqual([1, 3, 6, 10]);
		});

		test('should work with negative numbers', () => {
			const arr = [1, -2, 3, -4];
			expect(arr.cumulativeSum()).toEqual([1, -1, 2, -2]);
		});

		test('should work with decimals', () => {
			const arr = [1.5, 2.5, 3];
			expect(arr.cumulativeSum()).toEqual([1.5, 4, 7]);
		});

		test('should work with empty array', () => {
			const arr = [];
			expect(arr.cumulativeSum()).toEqual([]);
		});
	});

	describe('intersect', () => {
		test('should return common elements', () => {
			const arr = [];
			const result = arr.intersect([1, 2, 3, 4], [3, 4, 5, 6]);
			expect(result).toEqual([3, 4]);
		});

		test('should return empty array if no common elements', () => {
			const arr = [];
			const result = arr.intersect([1, 2], [3, 4]);
			expect(result).toEqual([]);
		});

		test('should work with strings', () => {
			const arr = [];
			const result = arr.intersect(['a', 'b', 'c'], ['b', 'c', 'd']);
			expect(result).toEqual(['b', 'c']);
		});

		test('should work with empty arrays', () => {
			const arr = [];
			expect(arr.intersect([], [1, 2])).toEqual([]);
			expect(arr.intersect([1, 2], [])).toEqual([]);
		});
	});

	describe('diff', () => {
		test('should return symmetric difference', () => {
			const arr = [];
			const result = arr.diff([1, 2, 3], [2, 3, 4]);
			expect(result).toEqual([1, 4]);
		});

		test('should return all elements if no common elements', () => {
			const arr = [];
			const result = arr.diff([1, 2], [3, 4]);
			expect(result).toEqual([1, 2, 3, 4]);
		});

		test('should work with strings', () => {
			const arr = [];
			const result = arr.diff(['a', 'b', 'c'], ['b', 'c', 'd']);
			expect(result).toEqual(['a', 'd']);
		});

		test('should work with empty arrays', () => {
			const arr = [];
			expect(arr.diff([], [1, 2])).toEqual([1, 2]);
			expect(arr.diff([1, 2], [])).toEqual([1, 2]);
		});
	});

	describe('filterUnique', () => {
		test('should filter duplicate values', () => {
			const arr = [1, 2, 2, 3, 3, 4];
			expect(arr.filterUnique()).toEqual([1, 2, 3, 4]);
		});

		test('should work with strings', () => {
			const arr = ['a', 'b', 'a', 'c'];
			expect(arr.filterUnique()).toEqual(['a', 'b', 'c']);
		});

		test('should work with empty array', () => {
			const arr = [];
			expect(arr.filterUnique()).toEqual([]);
		});
	});
});

describe('Array static methods', () => {
	describe('generate', () => {
		test('should generate array from 0 to given number', () => {
			const result = Array.generate({ to: 5 });
			expect(result).toEqual([0, 1, 2, 3, 4]);
		});

		test('should generate array with custom start', () => {
			const result = Array.generate({ from: 5, to: 10 });
			expect(result).toEqual([5, 6, 7, 8, 9]);
		});

		test('should generate array with custom step', () => {
			const result = Array.generate({ from: 0, to: 10, step: 2 });
			expect(result).toEqual([0, 2, 4, 6, 8]);
		});

		test('should generate array with negative step', () => {
			const result = Array.generate({ from: 10, to: 0, step: -2 });
			expect(result).toEqual([10, 8, 6, 4, 2]);
		});

		test('should generate array with decimal step', () => {
			const result = Array.generate({ from: 0, to: 2, step: 0.5 });
			expect(result).toEqual([0, 0.5, 1, 1.5]);
		});

		test('should work with custom length', () => {
			const result = Array.generate({ from: 0, step: 3, length: 4 });
			expect(result).toEqual([0, 3, 6, 9]);
		});
	});

	describe('getValuesByKeyInArrayOfArrays', () => {
		test('should extract values by key', () => {
			const arr = [
				{ id: 1, name: 'Alice' },
				{ id: 2, name: 'Bob' },
				{ id: 3, name: 'Charlie' }
			];
			const result = Array.getValuesByKeyInArrayOfArrays(arr, 'name');
			expect(result).toEqual(['Alice', 'Bob', 'Charlie']);
		});

		test('should skip elements without the key', () => {
			const arr = [
				{ id: 1, name: 'Alice' },
				{ id: 2 },
				{ id: 3, name: 'Charlie' }
			];
			const result = Array.getValuesByKeyInArrayOfArrays(arr, 'name');
			expect(result).toEqual(['Alice', 'Charlie']);
		});

		test('should work with empty array', () => {
			const result = Array.getValuesByKeyInArrayOfArrays([], 'name');
			expect(result).toEqual([]);
		});

		test('should work with numeric keys', () => {
			const arr = [
				{ 0: 'a', 1: 'b' },
				{ 0: 'c', 1: 'd' }
			];
			const result = Array.getValuesByKeyInArrayOfArrays(arr, 0);
			expect(result).toEqual(['a', 'c']);
		});
	});
});

describe('Object extensions', () => {
	describe('toArray', () => {
		test('should convert object values to array', () => {
			const obj = { a: 1, b: 2, c: 3 };
			expect(Object.toArray(obj)).toEqual([1, 2, 3]);
		});

		test('should work with empty object', () => {
			expect(Object.toArray({})).toEqual([]);
		});

		test('should preserve order for numeric keys', () => {
			const obj = { 0: 'a', 1: 'b', 2: 'c' };
			expect(Object.toArray(obj)).toEqual(['a', 'b', 'c']);
		});
	});

	describe('filter', () => {
		test('should filter object by value predicate', () => {
			const obj = { a: 1, b: 2, c: 3, d: 4 };
			const result = Object.filter(obj, val => val > 2);
			expect(result).toEqual({ c: 3, d: 4 });
		});

		test('should work with string values', () => {
			const obj = { a: 'apple', b: 'banana', c: 'cherry' };
			const result = Object.filter(obj, val => val.startsWith('a'));
			expect(result).toEqual({ a: 'apple' });
		});

		test('should return empty object if no match', () => {
			const obj = { a: 1, b: 2 };
			const result = Object.filter(obj, val => val > 10);
			expect(result).toEqual({});
		});

		test('should work with empty object', () => {
			const result = Object.filter({}, val => val > 0);
			expect(result).toEqual({});
		});
	});

	describe('filterKeys', () => {
		test('should filter object by key predicate', () => {
			const obj = { a: 1, b: 2, c: 3, d: 4 };
			const result = Object.filterKeys(obj, key => key === 'a' || key === 'c');
			expect(result).toEqual({ a: 1, c: 3 });
		});

		test('should work with pattern matching', () => {
			const obj = { name: 'John', age: 30, name2: 'Doe' };
			const result = Object.filterKeys(obj, key => key.includes('name'));
			expect(result).toEqual({ name: 'John', name2: 'Doe' });
		});

		test('should return empty object if no match', () => {
			const obj = { a: 1, b: 2 };
			const result = Object.filterKeys(obj, key => key === 'z');
			expect(result).toEqual({});
		});
	});

	describe('renameKeys', () => {
		test('should rename keys according to map', () => {
			const obj = { a: 1, b: 2, c: 3 };
			const result = Object.renameKeys(obj, { a: 'x', b: 'y' });
			expect(result).toEqual({ x: 1, y: 2, c: 3 });
		});

		test('should keep keys not in map', () => {
			const obj = { firstName: 'John', lastName: 'Doe', age: 30 };
			const result = Object.renameKeys(obj, { firstName: 'first', lastName: 'last' });
			expect(result).toEqual({ first: 'John', last: 'Doe', age: 30 });
		});

		test('should work with empty map', () => {
			const obj = { a: 1, b: 2 };
			const result = Object.renameKeys(obj, {});
			expect(result).toEqual({ a: 1, b: 2 });
		});

		test('should work with empty object', () => {
			const result = Object.renameKeys({}, { a: 'x' });
			expect(result).toEqual({});
		});
	});

	describe('renameKeysByCallback', () => {
		test('should rename keys using callback', () => {
			const obj = { a: 1, b: 2, c: 3 };
			const result = Object.renameKeysByCallback(obj, key => key.toUpperCase());
			expect(result).toEqual({ A: 1, B: 2, C: 3 });
		});

		test('should add prefix to keys', () => {
			const obj = { name: 'John', age: 30 };
			const result = Object.renameKeysByCallback(obj, key => 'user_' + key);
			expect(result).toEqual({ user_name: 'John', user_age: 30 });
		});

		test('should work with complex transformations', () => {
			const obj = { firstName: 'John', lastName: 'Doe' };
			const result = Object.renameKeysByCallback(obj, key => key.replace(/([A-Z])/g, '_$1').toLowerCase());
			expect(result).toEqual({ first_name: 'John', last_name: 'Doe' });
		});

		test('should work with empty object', () => {
			const result = Object.renameKeysByCallback({}, key => key.toUpperCase());
			expect(result).toEqual({});
		});
	});
});