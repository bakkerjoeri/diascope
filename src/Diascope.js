import Animation from './Animation';
import Cursor from './Cursor';

export default class Diascope {
	constructor(frame, reel, options = {}) {
		options = Object.assign(getDefaultOptions(), options);

		this.elementFrame = frame;
		this.elementReel = reel;
		this.elementsSlides = Array.from(this.elementReel.children);

		this.animationEasing = options.animationEasing;
		this.step = options.step;
		this.loop = options.loop;
		this.shouldCenter = options.shouldCenter;
		this.duration = options.duration;
		this.drag = options.drag;

		this.isDragging = false;
		this.cursor = new Cursor();

		this.setOnSlideStart(options.onSlideStart);
		this.setOnSlideEnd(options.onSlideEnd);
		this.setOnSlide(options.onSlide);

		if (options.hasOwnProperty('elementNavigateNext')) {
			this.addElementNavigateNext(options.elementNavigateNext);
		}

		if (options.hasOwnProperty('elementNavigatePrevious')) {
			this.addElementNavigatePrevious(options.elementNavigatePrevious);
		}

		if (this.drag) {
			this.initializeDragging(this.elementReel);
		}
	}

	next() {
		this.panSlides(this.step);
	}

	previous() {
		this.panSlides(this.step * -1);
	}

	panSlides(pan) {
		let newSlides = findSlidesForPanning(pan, this.elementsSlides, this.elementFrame, this.loop);

		if (newSlides.length > 0) {
			let reelOffsetLeft = calculateReelOffsetToBringSlidesIntoFrame(
				newSlides,
				this.elementReel,
				this.elementFrame,
				this.shouldCenter
			);

			if (this.reelAnimation) {
				this.reelAnimation.end();
			}

			this.reelAnimation = new Animation(this.elementReel, reelOffsetLeft, this.duration, this.animationEasing, {
				onStart: this.onSlideStart,
				onEnd: this.onSlideEnd,
				onStep: this.onSlide
			});

			this.reelAnimation.start();
		}
	}

	addElementNavigateNext(element) {
		if (element instanceof Element) {
			addEventListener('click', element, this.next.bind(this));
		}
	}

	addElementNavigatePrevious(element) {
		if (element instanceof Element) {
			addEventListener('click', element, this.previous.bind(this));
		}
	}

	initializeDragging(reel) {
		addEventListener('mousedown', reel, this.onDragStart.bind(this), {passive: false});
		addEventListener('touchstart', reel, this.onDragStart.bind(this), {passive: false});

		addEventListener('mousemove', document, this.onDrag.bind(this), {passive: false});
		addEventListener('touchmove', document, this.onDrag.bind(this), {passive: false});

		addEventListener('mouseup', document, this.onDragEnd.bind(this));
		addEventListener('touchend', document, this.onDragEnd.bind(this));
	}

	/**
	 * Set the animation easing function. This can be a string containing
	 * one of the predefined easing keywords: "linear|ease|easeIn|easeOut|easeInOut"
	 *
	 * Alternatively, you can pass an array containing the coordinates of
	 * control point 1 and 2 on the animation cubic bezier curve, like so:
	 *
	 * [p1x, p1y, p2x, p2y]
	 *
	 * @param {string|array} easing
	 */
	setAnimationEasing(easing) {
		this.animationEasing = easing;
	}

	/**
	 * Set a method that is called when the reel starts changing position.
	 *
	 * @param {function} onSlideStart
	 */
	setOnSlideStart(onSlideStart) {
		if (typeof onSlideStart === 'function') {
			this.onSlideStart = onSlideStart;
		}
	}

	/**
	 * Set a method that is called when the reel is done changing position.
	 *
	 * @param {function} onSlideEnd
	 */
	setOnSlideEnd(onSlideEnd) {
		if (typeof onSlideEnd === 'function') {
			this.onSlideEnd = onSlideEnd;
		}
	}

	/**
	 * Set a method that is called throughout on each step of changing reel position.
	 *
	 * @param {function} onSlide
	 */
	setOnSlide(onSlide) {
		if (typeof onSlide === 'function') {
			this.onSlide = onSlide;
		}
	}

	onDragStart(event) {
		if (this.drag) {
			stopEventPropagation(event);

			this.isDragging = true;
			this.cursor.updateWithEvent(event);

			this.dragReelOffsetStart = getElementTransformTranslateX(this.elementReel);
			this.dragPositionStart = this.cursor.getCurrentPosition();
		}
	}

	onDrag(event) {
		if (this.drag && this.isDragging) {
			preventEventDefaults(event);

			this.cursor.updateWithEvent(event);
			let dragPositionChangeHorizontal = this.cursor.getCurrentPosition().x - this.dragPositionStart.x;
			renderElementAtHorizontalOffset(this.elementReel, this.dragReelOffsetStart + dragPositionChangeHorizontal);
		}
	}

	onDragEnd() {
		if (this.isDragging) {
			this.isDragging = false;

			let slidesForSnap = findSlidesForSnap(this.elementsSlides, this.elementFrame);
			let reelOffsetLeft = calculateReelOffsetToBringSlidesIntoFrame(slidesForSnap, this.elementReel, this.elementFrame, this.shouldCenter);

			this.reelAnimation = new Animation(this.elementReel, reelOffsetLeft, this.duration, this.animationEasing, {
				onStart: this.onSlideStart,
				onEnd: this.onSlideEnd,
				onStep: this.onSlide
			});

			this.reelAnimation.start();
		}
	}
}

function renderElementAtHorizontalOffset(element, offset) {
	if (element instanceof Element) {
		element.style.transform = `translateX(${offset}px)`;
	}
}

function getDefaultOptions() {
	return {
		duration: 0.1,
		step: 1,
		loop: false,
		shouldCenter: false,
		animationEasing: 'linear',
		drag: false,
	};
}

function findSlidesForPanning(pan, slides, frame, shouldLoop) {
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

function findSlidesForSnap(slides, frame) {
	let newSlides = findSlidesInFrame(slides, frame);
	let slideClosestToEdge = findSlideClosestToFrameEdge(slides, frame);

	if (newSlides.indexOf(slideClosestToEdge) === -1) {
		newSlides.push(slideClosestToEdge);
	}

	return newSlides;
}

function calculateReelOffsetToBringSlidesIntoFrame(slides, reel, frame, shouldCenter = false) {
	if (shouldCenter) {
		return calculateReelOffsetForSlidesAlignCenter(slides, reel, frame);
	}

	if (shouldSlidesInFrameSnapLeft(slides, frame)) {
		return calculateReelOffsetForSlidesAlignLeft(slides, reel, frame);
	}

	return calculateReelOffsetForSlidesAlignRight(slides, reel, frame);
}

function shouldSlidesInFrameSnapLeft(slides, frame) {
	let slideClosestToEdge = findSlideClosestToFrameEdge(slides, frame);

	return calculateDistanceBetweenLeftEdgesOfElements(slideClosestToEdge, frame) < calculateDistanceBetweenRightEdgesOfElements(slideClosestToEdge, frame);
}

function calculateReelOffsetForSlidesAlignLeft(slides, reel, frame) {
	let slidesBounds = getHorizontalBoundsOfSlides(slides);
	let reelBounds = reel.getBoundingClientRect();
	let frameBounds = frame.getBoundingClientRect();

	let upperBoundary = 0;
	let lowerBoundary = (frameBounds.width - reelBounds.width);

	let reelOffset = (reelBounds.left - slidesBounds.left);

	return getValueCorrectedForBoundaries(reelOffset, lowerBoundary, upperBoundary);
}

function calculateReelOffsetForSlidesAlignRight(slides, reel, frame) {
	let slidesBounds = getHorizontalBoundsOfSlides(slides);
	let reelBounds = reel.getBoundingClientRect();
	let frameBounds = frame.getBoundingClientRect();

	let upperBoundary = 0;
	let lowerBoundary = (frameBounds.width - reelBounds.width);

	let reelOffsetLeft = (reelBounds.left - frameBounds.left) - (slidesBounds.right - frameBounds.right);

	return getValueCorrectedForBoundaries(reelOffsetLeft, lowerBoundary, upperBoundary);
}

function calculateReelOffsetForSlidesAlignCenter(slides, reel, frame) {
	let slidesBounds = getHorizontalBoundsOfSlides(slides);
	let reelBounds = reel.getBoundingClientRect();
	let frameBounds = frame.getBoundingClientRect();

	let upperBoundary = 0;
	let lowerBoundary = (frameBounds.width - reelBounds.width);

	let reelOffsetLeft = (reelBounds.left - slidesBounds.left) + ((frameBounds.width - slidesBounds.width) / 2);

	return getValueCorrectedForBoundaries(reelOffsetLeft, lowerBoundary, upperBoundary);
}

/**
 * Find any slides that are within the boundaries of a given frame for at least the given part.
 *
 * @param  {Element[]} 	slides	The slides to check for visibility.
 * @param  {Element} 	frame	The frame in which slides are visible.
 *
 * @return {Element[]}			The completely visible slides.
 */
function findSlidesInFrame(slides, frame) {
	return slides.filter((slide) => {
		return isSlideInFrame(slide, frame);
	});
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

function findSlideClosestToFrameEdge(slides, frame) {
	let smallestDistanceFromEdge;
	let slideWithSmallestDistanceFromEdge;

	for (let currentSlideIndex = 0; currentSlideIndex < slides.length; currentSlideIndex++) {
		let currentSlide = slides[currentSlideIndex];

		let distanceFromLeftEdge = calculateDistanceBetweenLeftEdgesOfElements(currentSlide, frame);
		let distanceFromRightEdge = calculateDistanceBetweenRightEdgesOfElements(currentSlide, frame);

		if (smallestDistanceFromEdge === undefined || smallestDistanceFromEdge > Math.min(distanceFromLeftEdge, distanceFromRightEdge)) {
			smallestDistanceFromEdge = Math.min(distanceFromLeftEdge, distanceFromRightEdge);
			slideWithSmallestDistanceFromEdge = currentSlide;
		}
	}

	return slideWithSmallestDistanceFromEdge;
}

function calculateDistanceBetweenLeftEdgesOfElements(firstElement, secondElement) {
	if (firstElement instanceof Element && secondElement instanceof Element) {
		return Math.abs(firstElement.getBoundingClientRect().left - secondElement.getBoundingClientRect().left);
	}

	return 0;
}

function calculateDistanceBetweenRightEdgesOfElements(firstElement, secondElement) {
	if (firstElement instanceof Element && secondElement instanceof Element) {
		return Math.abs(firstElement.getBoundingClientRect().right - secondElement.getBoundingClientRect().right);
	}

	return 0;
}

function getValueCorrectedForBoundaries(value, lower, upper) {
	if (value < lower) {
		return lower;
	}

	if (value > upper) {
		return upper;
	}

	return value;
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

	return (slideBounds.left >= frameBounds.left)
		&& (slideBounds.right <= frameBounds.right);
}

function addEventListener(type, element, callback, options = {}, useCapture = false) {
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

function getElementTransformTranslateX(element) {
	if (window.getComputedStyle) {
		let style = window.getComputedStyle(element);
		let calculatedTransformation = style.transform || style.webkitTransform || style.mozTransform;

		let transformationMatrix3D = calculatedTransformation.match(/^matrix3d\((.+)\)$/);
		if (transformationMatrix3D) {
			return parseFloat(transformationMatrix3D[1].split(', ')[13]);
		}

		let transformationMatrix = calculatedTransformation.match(/^matrix\((.+)\)$/);
		if (transformationMatrix) {
			return parseFloat(transformationMatrix[1].split(', ')[4]);
		}
	}

	return 0;
}

function preventEventDefaults(event) {
	if (!event) {
		event = window.event;
	}

	if (event.preventDefault) {
		event.preventDefault();
	}

	event.returnValue = false;
}

function stopEventPropagation(event) {
	if (!event) {
		event = window.event;
	}

	if (event.stopPropagation) {
		event.stopPropagation();
	}

	event.returnValue = false;
}
