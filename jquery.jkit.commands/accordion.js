
// ##### Accordion Command
//
// The [accordion command](http://jquery-jkit.com/commands/accordion.html) creates a content navigation
// that acts like an accordion.

plugin.commands.accordion = (function(){
	
	// Create an object that contains all of our data and functionality.
	
	var command = {};
	
	// This are the command defaults:
	
	plugin.addCommandDefaults('accordion', {
		'active':			1,
		'animation':		'slide',
		'speed':			250,
		'easing':			'linear'
	});
	
	// The execute function is launched whenever this command is executed:
	
	command.execute = function($that, options){
		
		var s = plugin.settings;
		
		// First try to find out which kind of HTML elements are used to structure the data:
		
		var containerTag = plugin.findElementTag($that, '>', 'max', 'div');
		var titleTag = plugin.findElementTag($that, '> '+containerTag+' >', 0, 'h3');
		var contentTag = plugin.findElementTag($that, '> '+containerTag+' >', 1, 'div');
		
		// Next we need to create an array that contains all the titles and content (yes, this
		// is so similar to the tabs command, that even the array is called "tabs"):
		
		// {!} task: Can we save code if we combine this one and the tab command? They are very similar!
		
		var tabs = [];
		$that.children(containerTag).each( function(){
			tabs.push({
				'title': $(this).children(titleTag).detach(),
				'content': $(this).children(contentTag).detach()
			});
		});
		
		// Prepare the original element so that we can add the navigation:
		
		$that.html('');
		var $tabnav = $('<ul/>', { }).appendTo($that);
		
		var current = 1;
		if (options.active == 0) current = -1;
		
		// Loop through each element and create the correct data structure with all events and animations:
		
		$.each( tabs, function(index, value){
			
			var $litemp = $('<li/>', { }).append(value.title).css('cursor', 'pointer').appendTo($tabnav);
			
			if (options.active-1 == index){
				$litemp.append(value.content).children(titleTag).addClass(s.activeClass);
				current = index;
			} else {
				$litemp.append(value.content.hide());
			}
			
			$litemp.find('> '+titleTag).on( 'click', function(e){
				if (index != current){
					plugin.triggerEvent('showentry showentry'+(index+1), $that, options);
					$tabnav.find('> li > '+titleTag).removeClass(s.activeClass);
					$(this).addClass(s.activeClass);
					if (options.animation == 'slide'){
						$tabnav.find('> li:nth-child('+(current+1)+') > '+contentTag).slideUp(options.speed, options.easing);
						$tabnav.find('> li:nth-child('+(index+1)+') > '+contentTag).slideDown(options.speed, options.easing);
					} else {
						$tabnav.find('> li:nth-child('+(current+1)+') > '+contentTag).hide();
						$tabnav.find('> li:nth-child('+(index+1)+') > '+contentTag).show();
					}
					current = index;
				} else {
					plugin.triggerEvent('hideentry hideentry'+(index+1), $that, options);
					$(this).removeClass(s.activeClass).next().slideUp(options.speed, options.easing);
					current = -1;
				}
			});
		
		});
		
	};
	
	// Add local functions and variables here ...
	
	return command;

}());