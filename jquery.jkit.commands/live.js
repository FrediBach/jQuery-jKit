
// ##### Command Template
//
// This is a template for commands. It should be used as a starting point to create new commands.

plugin.commands.live = (function(){
	
	// Create an object that contains all of our data and functionality.
	
	var command = {};
	
	// This are the command defaults:
	
	plugin.addCommandDefaults('live', {
		'interval': 		60
	});
	
	// The execute function is launched whenever this command is executed:
	
	command.execute = function($that, options){
		
		if ($that.attr('src') !== undefined) {
			window.setInterval( function() {
				updateSrc($that, options);
				plugin.triggerEvent('reloaded', $that, options);
			}, options.interval*1000);
		}
		
	};
	
	// The **updateSrc** function changes the src url in a way that forces the browser
	// to reload the src from the server.
	
	var updateSrc = function($el, options){
		
		if ((windowhasfocus || !windowhasfocus && plugin.settings.ignoreFocus) && ($el.jKit_inViewport() || !$el.jKit_inViewport() && plugin.settings.ignoreViewport)){
			
			var srcSplit = $el.attr('src').split('?');
			
			$el.attr('src', srcSplit[0]+'?t='+$.fn.jKit_getUnixtime());
		
		}
	
	};
	
	return command;

}());