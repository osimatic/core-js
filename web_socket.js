import { EventBus } from './event_bus.js';
import { io } from 'socket.io-client';

class WebSocket {
    /**
     * socketEvents : events en provenance de la socket qui seront dispatchés à travers le bus event
     * busEvents : events en provenance de l'event bus qui seront dispatchés vers la socket
     * customBusEvents : events "spéciaux" en provenance de l'event bus qui seront dispatchés vers la socket : array({ 'custom_name' => 'event_name' }, ...)
    */
    static setEventListeners(socketEvents, busEvents, customBusEvents) {
        this.eventBus = new EventBus();
		this.socketConnectionErrors = ['connect_error', 'connect_timeout', 'reconnect_error', 'reconnect_failed'];
        this.socketEvents = socketEvents;
		this.busEvents = busEvents;
        this.customBusEvents = customBusEvents;
    }

	static connect(url, options, connectInitPayload, onUnavailableCallback, onConnectionAckCallback) {
		this.logged = false;
		this.instance = io(url, options);

		this.registerErrorListeners(onUnavailableCallback);
		this.registerEventListeners(connectInitPayload, onConnectionAckCallback, onUnavailableCallback);
	}

	static registerErrorListeners(onUnavailableCallback) {
		var self = this;

		self.socketConnectionErrors.forEach(function(event) {
			self.instance.on(event, function() {
				self.clear(onUnavailableCallback, event);
			});
		});

		self.instance.on('error', function(error) {
			self.clear(onUnavailableCallback, error);
		});
	}

	static registerEventListeners(connectInitPayload, onConnectionAckCallback, onUnavailableCallback) {
		var self = this;

		self.instance.on('connect', function() {
			if (self.logged) { //reconnexion avant timeout : on supprime les listeners de l'event bus
				self.clear();
			}

			self.logged = true;

			self.instance.emit('connect_init', connectInitPayload, onConnectionAckCallback);			
		});

		self.instance.on('disconnect', function() {
			self.clear(onUnavailableCallback);
		});

		self.socketEvents.forEach(function (event) {
			self.instance.on(event, function(payload) {
				self.eventBus.publish(event, payload);
			});
		});

		self.busEvents.forEach(function(event) {
			self.eventBus.subscribe(event, function(payload) {
				self.instance.emit(event, payload);
			});
		});

        self.customBusEvents.forEach(function(object) {
			self.eventBus.subscribe(object.custom_name, function(payload) {
				self.instance.emit(object.event_name, payload)
			});
		});
	}

	static unregisterEventListener() {
		var self = this;

		self.busEvents.forEach(function (event) {
			self.eventBus.unsubscribe(event, {});
		});

        self.customBusEvents.forEach(function(object) {
			self.eventBus.unsubscribe(object.custom_name, {});
		});
	}

	static clear(onUnavailableCallback, error) {
		this.unregisterEventListener();

		if (typeof onUnavailableCallback !== 'undefined') {
            onUnavailableCallback(error);
        }
	}
}

export { WebSocket };