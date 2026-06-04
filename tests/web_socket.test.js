// Mock socket.io-client before requiring WebSocket
jest.mock('socket.io-client');

import { WebSocket } from '../web_socket.js';
import socketIoClient from 'socket.io-client';

describe('WebSocket', () => {
	let mockEventBus;
	let mockSocket;

	beforeEach(() => {
		// Reset the mock socket for each test
		mockSocket = {
			on: jest.fn(),
			emit: jest.fn(),
			connected: false
		};

		// Make io return our mock socket
		socketIoClient.io.mockReturnValue(mockSocket);

		// Mock EventBus
		mockEventBus = {
			publish: jest.fn(),
			subscribe: jest.fn(),
			unsubscribe: jest.fn()
		};

		// Mock EventBus module
		jest.doMock('../event_bus', () => ({
			EventBus: jest.fn(() => mockEventBus)
		}));

		// Clear static properties
		delete WebSocket.eventBus;
		delete WebSocket.socketConnectionErrors;
		delete WebSocket.socketEvents;
		delete WebSocket.busEvents;
		delete WebSocket.customBusEvents;
		delete WebSocket.logged;
		delete WebSocket.instance;
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('setEventListeners', () => {
		test('should set socket events', () => {
			const socketEvents = ['message', 'update'];
			const busEvents = ['send_message'];
			const customBusEvents = [{ custom_name: 'custom_send', event_name: 'send' }];

			WebSocket.setEventListeners(socketEvents, busEvents, customBusEvents);

			expect(WebSocket.socketEvents).toBe(socketEvents);
		});

		test('should set bus events', () => {
			const socketEvents = ['message'];
			const busEvents = ['send_message', 'send_update'];
			const customBusEvents = [];

			WebSocket.setEventListeners(socketEvents, busEvents, customBusEvents);

			expect(WebSocket.busEvents).toBe(busEvents);
		});

		test('should set custom bus events', () => {
			const socketEvents = ['message'];
			const busEvents = ['send_message'];
			const customBusEvents = [
				{ custom_name: 'custom_send', event_name: 'send' },
				{ custom_name: 'custom_update', event_name: 'update' }
			];

			WebSocket.setEventListeners(socketEvents, busEvents, customBusEvents);

			expect(WebSocket.customBusEvents).toBe(customBusEvents);
		});

		test('should create EventBus instance', () => {
			const socketEvents = [];
			const busEvents = [];
			const customBusEvents = [];

			WebSocket.setEventListeners(socketEvents, busEvents, customBusEvents);

			expect(WebSocket.eventBus).toBeDefined();
		});

		test('should set socket connection errors', () => {
			const socketEvents = [];
			const busEvents = [];
			const customBusEvents = [];

			WebSocket.setEventListeners(socketEvents, busEvents, customBusEvents);

			expect(WebSocket.socketConnectionErrors).toEqual([
				'connect_error',
				'connect_timeout',
				'reconnect_error',
				'reconnect_failed'
			]);
		});
	});

	describe('connect', () => {
		beforeEach(() => {
			WebSocket.setEventListeners(['message'], ['send'], [{ custom_name: 'custom_action', event_name: 'action' }]);
		});

		test('should create socket instance', () => {
			const url = 'http://localhost:3000';
			const options = { transports: ['websocket'] };

			WebSocket.connect(url, options, {}, jest.fn(), jest.fn());

			expect(socketIoClient.io).toHaveBeenCalledWith(url, options);
			expect(WebSocket.instance).toBe(mockSocket);
		});

		test('should set logged to false', () => {
			WebSocket.connect('http://localhost:3000', {}, {}, jest.fn(), jest.fn());

			expect(WebSocket.logged).toBe(false);
		});

		test('should register error listeners', () => {
			WebSocket.connect('http://localhost:3000', {}, {}, jest.fn(), jest.fn());

			// Should register handlers for all error events
			const eventNames = mockSocket.on.mock.calls.map(call => call[0]);
			expect(eventNames).toContain('connect_error');
			expect(eventNames).toContain('connect_timeout');
			expect(eventNames).toContain('reconnect_error');
			expect(eventNames).toContain('reconnect_failed');
			expect(eventNames).toContain('error');
		});

		test('should register connect event listener', () => {
			WebSocket.connect('http://localhost:3000', {}, {}, jest.fn(), jest.fn());

			const eventNames = mockSocket.on.mock.calls.map(call => call[0]);
			expect(eventNames).toContain('connect');
		});

		test('should register disconnect event listener', () => {
			WebSocket.connect('http://localhost:3000', {}, {}, jest.fn(), jest.fn());

			const eventNames = mockSocket.on.mock.calls.map(call => call[0]);
			expect(eventNames).toContain('disconnect');
		});

		test('should register socket event listeners', () => {
			WebSocket.connect('http://localhost:3000', {}, {}, jest.fn(), jest.fn());

			const eventNames = mockSocket.on.mock.calls.map(call => call[0]);
			expect(eventNames).toContain('message');
		});
	});

	describe('registerErrorListeners', () => {
		beforeEach(() => {
			WebSocket.setEventListeners([], [], []);
			WebSocket.instance = mockSocket;
		});

		test('should register handler for each connection error', () => {
			const onUnavailableCallback = jest.fn();

			WebSocket.registerErrorListeners(onUnavailableCallback);

			expect(mockSocket.on).toHaveBeenCalledWith('connect_error', expect.any(Function));
			expect(mockSocket.on).toHaveBeenCalledWith('connect_timeout', expect.any(Function));
			expect(mockSocket.on).toHaveBeenCalledWith('reconnect_error', expect.any(Function));
			expect(mockSocket.on).toHaveBeenCalledWith('reconnect_failed', expect.any(Function));
		});

		test('should register handler for error event', () => {
			const onUnavailableCallback = jest.fn();

			WebSocket.registerErrorListeners(onUnavailableCallback);

			expect(mockSocket.on).toHaveBeenCalledWith('error', expect.any(Function));
		});

		test('should call clear when connection error occurs', () => {
			const onUnavailableCallback = jest.fn();
			const clearSpy = jest.spyOn(WebSocket, 'clear');

			WebSocket.registerErrorListeners(onUnavailableCallback);

			// Get the connect_error callback and trigger it
			const errorCallback = mockSocket.on.mock.calls.find(call => call[0] === 'connect_error')[1];
			errorCallback();

			expect(clearSpy).toHaveBeenCalledWith(onUnavailableCallback, 'connect_error');

			clearSpy.mockRestore();
		});

		test('should call clear with error when error event occurs', () => {
			const onUnavailableCallback = jest.fn();
			const clearSpy = jest.spyOn(WebSocket, 'clear');
			const error = new Error('Connection failed');

			WebSocket.registerErrorListeners(onUnavailableCallback);

			// Get the error callback and trigger it
			const errorCallback = mockSocket.on.mock.calls.find(call => call[0] === 'error')[1];
			errorCallback(error);

			expect(clearSpy).toHaveBeenCalledWith(onUnavailableCallback, error);

			clearSpy.mockRestore();
		});
	});

	describe('registerEventListeners', () => {
		beforeEach(() => {
			WebSocket.setEventListeners(['message'], ['send'], [{ custom_name: 'custom_action', event_name: 'action' }]);
			WebSocket.instance = mockSocket;
		});

		test('should register connect handler', () => {
			const connectInitPayload = { userId: '123' };
			const onConnectionAckCallback = jest.fn();
			const onUnavailableCallback = jest.fn();

			WebSocket.registerEventListeners(connectInitPayload, onConnectionAckCallback, onUnavailableCallback);

			expect(mockSocket.on).toHaveBeenCalledWith('connect', expect.any(Function));
		});

		test('should register disconnect handler', () => {
			WebSocket.registerEventListeners({}, jest.fn(), jest.fn());

			expect(mockSocket.on).toHaveBeenCalledWith('disconnect', expect.any(Function));
		});

		test('should emit connect_init on connect', () => {
			const connectInitPayload = { userId: '123' };
			const onConnectionAckCallback = jest.fn();

			WebSocket.registerEventListeners(connectInitPayload, onConnectionAckCallback, jest.fn());

			// Trigger connect
			const connectCallback = mockSocket.on.mock.calls.find(call => call[0] === 'connect')[1];
			connectCallback();

			expect(WebSocket.logged).toBe(true);
			expect(mockSocket.emit).toHaveBeenCalledWith('connect_init', connectInitPayload, onConnectionAckCallback);
		});

		test('should clear on reconnect', () => {
			const clearSpy = jest.spyOn(WebSocket, 'clear');
			WebSocket.logged = true;

			WebSocket.registerEventListeners({}, jest.fn(), jest.fn());

			// Trigger connect (reconnect scenario)
			const connectCallback = mockSocket.on.mock.calls.find(call => call[0] === 'connect')[1];
			connectCallback();

			expect(clearSpy).toHaveBeenCalled();

			clearSpy.mockRestore();
		});

		test('should register socket event handlers', () => {
			WebSocket.registerEventListeners({}, jest.fn(), jest.fn());

			expect(mockSocket.on).toHaveBeenCalledWith('message', expect.any(Function));
		});

		test('should publish socket events to event bus', () => {
			WebSocket.registerEventListeners({}, jest.fn(), jest.fn());

			// Trigger message event
			const messageCallback = mockSocket.on.mock.calls.find(call => call[0] === 'message')[1];
			const payload = { text: 'Hello' };
			messageCallback(payload);

			expect(mockEventBus.publish).toHaveBeenCalledWith('message', payload);
		});

		test('should subscribe to bus events', () => {
			WebSocket.registerEventListeners({}, jest.fn(), jest.fn());

			expect(mockEventBus.subscribe).toHaveBeenCalledWith('send', expect.any(Function));
		});

		test('should emit to socket when bus event received', () => {
			WebSocket.registerEventListeners({}, jest.fn(), jest.fn());

			// Get the bus event callback
			const sendCallback = mockEventBus.subscribe.mock.calls.find(call => call[0] === 'send')[1];
			const payload = { text: 'Hello' };
			sendCallback(payload);

			expect(mockSocket.emit).toHaveBeenCalledWith('send', payload);
		});

		test('should subscribe to custom bus events', () => {
			WebSocket.registerEventListeners({}, jest.fn(), jest.fn());

			expect(mockEventBus.subscribe).toHaveBeenCalledWith('custom_action', expect.any(Function));
		});

		test('should emit custom event name to socket', () => {
			WebSocket.registerEventListeners({}, jest.fn(), jest.fn());

			// Get the custom bus event callback
			const customCallback = mockEventBus.subscribe.mock.calls.find(call => call[0] === 'custom_action')[1];
			const payload = { data: 'test' };
			customCallback(payload);

			expect(mockSocket.emit).toHaveBeenCalledWith('action', payload);
		});

		test('should call clear on disconnect', () => {
			const onUnavailableCallback = jest.fn();
			const clearSpy = jest.spyOn(WebSocket, 'clear');

			WebSocket.registerEventListeners({}, jest.fn(), onUnavailableCallback);

			// Trigger disconnect
			const disconnectCallback = mockSocket.on.mock.calls.find(call => call[0] === 'disconnect')[1];
			disconnectCallback();

			expect(clearSpy).toHaveBeenCalledWith(onUnavailableCallback);

			clearSpy.mockRestore();
		});
	});

	describe('unregisterEventListener', () => {
		beforeEach(() => {
			WebSocket.setEventListeners([], ['send', 'delete'], [{ custom_name: 'custom_send', event_name: 'send_custom' }]);
		});

		test('should unsubscribe all bus events', () => {
			WebSocket.unregisterEventListener();

			expect(mockEventBus.unsubscribe).toHaveBeenCalledWith('send', {});
			expect(mockEventBus.unsubscribe).toHaveBeenCalledWith('delete', {});
		});

		test('should unsubscribe all custom bus events', () => {
			WebSocket.unregisterEventListener();

			expect(mockEventBus.unsubscribe).toHaveBeenCalledWith('custom_send', {});
		});
	});

	describe('clear', () => {
		beforeEach(() => {
			WebSocket.setEventListeners([], ['send'], []);
		});

		test('should call unregisterEventListener', () => {
			const unregisterSpy = jest.spyOn(WebSocket, 'unregisterEventListener');

			WebSocket.clear();

			expect(unregisterSpy).toHaveBeenCalled();

			unregisterSpy.mockRestore();
		});

		test('should call onUnavailableCallback when provided', () => {
			const onUnavailableCallback = jest.fn();
			const error = 'connection_error';

			WebSocket.clear(onUnavailableCallback, error);

			expect(onUnavailableCallback).toHaveBeenCalledWith(error);
		});

		test('should not throw when onUnavailableCallback is undefined', () => {
			expect(() => {
				WebSocket.clear(undefined);
			}).not.toThrow();
		});

		test('should pass error to callback', () => {
			const onUnavailableCallback = jest.fn();
			const error = new Error('Network error');

			WebSocket.clear(onUnavailableCallback, error);

			expect(onUnavailableCallback).toHaveBeenCalledWith(error);
		});
	});

	describe('integration scenarios', () => {
		beforeEach(() => {
			WebSocket.setEventListeners(['message'], ['send'], [{ custom_name: 'custom_action', event_name: 'action' }]);
		});

		test('should complete full connection flow', () => {
			const url = 'http://localhost:3000';
			const options = { transports: ['websocket'] };
			const connectInitPayload = { userId: '123' };
			const onUnavailableCallback = jest.fn();
			const onConnectionAckCallback = jest.fn();

			WebSocket.connect(url, options, connectInitPayload, onUnavailableCallback, onConnectionAckCallback);

			expect(WebSocket.instance).toBeDefined();
			expect(WebSocket.logged).toBe(false);

			// Trigger connect
			const connectCallback = mockSocket.on.mock.calls.find(call => call[0] === 'connect')[1];
			connectCallback();

			expect(WebSocket.logged).toBe(true);
			expect(mockSocket.emit).toHaveBeenCalledWith('connect_init', connectInitPayload, onConnectionAckCallback);
		});

		test('should handle error and cleanup', () => {
			const url = 'http://localhost:3000';
			const options = {};
			const connectInitPayload = {};
			const onUnavailableCallback = jest.fn();
			const onConnectionAckCallback = jest.fn();

			WebSocket.connect(url, options, connectInitPayload, onUnavailableCallback, onConnectionAckCallback);

			// Trigger error
			const errorCallback = mockSocket.on.mock.calls.find(call => call[0] === 'error')[1];
			const error = new Error('Connection failed');
			errorCallback(error);

			expect(onUnavailableCallback).toHaveBeenCalledWith(error);
			expect(mockEventBus.unsubscribe).toHaveBeenCalled();
		});

		test('should handle disconnect and cleanup', () => {
			const url = 'http://localhost:3000';
			const options = {};
			const connectInitPayload = {};
			const onUnavailableCallback = jest.fn();
			const onConnectionAckCallback = jest.fn();

			WebSocket.connect(url, options, connectInitPayload, onUnavailableCallback, onConnectionAckCallback);

			// Trigger disconnect
			const disconnectCallback = mockSocket.on.mock.calls.find(call => call[0] === 'disconnect')[1];
			disconnectCallback();

			expect(onUnavailableCallback).toHaveBeenCalled();
			expect(mockEventBus.unsubscribe).toHaveBeenCalled();
		});

		test('should handle reconnect scenario', () => {
			const url = 'http://localhost:3000';
			const options = {};
			const connectInitPayload = {};
			const onUnavailableCallback = jest.fn();
			const onConnectionAckCallback = jest.fn();

			WebSocket.connect(url, options, connectInitPayload, onUnavailableCallback, onConnectionAckCallback);

			// First connect
			const connectCallback = mockSocket.on.mock.calls.find(call => call[0] === 'connect')[1];
			connectCallback();
			expect(WebSocket.logged).toBe(true);

			jest.clearAllMocks();

			// Reconnect (logged is already true)
			connectCallback();

			// Should have called clear() before reconnecting
			expect(mockEventBus.unsubscribe).toHaveBeenCalled();
			expect(WebSocket.logged).toBe(true);
		});

		test('should bridge socket events to event bus', () => {
			WebSocket.connect('http://localhost:3000', {}, {}, jest.fn(), jest.fn());

			// Trigger socket message event
			const messageCallback = mockSocket.on.mock.calls.find(call => call[0] === 'message')[1];
			const payload = { text: 'Hello from socket' };
			messageCallback(payload);

			expect(mockEventBus.publish).toHaveBeenCalledWith('message', payload);
		});

		test('should bridge bus events to socket', () => {
			WebSocket.connect('http://localhost:3000', {}, {}, jest.fn(), jest.fn());

			// Get bus event callback and trigger it
			const sendCallback = mockEventBus.subscribe.mock.calls.find(call => call[0] === 'send')[1];
			const payload = { text: 'Hello from bus' };
			sendCallback(payload);

			expect(mockSocket.emit).toHaveBeenCalledWith('send', payload);
		});

		test('should handle custom bus events correctly', () => {
			WebSocket.connect('http://localhost:3000', {}, {}, jest.fn(), jest.fn());

			// Get custom bus event callback
			const customCallback = mockEventBus.subscribe.mock.calls.find(call => call[0] === 'custom_action')[1];
			const payload = { data: 'custom data' };
			customCallback(payload);

			// Should emit with the mapped event name
			expect(mockSocket.emit).toHaveBeenCalledWith('action', payload);
		});

		test('should handle all connection errors', () => {
			const onUnavailableCallback = jest.fn();

			WebSocket.connect('http://localhost:3000', {}, {}, onUnavailableCallback, jest.fn());

			// Test each connection error type
			const errors = ['connect_error', 'connect_timeout', 'reconnect_error', 'reconnect_failed'];

			// Store all callbacks before clearing mocks
			const errorCallbacks = errors.map(errorType => ({
				type: errorType,
				callback: mockSocket.on.mock.calls.find(call => call[0] === errorType)[1]
			}));

			errorCallbacks.forEach(({ type, callback }) => {
				jest.clearAllMocks();
				callback();

				expect(onUnavailableCallback).toHaveBeenCalledWith(type);
				expect(mockEventBus.unsubscribe).toHaveBeenCalled();
			});
		});
	});
});