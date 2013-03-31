
// ##### Animation Command
//
// The [animation command](http://jquery-jkit.com/commands/animation.html) has two uses. Either it can be used
// to animate the CSS of an element or it can be used to animated a kind of keyframe animation with attribute
// tweenings.

plugin.commands.animation = (function(){
	
	// Create an object that contains all of our data and functionality.
	
	var command = {};
	
	// This are the command defaults:
	
	plugin.addCommandDefaults('animation', {
		'fps':				25,
		'loop':				'no',
		'from': 			'',
		'to': 				'',
		'speed': 			'500',
		'easing': 			'linear',
		'delay':			0,
		'on': 				''
	});
	
	// The execute function is launched whenever this command is executed:
	
	command.execute = function($that, options){
		
		var s = plugin.settings;
		
		// First check if this is a CSS animation:
		
		if (options.to != ''){
			
			// If the **from** option is set, we first have to set the initial CSS:
			
			if (options.from != ''){
				$that.css( plugin.cssFromString(options.from) );
			}
			
			// use setTimeout to delay the animation, even if the delay is zero:
			
			setTimeout(function() {
				
				// Either add an event that starts the animation or start it right away:
				
				// {!} task: Dublicate code and the delay doesn't make much sense with an event like this.
				
				if (options.on != ''){
					$that.on( options.on, function(){
						$that.animate( plugin.cssFromString(options.to), options.speed, options.easing, function(){
							if (options.macro != undefined) plugin.applyMacro($that, options.macro);
							plugin.triggerEvent('complete', $that, options);
						});
					});
				} else {
					$that.animate( plugin.cssFromString(options.to), options.speed, options.easing, function(){
						if (options.macro != undefined) plugin.applyMacro($el, options.macro);
						plugin.triggerEvent('complete', $that, options);
					});
				}
			}, options.delay);
		
		} else {
			
			// This is a keyframe animation. Let's first set some initial variables:
			
			options.interval = 1000 / options.fps;
			
			var frames = [];
			
			var pos = 0;
			var lastframe = 0;
			
			// Loop through each keyframe and collect all the useful information
			// we can find and parse the frame command that sets each frames options.
			
			$that.children().each( function(){
				var rel = $(this).attr('rel');
				var data = $(this).attr(s.dataAttribute);
				
				if (data != undefined){
					var start = data.indexOf('[');
					var end = data.indexOf(']');
					var optionstring = data.substring(start+1, end);
				} else {
					var start = rel.indexOf('[');
					var end = rel.indexOf(']');
					var optionstring = rel.substring(start+1, end);
				}
				
				var frame = plugin.parseOptions(optionstring);
				
				frame.el = $(this);
				if (frame.easing == undefined) frame.easing = 'linear';
				
				frame.start = pos;
				pos += parseInt(frame.steps);
				frame.end = pos;
				lastframe = pos;
				pos++;
				
				frames.push(frame);
			});
			
			options.lastframe = lastframe;
			
			$that.css('overflow', 'hidden');
			
			// Replace the original elements content with the first frame only:
			
			$that.html(frames[0].el);
			
			// And now start the animation:
			
			window.setTimeout( function() { animation(frames, -1, $that, options); }, 0);
		
		}
		
	};
	
	var animation = function(frames, current, el, options){
		
		if ((windowhasfocus || !windowhasfocus && plugin.settings.ignoreFocus) && (el.jKit_inViewport() || !el.jKit_inViewport() && plugin.settings.ignoreViewport)){
			
			plugin.triggerEvent('showframe showframe'+(current+1), el, options);
			
			// Loop through each frame and run the frames action in case it matches the current frame number:
			
			$.each( frames, function(index, value){
				if (value.start == current){
					
					// First add the new element by cloning it from the frames object and calculate the duration
					// this frame is visible:
					
					el.html(value.el.clone());
					var duration = (value.end - value.start) * options.interval;
					
					// Depending on the action that is set for this frame, we need to start different kind of animations:
					
					if (value.action == 'fadeout'){
						el.children(":first").show().fadeTo(duration, 0, value.easing);
					} else if (value.action == 'fadein'){
						el.children(":first").hide().fadeTo(duration, 1, value.easing);
					} else if (value.action == 'fadeinout'){
						el.children(":first").hide().fadeTo(duration/2, 1, value.easing).fadeTo(duration/2, 0, value.easing);
					} else if (value.action == 'tween'){
						var next = frames[index+1].el;
						el.children(":first").animate({
							'font-size': next.css('font-size'),
							'letter-spacing': next.css('letter-spacing'),
							'color': next.css('color'),
							'opacity': next.css('opacity'),
							'background-color': next.css('background-color'),
							'padding-top': next.css('padding-top'),
							'padding-bottom': next.css('padding-bottom'),
							'padding-left': next.css('padding-left'),
							'padding-right': next.css('padding-right')
						}, duration, value.easing);
					}
				
				}
			})
			
			// Move one step forward:
			
			current++;
			var nextloop = false;
			if (current > options.lastframe){
				current = 0;
				nextloop = true;
			}
			
			// Is the animation finsihes or do we have to go to the next step?
			
			if ((nextloop && options.loop == "yes") || !nextloop){
				window.setTimeout( function() { animation(frames, current, el, options); }, options.interval);
			}
			
			// Some additional stuff to trigger in case the animation is finished:
			
			if (options.loop == "no"){
				if (options.macro != undefined) plugin.applyMacro(el, options.macro);
				plugin.triggerEvent('complete', el, options);
			}
		
		} else {
			window.setTimeout( function() { animation(frames, current, el, options); }, options.interval);
		}
	
	};
	
	return command;

}());