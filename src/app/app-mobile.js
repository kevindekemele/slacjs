import SlacController from './slac-controller';
import BLE from './device/bluetooth.js';
import MotionSensor from './device/motion-sensor';
import config from './config';

window.SlacApp = {

	controller: undefined,

	motionSensor: undefined,
	ble: undefined,

	uiElements: {},

	/**
	 * Setup the application
	 * @return {void}
	 */
	initialize() {
		
		//Cache all UI elements
		this.uiElements = {
			indx: $('.motion-indicator-x'),
			indy: $('.motion-indicator-y'),
			indz: $('.motion-indicator-z'),
			indheading: $('.motion-indicator-heading'),
			stepCount: $('.motion-step-count'),
			map: $('#slacjs-map'),

			deviceMotionEnabled: $('.device-motion'),
			deviceCompassEnabled: $('.device-compass'),
			deviceBleEnabled: $('.device-ble'),

			btnStart: $('.btn-start'),
			btnReset: $('.btn-reset'),
			btnPause: $('.btn-pause')
		};

		//Create a new motion sensor object that listens for updates
		//The sensor is working even if the algorithm is paused (to update the view)
		this._startMotionSensing();

		//Start the bluetooth radio
		this._startBluetooth();

		//Bind events to the buttons
		this._bindButtons();
	},

	/**
	 * Start the SLACjs algorithm
	 * @return {void}
	 */
	start() {

		console.log('[SLACjs] Starting');

		if(this.controller !== undefined) {
			this.reset();
		}

		//Create a new controller
		this.controller = new SlacController(
			config.particles.N,
			config.particles.defaultPose,
			config.beacons,
			config.sensor.frequency
		);

		this.uiElements.btnStart.prop('disabled', true);
		this.uiElements.btnReset.prop('disabled', false);
	},

	/**
	 * Reset the SLACjs controller
	 * @return {void}
	 */
	reset() {

		console.log('[SLACjs] Resetting controller');

		this.uiElements.btnStart.prop('disabled', false);
		this.uiElements.btnReset.prop('disabled', true);

		delete this.controller;
	},

	/**
	 * Pause the SLACjs controller
	 * @return {void}
	 */
	pause() {
		console.log('[SLACjs] Pausing controller');

		this.controller.pause();
	},

	/**
	 * Bind events to buttons in the view
	 * @return {void}
	 */
	_bindButtons() {

		this.uiElements.btnStart.on('click', () => this.start());
		this.uiElements.btnReset.on('click', () => this.reset());
		this.uiElements.btnPause.on('click', () => this.pause());
	},

	/**
	 * Start the bluetooth radio
	 * @return {void}
	 */
	_startBluetooth() {

		this.ble = new BLE(config.ble.frequency);

		const success = this.ble.initRadio();

		if (success) {
			this.uiElements.deviceBleEnabled.addClass('enabled');
		}

		this.ble.onObservation((data) => this._bluetoothObservation(data));
	},

	/**
	 * Start the motion sensing
	 * @return {void}
	 */
	_startMotionSensing() {

		//Create a new motion sensor object that listens for updates
		this.motionSensor = new MotionSensor();

		//Register a listener, this udpates the view and runs the pedometer
		this.motionSensor.onChange((data) => this._motionUpdate(data));
		const enabled = this.motionSensor.startListening();

		//Update the view to indicate all sensors are working
		if (enabled.accelerometer) {
			this.uiElements.deviceMotionEnabled.addClass('enabled');
		}

		if (enabled.compass) {
			this.uiElements.deviceCompassEnabled.addClass('enabled');
		}
	},

	/**
	 * Process a motion update event
	 * @param  {Object} data
	 * @return {void}
	 */
	_motionUpdate(data) {

		//Update the view
		this.uiElements.indx.html(data.x.toFixed(2));
		this.uiElements.indy.html(data.y.toFixed(2));
		this.uiElements.indz.html(data.z.toFixed(2));
		this.uiElements.indheading.html(data.heading.toFixed(2));

		//Send the motion update to the controller
		if (this.controller !== undefined) {
			this.controller.addMotionObservation(data.x, data.y, data.z, data.heading);

			this.uiElements.stepCount.html(this.controller.pedometer.stepCount);
		}
	},
	
	/**
	 * Process a bluetooth event
	 * @param  {Object} data
	 * @return {void}
	 */
	_bluetoothObservation(data) {

		if (this.controller !== undefined) {

			this.controller.addDeviceObservation({
				uid: data.address,
				rssi: data.rssi
			});
		}
	}
};

//@todo remove this for the device version
window.SlacApp.initialize(); 