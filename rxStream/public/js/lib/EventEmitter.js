/*!
 * EventEmitter v0.11.0 - 
 * Unlicense - http://unlicense.org/
 */

;
(function() {
	'use strict';

	/**
	 * Class for managing events.
	 * Can be extended to provide event functionality in other classes.
	 *
	 * @class EventEmitter Manages event registering and emitting.
	 */
	function EventEmitter() {}

	// Shortcuts to improve speed and size
	var exports = this,
		OP = Object.prototype,
		toString = OP.toString,
		hasOwnProperty = OP.hasOwnProperty,
		AP = Array.prototype,
		slice = AP.slice,
		sNativeCode = (slice + '').slice((slice + '').indexOf('{')),
		rSpaces = /\s+/,
		NUMBER_STRING_TYPE = {
			'number': !0,
			'string': !0
		},
		REFERENCE_TYPE = {
			'object': !0,
			'function': !0
		},
		now = isNativeFunction(Date.now) ? Date.now : (Date.now = function now() {
			return new Date().getTime();
		});

	/**
	 * Types test for an object.
	 *
	 * @param {*} object any types object.
	 * @return {String} type of the object.
	 * @api private
	 */
	function typeOf(object) {
		return toString.call(object).slice(8, -1);
	}

	/**
	 * Boolean test for method of an object is native.
	 *
	 * @param {Object} target Object.
	 * @param {Object} src Object.
	 * @return {Object} target.
	 * @api private
	 */
	function extend(target, src) {
		if(src){
			for (var k in src) {
				hasOwnProperty.call(src, k) && (target[k] = src[k]);
			}
		}
		return target;
	}

	/**
	 * Boolean test for a function is native.
	 *
	 * @param {Function} func.
	 * @return {Boolean} is a native Function.
	 * @api private
	 */
	function isNativeFunction(func) {
		return typeOf(func) === 'Function' && sNativeCode === (func += '').slice(func.indexOf('{'));
	};

	// es6 Object.create
	isNativeFunction(Object.create) ||
		(Object.create = function create(object, properties) {
			if(object === null){
				
			}else if(!REFERENCE_TYPE[typeof object]){
				throw 'Object prototype may only be an Object or null';
			}
			noop.prototype = object;
			var proto = new noop,
				prop, propName;

			if (properties) {
				if(REFERENCE_TYPE[typeof properties]){
					for (propName in properties) {
						if (hasOwnProperty.call(properties, propName)) {
							if ((prop = properties[propName]) && REFERENCE_TYPE[typeof prop]) {
								object[propName] = prop.value;
							} else {
								throw 'Property description must be an object: value';
							}
						}
					}
				}
				else{
					throw 'Property description must be an object: value';
				}
			}
			return proto;
		});

	// noop Function
	function noop() {};

	/**
	 * Finds the index of the listener for the event in its storage array.
	 *
	 * @param {Function[]} listeners Array of listeners to search through.
	 * @param {Function} listener Method to look for.
	 * @return {Number} Index of the specified listener, -1 if not found
	 * @api private
	 */
	function indexOfListener(listeners, listener) {
		var i = listeners.length;
		while (i--) {
			if (listeners[i].listener === listener) {
				return i;
			}
		}
		return -1;
	}

	/**
	 * Alias a method while keeping the context correct, to allow for overwriting of target method.
	 *
	 * @param {String} name The name of the target method.
	 * @return {Function} The aliased method
	 * @api private
	 */
	function alias(name) {
		return function aliasClosure() {
			return this[name].apply(this, arguments);
		};
	}

	extend(EventEmitter.prototype, {

		/**
		 * Adds a listener function to the specified event.
		 * The listener will not be added if it is a duplicate.
		 * If the listener returns true then it will be removed after it is called.
		 * If you pass a regular expression as the event name then the listener will be added to all events that match it.
		 *
		 * @param {String|RegExp} evt Name of the event to attach the listener to.
		 * @param {Function} listener Method to be called when the event is emitted. If the function returns true then it will be removed after calling.
		 * @return {Object} Current instance of EventEmitter for chaining.
		 */
		addListener: function addListener(evt, listener) {
			var events = this._events,
				key,
				listeners,
				types,
				i,
				type,
				listenerArgs = slice.call(arguments, 1),
				l,
				j;

			wrapListenerArgs();

			if (!evt) {
				if (l && events) {
					for (key in events) {
						listeners = events[key];
						adds();
					}
				}
			} else switch (typeof evt) {
				// 
				case 'string':
					if (l) {
						types = evt.split(rSpaces);
						i = types.length;
						// add some event types
						if (events) {
							while (i--) {
								if (hasOwnProperty.call(events, types[i])) {
									listeners = events[types[i]];
									adds();
								} else {
									events[types[i]] = listenerArgs.slice();
								}
							}
						}
						// add All event types
						else {
							events = this._events = {};
							while (i--) {
								events[types[i]] = listenerArgs.slice();
							}
						}
					}
					break;
					// 
				case 'function':
					// add some event types
					if (events) {
						listenerArgs = slice.call(arguments, 0);
						wrapListenerArgs();
						for (key in events) {
							listeners = events[key];
							adds();
						}
					}
					break;
					// 
				case 'object':

					if (evt.test) {
						if (l && events) {
							for (key in events) {
								if (evt.test(key)) {
									listeners = events[key];
									adds();
								}
							}
						}
					}
					// has events
					else {
						if (!events) {
							events = this._events = {};
						}
						for (key in evt) {
							if (hasOwnProperty.call(evt, key)) {
								listenerArgs = typeof evt[key] === 'function' ? [evt[key]] : evt[key];
								wrapListenerArgs();
								if (hasOwnProperty.call(events, key)) {
									listeners = events[key];
									adds();
								} else {
									events[key] = listenerArgs;
								}
							}
						}
					}
					break;
			}

			return this;

			function wrapListenerArgs() {
				j = l = listenerArgs.length;
				while (j--) {
					if(listenerArgs[j]){
						if(typeof listenerArgs[j] === 'function'){
							listenerArgs[j] = {
								listener: listenerArgs[j],
								once: false
							};
						}
						else if(typeof listenerArgs[j].listener !== 'function'){
							listenerArgs.splice(j--, 1);
						}
					}
					else{
						listenerArgs.splice(j--, 1);
					}
				}
			}

			function adds() {
				j = -1;
				while (++j < l) {
					if (indexOfListener(listeners, listenerArgs[j].listener) < 0) {
						listeners.push(listenerArgs[j]);
					}
				}
			}
		},

		/**
		 * Alias of addListener
		 */
		on: alias('addListener'),

		/**
		 * Semi-alias of addListener. It will add a listener that will be
		 * automatically removed after its first execution.
		 *
		 * @param {String|RegExp} evt Name of the event to attach the listener to.
		 * @param {Function} listener Method to be called when the event is emitted. If the function returns true then it will be removed after calling.
		 * @return {Object} Current instance of EventEmitter for chaining.
		 */
		addOnceListener: function addOnceListener(evt, listener) {
			return this.addListener(evt, {
				listener: listener,
				once: true
			});
		},

		/**
		 * Alias of addOnceListener.
		 */
		once: alias('addOnceListener'),

		/**
		 * Removes a listener function from the specified event.
		 * When passed a regular expression as the event name, it will remove the listener from all events that match it.
		 *
		 * @param {String|RegExp} evt Name of the event to remove the listener from.
		 * @param {Function} listener Method to remove from the event.
		 * @return {Object} Current instance of EventEmitter for chaining.
		 */
		removeListener: function removeListener(evt, listener) {
			var events = this._events,
				key,
				listeners,
				types,
				index,
				type,
				listenerArgs = slice.call(arguments, 1),
				l = listenerArgs.length,
				i,
				j;

			if (events) {
				// remove all listeners
				if (!evt) {
					for (key in events) {
						if (hasOwnProperty.call(events, key)) {
							delete events[key];
						}
					}
				}
				// remove some listeners
				else switch (typeof evt) {
					case 'string':
						filters();
						break;
					case 'function':
						listenerArgs = slice.call(arguments, 0);;
						l = listenerArgs.length;
						for (key in events) {
							if (hasOwnProperty.call(events, key)) {
								listeners = events[type = key];
								filter();
							}
						}
						break;
					case 'object':
						// remove some match listeners
						if (evt.test) {
							for (key in events) {
								if (hasOwnProperty.call(events, key) && evt.test(key)) {
									listeners = events[type = key];
									filter();
								}
							}
						}
						// remove some listeners (types hash)
						else {
							for (key in evt) {
								if (hasOwnProperty.call(evt, key) && hasOwnProperty.call(events, key)) {
									listeners = events[key];
									listenerArgs = typeof evt[key] === 'function' ? [evt[key]] : evt[key];
									l = listenerArgs.length;
									filters();
								}
							}
						}
						break;
				}
			}

			return this;

			function filters() {
				types = evt.split(rSpaces);
				i = types.length;
				while (i--) {
					if (listeners = events[type = types[i]]) {
						filter();
					}
				}
			}

			function filter() {
				j = 0;
				do {
					if ((index = indexOfListener(listeners, listenerArgs[j].listener)) > -1) {
						listeners.splice(index, 1);
					}
				} while (++j < l && listeners.length);
				if (!listeners.length) {
					delete events[type];
				}
			}
		},

		/**
		 * Alias of removeListener
		 */
		off: alias('removeListener'),

		/**
		 * Adds listeners in bulk using the manipulateListeners method.
		 * If you pass an object as the second argument you can add to multiple events at once. The object should contain key value pairs of events and listeners or listener arrays. You can also pass it an event name and an array of listeners to be added.
		 * You can also pass it a regular expression to add the array of listeners to all events that match it.
		 * Yeah, this function does quite a bit. That's probably a bad thing.
		 *
		 * @param {String|Object|RegExp} evt An event name if you will pass an array of listeners next. An object if you wish to add to multiple events at once.
		 * @param {Function[]} [listeners] An optional array of listener functions to add.
		 * @return {Object} Current instance of EventEmitter for chaining.
		 */
		addAllListeners: function addAllListeners(listeners) {
			// Pass through to manipulateListeners
			return this.addListener.apply(this, listeners);
		},

		/**
		 * Alias of addAllListeners
		 */
		onAll: alias('addAllListeners'),

		/**
		 * Removes listeners in bulk using the manipulateListeners method.
		 * If you pass an object as the second argument you can remove from multiple events at once. The object should contain key value pairs of events and listeners or listener arrays.
		 * You can also pass it an event name and an array of listeners to be removed.
		 * You can also pass it a regular expression to remove the listeners from all events that match it.
		 *
		 * @param {String|Object|RegExp} evt An event name if you will pass an array of listeners next. An object if you wish to remove from multiple events at once.
		 * @param {Function[]} [listeners] An optional array of listener functions to remove.
		 * @return {Object} Current instance of EventEmitter for chaining.
		 */
		removeAllListeners: function removeAllListeners(listeners) {
			// Pass through to manipulateListeners
			return this.removeListener.apply(this, listeners);
		},

		/**
		 * Alias of removeAllListeners
		 */
		offAll: alias('removeAllListeners'),

		/**
		 * Emits an event of your choice.
		 * When emitted, every listener attached to that event will be executed.
		 * If you pass the optional argument array then those arguments will be passed to every listener upon execution.
		 * Because it uses `apply`, your array of arguments will be passed as if you wrote them out separately.
		 * So they will not arrive within the array on the other side, they will be separate.
		 * You can also pass a regular expression to emit to all events that match it.
		 *
		 * @param {String|RegExp} evt Name of the event to emit and execute listeners for.
		 * @param {Array} [args] Optional array of arguments to be passed to each listener.
		 * @return {Object} Current instance of EventEmitter for chaining.
		 */
		emitEvent: function emitEvent(evt, args, target) {
			var that = this,
				events = this._events,
				listeners,
				i,
				types,
				type,
				l,
				j,
				event,
				onceReturnValue = this._onceReturnValue;

			target || (target = this);

			if (events) {
				args || (args = []);
				if (!evt) {
					for (type in events) {
						emits.call(this, type, events[type], args);
					}
				} else switch (typeof evt) {
					case 'string':
						types = evt.split(rSpaces);
						l = types.length;
						j = -1;
						while (++j < l) {
							if (listeners = events[types[j]]) {
								emits.call(this, types[j], listeners, args);
							}
						}
						break;
					case 'object':
						if (evt.test) {
							for (type in events) {
								if (evt.test(type)) {
									emits.call(this, type, events[type], args);
								}
							}
						}
						break;
				}
			} else if (this.parent && this.parent.emitEvent) {
				this.parent.emitEvent(evt, args, target);
			}

			function emits(type, listeners, args) {
				var l = listeners.length,
					i = -1,
					listener,
					handleEvent,
					context,
					response;

				event = this.createEvent(type, target);

				while (++i < l) {
					// If the listener returns true then it shall be removed from the event
					// The function is executed either with a basic call or an apply if there is an args array
					listener = listeners[i];
					handleEvent = listener.listener;
					context = listener.context || this;

					if (listener.once === true) {
						this.removeListener(type, handleEvent);
					}

					switch (args.length) {
						// fast cases
						case 0:
							response = handleEvent.call(context, event);
							break;
						case 1:
							response = handleEvent.call(context, event, args[0]);
							break;
						case 2:
							response = handleEvent.call(context, event, args[0], args[1]);
							break;
						case 3:
							response = handleEvent.call(context, event, args[0], args[1], args[2]);
							break;
							// slower
						default:
							response = handleEvent.apply(context, [event].concat(args));
					}

					if (response === onceReturnValue) {
						this.removeListener(type, handleEvent);
					} else if (response === false) {
						break;
					}
				}

				if (this.parent && this.parent.emitEvent) {
					event.isPropagationStopped() || this.parent.emitEvent(type, args, target);
				}
			}

			return event;
		},

		_onceReturnValue: true,

		/**
		 *
		 */
		createEvent: function createEvent(type, target) {
			var event = new Event(type);
			event.initEvent(type, true, true);
			event.currentTarget = this;
			event.target = target || this;
			event.timeStamp = now();
			return EventEmitter.event = event;
		},

		/**
		 * Alias of emitEvent
		 */
		trigger: alias('emitEvent'),

		/**
		 * Subtly different from emitEvent in that it will pass its arguments on to the listeners, as opposed to taking a single array of arguments to pass on.
		 * As with emitEvent, you can pass a regex in place of the event name to emit to all events that match it.
		 *
		 * @param {String|RegExp} evt Name of the event to emit and execute listeners for.
		 * @param {...*} Optional additional arguments to be passed to each listener.
		 * @return {Object} Current instance of EventEmitter for chaining.
		 */
		emit: function emit(evt) {
			var args = slice.call(arguments, 1);
			return this.emitEvent(evt, args);
		},

		/**
		 * Fetches the events object and creates one if required.
		 *
		 * @return {Object} The events storage object.
		 * @api private
		 */
		_getEvents: function _getEvents() {
			return this._events || (this._events = {});
		},
		
		// @param {...*} Optional additional arguments to prototype’s Method Name
		bindHandleEvent: function bindHandleEvent(/*[methodName1, methodName2, ...]*/) {
			var methodNames = slice.call(arguments);
			methodNames.push('handleEvent');
			this.bind.apply(this, methodNames);
			this.bindHandleEvent = this.bind;
		},
		
		// @param {...*} Optional additional arguments to prototype’s Method Name
		bind: function bind(/*[methodName1, methodName2, ...]*/) {
			var l = arguments.length,
				i = 0,
				key;
			for (; i < l; i++) {
				key = arguments[i];
				if (typeof this[key] === 'function' && !hasOwnProperty.call(this, key)) {
					this[key] = this[key].bind(this);
				}
			}
		},
		
		// {Object} component instance of EventEmitter
		parent: null,
		
		// {null|Array} child components
		children: null,
		
		// @param {Object} component instance of EventEmitter
		// @return {Object} equal param
		appendChild: function(component) {
			this.children || (this.children = []);
			if (this.children.indexOf(component) < 0) {
				this.children.push(component);
				component.parent = this;
			}
			return component;
		},
		
		// @param {Object} component instance of EventEmitter
		// @return {Object} equal param
		removeChild: function(component) {
			var index;
			if (this.children && (index = this.children.indexOf(component)) > -1) {
				this.children.splice(index, 1);
				delete component.parent;
			}
			return component;
		}

	});

	// static properties
	extend(EventEmitter, {
		create: create,
		inherito: inherito,
		extend: extend,
		isNativeFunction: isNativeFunction,
		typeOf: typeOf,
		Event: Event,
		returnTrue: returnTrue,
		returnFalse: returnFalse,
		NUMBER_STRING_TYPE: NUMBER_STRING_TYPE,
		REFERENCE_TYPE: REFERENCE_TYPE,
		noop: noop,
		rSpaces: rSpaces
	});
	
	// 创建一个基于指定类原型的对象
	function create() {
		noop.prototype = this.prototype;
		return new noop;
	}
	
	// 继承给指定的类
	function inherito(constructor, props) {
		extend(constructor.prototype = this.create(), props)
		.constructor = constructor;
		// 静态成员继承
		extend(constructor, this);
	}

	/**
	 * Create an event object.
	 *
	 * @param {String} event type.
	 * @return {Object} event object.
	 * @api private
	 */
	function Event(type) {
		this.type = type;
	};

	extend(Event.prototype, {

		currentTarget: null,

		target: null,

		bubbles: true,

		cancelBubble: false,

		cancelable: true,

		returnValue: true,

		eventPhase: 0,

		initEvent: function initEvent(type, canBubble, cancelable) {
			this.type = type;
			this.bubbles = !!canBubble;
			this.cancelable = !!canBubble;
			if (!this.cancelBubble) {
				this.stopPropagation = returnFalse;
			}
			if (!this.cancelable) {
				this.preventDefault = returnFalse;
			}
			return this;
		},

		preventDefault: function preventDefault() {
			this.preventDefault = this.isDefaultPrevented = returnTrue;
			returnValue = false;
			return true;
		},

		isDefaultPrevented: returnFalse,

		stopPropagation: function stopPropagation() {
			this.stopPropagation = this.isPropagationStopped = returnTrue;
			return true;
		},

		isPropagationStopped: returnFalse,

		stopImmediatePropagation: function stopImmediatePropagation() {
			this.returnValue = false;
			this.stopPropagation();
			this.stopImmediatePropagation = this.isImmediatePropagationStopped = returnTrue;
		},

		isImmediatePropagationStopped: returnFalse

	});

	function returnTrue() {
		return true;
	}

	function returnFalse() {
		return false;
	}

	var _EventEmitter = exports.EventEmitter;

	/**
	 * Reverts the global {@link EventEmitter} to its previous value and returns a reference to this version.
	 *
	 * @return {Function} Non conflicting EventEmitter class.
	 */
	EventEmitter.noConflict = function noConflict() {
		exports.EventEmitter = _EventEmitter;
		return EventEmitter;
	};

	// Expose the class either via AMD, CommonJS or the global object
	if (typeof define === 'function' && define.amd) {
		define(function() {
			return EventEmitter;
		});
	} else if (typeof module === 'object' && module.exports) {
		module.exports = EventEmitter;
	} else {
		exports.EventEmitter = EventEmitter;
	}

}.call(this));