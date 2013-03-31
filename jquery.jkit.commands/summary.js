
// ##### Summary Command
//
// The [summary command](http://jquery-jkit.com/commands/summary.html) creates a summary on specific content, for example the headers in a content div.
// The summary itself is either a linked list or a dropdown with automated events.

plugin.commands.summary = (function(){
	
	// Create an object that contains all of our data and functionality.
	
	var command = {};
	
	// This are the command defaults:
	
	plugin.addCommandDefaults('summary', {
		'what': 			'',
		'linked': 			'yes',
		'from': 			'',
		'scope': 			'children',
		'style': 			'ul',
		'indent': 			'no'
	});
	
	// The execute function is launched whenever this command is executed:
	
	command.execute = function($that, options){
		
		var s = plugin.settings;
		
		var output = '';
		var jumpid = '';
		
		var pre = ''
		if (options.scope == 'children'){
			pre = '> ';
		}
		
		if (options.what == 'headers'){
			options.what = ':header';
		}
		
		$(options.from).find(pre+options.what).each( function(){
			
			var $current = $(this);
			
			// If we're using all headers for our summary, than we have to do some extra work to get them
			// indented correctly.
			
			var space = '';
			if (options.what == ':header' && options.indent == 'yes'){
				var tag = $current.prop('tagName');
				if (tag.length == 2 && tag[1] != ''){
					var spaces = tag[1]-1;
					for (var i=1; i<=spaces;i++){
						space += '&nbsp; &nbsp; ';
					}
				}
			}
			
			// A summary can either be linked or just text:
			
			if (options.linked == 'yes'){
				
				if ($current.attr('id') !== undefined){
					var id = $current.attr('id');
				} else {
					var id = s.prefix+'-uid-'+(++uid);
					$current.attr('id', id);
				}
				
				if (window.location.hash == '#'+id){
					jumpid = id;
				}
				
				if (options.style == 'select'){
					output += '<option value="'+id+'">'+space+$(this).text()+'</option>';
				} else {
					output += '<li><a href="#'+id+'">'+space+$(this).text()+'</a></li>';
				}
				
			} else {
				if (options.style == 'select'){
					output += '<option value="">'+space+$(this).text()+'</option>';
				} else {
					output += '<li>'+space+$(this).text()+'</li>';
				}
			}
		});
		
		if (output != ''){
			
			$that.html('<'+options.style+'>'+output+'</'+options.style+'>');
			
			// In case this is a dropdown summary that is linked, we have to manually add 
			// an event on change so we can jump to the anchors as needed:
			
			if (options.style == 'select' && options.linked == 'yes'){
				$that.find('select').on( 'change', function(){
					window.location.hash = '#'+$(this).val();
					$(this).blur();
				});
			}
			
			// And lastly if we create a select and have detected a hash, we need to set that select to the correct value
			// and jump to the correct element:
			
			if (options.style == 'select' && options.linked == 'yes' && jumpid != ''){
				
				$that.find('select').val(jumpid);
				
				if ($that.find('#'+jumpid).offset() !== undefined){
					var ypos = $that.find('#'+jumpid).offset().top;
					$('html, body').css({ scrollTop: ypos+'px' });
				}
				
			}
			
		}
		
	};
	
	return command;

}());