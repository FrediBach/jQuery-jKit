
// ##### Limit Command
//
// The [limit command](http://jquery-jkit.com/commands/limit.html) either limts the
// characters of a string or the elements inside a container by a set number.

plugin.commands.limit = (function(){
	
	// Create an object that contains all of our data and functionality.
	
	var command = {};
	
	// This are the command defaults:
	
	plugin.addCommandDefaults('limit', {
		'elements':			'children',
		'count':			5,
		'animation':		'none',
		'speed':			250,
		'easing':			'linear',
		'endstring':		'...'
	});
	
	// The execute function is launched whenever this command is executed:
	
	command.execute = function($that, options){
		
		// Limit the number of elements. Set speed to zero if you want to hide them immediately
		// or use an animation:
		
		if (options.elements == 'children'){
			
			$that.children(':gt('+(options.count-1)+')').each(function(){
				$(this).jKit_effect(false, options.animation, options.speed, options.easing);
			});
			
			setTimeout( function(){
				plugin.triggerEvent('complete', $that, options);
			}, options.speed);
		
		// Limit the number of characters in a string:
		
		} else {
			
			var newtext = $that.text().substr(0,options.count);
			
			// Add an endstring if needed:
			
			if (newtext != $that.text()){
				newtext = newtext.substr(0,newtext.length-options.endstring.length)+options.endstring;
				$that.text(newtext);
			}
			
		}
		
	};
	
	return command;

}());