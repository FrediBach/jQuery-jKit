
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
		'color':			'#fff',
		'background':		'#000',
		'classname':		''
	});
	
	// The execute function is launched whenever this command is executed:
	
	command.execute = function($that, options){
		
		var s = plugin.settings;
		
		// Create the tooltip div if it doesn't already exist:
		
		if ($('div#'+s.prefix+'-tooltip').length == 0){
			$('<div/>', {
				id: s.prefix+'-tooltip'
			}).hide().appendTo('body');
		}
		
		$tip = $('div#'+s.prefix+'-tooltip');
		
		// Display the tooltip on mouseenter:
		
		$that.on('mouseenter', function(e){
			
			// Has this tooltip custom styling either by class or by supplying color values?
			
			if (options.classname != ''){
				$tip.html(options.text).removeClass().css({ 'background': '', 'color': '' }).addClass(options.classname);
			} else {
				$tip.html(options.text).removeClass().css({ 'background': options.background, 'color': options.color });
			}
			
			// Correctly position the tooltip based on the mouse position:
			
			$tip.css('top', (e.pageY+15-$(window).scrollTop())).css('left', e.pageX);
			
			// Fix the tooltip position so that we don't get tooltips we can't read because their outside
			// the window:
			
			if ( parseInt($tip.css('left')) > $(window).width() / 2 ){
				$tip.css('left', '0px').css('left', e.pageX - $tip.width());
			}
			
			// Stop any possible previous animations and start fading it in:
			
			$tip.stop(true, true).fadeIn(200);
			
			plugin.triggerEvent('open', $that, options);
		
		
		// Fade out the tooltip on mouseleave:
		
		}).on('mouseleave click', function(e){
			
			var speed = 200;
			if ($tip.is(':animated')){
				speed = 0;
			}
			
			$tip.stop(true, true).fadeOut(speed);
			
			plugin.triggerEvent('closed', $that, options);
		
		});
		
	};
	
	return command;

}());