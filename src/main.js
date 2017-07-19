export default class Diascope {
	constructor(frame, reel, options = {}) {
		this.options = applyDefaultsForMissingKeys(options, getDefaultOptions());

		this.elementNavigatePrevious = document.querySelector(options.selectorNavigatePrevious);
		this.elementNavigateNext = document.querySelector(options.selectorNavigateNext);
		this.elementFrame = frame;
		this.elementReel = reel;
		this.elementsSlides = Array.from(this.elementReel.children);

		if (this.elementNavigatePrevious) {
			addEvent('click', this.elementNavigatePrevious, this.previous.bind(this));
		}

		if (this.elementNavigateNext) {
			addEvent('click', this.elementNavigateNext, this.next.bind(this));
		}
	}

	next() {
		this.panSlides(this.options.step);
	}

	previous() {
		this.panSlides(this.options.step * -1);
	}

	panSlides(pan) {
		let newSlides = findNewVisibleSlides(pan, this.elementsSlides, this.elementFrame, this.options.loop);

		if (newSlides.length > 0) {
			let reelOffsetLeft = calculateLeftReelOffsetToBringSlidesIntoFrame(
				newSlides,
				this.elementReel,
				this.elementFrame,
				this.options.shouldCenter
			);

			this.elementReel.style.transform = `translateX(${reelOffsetLeft}px)`;
		}
	}
}

function getDefaultOptions() {
	return {
		step: 1,
		loop: false,
		shouldCenter: false,
		selectorNavigatePrevious: '.js-diascope-navigate-previous',
		selectorNavigateNext: '.js-diascope-navigate-next',
	};
}

function findNewVisibleSlides(pan, slides, frame, shouldLoop) {
	const firstSlideIndex = 0;
	const lastSlideIndex = slides.length - 1;

	let newSlides = [],
		firstVisibleSlideIndex,
		lastVisibleSlideIndex,
		firstNewSlideIndex,
		lastNewSlideIndex;

	firstVisibleSlideIndex = findIndexOfFirstVisibleSlideInFrame(slides, frame);
	lastVisibleSlideIndex = findIndexOfLastVisibleSlideInFrame(slides, frame);

	// loop to the first slide.
	if (pan > 0 && shouldLoop && lastVisibleSlideIndex === lastSlideIndex) {
		return [slides[0]];
	}

	// loop to the last slide.
	if (pan < 0 && shouldLoop && firstVisibleSlideIndex === firstSlideIndex) {
		return [slides[lastSlideIndex]];
	}


	if (lastVisibleSlideIndex + pan > lastSlideIndex) {
		pan = lastSlideIndex - lastVisibleSlideIndex;
		firstNewSlideIndex = lastSlideIndex - pan;
		lastNewSlideIndex = lastSlideIndex;
	} else if (firstVisibleSlideIndex + pan < 0) {
		pan = firstSlideIndex - firstVisibleSlideIndex;
		firstNewSlideIndex = 0
		lastNewSlideIndex = 0 - pan;
	} else {
		firstNewSlideIndex = firstVisibleSlideIndex + pan;
		lastNewSlideIndex = lastVisibleSlideIndex + pan;
	}

	for (let i = firstNewSlideIndex; i <= lastNewSlideIndex; i++) {
		newSlides.push(slides[i]);
	}

	return newSlides;
}

function findIndexOfFirstVisibleSlideInFrame(slides, frame) {
	for (let currentSlideIndex = 0; currentSlideIndex < slides.length; currentSlideIndex++) {
		if (isSlideInFrame(slides[currentSlideIndex], frame)) {
			return currentSlideIndex;
		}
	}
}

function findIndexOfLastVisibleSlideInFrame(slides, frame) {
	let lastVisibleSlideIndex;

	for (let currentSlideIndex = 0; currentSlideIndex < slides.length; currentSlideIndex++) {
		if (isSlideInFrame(slides[currentSlideIndex], frame)) {
			lastVisibleSlideIndex = currentSlideIndex;
		}
	}

	return lastVisibleSlideIndex;
}

function calculateLeftReelOffsetToBringSlidesIntoFrame(slides, reel, frame, shouldCenter = false) {
	let slidesBounds = getHorizontalBoundsOfSlides(slides);
	let reelBounds = reel.getBoundingClientRect();
	let frameBounds = frame.getBoundingClientRect();

	if (shouldCenter) {
		let reelOffsetLeft = (frameBounds.left - slidesBounds.left) - (frameBounds.left - reelBounds.left) + ((frameBounds.width - slidesBounds.width) / 2);

		if ((reelOffsetLeft * -1) > (reelBounds.width - frameBounds.width)) {
			return (frameBounds.width - reelBounds.width);
		}

		if (reelOffsetLeft >= 0) {
			return 0;
		}

		return reelOffsetLeft;
	}

	if (slidesBounds.right > frameBounds.right) {
		return (reelBounds.left - frameBounds.left) - (slidesBounds.right - frameBounds.right);
	}

	if (slidesBounds.left < frameBounds.left) {
		return (frameBounds.left - slidesBounds.left) - (frameBounds.left - reelBounds.left);
	}

	return (frameBounds.left - reelBounds.left);
}

function getHorizontalBoundsOfSlides(slides) {
	let maxLeft;
	let maxRight;

	slides.forEach((slide) => {
		if (maxLeft === undefined || slide.getBoundingClientRect().left < maxLeft) {
			maxLeft = slide.getBoundingClientRect().left;
		}

		if (maxRight === undefined || slide.getBoundingClientRect().right > maxRight) {
			maxRight = slide.getBoundingClientRect().right;
		}
	});

	return {
		left: maxLeft,
		right: maxRight,
		width: maxRight - maxLeft,
	}
}

function isSlideInFrame(slide, frame) {
	let slideBounds = slide.getBoundingClientRect();
	let frameBounds = frame.getBoundingClientRect();

	return slideBounds.left >= frameBounds.left
		&& slideBounds.right <= frameBounds.right;
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
