
// ##### Encode Command
//
// The [encode command](http://jquery-jkit.com/commands/encode.html) apply various encodings to the content of an element.
// If the option is code, the content is not only HTML encoded, it can even remove the extra tab whitespace you get if you 
// have that content indented inside the code element.

plugin.commands.encode = (function(){
	
	// Create an object that contains all of our data and functionality.
	
	var command = {};
	
	// This are the command defaults:
	
	plugin.addCommandDefaults('encode', {
		'format':			'code',
		'fix': 				'yes'
	});
	
	// The execute function is launched whenever this command is executed:
	
	command.execute = function($that, options){
		
		switch(options.format) {
			case 'code':
				var src = $that.html();
				if (options.fix == 'yes'){
					src = preFix(src);
				}
				$that.html(src.replace(/</g, '&lt;').replace(/>/g, '&gt;'));
				break;
			case 'text':
				$that.html($that.text());
				break;
			case 'esc':
				$that.html(escape($that.html()));
				break;
			case 'uri':
				$that.html(encodeURI($that.html()));
				break;
		}
		
	};
	
	var preFix = function(str){
		
		var lines = str.split("\n");
		var min = 9999;
		
		$.each( lines, function(i,v){
			if ($.trim(v) != ''){
				
				var cnt = -1;
				
				while(v.charAt(cnt+1) == "\t"){
					cnt++;
				}
				cnt++;
				
				if (cnt < min){
					min = cnt;
				}
			
			}
		});
		
		$.each( lines, function(i,v){
			lines[i] = v.substr(min);
		});
		
		return lines.join("\n");
	};
	
	return command;

}());