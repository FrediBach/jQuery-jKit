
// ##### Swap Command
//
// The [swap command](http://jquery-jkit.com/commands/swap.html) replaces a DOM node attribute, for 
// example an image, with another value on hover.

plugin.commands.swap = (function(){
	
	// Create an object that contains all of our data and functionality.
	
	var command = {};
	
	// This are the command defaults:
	
	plugin.addCommandDefaults('swap', {
		'versions': 		'_off,_on',
		'attribute': 		'src'
	});
	
	// The execute function is launched whenever this command is executed:
	
	command.execute = function($that, options){
		
		var s = plugin.settings;
		
		var versions = options.versions.split(s.delimiter);
		var active = false;
		
		// We have to store the original attributes value to swap the attribute back on mouseleave:
		
		var original = $that.attr(options.attribute);
		var replacement = $that.attr(options.attribute).replace(versions[0],versions[1]);
		
		// In case the attribute is an image source, we have to preload the image or the swapping could have a delay:
		
		if (options.attribute == 'src'){
			$('<img/>')[0].src = replacement;
		}
		
		// Finally, add the two event handlers with the swapping code:
		
		$that.on( 'mouseenter click', function(){
			if (!active){
				$that.attr(options.attribute, replacement );
				plugin.triggerEvent('active', $that, options);
				active = true;
			}
		}).on( 'mouseleave click', function(){
			if (active){
				$that.attr(options.attribute, original );
				plugin.triggerEvent('inactive', $that, options);
				active = false;
			}
		});
		
	};
	
	return command;

}());