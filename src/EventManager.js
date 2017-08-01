export default class EventManager {
	static addEventListener(type, element, callback, options = {}, useCapture = false) {
		/**
		 * Browsers that support the `passive` option are those that allow
		 * for the usage of the options parameter in event listeners.
		 *
		 * See: https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
		 */
		if (doesSupportPassive()) {
			/**
			 * The following events should never `preventDefault()`, due to heavy
			 * performance impact. The `passive` option enforces this, and
			 * tells the browser not to expect any `preventDefault()``.
			 *
			 * See: https://developers.google.com/web/tools/lighthouse/audits/passive-event-listeners
			 */
			if (!options.hasOwnProperty('passive') && (type === 'wheel' || type === 'mousewheel' || type === 'touchstart' || type === 'touchmove')) {
				options.passive = true;
			}

			element.addEventListener(type, callback, options, useCapture);
		} else if (element.addEventListener) {
			element.addEventListener(type, callback, useCapture);
		} else {
			element.attachEvent(`on${type}`, callback);
		}
	}

	static isEventUnmodifiedLeftMouseDown(event) {
		return event.button === 0
			&& !event.ctrlKey
			&& !event.shiftKey
			&& !event.altKey
			&& !event.metaKey;
	}

	static preventEventDefaults(event) {
		if (!event) {
			event = window.event;
		}

		if (event.preventDefault) {
			event.preventDefault();
		}

		event.returnValue = false;
	}

	static stopEventPropagation(event) {
		if (!event) {
			event = window.event;
		}

		if (event.stopPropagation) {
			event.stopPropagation();
		}

		event.returnValue = false;
	}
}

/**
 * Check if the browser knows about the `passive` option and actively looks for it.
 *
 * See: https://github.com/WICG/EventListenerOptions/blob/gh-pages/explainer.md#feature-detection
 */
function doesSupportPassive() {
	let supportsPassive = false;

	try {
		let options = Object.defineProperty({}, 'passive', {
			get: function() {
				supportsPassive = true;
			}
		});

		window.addEventListener('test', null, options);
		window.removeEventListener('test', null, options);
	} catch (e) {
		// Do nothing
	}

	return supportsPassive;
}
