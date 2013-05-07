
// ##### Respond Command
//
// The [respond command](http://jquery-jkit.com/commands/respond.html) can helps you create better responsive websites,
// especially if it's built modularly. It makes it possible to use something similar to "Element Queries".

plugin.commands.respond = (function(){
	
	// Create an object that contains all of our data and functionality.
	
	var command = {};
	
	// This are the command defaults:
	
	plugin.addCommandDefaults('respond', {});
	
	// The execute function is launched whenever this command is executed:
	
	command.execute = function($that, options){
		
		// Onlyx run the command if the *width* option is set:
		
		if (options.width != undefined){
			
			// Split the string into an array that contain all widths, sorted from the smallest to the biggest:
			
			var widths = options.width.split(',');
			widths.sort( function(a,b){
				return parseInt(a)-parseInt(b);
			});
			
			// Now execute and bind the **setClasses** function:
			
			setClasses($that, widths);
			
			$(window).resize(function(){
				setClasses($that, widths);
			});
		}
		
	};
	
	// The **setClasses** function sets the ^correct class based on the elements width.
	
	var setClasses = function($that, widths){
		
		// Set some initial variables:
		
		var w = $that.width();
		var responseClass = '';
		
		// Find out which class (if any) we have to set:
		
		for(var x in widths){
			if (parseInt(widths[x]) < w){
				responseClass = plugin.settings.prefix+'-respond-'+widths[x];
			}
		}
		
		// Get all currently set classes and remove them from the element:
		
		if ($that.attr('class') == undefined){
			var classList = [];
		} else {
			var classList = $that.attr('class').split(/\s+/);
		}
		
		$that.removeClass();
		
		// Add all needed classes back to the element together with the respond class:
		
		for(var x in classList){
			if (classList[x].indexOf(plugin.settings.prefix+'-respond') == -1){
				$that.addClass(classList[x]);
			}
		}
		
		$that.addClass(responseClass);
		
	};
	
	return command;

}());