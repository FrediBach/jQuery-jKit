
// ##### Tooltip Command
//
// The [tooltip command](http://jquery-jkit.com/commands/tooltip.html) displays additional information for
// an element on mouseover.

plugin.commands.tooltip = (function(){
	
	// Create an object that contains all of our data and functionality.
	
	var command = {};
	
	// This are the command defaults:
	
	plugin.addCommandDefaults('tooltip', {
		'text':				'',
		'content': 			'',
		'color':			'#fff',
		'background':		'#000',
		'classname':		'',
		'follow': 			'no',
		'event': 			'mouse',
		'yoffset': 			20
	});
	
	// The execute function is launched whenever this command is executed:
	
	command.execute = function($that, options){
		
		var s = plugin.settings;
		var visible = false;
		
		// Create the tooltip div if it doesn't already exist:
		
		if ($('div#'+s.prefix+'-tooltip').length == 0){
			$('<div/>', {
				id: s.prefix+'-tooltip'
			})
			.css('position', 'absolute')
			.hide().appendTo('body');
		}
		
		$tip = $('div#'+s.prefix+'-tooltip');
		
		// Get the text from the DOM node, title or alt attribute if it isn't set in the options:
		
		if (options.content != ''){
			options.text = $(options.content).html();
		} else {
			if (options.text == '') options.text = $.trim($that.attr('title'));
			if (options.text == '') options.text = $.trim($that.attr('alt'));
		}
		
		// Display the tooltip on mouseenter or focus:
		
		var onevent = 'mouseenter';
		var offevent = 'mouseleave click';
		
		if (options.event == 'focus'){
			onevent = 'focus';
			offevent = 'blur';
		}
		
		$that.on(onevent, function(e){
			
			// Has this tooltip custom styling either by class or by supplying color values?
			
			if (options.classname != ''){
				$tip.html(options.text).removeClass().css({ 'background': '', 'color': '' }).addClass(options.classname);
			} else {
				$tip.html(options.text).removeClass().css({ 'background': options.background, 'color': options.color });
			}
			
			if (options.event == 'focus'){
				
				// Set the position based on the element that came into focus:
				
				$tip.css({ 'top': $that.offset().top+$that.outerHeight(), 'left': $that.offset().left });
				
			} else {
			
				// Correctly position the tooltip based on the mouse position:
			
				$tip.css('top', (e.pageY+options.yoffset)).css('left', e.pageX);
			
				// Fix the tooltip position so that we don't get tooltips we can't read because their outside
				// the window:
			
				if ( parseInt($tip.css('left')) > $(window).width() / 2 ){
					$tip.css('left', '0px').css('left', e.pageX - $tip.width());
				}
				
			}
			
			// Stop any possible previous animations and start fading it in:
			
			$tip.stop(true, true).fadeIn(200);
			
			plugin.triggerEvent('open', $that, options);
			
			visible = true;
		
		// Fade out the tooltip on mouseleave:
		
		}).on(offevent, function(e){
			
			var speed = 200;
			if ($tip.is(':animated')){
				speed = 0;
			}
			
			$tip.stop(true, true).fadeOut(speed, function(){
				visible = false;
			});
			
			plugin.triggerEvent('closed', $that, options);
		
		});
		
		// If the "follow" option is "true", we let the tooltip follow the mouse:
		
		if (options.follow == 'yes'){
			$('body').on('mousemove', function(e){
				if (visible){
					$tip.css('top', (e.pageY+options.yoffset)).css('left', e.pageX);
				}
			});
		}
		
	};
	
	return command;

}());