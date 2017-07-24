export default class Animation {
	constructor(element, newPosition, duration) {
		this.element = element;

		this.startingPosition = getElementTransformTranslateX(element);
		this.currentPosition = this.startingPosition;
		this.newPosition = newPosition;

		this.startTime;
		this.duration = duration;
	}

	start() {
		window.requestAnimationFrame((time) => {
			if (!this.startTime) {
				this.startTime = time;
			}

			this.animationStep(time);
		});
	}

	animationStep(currentTime) {
		let stepTime = currentTime - this.startTime;
		let dx = calculatePositionChange(stepTime, this.duration, this.startingPosition, this.newPosition);

		this.currentPosition = this.currentPosition + dx;

		renderElementAtHorizontalOffset(this.element, this.currentPosition);
		window.requestAnimationFrame(this.animationStep.bind(this));
	}
}

function renderElementAtHorizontalOffset(element, offset) {
	if (element instanceof Element) {
		element.style.transform = `translateX(${offset}px)`;
	}
}

function calculatePositionChange(stepTime, duration, startingPosition, newPosition) {
	if (startingPosition !== newPosition) {
		let x = newPosition - startingPosition;
		let dt = stepTime / (duration * 1000);
		let dx = x * dt;

		if (
			(startingPosition < newPosition && (newPosition - dx) < newPosition)
			|| (startingPosition > newPosition && (newPosition - dx) > newPosition)
		) {
			return dx;
		} else {
			return newPosition - dx;
		}
	}
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
			return parseFloat(transformationMatrix[1].split(', ')[5]);
		}
	}

	return 0;
}
