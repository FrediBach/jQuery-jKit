
// ##### Random Command
//
// The [random command](http://jquery-jkit.com/commands/random.html) can be used to randomly select a 
// specific amount of elements from a collection of elements. All not selected ones will either be hidden 
// or completely removed from the DOM.

plugin.commands.random = (function(){
	
	// Create an object that contains all of our data and functionality.
	
	var command = {};
	
	// This are the command defaults:
	
	plugin.addCommandDefaults('random', {
		'count': 			1,
		'remove': 			'yes'
	});
	
	// The execute function is launched whenever this command is executed:
	
	command.execute = function($that, options){
		
		var childs = $that.children().size();
		var shownrs = [];
		
		// Create an array of index numbers of our randomly selected elements:
		
		while(shownrs.length < options.count){
			var shownr = Math.floor(Math.random() * childs);
			if ($.inArray(shownr, shownrs) == -1){
				shownrs.push(shownr);
			}
		}
		
		// Now loop through all elements and only show those we just slected:
		
		var i = 0;
		$that.children().each( function(){
			if ($.inArray(i, shownrs) == -1){
				if (options.remove == 'yes'){
					$(this).remove();
				} else {
					$(this).hide();
				}
			} else {
				$(this).show();
			}
			i++;
		});
		
	};
	
	return command;

}());