import RevolutCheckout from '@revolut/checkout';

export class Revolut {
    constructor() {
        this.mode = 'prod';
    }

    static setMode(mode) {
        this.mode = mode;
    }

    static displayPaymentPopup(orderId, onSuccess, onError, onCancel) {
        RevolutCheckout(orderId, this.mode).then((instance) => {
            instance.payWithPopup({
                onSuccess,
                onError,
                onCancel
            });
        });
    }
}
