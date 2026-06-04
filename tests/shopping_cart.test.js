import '../array.js'; // For unsetVal method
import { ShoppingCart } from '../shopping_cart.js';

describe('ShoppingCart', () => {
	let localStorageMock;

	beforeEach(() => {
		// Mock localStorage
		localStorageMock = (() => {
			let store = {};
			return {
				getItem: jest.fn((key) => store[key] || null),
				setItem: jest.fn((key, value) => {
					store[key] = value.toString();
				}),
				removeItem: jest.fn((key) => {
					delete store[key];
				}),
				clear: jest.fn(() => {
					store = {};
				})
			};
		})();

		global.localStorage = localStorageMock;
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('getCart', () => {
		test('should return empty array when cart does not exist', () => {
			const cart = ShoppingCart.getCart();

			expect(cart).toEqual([]);
			expect(localStorageMock.getItem).toHaveBeenCalledWith('cart');
		});

		test('should return cart from localStorage when it exists', () => {
			const mockCart = [
				{ product_id: 1, quantity: 2, data: { name: 'Product 1' } },
				{ product_id: 2, quantity: 1, data: { name: 'Product 2' } }
			];
			localStorageMock.setItem('cart', JSON.stringify(mockCart));

			const cart = ShoppingCart.getCart();

			expect(cart).toEqual(mockCart);
			expect(localStorageMock.getItem).toHaveBeenCalledWith('cart');
		});

		test('should parse JSON correctly', () => {
			const mockCart = [{ product_id: 5, quantity: 3, data: {} }];
			localStorageMock.setItem('cart', JSON.stringify(mockCart));

			const cart = ShoppingCart.getCart();

			expect(Array.isArray(cart)).toBe(true);
			expect(cart[0]).toHaveProperty('product_id');
			expect(cart[0]).toHaveProperty('quantity');
			expect(cart[0]).toHaveProperty('data');
		});

		test('should return new array each time', () => {
			const mockCart = [{ product_id: 1, quantity: 1, data: {} }];
			localStorageMock.setItem('cart', JSON.stringify(mockCart));

			const cart1 = ShoppingCart.getCart();
			const cart2 = ShoppingCart.getCart();

			expect(cart1).toEqual(cart2);
			expect(cart1).not.toBe(cart2); // Different array instances
		});
	});

	describe('addProduct', () => {
		test('should add new product to empty cart', () => {
			ShoppingCart.addProduct(1, 2, { name: 'Product 1' });

			expect(localStorageMock.setItem).toHaveBeenCalledWith(
				'cart',
				JSON.stringify([{ product_id: 1, quantity: 2, data: { name: 'Product 1' } }])
			);
		});

		test('should add new product to existing cart', () => {
			const existingCart = [{ product_id: 1, quantity: 2, data: { name: 'Product 1' } }];
			localStorageMock.setItem('cart', JSON.stringify(existingCart));

			ShoppingCart.addProduct(2, 1, { name: 'Product 2' });

			const savedCart = JSON.parse(localStorageMock.setItem.mock.calls[1][1]);
			expect(savedCart).toHaveLength(2);
			expect(savedCart[0]).toEqual({ product_id: 1, quantity: 2, data: { name: 'Product 1' } });
			expect(savedCart[1]).toEqual({ product_id: 2, quantity: 1, data: { name: 'Product 2' } });
		});

		test('should update quantity when product already exists', () => {
			const existingCart = [{ product_id: 1, quantity: 2, data: { name: 'Product 1' } }];
			localStorageMock.setItem('cart', JSON.stringify(existingCart));

			ShoppingCart.addProduct(1, 3, { name: 'Product 1 Updated' });

			const savedCart = JSON.parse(localStorageMock.setItem.mock.calls[1][1]);
			expect(savedCart).toHaveLength(1);
			expect(savedCart[0].product_id).toBe(1);
			expect(savedCart[0].quantity).toBe(5); // 2 + 3
			expect(savedCart[0].data).toEqual({ name: 'Product 1 Updated' });
		});

		test('should handle adding product with zero quantity', () => {
			ShoppingCart.addProduct(1, 0, { name: 'Product 1' });

			const savedCart = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
			expect(savedCart[0].quantity).toBe(0);
		});

		test('should handle adding product with negative quantity', () => {
			ShoppingCart.addProduct(1, -5, { name: 'Product 1' });

			const savedCart = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
			expect(savedCart[0].quantity).toBe(-5);
		});

		test('should add product with null data', () => {
			ShoppingCart.addProduct(1, 2, null);

			const savedCart = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
			expect(savedCart[0].data).toBeNull();
		});

		test('should add product with undefined data', () => {
			ShoppingCart.addProduct(1, 2, undefined);

			const savedCart = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
			expect(savedCart[0].data).toBeUndefined();
		});

		test('should add product with complex data object', () => {
			const complexData = {
				name: 'Product 1',
				price: 19.99,
				attributes: { color: 'red', size: 'M' },
				tags: ['new', 'sale']
			};

			ShoppingCart.addProduct(1, 2, complexData);

			const savedCart = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
			expect(savedCart[0].data).toEqual(complexData);
		});

		test('should handle string product IDs', () => {
			ShoppingCart.addProduct('abc123', 2, { name: 'Product 1' });

			const savedCart = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
			expect(savedCart[0].product_id).toBe('abc123');
		});

		test('should match product by loose equality', () => {
			const existingCart = [{ product_id: '1', quantity: 2, data: {} }];
			localStorageMock.setItem('cart', JSON.stringify(existingCart));

			ShoppingCart.addProduct(1, 3, {});

			const savedCart = JSON.parse(localStorageMock.setItem.mock.calls[1][1]);
			expect(savedCart).toHaveLength(1);
			expect(savedCart[0].quantity).toBe(5); // Found via == comparison
		});

		test('should add multiple different products', () => {
			ShoppingCart.addProduct(1, 2, { name: 'Product 1' });
			ShoppingCart.addProduct(2, 3, { name: 'Product 2' });
			ShoppingCart.addProduct(3, 1, { name: 'Product 3' });

			const savedCart = JSON.parse(localStorageMock.setItem.mock.calls[2][1]);
			expect(savedCart).toHaveLength(3);
		});
	});

	describe('deleteProduct', () => {
		test('should delete product from cart', () => {
			const existingCart = [
				{ product_id: 1, quantity: 2, data: { name: 'Product 1' } },
				{ product_id: 2, quantity: 1, data: { name: 'Product 2' } }
			];
			localStorageMock.setItem('cart', JSON.stringify(existingCart));

			ShoppingCart.deleteProduct(1);

			const savedCart = JSON.parse(localStorageMock.setItem.mock.calls[1][1]);
			expect(savedCart).toHaveLength(1);
			expect(savedCart[0].product_id).toBe(2);
		});

		test('should handle deleting from empty cart', () => {
			ShoppingCart.deleteProduct(1);

			const savedCart = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
			expect(savedCart).toHaveLength(0);
		});

		test('should handle deleting non-existent product', () => {
			const existingCart = [{ product_id: 1, quantity: 2, data: {} }];
			localStorageMock.setItem('cart', JSON.stringify(existingCart));

			ShoppingCart.deleteProduct(999);

			const savedCart = JSON.parse(localStorageMock.setItem.mock.calls[1][1]);
			expect(savedCart).toHaveLength(1);
			expect(savedCart[0].product_id).toBe(1);
		});

		test('should delete last remaining product', () => {
			const existingCart = [{ product_id: 1, quantity: 2, data: {} }];
			localStorageMock.setItem('cart', JSON.stringify(existingCart));

			ShoppingCart.deleteProduct(1);

			const savedCart = JSON.parse(localStorageMock.setItem.mock.calls[1][1]);
			expect(savedCart).toHaveLength(0);
		});

		test('should delete product by loose equality', () => {
			const existingCart = [{ product_id: '1', quantity: 2, data: {} }];
			localStorageMock.setItem('cart', JSON.stringify(existingCart));

			ShoppingCart.deleteProduct(1);

			const savedCart = JSON.parse(localStorageMock.setItem.mock.calls[1][1]);
			expect(savedCart).toHaveLength(0);
		});

		test('should delete only first matching product', () => {
			const existingCart = [
				{ product_id: 1, quantity: 2, data: {} },
				{ product_id: 1, quantity: 3, data: {} }
			];
			localStorageMock.setItem('cart', JSON.stringify(existingCart));

			ShoppingCart.deleteProduct(1);

			const savedCart = JSON.parse(localStorageMock.setItem.mock.calls[1][1]);
			expect(savedCart).toHaveLength(1);
			expect(savedCart[0].quantity).toBe(3);
		});

		test('should handle string product IDs', () => {
			const existingCart = [{ product_id: 'abc123', quantity: 2, data: {} }];
			localStorageMock.setItem('cart', JSON.stringify(existingCart));

			ShoppingCart.deleteProduct('abc123');

			const savedCart = JSON.parse(localStorageMock.setItem.mock.calls[1][1]);
			expect(savedCart).toHaveLength(0);
		});
	});

	describe('removeAllItems', () => {
		test('should remove cart from localStorage', () => {
			const existingCart = [{ product_id: 1, quantity: 2, data: {} }];
			localStorageMock.setItem('cart', JSON.stringify(existingCart));

			ShoppingCart.removeAllItems();

			expect(localStorageMock.removeItem).toHaveBeenCalledWith('cart');
		});

		test('should handle removing when cart does not exist', () => {
			ShoppingCart.removeAllItems();

			expect(localStorageMock.removeItem).toHaveBeenCalledWith('cart');
		});

		test('should clear cart so getCart returns empty array', () => {
			const existingCart = [{ product_id: 1, quantity: 2, data: {} }];
			localStorageMock.setItem('cart', JSON.stringify(existingCart));

			ShoppingCart.removeAllItems();

			const cart = ShoppingCart.getCart();
			expect(cart).toEqual([]);
		});
	});

	describe('Integration tests', () => {
		test('should handle complete shopping flow', () => {
			// Start with empty cart
			expect(ShoppingCart.getCart()).toEqual([]);

			// Add first product
			ShoppingCart.addProduct(1, 2, { name: 'Product 1', price: 10 });
			let cart = ShoppingCart.getCart();
			expect(cart).toHaveLength(1);

			// Add second product
			ShoppingCart.addProduct(2, 1, { name: 'Product 2', price: 20 });
			cart = ShoppingCart.getCart();
			expect(cart).toHaveLength(2);

			// Update first product quantity
			ShoppingCart.addProduct(1, 3, { name: 'Product 1', price: 10 });
			cart = ShoppingCart.getCart();
			expect(cart).toHaveLength(2);
			const product1 = cart.find(item => item.product_id === 1);
			expect(product1.quantity).toBe(5);

			// Delete second product
			ShoppingCart.deleteProduct(2);
			cart = ShoppingCart.getCart();
			expect(cart).toHaveLength(1);
			expect(cart[0].product_id).toBe(1);

			// Clear cart
			ShoppingCart.removeAllItems();
			cart = ShoppingCart.getCart();
			expect(cart).toEqual([]);
		});

		test('should persist cart across operations', () => {
			ShoppingCart.addProduct(1, 5, { name: 'Product 1' });

			// Simulate page reload by getting fresh cart
			const cart1 = ShoppingCart.getCart();
			expect(cart1[0].quantity).toBe(5);

			// Add more quantity
			ShoppingCart.addProduct(1, 2, { name: 'Product 1' });

			// Check persisted value
			const cart2 = ShoppingCart.getCart();
			expect(cart2[0].quantity).toBe(7);
		});

		test('should handle multiple products with same operations', () => {
			// Add multiple products
			for (let i = 1; i <= 5; i++) {
				ShoppingCart.addProduct(i, i, { name: `Product ${i}` });
			}

			let cart = ShoppingCart.getCart();
			expect(cart).toHaveLength(5);

			// Delete odd products
			ShoppingCart.deleteProduct(1);
			ShoppingCart.deleteProduct(3);
			ShoppingCart.deleteProduct(5);

			cart = ShoppingCart.getCart();
			expect(cart).toHaveLength(2);
			expect(cart.map(item => item.product_id)).toEqual([2, 4]);
		});
	});
});