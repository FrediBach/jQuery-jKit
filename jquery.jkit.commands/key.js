
// ##### Key Command
//
// The [key command](http://jquery-jkit.com/commands/key.html) let's us create hotkeys 
// for links. If thge link has an **onclick** attribute, we fire that one, if not, we're just 
// going to open the href, either as a popup or inside the same window, whatever the target 
// attribute tells us.

plugin.commands.key = (function(){
	
	// Create an object that contains all of our data and functionality.
	
	var command = {};
	
	// This are the command defaults:
	
	plugin.addCommandDefaults('key', {});
	
	// The execute function is launched whenever this command is executed:
	
	command.execute = function($that, options){
		
		if (options.code != undefined){
			
			// First we need to add the event handling for this keycode to the element ...
			
			plugin.addKeypressEvents($that, options.code);
			
			// Because only now we can listen to it:
			
			$that.on( options.code, function(){
				if ($that.attr('onclick') !== undefined){
					$that.click();
				} else {
					if ($that.attr('target') !== undefined && $that.attr('target') == '_blank'){
						
						// Sadly we can't open pages in a new tab or regular window, so we have to open it in a popup instead:
						
						window.open($that.attr('href'), '_blank', false);
					} else {
						window.location.href = $that.attr('href');
					}
				}
				if (options.macro != undefined) plugin.applyMacro($that, options.macro);
				plugin.triggerEvent('pressed', $that, options);
			});
		
		}
		
	};
	
	return command;

}());