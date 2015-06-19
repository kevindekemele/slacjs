class BaseRenderer {

    constructor(element) {

        this.element = element;
        this.canvas = document.getElementById(element);
        this.ctx = this.canvas.getContext('2d');

        this.xMax = 1;
        this.yMax = 1;
    }

    /**
	 * Clear the canvas
	 * @return {ReplayRenderer}
	 */
	clearCanvas() {

		//Save transformation matrix
		this.ctx.save();

		//Reset the transform to clear the whole canvas
		this.ctx.setTransform(1, 0, 0, 1, 0, 0);
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

		//Restore transformation
		this.ctx.restore();

		return this;
	}

    /**
	 * Resize the canvas for retina devices
	 * @return {void}
	 */
	optimizeForRetina() {

		const cs = window.getComputedStyle(this.canvas);
		const width = parseInt(cs.getPropertyValue('width'), 10);
		const height = parseInt(cs.getPropertyValue('height'), 10);

		//Calcuate a factor for the resolution
		//Use 1.99 scale on retina devices
		const resolutionFactor = window.devicePixelRatio && window.devicePixelRatio === 2 ? 1.99 : 1;

		//Make the canvas smaller with css
		this.canvas.width = width * resolutionFactor;
		this.canvas.height = height * resolutionFactor;
		this.canvas.style.width = width + 'px';
		this.canvas.style.height = height + 'px';
	}

    /**
	 * Scale the canvas to zoom in
	 * @return {void}
	 */
	calculateScaleFactor(xMax, yMax, padding) {

		const width = this.canvas.width;
		const height = this.canvas.height;

		//Calculate maximal possible scalefactor
		const scaleXMax = width / (xMax + padding);
		const scaleYMax = height / (yMax + padding);

		return Math.min(scaleXMax, scaleYMax);
	}

    /**
	 * Plot a user object on the canvas
	 * @param  {User} user
	 * @param  {String} color
	 * @param  {float} Range of the sensor
	 * @return {void}
	 */
	plotUserTrace(user, color = '#A8A8A8', lineWidth = 2) {

		this.ctx.lineJoin = 'round';
		this.ctx.lineWidth = lineWidth;
		this.ctx.fillStyle = '#960E0E';
		this.ctx.strokeStyle = color;

		this.ctx.beginPath();

		let resize = false;

		user.trace.values().forEach(({x, y, theta}, i) => {

			const tX = this.tx(x);
			const tY = this.ty(y);

			if (i === 0) {
				this.ctx.moveTo(tX, tY);
			}
			else {
				this.ctx.lineTo(tX, tY);
			}
		});

		this.ctx.stroke();
		this.ctx.closePath();

		return resize;
	}

    /**
	 * Plot a object
	 * @param {Object} objects A objects with at least an x,y value
	 * @param {string} fillStyle
	 */
	plotObject(object, fillStyle = '#000000', size = 3) {
		this.ctx.fillStyle = fillStyle;

		//Compensate for landmark size
		var x = this.tx(object.x) - (0.5 * size);
		var y = this.ty(object.y) - (0.5 * size);

		this.ctx.fillRect(x, y, size, size);

		if(object.name !== undefined) {
			this.ctx.font = "15px serif";
			this.ctx.fillStyle = "#000000";
			this.ctx.fillText(object.name, x, y);
		}
	}

    /**
	 * Translate x
	 * @param  {Number} x
	 * @return {Number}
	 */
	tx(x) {
		return x;
	}

	/**
	 * Translate y
	 * @param  {Number} y
	 * @return {Number}
	 */
	ty(y) {
		return y;
	}
}

export default BaseRenderer;
