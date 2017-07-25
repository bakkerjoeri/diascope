export default class Animation {
	constructor(element, newPosition, duration) {
		this.element = element;

		this.startingPosition = getElementTransformTranslateX(element);
		this.currentPosition = this.startingPosition;
		this.newPosition = newPosition;

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
		let positionChange = calculatePositionChange(time, distance, this.duration);

		this.currentPosition = this.startingPosition + positionChange;

		renderElementAtHorizontalOffset(this.element, this.currentPosition);

		if (this.currentPosition !== this.newPosition) {
			this.requestId = window.requestAnimationFrame(this.animationStep.bind(this));
		}
	}
}

function renderElementAtHorizontalOffset(element, offset) {
	if (element instanceof Element) {
		element.style.transform = `translateX(${offset}px)`;
	}
}

function calculatePositionChange(time, distance, duration) {
	let progress = time / duration;
	let positionChange = distance * calculatePointOnCubicBezier(progress, 0.25, 1, .25, 1);

	return positionChange;
}

function calculatePointOnCubicBezier(t, p1x = 0, p1y = 0, p2x = 0, p2y = 0) {
	if (t < 0) {
		t = 0;
	}

	if (t > 1) {
		t = 1;
	}

	let p0, p1, p2, p3;

	p0 = {
		x: 0,
		y: 0,
	}

	p1 = {
		x: p1x,
		y: p1y,
	}

	p2 = {
		x: p2x,
		y: p2y,
	}

	p3 = {
		x: 1,
		y: 1,
	}

	return (Math.pow((1 - t), 3) * p0.y)
		+ (3 * Math.pow((1 - t), 2) * t * p1.y)
		+ (3 * (1 - t) * Math.pow(t, 2) * p2.y)
		+ (Math.pow(t, 3) * p3.y);
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
