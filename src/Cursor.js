export default class Cursor {
	constructor() {
		this.position = {
			x: 0,
			y: 0,
		};

		this.positionPrevious = {
			x: 0,
			y: 0,
		};

		this.positionChange = {
			x: 0,
			y: 0,
		};
	}

	updateWithEvent(event) {
		if (!event) {
			event = window.event;
		}

		if (event.touches && event.touches[0]) {
			event = event.touches[0];
		}

		let newPosition = getPositionFromEvent(event);

		this.positionPrevious = this.position;
		this.position = newPosition;
		this.positionChange = {
			x: newPosition.x - this.positionPrevious.x,
			y: newPosition.y - this.positionPrevious.y,
		}

		console.log(this.getCurrentPosition());
		console.log(this.getPreviousPosition());
		console.log(this.getChange());
	}

	getCurrentPosition() {
		return this.position;
	}

	getPreviousPosition() {
		return this.positionPrevious;
	}

	getChange() {
		return this.positionChange;
	}
}

function getPositionFromEvent(event) {
	if (typeof event.clientX === 'number' && typeof event.clientY === 'number') {
		return {
			x: event.clientX,
			y: event.clientY,
		}
	}

	if (typeof event.pageX === 'number' && typeof event.pageY === 'number') {
		return {
			x: event.pageX - document.body.scrollLeft - document.documentElement.scrollLeft,
			y: event.pageY - document.body.scrollTop - document.documentElement.scrollTop,
		}
	}

	return {
		x: 0,
		y: 0,
	}
}
