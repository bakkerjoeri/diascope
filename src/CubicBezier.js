export default class CubicBezier {
	/**
	 * Create a new CubicBezier instance.
	 *
	 * @param  {Number} 	p0x The x coordinate of control point 0.
	 * @param  {Number} 	p0y The y coordinate of control point 0.
	 * @param  {Number} 	p1x The x coordinate of control point 1.
	 * @param  {Number} 	p1y The y coordinate of control point 1.
	 * @param  {Number} 	p2x The x coordinate of control point 2.
	 * @param  {Number} 	p2y The y coordinate of control point 2.
	 * @param  {Number} 	p3x The x coordinate of control point 3.
	 * @param  {Number} 	p3y The y coordinate of control point 3.
	 *
	 * @return {CubicBezier}
	 */
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

	/**
	 * Calculate the y coordinate of a point found on the curve for a given time t.
	 *
	 * @param  {Number} t 	The given time, with domain 0 <= t <= 1
	 * @return {Number}   	The y coordinate of the point on the curve at given time t.
	 */
	calculateVerticalForTime(t) {
		t = getValueCorrectedForBoundaries(t, 0, 1);

		return (Math.pow((1 - t), 3) * this.p0.y)
			+ (3 * Math.pow((1 - t), 2) * t * this.p1.y)
			+ (3 * (1 - t) * Math.pow(t, 2) * this.p2.y)
			+ (Math.pow(t, 3) * this.p3.y);
	}

	/**
	 * Calculate the x coordinate of a point found on the curve for a given time t.
	 *
	 * @param  {Number} t 	The given time, with domain 0 <= t <= 1
	 * @return {Number}   	The x coordinate of the point on the curve at given time t.
	 */
	calculateHorizontalForTime(t) {
		t = getValueCorrectedForBoundaries(t, 0, 1);

		return (Math.pow((1 - t), 3) * this.p0.x)
			+ (3 * Math.pow((1 - t), 2) * t * this.p1.x)
			+ (3 * (1 - t) * Math.pow(t, 2) * this.p2.x)
			+ (Math.pow(t, 3) * this.p3.x);
	}

	/**
	 * Create a custom animation cubic bezier curve. Animation cubic bezier curves
	 * have fixed start and end control points, at (0, 0) and (1, 1) resprectfully.
	 *
	 * @param  {Number} p1x 	The x coordinate of control point 1.
	 * @param  {Number} p1y 	The y coordinate of control point 1.
	 * @param  {Number} p2x 	The x coordinate of control point 2.
	 * @param  {Number} p2y 	The y coordinate of control point 2.
	 *
	 * @return {CubicBezier}
	 */
	static createCustomAnimation(p1x, p1y, p2x, p2y) {
		return new CubicBezier(
			0, 0,
			p1x, p1y,
			p2x, p2y,
			1, 1
		);
	}

	/**
	 * Create a linear cubic bezier curve.
	 *
	 * @return {CubicBezier}
	 */
	static createLinear() {
		return new CubicBezier(
			0, 0,
			0, 0,
			1, 1,
			1, 1
		);
	}

	/**
	 * Create a cubic bezier curve for an ease animation.
	 *
	 * @return {CubicBezier}
	 */
	static createEase() {
		return new CubicBezier(
			0, 0,
			.25, .1,
			.25, 1,
			1, 1
		);
	}

	/**
	 * Create a cubic bezier curve for an ease-in animation.
	 *
	 * @return {CubicBezier}
	 */
	static createEaseIn() {
		return new CubicBezier(
			0, 0,
			.42, 0,
			1, 1,
			1, 1
		);
	}

	/**
	 * Create a cubic bezier curve for an ease-out animation.
	 *
	 * @return {CubicBezier}
	 */
	static createEaseOut() {
		return new CubicBezier(
			0, 0,
			0, 0,
			.58, 1,
			1, 1
		);
	}

	/**
	 * Create a cubic bezier curve for an ease-in-and-out animation.
	 *
	 * @return {CubicBezier}
	 */
	static createEaseInOut() {
		return new CubicBezier(
			0, 0,
			.42, 0,
			.58, 1,
			1, 1
		);
	}
}

/**
 * Check if a value violates the given upper and lower boundaries.
 * If so, return the violated boundary. Otherwise, return the value.
 *
 * @param  {Number} value
 * @param  {Number} lower 	The lower boundary.
 * @param  {Number} upper 	The upper boundary.
 *
 * @return {Number}
 */
function getValueCorrectedForBoundaries(value, lower, upper) {
	if (value < lower) {
		return lower;
	}

	if (value > upper) {
		return upper;
	}

	return value;
}
