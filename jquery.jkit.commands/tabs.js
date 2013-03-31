
// ##### Tabs Command
//
// The [tabs command](http://jquery-jkit.com/commands/tabs.html) is used to create a tab navigation
// of different content elements.

plugin.commands.tabs = (function(){
	
	// Create an object that contains all of our data and functionality.
	
	var command = {};
	
	// This are the command defaults:
	
	plugin.addCommandDefaults('tabs', {
		'active':			1,
		'animation':		'none',
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
		
		// Next we need to create an array the contains all the tab titles and content:
		
		var tabs = [];
		$that.children(containerTag).each( function(){
			tabs.push({ 'title': $(this).children(titleTag).html(), 'content': $(this).children(contentTag).detach() });
		});
		
		// Prepare the original element so that we can add the navigation:
		
		$that.html('');
		var $tabnav = $('<ul/>', { }).appendTo($that);
		
		// We need a jQuery element right now but can only set it after the following loop has finished:  
		
		var $tabcontent = $;
		
		$.each( tabs, function(index, value){
			
			// Create a list element and add it to the tab naviagtion:
			
			var $litemp = $('<li/>', { }).html(value.title).css('cursor', 'pointer').appendTo($tabnav);
			
			// Is this tab active? If yes, add the "active" class:
			
			if (options.active-1 == index){
				$litemp.addClass(s.activeClass);
			}
			
			// Create a callback for each list and fire it on the click event:
			
			// {!} task: Was there a reason for this callback variable? Can't we just use an anonymos function inside the event?
			
			var callback = function(){
				plugin.triggerEvent('showentry showentry'+(index+1), $that, options);
				
				$tabcontent.jKit_effect(false, options.animation, options.speed, options.easing, 0, function(){
					$(this).remove();
					$tabcontent = tabs[index].content.appendTo($that).hide();
					$tabcontent.jKit_effect(true, options.animation, options.speed, options.easing);
				});
				
				$tabnav.find('li').removeClass(s.activeClass);
				$tabnav.find('li:nth-child('+(index+1)+')').addClass(s.activeClass);
			};
			
			$litemp.on( 'click ', function(){
				callback();
			});
			
		});
		
		// Do we have to display an initial content or do we start without a tab selected?
		
		if (tabs[options.active-1] != undefined){
			$tabcontent = tabs[options.active-1].content.appendTo($that);
		}
		
	};
	
	// Add local functions and variables here ...
	
	return command;

}());