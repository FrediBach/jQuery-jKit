
// ##### Fontsize Command
//
// The [fontsize command](http://jquery-jkit.com/commands/fontsize.html) can be used to change the size of text. 
// It can be limited to specific elements. You can even use it to change other CSS related sizes, for example the 
// width of an element, with the **style** option.

plugin.commands.fontsize = (function(){
	
	// Create an object that contains all of our data and functionality.
	
	var command = {};
	
	// This are the command defaults:
	
	plugin.addCommandDefaults('fontsize', {
		'steps': 			2,
		'min': 				6,
		'max': 				72,
		'affected':			'p',
		'style': 			'font-size'
	});
	
	// The execute function is launched whenever this command is executed:
	
	command.execute = function($that, options){
		
		$that.on( 'click', function(){
			
			$element.find(options.affected).each( function(){
				
				var newsize = parseInt($(this).css(options.style)) + parseInt(options.steps);
				
				if (newsize >= parseInt(options.min) && newsize <= parseInt(options.max) ){
					$(this).css(options.style, newsize );
				}
			
			});
			
			plugin.triggerEvent('changed', $that, options);
			
			return false;
		});
		
	};
	
	return command;

}());