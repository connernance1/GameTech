/* global Demo */

// ------------------------------------------------------------------
//
// This namespace holds the input demo model.
//
// ------------------------------------------------------------------
Demo.model = (function(input, components, renderer) {
	'use strict';
	var myKeyboard = input.Keyboard(),
		myMouse = input.Mouse(),
		that = {};

	// ------------------------------------------------------------------
	//
	// This function initializes the input demo model.
	//
	// ------------------------------------------------------------------
	that.initialize = function() {
		components.ParticleSystem.createEffectExplosion({
			center: { x: 0.5, y: 0.5 },
			howMany: 300
		});
		components.ParticleSystem.createEffectFire({
			center: { x: 0.5, y: 0.5 },
			lifetime: 2000
		});

		//
		// Register the mouse click to cause a new effect to be created
		myMouse.registerHandler(function(event) {
			var point = renderer.core.clientToWorld(event.clientX, event.clientY);

			components.ParticleSystem.createEffectExplosion({
				center: point,
				howMany: 300
			});
		},
			myMouse.EventMouseDown, false);
	};

	// ------------------------------------------------------------------
	//
	// Process all input for the model here.
	//
	// ------------------------------------------------------------------
	that.processInput = function(elapsedTime) {
		myKeyboard.update(elapsedTime);
		myMouse.update(elapsedTime);
	};

	// ------------------------------------------------------------------
	//
	// This function is used to update the state of the demo model.
	//
	// ------------------------------------------------------------------
	that.update = function(elapsedTime) {
		components.ParticleSystem.update(elapsedTime);
	};

	// ------------------------------------------------------------------
	//
	// This function renders the demo model.
	//
	// ------------------------------------------------------------------
	that.render = function(/* renderer */) {

		//
		// Draw a border around the unit world.
		renderer.core.drawRectangle('rgba(255, 255, 255, 1)', 0, 0, 1, 1);
		renderer.ParticleSystem.render(components.ParticleSystem);
	};

	return that;

}(Demo.input, Demo.components, Demo.renderer));
