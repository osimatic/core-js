class EventBus {
    constructor() {
		this.events = {}; 
	}

    publish(name, data) {
        var handlers = this.events[name];

        if (!!handlers === false) {
            return;
        }

        handlers.forEach(function(handler) {
            handler.call(this, data)
        });
    }

    subscribe(name, handler) {
        var handlers = this.events[name];

        if (!!handlers === false) {
            handlers = this.events[name] = [];
        } 

        handlers.push(handler);
    }

    unsubscribe(name, handler) {
        var handlers = this.events[name];

        if (!!handlers === false) {
            return;
        }

		handlers.splice(handlers.indexOf(handler), 1);
    }
}

export { EventBus };