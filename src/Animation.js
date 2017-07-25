import CubicBezier from './CubicBezier';

export default class Animation {
	constructor(element, newPosition, duration, easing = 'linear') {
		this.element = element;

		this.startingPosition = getElementTransformTranslateX(element);
		this.currentPosition = this.startingPosition;
		this.newPosition = newPosition;
		this.animationBezierCurve = getCubicBezierForEasing(easing);

		this.startTime;
		this.previousStepTime;
		this.duration = duration;
	}

	start() {
		this.requestId = window.requestAnimationFrame((time) => {
			this.startTime = time;
			this.animationStep(time);
		});
	}

	cancel() {
		if (this.requestId) {
			window.cancelAnimationFrame(this.requestId);
			delete this.requestId;
		}
	}

	animationStep(currentTime) {
		let time = currentTime - this.startTime;
		let distance = this.newPosition - this.startingPosition;
		let positionChange = calculatePositionChange(time, distance, this.duration, this.animationBezierCurve);

		this.currentPosition = this.startingPosition + positionChange;

		renderElementAtHorizontalOffset(this.element, this.currentPosition);

		if (this.currentPosition !== this.newPosition) {
			this.requestId = window.requestAnimationFrame(this.animationStep.bind(this));
		}
	}
}

function getCubicBezierForEasing(easing) {
	if (typeof easing === 'object') {
		return CubicBezier.createCustomAnimation(
			easing[0],
			easing[1],
			easing[2],
			easing[3]
		);
	}

	switch (easing) {
		case 'ease':
			return CubicBezier.createEase();
		case 'easeIn':
			return CubicBezier.createEaseIn();
		case 'easeOut':
			return CubicBezier.createEaseOut();
		case 'easeInOut':
			return CubicBezier.createEaseInOut();
		case 'linear':
		default:
			return CubicBezier.createLinear();
	}
}

function renderElementAtHorizontalOffset(element, offset) {
	if (element instanceof Element) {
		element.style.transform = `translateX(${offset}px)`;
	}
}

function calculatePositionChange(time, distance, duration, animationBezierCurve) {
	let progress = time / duration;
	let positionChange = distance * animationBezierCurve.calculateVerticalForTime(progress);

	return positionChange;
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
