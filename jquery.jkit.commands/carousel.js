
// ##### Carousel Command
//
// The [carousel command](http://jquery-jkit.com/commands/carousel.html) is used to display a
// subset of elements like a carousel, new one in, old one out.

plugin.commands.carousel = (function(){
	
	// Create an object that contains all of our data and functionality.
	
	var command = {};
	
	// This are the command defaults:
	
	plugin.addCommandDefaults('carousel', {
		'autoplay': 		"yes",
		'limit': 			5,
		'animation':		'grow',
		'speed':			250,
		'easing':			'linear',
		'interval':			5000,
		'prevhtml':			'&lt;',
		'nexthtml':			'&gt;'
	});
	
	// The execute function is launched whenever this command is executed:
	
	command.execute = function($that, options){
		
		var s = plugin.settings;
		
		var cnt = 0;
		
		// First hide all elements that are over our limit of elements we want to show:
		
		$that.children().each( function(){
			cnt++;
			if (cnt > options.limit){
				$(this).hide();
			}
		});
		
		// Add our **prev** and **next** button elements so the user can control the carousel:
		
		var $prevdiv = $('<a/>', {
			'class': s.prefix+'-carousel-prev'
		}).html(options.prevhtml).on( 'click left', function(){
			carousel($that, options, 'prev');
		}).insertAfter($that);
		
		var $nextdiv = $('<a/>', {
			'class': s.prefix+'-carousel-next'
		}).html(options.nexthtml).on( 'click right', function(){
			carousel($that, options, 'next');
		}).insertAfter($that);
		
		// Add some additional keyboard events:
		
		plugin.addKeypressEvents($prevdiv, 'left');
		plugin.addKeypressEvents($nextdiv, 'right');
		
		// Start autoplay if needed:
		
		if (options.autoplay == 'yes'){
			window.setTimeout( function() { carousel($that, options); }, options.interval);
		}
		
	};
	
	// The **carousel** function moves the carousel either one forward, or
	// one backward.
	
	carousel = function($el, options, dir){
		
		// Every manual interaction stops the autoplay:
		
		if (dir != undefined){
			options.autoplay = false;
		}
		
		// Only run the carousel if we're inside the viewport and the window has focus:
		
		if ((windowhasfocus || !windowhasfocus && plugin.settings.ignoreFocus) && ($el.jKit_inViewport() || !$el.jKit_inViewport() && plugin.settings.ignoreViewport)){
			
			// Check if we're in the middle of an animation:
			
			var isAnimated = false;
			$el.children().each( function(){
				if ( $(this).is(':animated') ) {
					isAnimated = true;
				}
			});
			
			// We only move the carousel if it isn't animating right now:
			
			if (!isAnimated) {
				
				// What number is the last element?
				
				var pos = Math.min(options.limit, $el.children().length);
				
				// Step one forward:
				
				if (dir == 'next' || dir == undefined) {

					plugin.triggerEvent('shownext', $el, options);

					$el.children(':first-child').jKit_effect(false, options.animation, options.speed, options.easing, 0, function(){
						$el.append($el.children(':nth-child(1)'));
						$el.children(':nth-child('+pos+')').jKit_effect(true, options.animation, options.speed, options.easing, 0);
					});
				
				// Step one backward:
					
				} else if (dir == 'prev') {

					plugin.triggerEvent('showprev', $el, options);

					$el.children(':nth-child('+pos+')').jKit_effect(false, options.animation, options.speed, options.easing, 0, function(){
						$el.prepend( $el.children(':last-child') );
						$el.children(':first-child').jKit_effect(true, options.animation, options.speed, options.easing, 0);
					});
					     
				}
				
			}
			
			// Is autoplay is on? Than set the interval: 
			
			if (options.autoplay == 'yes'){
				window.setTimeout( function() { carousel($el, options); }, options.interval);
			}
		
		} else {
			window.setTimeout( function() { carousel($el, options); }, options.interval);
		}
	
	};
	
	return command;

}());