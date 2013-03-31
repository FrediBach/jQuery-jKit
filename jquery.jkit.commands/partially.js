
// ##### Partially Command
//
// The [partially command](http://jquery-jkit.com/commands/partially.html) let's us display an element
// only partially in case it is bigger than our supplied maximum height. The whole height is shown only 
// on specific user action (hover over element or click of the *down* key)

plugin.commands.partially = (function(){
	
	// Create an object that contains all of our data and functionality.
	
	var command = {};
	
	// This are the command defaults:
	
	plugin.addCommandDefaults('partially', {
		'height':			200,
		'text':				'more ...',
		'speed':			250,
		'easing':			'linear',
		'on': 				'mouseover'
	});
	
	// The execute function is launched whenever this command is executed:
	
	command.execute = function($that, options){
		
		var s = plugin.settings;
		
		// First store the original height, we need it later.
		
		var originalHeight = $that.height();
		
		// Only add the magic is we need, in other words, if the lement is higher than our maximum height:
		
		if (originalHeight > options.height){
			
			// We can only add our *more div* if it's relatively positioned, so force that one on it:
			
			$that.css('position', 'relative');
			
			// Create the *more div*:
			
			var $morediv = $('<div/>')
					.addClass(s.prefix+'-morediv')
					.appendTo($that)
					.html(options.text)
					.css( { width: $that.outerWidth()+'px', opacity: 0.9 });
			
			// Add the event handlers and animations:
			
			plugin.addKeypressEvents($that, 'down');
			plugin.addKeypressEvents($that, 'up');
			
			if (options.on == 'click' || $.fn.jKit_iOS()){
				var openEvent = 'click';
				var closeEvent = 'click';
			} else {
				var openEvent = 'mouseenter';
				var closeEvent = 'mouseleave';
			}
			
			$that.css({ 'height': options.height+'px', 'overflow': 'hidden' }).on( openEvent+' down', function() {
				if ($that.height() < originalHeight){
					$morediv.fadeTo(options.speed, 0);
					$that.animate({ 'height': originalHeight+'px' }, options.speed, options.easing, function(){
						plugin.triggerEvent('open', $that, options);
					});
				}
			}).on( closeEvent+' up',  function(){
				if ($that.height() == originalHeight){
					$morediv.fadeTo(options.speed, 0.9);
					$that.animate({ 'height': options.height+'px' }, options.speed, options.easing, function(){
						plugin.triggerEvent('closed', $that, options);
					});
				}
			});
			
		}
		
	};
	
	return command;

}());