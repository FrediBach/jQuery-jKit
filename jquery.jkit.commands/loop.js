
// ##### Loop Command
//
// The [loop command](http://jquery-jkit.com/commands/loop.html) does the sam thing as the **showandhide** command,
// but repeats itself again, and again ... actually, pretty much forever. **Oh, and lease don't use it as a blink tag!!!**

plugin.commands.loop = (function(){
	
	// Create an object that contains all of our data and functionality.
	
	var command = {};
	
	// This are the command defaults:
	
	plugin.addCommandDefaults('loop', {
		'speed1':			500,
		'speed2':			500,
		'duration1':		2000,
		'duration2':		2000,
		'easing1':			'linear',
		'easing2':			'linear',
		'animation':		'fade'
	});
	
	// The execute function is launched whenever this command is executed:
	
	command.execute = function($that, options){
		loop($that.hide(), options);
	};
	
	// The local **loop** function is used by the loop the command and basically just shows and hides and element and than starts
	// the next interval.

	var loop = function($that, options){
		
		if ((windowhasfocus || !windowhasfocus && plugin.settings.ignoreFocus) && ($that.jKit_inViewport() || !$that.jKit_inViewport && plugin.settings.ignoreViewport)){

			plugin.triggerEvent('show', $that, options);

			$that.jKit_effect(true, options.animation, options.speed1, options.easing1, options.duration1, function(){
				plugin.triggerEvent('hide', $that, options);
				$that.jKit_effect(false, options.animation, options.speed2, options.easing2, options.duration2, loop($that, options));
			});

		} else {
			window.setTimeout( function() { loop($that, options); }, 100);
		}

	};
	
	return command;

}());