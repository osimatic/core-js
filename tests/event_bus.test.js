import { EventBus } from '../event_bus.js';

describe('EventBus', () => {
	let eventBus;

	beforeEach(() => {
		eventBus = new EventBus();
	});

	describe('constructor', () => {
		test('should create an instance with empty events object', () => {
			expect(eventBus.events).toEqual({});
		});

		test('should create a new EventBus instance', () => {
			expect(eventBus).toBeInstanceOf(EventBus);
		});
	});

	describe('subscribe', () => {
		test('should subscribe a handler to an event', () => {
			const handler = jest.fn();
			eventBus.subscribe('test-event', handler);

			expect(eventBus.events['test-event']).toContain(handler);
		});

		test('should allow multiple handlers for the same event', () => {
			const handler1 = jest.fn();
			const handler2 = jest.fn();

			eventBus.subscribe('test-event', handler1);
			eventBus.subscribe('test-event', handler2);

			expect(eventBus.events['test-event']).toHaveLength(2);
			expect(eventBus.events['test-event']).toContain(handler1);
			expect(eventBus.events['test-event']).toContain(handler2);
		});

		test('should create event array if it does not exist', () => {
			const handler = jest.fn();
			eventBus.subscribe('new-event', handler);

			expect(eventBus.events['new-event']).toEqual([handler]);
		});

		test('should allow subscribing to multiple different events', () => {
			const handler1 = jest.fn();
			const handler2 = jest.fn();

			eventBus.subscribe('event1', handler1);
			eventBus.subscribe('event2', handler2);

			expect(eventBus.events['event1']).toContain(handler1);
			expect(eventBus.events['event2']).toContain(handler2);
		});

		test('should allow subscribing same handler to multiple events', () => {
			const handler = jest.fn();

			eventBus.subscribe('event1', handler);
			eventBus.subscribe('event2', handler);

			expect(eventBus.events['event1']).toContain(handler);
			expect(eventBus.events['event2']).toContain(handler);
		});
	});

	describe('publish', () => {
		test('should call subscribed handler when event is published', () => {
			const handler = jest.fn();
			eventBus.subscribe('test-event', handler);

			eventBus.publish('test-event', { data: 'test' });

			expect(handler).toHaveBeenCalledTimes(1);
			expect(handler).toHaveBeenCalledWith({ data: 'test' });
		});

		test('should call all subscribed handlers', () => {
			const handler1 = jest.fn();
			const handler2 = jest.fn();
			const handler3 = jest.fn();

			eventBus.subscribe('test-event', handler1);
			eventBus.subscribe('test-event', handler2);
			eventBus.subscribe('test-event', handler3);

			eventBus.publish('test-event', { data: 'test' });

			expect(handler1).toHaveBeenCalledTimes(1);
			expect(handler2).toHaveBeenCalledTimes(1);
			expect(handler3).toHaveBeenCalledTimes(1);
		});

		test('should pass data to all handlers', () => {
			const handler1 = jest.fn();
			const handler2 = jest.fn();
			const data = { message: 'hello', value: 42 };

			eventBus.subscribe('test-event', handler1);
			eventBus.subscribe('test-event', handler2);

			eventBus.publish('test-event', data);

			expect(handler1).toHaveBeenCalledWith(data);
			expect(handler2).toHaveBeenCalledWith(data);
		});

		test('should do nothing if event has no handlers', () => {
			expect(() => {
				eventBus.publish('non-existent-event', { data: 'test' });
			}).not.toThrow();
		});

		test('should publish with undefined data', () => {
			const handler = jest.fn();
			eventBus.subscribe('test-event', handler);

			eventBus.publish('test-event');

			expect(handler).toHaveBeenCalledWith(undefined);
		});

		test('should publish with null data', () => {
			const handler = jest.fn();
			eventBus.subscribe('test-event', handler);

			eventBus.publish('test-event', null);

			expect(handler).toHaveBeenCalledWith(null);
		});

		test('should publish multiple times', () => {
			const handler = jest.fn();
			eventBus.subscribe('test-event', handler);

			eventBus.publish('test-event', { count: 1 });
			eventBus.publish('test-event', { count: 2 });
			eventBus.publish('test-event', { count: 3 });

			expect(handler).toHaveBeenCalledTimes(3);
			expect(handler).toHaveBeenNthCalledWith(1, { count: 1 });
			expect(handler).toHaveBeenNthCalledWith(2, { count: 2 });
			expect(handler).toHaveBeenNthCalledWith(3, { count: 3 });
		});

		test('should not affect other events', () => {
			const handler1 = jest.fn();
			const handler2 = jest.fn();

			eventBus.subscribe('event1', handler1);
			eventBus.subscribe('event2', handler2);

			eventBus.publish('event1', { data: 'test' });

			expect(handler1).toHaveBeenCalledTimes(1);
			expect(handler2).not.toHaveBeenCalled();
		});
	});

	describe('unsubscribe', () => {
		test('should remove a subscribed handler', () => {
			const handler = jest.fn();
			eventBus.subscribe('test-event', handler);

			eventBus.unsubscribe('test-event', handler);

			eventBus.publish('test-event', { data: 'test' });
			expect(handler).not.toHaveBeenCalled();
		});

		test('should remove only the specified handler', () => {
			const handler1 = jest.fn();
			const handler2 = jest.fn();
			const handler3 = jest.fn();

			eventBus.subscribe('test-event', handler1);
			eventBus.subscribe('test-event', handler2);
			eventBus.subscribe('test-event', handler3);

			eventBus.unsubscribe('test-event', handler2);

			eventBus.publish('test-event', { data: 'test' });

			expect(handler1).toHaveBeenCalledTimes(1);
			expect(handler2).not.toHaveBeenCalled();
			expect(handler3).toHaveBeenCalledTimes(1);
		});

		test('should do nothing if event does not exist', () => {
			const handler = jest.fn();

			expect(() => {
				eventBus.unsubscribe('non-existent-event', handler);
			}).not.toThrow();
		});

		test('should do nothing if handler is not subscribed', () => {
			const handler1 = jest.fn();
			const handler2 = jest.fn();

			eventBus.subscribe('test-event', handler1);

			expect(() => {
				eventBus.unsubscribe('test-event', handler2);
			}).not.toThrow();
		});

		test('should handle multiple unsubscribes', () => {
			const handler1 = jest.fn();
			const handler2 = jest.fn();

			eventBus.subscribe('test-event', handler1);
			eventBus.subscribe('test-event', handler2);

			eventBus.unsubscribe('test-event', handler1);
			eventBus.unsubscribe('test-event', handler2);

			eventBus.publish('test-event', { data: 'test' });

			expect(handler1).not.toHaveBeenCalled();
			expect(handler2).not.toHaveBeenCalled();
		});
	});

	describe('integration', () => {
		test('should handle subscribe-publish-unsubscribe flow', () => {
			const handler = jest.fn();

			eventBus.subscribe('test-event', handler);
			eventBus.publish('test-event', { step: 1 });

			expect(handler).toHaveBeenCalledTimes(1);

			eventBus.unsubscribe('test-event', handler);
			eventBus.publish('test-event', { step: 2 });

			expect(handler).toHaveBeenCalledTimes(1); // Still 1, not called again
		});

		test('should handle multiple events with different handlers', () => {
			const userHandler = jest.fn();
			const orderHandler = jest.fn();

			eventBus.subscribe('user-created', userHandler);
			eventBus.subscribe('order-placed', orderHandler);

			eventBus.publish('user-created', { userId: 123 });
			eventBus.publish('order-placed', { orderId: 456 });

			expect(userHandler).toHaveBeenCalledWith({ userId: 123 });
			expect(orderHandler).toHaveBeenCalledWith({ orderId: 456 });
		});

		test('should handle re-subscribing after unsubscribe', () => {
			const handler = jest.fn();

			eventBus.subscribe('test-event', handler);
			eventBus.unsubscribe('test-event', handler);
			eventBus.subscribe('test-event', handler);

			eventBus.publish('test-event', { data: 'test' });

			expect(handler).toHaveBeenCalledTimes(1);
		});
	});
});