
// ##### Replace Command
//
// The [replace command](http://jquery-jkit.com/commands/replace.html) makes it possible to replace content 
// based on a regex pattern. It acts on the HTML level, so not only text is replacable!

plugin.commands.replace = (function(){
	
	// Create an object that contains all of our data and functionality.
	
	var command = {};
	
	// This are the command defaults:
	
	plugin.addCommandDefaults('replace', {
		'modifier': 		'g',
		'search': 			'',
		'replacement': 		''
	});
	
	// The execute function is launched whenever this command is executed:
	
	command.execute = function($that, options){
		
		var str = new RegExp(options.search, options.modifier);
		$that.html($that.html().replace(str,options.replacement));
		
	};
	
	return command;

}());