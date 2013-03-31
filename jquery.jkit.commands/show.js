
// ##### Show Command
//
// The [show command](http://jquery-jkit.com/commands/show.html) is used to reveal an element, animated or not.

plugin.commands.show = (function(){
	
	// Create an object that contains all of our data and functionality.
	
	var command = {};
	
	// This are the command defaults:
	
	plugin.addCommandDefaults('show', {
		'delay':			0,
		'speed':			500,
		'animation':		'fade',
		'easing':			'linear'
	});
	
	// The execute function is launched whenever this command is executed:
	
	command.execute = function($that, options){
		
		$that.hide().jKit_effect(true, options.animation, options.speed, options.easing, options.delay, function(){
			plugin.triggerEvent('complete', $that, options);
		});
		
	};
	
	return command;

}());