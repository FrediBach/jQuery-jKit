
// ##### Cycle Command
//
// The [cycle command](http://jquery-jkit.com/commands/cycle.html) let's you "cycle" through
// a sequence of values and apply them to a set of DOM nodes. This can be classes, html, attributes or css.

plugin.commands.cycle = (function(){
	
	// Create an object that contains all of our data and functionality.
	
	var command = {};
	
	// This are the command defaults:
	
	plugin.addCommandDefaults('cycle', {
		'what': 			'class',
		'where': 			'li',
		'scope': 			'children',
		'sequence': 		'odd,even'
	});
	
	// The execute function is launched whenever this command is executed:
	
	command.execute = function($that, options){
		
		var s = plugin.settings;
		
		var seq = options.sequence.split(s.delimiter);
		var pos = 0;
		
		var sel = options.where;
		if (options.scope == 'children'){
			sel = '> '+sel;
		}
		
		$that.find(sel).each( function(){
			if (seq[pos] != undefined && seq[pos] != ''){
				switch(options.what){
					case 'class':
						$(this).addClass(seq[pos]);
						break;
					case 'html':
						$(this).html(seq[pos]);
						break;
					default:
						
						// If it's not a class or html, it has to be a dot separated combination like for exmaple
						// **css.color** or **attr.id**, so split it:
					
						var what = options.what.split('.');
						if (what[0] == 'attr'){
							$(this).attr(what[1], seq[pos]);
						} else if (what[0] == 'css'){
							$(this).css(what[1], seq[pos]);
						}
				}
			}
			pos++;
			if (pos > seq.length-1) pos = 0;
		});
		
	};
	
	return command;

}());