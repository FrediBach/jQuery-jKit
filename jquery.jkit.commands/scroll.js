
// ##### Scroll Command
//
// The [scroll command](http://jquery-jkit.com/commands/scroll.html) let's us scroll smoothly to
// an anchor on the page or if the HREF attribute is empty, we just scroll to the top.

plugin.commands.scroll = (function(){
	
	// Create an object that contains all of our data and functionality.
	
	var command = {};
	
	// This are the command defaults:
	
	plugin.addCommandDefaults('scroll', {
		'speed': 			500,
		'dynamic': 			'yes',
		'easing': 			'linear',
		'offset': 			0
	});
	
	// The execute function is launched whenever this command is executed:
	
	command.execute = function($that, options){
		
		$that.click(function() {
			
			plugin.triggerEvent('clicked', $that, options);
			
			// Get the position of our target element:
			
			if ($(this).attr("href") == ''){
				var ypos = 0;
			} else {
				var ypos = $($that.attr("href")).offset().top;
			}
			
			ypos = ypos + parseInt(options.offset);
			
			// The dynamic option changes the scroll animation duration based on the distance between 
			// us and the target element:
			
			if (options.dynamic == 'yes'){
				options.speed = Math.abs($(document).scrollTop() - ypos) / 1000 * options.speed;
			}
			
			// Finally animate the **scrollTop** of the whole HTML page to scroll inside the current window:
			
			$('html, body').animate({ scrollTop: ypos+'px' }, options.speed, options.easing, function(){
				plugin.triggerEvent('complete', $that, options);
			});
			
			return false;
			
		});
		
	};
	
	return command;

}());