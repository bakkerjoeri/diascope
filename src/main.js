export default class Diascope {
	constructor(frame, reel, options = {}) {
		this.options = applyDefaultsForMissingKeys(options, getDefaultOptions());

		this.elementNavigatePrevious = document.querySelector(options.selectorNavigatePrevious);
		this.elementNavigateNext = document.querySelector(options.selectorNavigateNext);
		this.elementFrame = frame;
		this.elementReel = reel;
		this.elementsSlides = Array.from(this.elementReel.children);

		this.setSlideAsCurrentSlide(this.elementsSlides[this.options.start]);
		bringSlideOfReelIntoFrame(this.elementsSlides[this.options.start], this.elementReel, this.elementFrame);

		if (this.elementNavigatePrevious) {
			addEvent('click', this.elementNavigatePrevious, this.previous.bind(this));
		}

		if (this.elementNavigateNext) {
			addEvent('click', this.elementNavigateNext, this.next.bind(this));
		}
	}

	next() {
		this.adjustPositionWithStep(this.options.step);
	}

	previous() {
		this.adjustPositionWithStep(this.options.step * -1);
	}

	adjustPositionWithStep(stepSize) {
		let currentPosition = this.elementsSlides.indexOf(this.activeSlide);
		let amountOfSlides = this.elementsSlides.length;
		let newPosition = determineNewPosition(amountOfSlides, currentPosition, stepSize, this.options.loop);
		let newCurrentSlide = this.elementsSlides[newPosition];

		this.setSlideAsCurrentSlide(newCurrentSlide);
		bringSlideOfReelIntoFrame(newCurrentSlide, this.elementReel, this.elementFrame);
	}

	setSlideAsCurrentSlide(slide) {
		this.markSlideAsInactive(this.activeSlide);
		this.activeSlide = slide;
		this.markSlideAsActive(slide);
	}

	markSlideAsActive(slide) {
		if (slide) {
			slide.classList.add('is-active');
		}
	}

	markSlideAsInactive(slide) {
		if (slide) {
			slide.classList.remove('is-active');
		}
	}
}

function getDefaultOptions() {
	return {
		start: 0,
		step: 1,
		loop: true,
		align: 'left',
		selectorNavigatePrevious: '.js-diascope-navigate-previous',
		selectorNavigateNext: '.js-diascope-navigate-next',
	};
}

function determineNewPosition(listSize, currentPosition, stepSize, shouldLoop = false) {
	if (shouldLoop) {
		let distanceFromListBoundaries = (currentPosition + stepSize) % listSize;

		if (distanceFromListBoundaries < 0) {
			return listSize + distanceFromListBoundaries;
		}

		return distanceFromListBoundaries;
	}

	if (currentPosition + stepSize > listSize) {
		return listSize;
	} else if (currentPosition + stepSize < 0) {
		return 0;
	}

	return currentPosition + stepSize;
}

function bringSlideOfReelIntoFrame(slide, reel, frame, align = 'left') {
	let listOffsetLeft = 0;

	if (align === 'left') {
		listOffsetLeft = slide.getBoundingClientRect().left - reel.getBoundingClientRect().left;
	} else if (align === 'center') {
		listOffsetLeft = (slide.getBoundingClientRect().left - reel.getBoundingClientRect().left - (frame.getBoundingClientRect().width / 2) + (slide.getBoundingClientRect().width / 2));
	}

	if (listOffsetLeft < 0) {
		listOffsetLeft = 0;
	}

	if (listOffsetLeft > reel.getBoundingClientRect().width - frame.getBoundingClientRect().width) {
		listOffsetLeft = reel.getBoundingClientRect().width - frame.getBoundingClientRect().width;
	}

	this.elementReel.style.transform = `translateX(${-listOffsetLeft}px)`;
}

function applyDefaultsForMissingKeys(object, defaults) {
	for (let key in defaults) {
		if (!object.hasOwnProperty(key)) {
			object[key] = defaults[key];
		}
	}

	return object;
}

function addEvent(type, element, callback, options = {}, useCapture = true) {
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
		if (type === 'wheel' || type === 'mousewheel' || type === 'touchstart' || type === 'touchmove') {
			options.passive = true;
		}

		element.addEventListener(type, callback, options, useCapture);
	} else {
		element.addEventListener(type, callback, useCapture);
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
