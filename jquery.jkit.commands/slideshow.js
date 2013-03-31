
// ##### Slideshow Command
//
// The [slideshow command](http://jquery-jkit.com/commands/slideshow.html) is being used to create 
// slideshows of either images or any other kind of HTML content.

plugin.commands.slideshow = (function(){
	
	// Create an object that contains all of our data and functionality.
	
	var command = {};
	
	// This are the command defaults:
	
	plugin.addCommandDefaults('slideshow', {
		'shuffle':			'no',
		'interval':			3000,
		'speed':			250,
		'animation':		'fade',
		'easing':			'linear',
		'on': 				''
	});
	
	// The execute function is launched whenever this command is executed:
	
	command.execute = function($that, options){
		
		// Get all slides:
		
		var slides = $that.children();
		
		// If needed, shuffle the slides into a random order:
		
		if (options.shuffle == 'yes'){
			var tmp, rand;
			var slidecount = slides.length;
			for(var i =0; i < slidecount; i++){
				rand = Math.floor(Math.random() * slidecount);
				tmp = slides[i];
				slides[i] = slides[rand];
				slides[rand] = tmp;
			}
		}
		
		$that.css( { 'position': 'relative' } );
		
		// Add the first slide and set a hidden data attribute so we know
		// if the slideshow is running or not.
		
		$that.html(slides[0]);
		$.data($that, 'anim', false);
		
		if (options.on != ''){
			
			// In case the **on** option is set to **mouseover**, we have to set an
			// additional **mouseleave** event.
			
			if (options.on == 'mouseover'){
				$that.on( 'mouseleave', function(){
					$.data($that, 'anim', false);
				});
			}
			
			// Set the correct events and use a setTimeout function to call the slideshow function:
			
			$that.on( options.on, function(){
				if (options.on == 'click'){
					if ($.data($that, 'anim')){
						$.data($that, 'anim', false);
					} else {
						$.data($that, 'anim', true);
						window.setTimeout( function() { slideshow(slides, 0, $that, options); }, 0);
					}
				} else if (options.on == 'mouseover'){
					if (!$.data($that, 'anim')){
						$.data($that, 'anim', true);
						window.setTimeout( function() { slideshow(slides, 0, $that, options); }, 0);
					}
				}
			});
		
		} else {
			
			// No event is set, so we just run the slideshow right now:
			
			$.data($that, 'anim', true);
			window.setTimeout( function() { slideshow(slides, 0, $that, options); }, options.interval);
			
		}
		
	};
	
	// The **slideshow** function replaces one slide with the next one. This one is
	// is really simple, so not much to comment, just that the old element is first being hidden and than the new one shown,
	// with or whitout an animation.
	
	var slideshow = function(slides, current, el, options){
		
		if ($.data(el, 'anim')){
			if ((windowhasfocus || !windowhasfocus && plugin.settings.ignoreFocus) && (el.jKit_inViewport() || !el.jKit_inViewport() && plugin.settings.ignoreViewport)){
				
				if (current < (slides.length-1)){
					current++;
				} else {
					current = 0;
				}
				
				plugin.triggerEvent('hideentry hideentry'+(current+1), el, options);
				
				el.jKit_effect(false, options.animation, options.speed, options.easing, 0, function(){
					el.html(slides[current]);
					
					plugin.triggerEvent('showentry showentry'+(current+1), el, options);
					
					el.jKit_effect(true, options.animation, options.speed, options.easing, 0, function(){
						window.setTimeout( function() { slideshow(slides, current, el, options); }, options.interval);
					});
				});
			
			} else {
				window.setTimeout( function() { slideshow(slides, current, el, options); }, options.interval);
			}
		}
	
	};
	
	return command;

}());