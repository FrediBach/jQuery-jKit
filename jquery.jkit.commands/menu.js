
// ##### Menu Command
//
// The [menu command](http://jquery-jkit.com/commands/menu.html) adds some additional features 
// to a CSS based menu.

plugin.commands.menu = (function(){
	
	// Create an object that contains all of our data and functionality.
	
	var command = {};
	
	// This are the command defaults:
	
	plugin.addCommandDefaults('menu', {
		'autoactive': 		'no'
	});
	
	// The execute function is launched whenever this command is executed:
	
	command.execute = function($that, options){
		
		var s = plugin.settings;
		
		// Add an active class to the menu link that matches the current page url:
		
		if (options.autoactive == 'yes'){
			
			var path = window.location.toString().split('#')[0].split("/");
			
			$that.find("a").filter(function() {
				return $(this).attr("href") == path[path.length-1];
			}).addClass(s.activeClass);
			
		}
		
		// Add mouseover events and a click event for touch devices:
		
		$that.find("li").hover(function(){
			
			$(this).addClass("hover");
			$('ul:first',this).css('visibility', 'visible');
		
		}, function(){
			
			$(this).removeClass("hover");
			$('ul:first',this).css('visibility', 'hidden');
		
		}).on( 'click', function(){
			
			$(this).addClass("hover");
			$('ul:first',this).css('visibility', 'visible');
		
		});
		
	};
	
	return command;

}());