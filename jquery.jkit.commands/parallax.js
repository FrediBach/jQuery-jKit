
// ##### Parallax Command
//
// The [parallax command](http://jquery-jkit.com/commands/parallax.html) is used to create a parallax scrolling
// effect with different layers that look like a 3D scenery. Sidescrolling games in the old days used this kind 
// of faked 3D effect quite a lot.

plugin.commands.parallax = (function(){
	
	// Create an object that contains all of our data and functionality.
	
	var command = {};
	
	// This are the command defaults:
	
	plugin.addCommandDefaults('parallax', {
		'strength':			5,
		'axis':				'x',
		'scope':			'global',
		'detect': 			'mousemove'
	});
	
	// The execute function is launched whenever this command is executed:
	
	command.execute = function($that, options){
		
		var s = plugin.settings;
		
		var strength = options.strength / 10;
		
		// We have to attach our event to different DOM elements based on the the type of parallax we want.
		// The first option will use window scrolling to set the position of each layer, the other two use
		// the mouse position for that.
		
		if (options.detect == 'scroll'){
			var $capture = $(window);
		} else if (options.scope == 'global'){
			var $capture = $(document);
		} else {
			var $capture = $that;
		}
		
		// Set the correct event:
		
		$capture.on( options.detect, function(event) {
			
			// We only want to go through all calculations if needed, so check if our element is inside the viewport 
			// and that the window has focus:
			
			if ((windowhasfocus || !windowhasfocus && s.ignoreFocus) && ($that.jKit_inViewport() || !$that.jKit_inViewport() && s.ignoreViewport)){
				var cnt = 1;
				
				// Get either the scroll or the mouse position:
				
				if (options.detect == 'scroll'){
					var xaxis = $(window).scrollLeft() + $(window).width() / 2;
					var yaxis = $(window).scrollTop() + $(window).height() / 2;
				} else {
					var xaxis = event.pageX;
					var yaxis = event.pageY;
				}
				
				// Loop through each layer and set the correct positions of each one of them:
				
				$that.children().each( function(){
					
					var box = $that.offset();
					
					if (options.axis == 'x' || options.axis == 'both'){
						var offsetx = (xaxis-box.left-($that.width()/2))*strength*cnt*-1 - $(this).width()/2 + $that.width()/2;
						$(this).css({ 'left': offsetx+'px' });
					}
					if (options.axis == 'y' || options.axis == 'both'){
						var offsety = (yaxis-box.top-($that.height()/2))*strength*cnt*-1 - $(this).height()/2 + $that.height()/2;
						$(this).css({ 'top': offsety+'px' });
					}
					
					cnt++;
				
				});
			}
		
		});
		
	};
	
	return command;

}());