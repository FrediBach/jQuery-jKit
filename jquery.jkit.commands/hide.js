
// ##### Command Template
//
// This is a template for commands. It should be used as a starting point to create new commands.

plugin.commands.hide = (function(){
	
	// Create an object that contains all of our data and functionality.
	
	var command = {};
	
	// This are the command defaults:
	
	plugin.addCommandDefaults('hide', {
		'delay': 			0,
		'speed': 			500,
		'animation': 		'fade',
		'easing': 			'linear'
	});
	
	// The execute function is launched whenever this command is executed:
	
	command.execute = function($that, options){
		
		$that.jKit_effect(false, options.animation, options.speed, options.easing, options.delay, function(){
			plugin.triggerEvent('complete', $that, options);
		});
		
	};
	
	return command;

}());