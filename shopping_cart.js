class ShoppingCart {
	static addProduct(productId, quantity, data) {
		let cart = this.getCart();
		let item = cart.find(element => element.product_id == productId);
		if (typeof item != 'undefined') {
			cart.unsetVal(item);
			quantity += item.quantity;
		}
		cart.push({product_id: productId, quantity: quantity, data: data});
		localStorage.setItem('cart', JSON.stringify(cart));
	}

	static deleteProduct(productId) {
		let cart = this.getCart();
		cart.unsetVal(cart.find(element => element.product_id == productId));
		localStorage.setItem('cart', JSON.stringify(cart));
	}

	static removeAllItems() {
		localStorage.removeItem('cart');
	}

	static getCart() {
		let cart = [];
		if (localStorage.getItem('cart') != null) {
			cart = JSON.parse(localStorage.getItem('cart'));
		}
		return cart;
	}
}

export { ShoppingCart };