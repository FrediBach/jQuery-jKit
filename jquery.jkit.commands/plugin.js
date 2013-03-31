
// ##### Plugin Command
//
// The [plugin command](http://jquery-jkit.com/commands/plugin.html) makes it possible to add jQuery plugins
// that can be used the same way as jKit commands.

plugin.commands.plugin = (function(){
	
	// Create an object that contains all of our data and functionality.
	
	var command = {};
	
	// This are the command defaults:
	
	plugin.addCommandDefaults('plugin', {
		'script': 			''
	});
	
	// The execute function is launched whenever this command is executed:
	
	command.execute = function($that, options){
		
		var s = plugin.settings;
		
		// First check if this is a plugin we registered on plugin init:
		
		if (s.plugins[options.script] != undefined){
			
			options.functioncall = s.plugins[options.script]['fn'];
			if (s.plugins[options.script]['option'] != undefined){
				options.option = s.plugins[options.script]['option'];
			}
			
			options.script = s.plugins[options.script]['path'];
		}
		
		// Temporarly enable ajax caching:
		
		$.ajaxSetup({ cache: true });
		
		// 
		
		if (options.script != undefined){
			
			// Load the script from the server:
			
			$.getScript(options.script, function() {
				
				// The plugin has loaded, now all we need to do is correctly initialize it
				// by calling the correct function name with the correct set of parameters:
				
				if (options.option != undefined){
					$that[ options.functioncall ]( options[options.option] );
				} else {
					delete(options.type);
					delete(options.script);
					$that[ options.functioncall ]( options );
				}
				
				plugin.triggerEvent('complete', $that, options);
			
			});
		}
		
		// Stop ajax caching again:
		
		$.ajaxSetup({ cache: false });
		
	};
	
	return command;

}());