
// ##### Split Command
//
// The [split command](http://jquery-jkit.com/commands/split.html) can take a string, for example a comma separeted one, 
// and create new HTML elements out of the individual parts. This way a simple comma separated list can be transformed 
// into an unordered list.

plugin.commands.split = (function(){
	
	// Create an object that contains all of our data and functionality.
	
	var command = {};
	
	// This are the command defaults:
	
	plugin.addCommandDefaults('split', {
		'separator': 		'',
		'container': 		'span',
		'before':			'',
		'after':			''
	});
	
	// The execute function is launched whenever this command is executed:
	
	command.execute = function($that, options){
		
		var parts = $that.text().split(options.separator);
		$that.html('');
		
		$.each( parts, function(i,v){
			$('<'+options.container+'/>').text(v).appendTo($that);
		});
		
		$that.html(options.before+$that.html()+options.after);
		
	};
	
	return command;

}());