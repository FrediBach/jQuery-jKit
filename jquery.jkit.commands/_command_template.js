
// ##### Command Template
//
// This is a template for commands. It should be used as a starting point to create new commands.

plugin.commands.yourcommandname = (function(){
	
	// Create an object that contains all of our data and functionality.
	
	var command = {};
	
	// This are the command defaults:
	
	plugin.addCommandDefaults('yourcommandname', {
		'option1':			'value1',
		'option2':			'value1'
	});
	
	// The execute function is launched whenever this command is executed:
	
	command.execute = function($that, options){
		// Put your command code here ...
	};
	
	// Add local functions and variables here ...
	
	return command;

}());