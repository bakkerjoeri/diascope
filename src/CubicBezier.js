export default class CubicBezier {
	constructor(p0x, p0y, p1x, p1y, p2x, p2y, p3x, p3y) {
		this.p0 = {
			x: p0x,
			y: p0y,
		}

		this.p1 = {
			x: p1x,
			y: p1y,
		}

		this.p2 = {
			x: p2x,
			y: p2y,
		}

		this.p3 = {
			x: p3x,
			y: p3y,
		}
	}

	calculateVerticalForHorizontal(x) {
		correctValueForBounds(x, 0, 1);

		return (Math.pow((1 - x), 3) * this.p0.y)
			+ (3 * Math.pow((1 - x), 2) * x * this.p1.y)
			+ (3 * (1 - x) * Math.pow(x, 2) * this.p2.y)
			+ (Math.pow(x, 3) * this.p3.y);
	}

	calculateHorizontalForVertical(y) {
		correctValueForBounds(y, 0, 1);

		return (Math.pow((1 - y), 3) * this.p0.x)
			+ (3 * Math.pow((1 - y), 2) * y * this.p1.x)
			+ (3 * (1 - y) * Math.pow(y, 2) * this.p2.x)
			+ (Math.pow(y, 3) * this.p3.x);
	}

	static createCustomAnimation(p1x, p1y, p2x, p2y) {
		return new CubicBezier(
			0, 0,
			p1x, p1y,
			p2x, p2y,
			1, 1
		);
	}

	static createLinear() {
		return new CubicBezier(
			0, 0,
			0, 0,
			1, 1,
			1, 1
		);
	}

	static createEase() {
		return new CubicBezier(
			0, 0,
			.25, .1,
			.25, 1,
			1, 1
		);
	}

	static createEaseIn() {
		return new CubicBezier(
			0, 0,
			.42, 0,
			1, 1,
			1, 1
		);
	}

	static createEaseOut() {
		return new CubicBezier(
			0, 0,
			0, 0,
			.58, 1,
			1, 1
		);
	}

	static createEaseInOut() {
		return new CubicBezier(
			0, 0,
			.42, 0,
			.58, 1,
			1, 1
		);
	}
}

function correctValueForBounds(value, lower, upper) {
	if (value < lower) {
		return lower;
	}

	if (value > upper) {
		return upper;
	}

	return value;
}
