
// ##### Ajax Command
//
// The [ajax command](http://jquery-jkit.com/commands/ajax.html) can do a few thing. The normal use case is a link 
// that loads some extra content through an ajax call on click. But the command can be used to lazy load images, too.

plugin.commands.ajax = (function(){
	
	// Create an object that contains all of our data and functionality.
	
	var command = {};
	
	// This are the command defaults:
	
	plugin.addCommandDefaults('ajax', {
		'animation':		'slide',
		'speed':			250,
		'easing':			'linear',
		'when': 			'click'
	});
	
	// The execute function is launched whenever this command is executed:
	
	command.execute = function($that, options){
		
		var s = plugin.settings;
		
		// If the href option is set, take it from the option, if not, take it from our element: 
		
		if (options.href != undefined && options.href != ''){
			var href = options.href;
		} else {
			var href = $that.attr('href');
		}
		
		if (options.when == 'load' || options.when == 'viewport' || options.when == 'shown'){
			
			// If the option **when** is **load*, than we're just loading the content:
			
			if (options.when == 'load'){
				$that.load(href, function(){
					plugin.triggerEvent('complete', $that, options);
				});
				
			// If it's **viewport** or **shown**, we're going to wait till the content enters the viewport or is being shown (think resonsive) before 
			// we load the content or the image (lazy load), whatever our options say:
				
			} else {
				var myInterval = setInterval(function(){
					if ( (options.when == 'viewport' && ($that.jKit_inViewport() || !$that.jKit_inViewport() && s.ignoreViewport)) || (options.when == 'shown' && $that.css('display') != 'none') ){
						if (options.src != undefined){
							$that.attr('src', options.src);
							plugin.triggerEvent('complete', $that, options);
						} else {
							$that.load(href, function(){
								plugin.init($that);
								plugin.triggerEvent('complete', $that, options);
							});
						}
						window.clearInterval(myInterval);
					}
				},100);
			}
		
		// This is our default use case, load the content on click:
			
		} else {
			$that.on('click', function(){
				loadAndReplace(href, options, $that);
				return false;
			});
		}
		
	};
	
	var loadAndReplace = function(href, options, $el){
		
		// Create an unique temporary id we can use to store and access our loaded content.
		
		var tempid = plugin.settings.prefix+'_ajax_temp_'+$.fn.jKit_getUnixtime();
		
		// Hide the affected element:
		
		$(options.element).jKit_effect(false, options.animation, options.speed, options.easing, 0, function(){
			
			// Prepare the current element and create a div we use to store the loaded content:
			
			$(options.element).html('');
			
			jQuery('<div/>', {
				id: tempid
			}).appendTo('body');
			
			// Load the content from the supplied url and tell jQuery which element we need from it:
			
			$('#'+tempid).load(href+' '+options.element, function() {
				
				// Add the content from our temporary div to our real element and initialize the content
				// in case there are an jKit commands on it:
				
				$(options.element).html( $('#'+tempid+' '+options.element).html() );
				plugin.init($(options.element));
				
				// Trigger some stuff and show the content we just added:
				
				plugin.triggerEvent('complete', $el, options);
				
				$(options.element).jKit_effect(true, options.animation, options.speed, options.easing);
				
				if (options.macro != undefined) plugin.applyMacro($(options.element), options.macro);
				
				// Remove our temporary item:
				
				$('#'+tempid).remove();
			
			});
		
		});
	
	};
	
	return command;

}());