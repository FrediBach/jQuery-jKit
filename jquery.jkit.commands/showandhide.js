
// ##### Showandhide Command
//
// The [showandhide command](http://jquery-jkit.com/commands/showandhide.html) is used to reveal an element
// and than hide it again, animated or not.

plugin.commands.showandhide = (function(){
	
	// Create an object that contains all of our data and functionality.
	
	var command = {};
	
	// This are the command defaults:
	
	plugin.addCommandDefaults('showandhide', {
		'delay':			0,
		'speed':			500,
		'duration':			10000,
		'animation':		'fade',
		'easing':			'linear'
	});
	
	// The execute function is launched whenever this command is executed:
	
	command.execute = function($that, options){
		
		$that.hide().jKit_effect(true, options.animation, options.speed, options.easing, options.delay, function(){
			plugin.triggerEvent('shown', $that, options);
			$that.jKit_effect(false, options.animation, options.speed, options.easing, options.duration, function(){
				plugin.triggerEvent('complete', $that, options);
			});
		});
		
	};
	
	return command;

}());