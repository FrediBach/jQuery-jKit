
// ##### Remove Command
//
// The [remove command](http://jquery-jkit.com/commands/remove.html) is used to completely remove the element 
// from the DOM.

plugin.commands.remove = (function(){
	
	// Create an object that contains all of our data and functionality.
	
	var command = {};
	
	// This are the command defaults:
	
	plugin.addCommandDefaults('remove', {
		'delay':			0
	});
	
	// The execute function is launched whenever this command is executed:
	
	command.execute = function($that, options){
		
		$that.delay(options.delay).hide(0, function(){
			$that.remove();
			plugin.triggerEvent('complete', $that, options);
		});
		
	};
	
	return command;

}());