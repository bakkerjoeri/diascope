import Animation from './Animation';
import Cursor from './Cursor';
import EventManager from './EventManager';

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
		this.elastic = options.elastic;

		this.currentPanDistance = 0;
		this.isPanning = false;
		this.isDragging = false;
		this.cursor = new Cursor();

		this.setSlideStartCallback(options.slideStartCallback);
		this.setSlideEndCallback(options.slideEndCallback);
		this.setSlideCallback(options.slideCallback);

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
		if (this.currentPanDistance < 0) {
			this.cancelPanning();
		}

		this.currentPanDistance = this.step;
		this.panWithDistance(this.currentPanDistance);
	}

	previous() {
		if (this.currentPanDistance > 0) {
			this.cancelPanning();
		}

		this.currentPanDistance = this.step * -1;
		this.panWithDistance(this.currentPanDistance);
	}

	panWithDistance(pan) {
		if (!this.isPanning) {
			let newSlides = findSlidesForPanning(pan, this.elementsSlides, this.elementFrame, this.loop);

			this.panSlidesIntoView(newSlides);
		}
	}

	panSlidesIntoView(slides) {
		if (!this.isPanning && slides.length > 0) {
			this.isPanning = true;

			let reelOffsetLeft = calculateReelOffsetToBringSlideSetIntoFrame(
				slides,
				this.elementsSlides,
				this.elementFrame,
				this.shouldCenter
			);

			if (this.reelAnimation) {
				this.reelAnimation.destroy();
			}

			this.reelAnimation = new Animation(this.elementReel, reelOffsetLeft, this.duration, this.animationEasing, {
				onStart: this.onSlideStart.bind(this),
				onEnd: this.onSlideEnd.bind(this),
				onStep: this.onSlide.bind(this)
			});

			this.reelAnimation.start();
		}
	}

	/**
	 * Returns all slides that are completely visible inside the frame.
	 *
	 * @return {Element[]}
	 */
	getVisibleSlides() {
		return findSlidesInFrame(this.elementsSlides, this.elementFrame);
	}

	initializeDragging(reel) {
		EventManager.addEventListener('mousedown', reel, this.onGrab.bind(this), {passive: false});
		EventManager.addEventListener('touchstart', reel, this.onGrab.bind(this), {passive: false});

		EventManager.addEventListener('mousemove', document, this.onDrag.bind(this), {passive: false});
		EventManager.addEventListener('touchmove', document, this.onDrag.bind(this), {passive: false});

		EventManager.addEventListener('mouseup', document, this.onDragEnd.bind(this), {passive: false});
		EventManager.addEventListener('touchend', document, this.onDragEnd.bind(this), {passive: false});

		EventManager.addEventListener('click', reel, this.preventClickInteractionDuringDragging.bind(this), {passive: false});
	}

	onGrab(event) {
		if (this.drag && (event.type === 'touchstart' || EventManager.isEventUnmodifiedLeftMouseDown(event))) {
			this.cursor.updateWithEvent(event);
			this.isGrabbed = true;

			this.dragReelOffsetStart = getElementTransformTranslateX(this.elementReel);
			this.dragPositionStart = this.cursor.getCurrentPosition();
			this.dragDistanceHorizontal = 0;
		}
	}

	onDrag(event) {
		this.cursor.updateWithEvent(event);

		if (this.isGrabbed && !this.isDragging) {
			let cursorChange = this.cursor.getChange();
			if (Math.abs(cursorChange.x) > Math.abs(cursorChange.y)) {
				this.isDragging = true;
			} else if (Math.abs(cursorChange.x) < Math.abs(cursorChange.y)) {
				this.isGrabbed = false;
			}

			if (typeof this.onSlideStart === 'function') {
				this.onSlideStart();
			}
		}

		if (this.drag && this.isDragging) {
			this.cancelPanning();
			EventManager.preventEventDefaults(event);

			this.dragDistanceHorizontal = this.cursor.getCurrentPosition().x - this.dragPositionStart.x;
			let reelOffset = getBoundaryCorrectedDragOffset(
				this.dragReelOffsetStart + this.dragDistanceHorizontal,
				this.elementsSlides,
				this.elementFrame,
				this.elastic,
			);
			renderElementAtHorizontalOffset(this.elementReel, reelOffset);

			if (typeof this.onSlide === 'function') {
				this.onSlide();
			}
		}
	}

	onDragEnd(event) {
		if (this.isGrabbed) {
			this.isGrabbed = false;
		}

		if (this.isDragging) {
			EventManager.stopEventPropagation(event);

			// Delay drag end events slightly so other click and drag events are finished first.
			setTimeout(() => {
				this.isDragging = false;
				let slidesForSnap = findSlidesForSnap(this.elementsSlides, this.elementFrame);
				this.panSlidesIntoView(slidesForSnap);
			}, 0);
		}
	}

	preventClickInteractionDuringDragging(event) {
		if (this.isDragging) {
			EventManager.stopEventPropagation(event)
		}
	}

	addElementNavigateNext(element) {
		if (element instanceof Element) {
			EventManager.addEventListener('click', element, this.next.bind(this));
		}
	}

	addElementNavigatePrevious(element) {
		if (element instanceof Element) {
			EventManager.addEventListener('click', element, this.previous.bind(this));
		}
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
	 * @param {function} slideStartCallback
	 */
	setSlideStartCallback(slideStartCallback) {
		if (typeof slideStartCallback === 'function') {
			this.slideStartCallback = slideStartCallback;
		}
	}

	/**
	 * Set a method that is called when the reel is done changing position.
	 *
	 * @param {function} slideEndCallback
	 */
	setSlideEndCallback(slideEndCallback) {
		if (typeof slideEndCallback === 'function') {
			this.slideEndCallback = slideEndCallback;
		}
	}

	/**
	 * Set a method that is called throughout on each step of changing reel position.
	 *
	 * @param {function} slideCallback
	 */
	setSlideCallback(slideCallback) {
		if (typeof slideCallback === 'function') {
			this.slideCallback = slideCallback;
		}
	}

	onSlide() {
		if (typeof this.slideCallback === 'function') {
			this.slideCallback();
		}
	}

	onSlideStart() {
		if (typeof this.slideStartCallback === 'function') {
			this.slideStartCallback();
		}
	}

	onSlideEnd() {
		this.isPanning = false;
		this.currentPanDistance = 0;

		if (typeof this.slideEndCallback === 'function') {
			this.slideEndCallback();
		}
	}

	cancelPanning() {
		if (this.reelAnimation) {
			this.reelAnimation.destroy();
			delete this.reelAnimation;
		}

		this.isPanning = false;
		this.currentPanDistance = 0;
	}
}

function renderElementAtHorizontalOffset(element, offset) {
	if (element instanceof Element) {
		element.style.transform = `translateX(${offset}px)`;
	}
}

function getDefaultOptions() {
	return {
		duration: 200,
		step: 1,
		animationEasing: 'linear',
		loop: false,
		shouldCenter: false,
		drag: true,
		elastic: true,
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

function calculateReelOffsetToBringSlideSetIntoFrame(slideSet, allSlides, frame, shouldCenter = false) {
	if (shouldCenter) {
		return calculateReelOffsetForSlideSetAlignCenter(slideSet, allSlides, frame);
	}

	if (shouldSlideSetInFrameSnapLeft(slideSet, frame)) {
		return calculateReelOffsetForSlideSetAlignLeft(slideSet, allSlides, frame);
	}

	return calculateReelOffsetForSlideSetAlignRight(slideSet, allSlides, frame);
}

function shouldSlideSetInFrameSnapLeft(slideSet, frame) {
	let slideClosestToEdge = findSlideClosestToFrameEdge(slideSet, frame);

	return calculateDistanceBetweenLeftEdgesOfElements(slideClosestToEdge, frame) < calculateDistanceBetweenRightEdgesOfElements(slideClosestToEdge, frame);
}

function calculateReelOffsetForSlideSetAlignLeft(slideSet, allSlides, frame) {
	let slideSetBounds = getHorizontalBoundariesOfElements(slideSet);
	let allSlidesBounds = getHorizontalBoundariesOfElements(allSlides);
	let frameBounds = frame.getBoundingClientRect();

	let upperBoundary = 0;
	let lowerBoundary = (frameBounds.width - allSlidesBounds.width);

	let reelOffset = (allSlidesBounds.left - slideSetBounds.left);

	return getValueCorrectedForBoundaries(reelOffset, lowerBoundary, upperBoundary);
}

function calculateReelOffsetForSlideSetAlignRight(slideSet, allSlides, frame) {
	let slideSetBounds = getHorizontalBoundariesOfElements(slideSet);
	let allSlidesBounds = getHorizontalBoundariesOfElements(allSlides);
	let frameBounds = frame.getBoundingClientRect();

	let upperBoundary = 0;
	let lowerBoundary = (frameBounds.width - allSlidesBounds.width);

	let reelOffsetLeft = (allSlidesBounds.left - frameBounds.left) - (slideSetBounds.right - frameBounds.right);

	return getValueCorrectedForBoundaries(reelOffsetLeft, lowerBoundary, upperBoundary);
}

function calculateReelOffsetForSlideSetAlignCenter(slideSet, allSlides, frame) {
	let slideSetBounds = getHorizontalBoundariesOfElements(slideSet);
	let allSlidesBounds = getHorizontalBoundariesOfElements(allSlides);
	let frameBounds = frame.getBoundingClientRect();

	let upperBoundary = 0;
	let lowerBoundary = (frameBounds.width - allSlidesBounds.width);

	let reelOffsetLeft = (allSlidesBounds.left - slideSetBounds.left) + ((frameBounds.width - slideSetBounds.width) / 2);

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
	let slidesInFrame = slides.filter((slide) => {
		return isSlideInFrame(slide, frame);
	});

	if (slidesInFrame.length > 0) {
		return slidesInFrame;
	}

	return [findSlideClosestToFrameEdge(slides, frame)];
}

function findIndexOfFirstVisibleSlideInFrame(slides, frame) {
	return slides.indexOf(findSlidesInFrame(slides, frame)[0]);
}

function findIndexOfLastVisibleSlideInFrame(slides, frame) {
	let slidesInFrame = findSlidesInFrame(slides, frame);

	return slides.indexOf(slidesInFrame[slidesInFrame.length - 1]);
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

function getBoundaryCorrectedDragOffset(offset, allSlides, frame, elastic) {
	let lowerBoundary = (frame.getBoundingClientRect().width - getHorizontalBoundariesOfElements(allSlides).width);
	let offsetCorrectedForBoundaries = getValueCorrectedForBoundaries(offset, lowerBoundary, 0);

	if (elastic === false) {
		return offsetCorrectedForBoundaries;
	}

	if (offset - offsetCorrectedForBoundaries !== 0) {
		return offsetCorrectedForBoundaries + (offset - offsetCorrectedForBoundaries) * 0.25;
	}

	return offset;
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

function getHorizontalBoundariesOfElements(elements) {
	let maxLeft;
	let maxRight;

	elements.forEach((element) => {
		if (maxLeft === undefined || element.getBoundingClientRect().left < maxLeft) {
			maxLeft = element.getBoundingClientRect().left;
		}

		if (maxRight === undefined || element.getBoundingClientRect().right > maxRight) {
			maxRight = element.getBoundingClientRect().right;
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
