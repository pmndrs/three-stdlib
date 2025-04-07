/*
Due to @types/three r168 breaking change
we have to manually copy the EventDispatcher class from three.js.
So this files merges the declarations from https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/three/src/core/EventDispatcher.d.ts
with the implementation from https://github.com/mrdoob/three.js/blob/dev/src/core/EventDispatcher.js
More info in https://github.com/pmndrs/three-stdlib/issues/387
*/

/**
 * The minimal basic Event that can be dispatched by a {@link EventDispatcher<>}.
 */
export interface BaseEvent<TEventType extends string = string> {
    readonly type: TEventType;
    // not defined in @types/three
    target: any;
}

/**
 * The minimal expected contract of a fired Event that was dispatched by a {@link EventDispatcher<>}.
 */
export interface Event<TEventType extends string = string, TTarget = unknown> {
    readonly type: TEventType;
    readonly target: TTarget;
}

export type EventListener<TEventData, TEventType extends string, TTarget> = (
    event: TEventData & Event<TEventType, TTarget>,
) => void;

export class EventDispatcher<TEventMap extends {} = {}> {
    // not defined in @types/three
    private _listeners: any;

    /**
     * Adds a listener to an event type.
     * @param type The type of event to listen to.
     * @param listener The function that gets called when the event is fired.
     */
	addEventListener(type: string, listener: EventListener<{}, string, this>): void
	addEventListener<T extends Extract<keyof TEventMap, string>>(
        type: T,
        listener: EventListener<TEventMap[T], T, this>,
    ): void
	addEventListener<T extends Extract<keyof TEventMap, string>>(
        type: T | string,
        listener: EventListener<TEventMap[T], T, this> | EventListener<{}, string, this>,
    ): void
	 {

		if ( this._listeners === undefined ) this._listeners = {};

		const listeners = this._listeners;

		if ( listeners[ type ] === undefined ) {

			listeners[ type ] = [];

		}

		if ( listeners[ type ].indexOf( listener ) === - 1 ) {

			listeners[ type ].push( listener );

		}

	}

	/**
     * Checks if listener is added to an event type.
     * @param type The type of event to listen to.
     * @param listener The function that gets called when the event is fired.
     */
	hasEventListener(type: string, listener: EventListener<{}, string, this>): boolean;
    hasEventListener<T extends Extract<keyof TEventMap, string>>(
        type: T,
        listener: EventListener<TEventMap[T], T, this>,
    ): boolean;
	hasEventListener<T extends Extract<keyof TEventMap, string>>(
        type: T | string,
        listener: EventListener<TEventMap[T], T, this> | EventListener<{}, string, this>,
    ): boolean {

		if ( this._listeners === undefined ) return false;

		const listeners = this._listeners;

		return listeners[ type ] !== undefined && listeners[ type ].indexOf( listener ) !== - 1;

	}

	/**
     * Removes a listener from an event type.
     * @param type The type of the listener that gets removed.
     * @param listener The listener function that gets removed.
     */
	removeEventListener(type: string, listener: EventListener<{}, string, this>): void;
    removeEventListener<T extends Extract<keyof TEventMap, string>>(
        type: T,
        listener: EventListener<TEventMap[T], T, this>,
    ): void
	removeEventListener<T extends Extract<keyof TEventMap, string>>(
        type: T|string,
        listener: EventListener<TEventMap[T], T, this> | EventListener<{}, string, this>,
    ): void {

		if ( this._listeners === undefined ) return;

		const listeners = this._listeners;
		const listenerArray = listeners[ type ];

		if ( listenerArray !== undefined ) {

			const index = listenerArray.indexOf( listener );

			if ( index !== - 1 ) {

				listenerArray.splice( index, 1 );

			}

		}

	}

	/**
     * Fire an event type.
     * @param event The event that gets fired.
     */
    dispatchEvent<T extends Extract<keyof TEventMap, string>>(event: BaseEvent<T> & TEventMap[T]): void {

		if ( this._listeners === undefined ) return;

		const listeners = this._listeners;
		const listenerArray = listeners[ event.type ];

		if ( listenerArray !== undefined ) {

			event.target = this;

			// Make a copy, in case listeners are removed while iterating.
			const array = listenerArray.slice( 0 );

			for ( let i = 0, l = array.length; i < l; i ++ ) {

				array[ i ].call( this, event );

			}

			event.target = null;

		}

	}

}