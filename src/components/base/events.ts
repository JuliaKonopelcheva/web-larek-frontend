import { IEvents, EventMap, EmitterEvent } from "../../types"; 

// Брокер событий 
export class EventEmitter implements IEvents {
	private _events = new Map<string | RegExp, Set<Function>>();

	on<K extends keyof EventMap>(eventName: K, callback: (data: EventMap[K]) => void): void {
		if (!this._events.has(eventName)) {
			this._events.set(eventName, new Set());
		}
		this._events.get(eventName)!.add(callback);
	}

	off<K extends keyof EventMap>(eventName: K, callback: (data: EventMap[K]) => void): void {
		this._events.get(eventName)?.delete(callback);
		if (this._events.get(eventName)?.size === 0) {
			this._events.delete(eventName);
		}
	}

	emit<K extends keyof EventMap>(eventName: K, data: EventMap[K]): void {
		for (const [name, subscribers] of this._events.entries()) {
			if (name === '*' || name === eventName || (name instanceof RegExp && name.test(eventName))) {
				subscribers.forEach(cb => cb(name === '*' ? { eventName, data } : data));
			}
		}
	}

	onAll(callback: (event: EmitterEvent) => void): void {
		this.on('*' as keyof EventMap, callback as unknown as (data: EventMap[keyof EventMap]) => void);
	}

	offAll(): void {
		this._events.clear();
	}

	trigger<K extends keyof EventMap>(eventName: K, context?: Partial<EventMap[K]>): (data: EventMap[K]) => void {
		return (data: EventMap[K]) => {
			this.emit(eventName, { ...context, ...data } as EventMap[K]);
		};
	}

}