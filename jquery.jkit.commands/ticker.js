
// ##### Ticker Command
//
// The [ticker command](http://jquery-jkit.com/commands/ticker.html) goes through each item of a list and reveals 
// the item one character at a time.

plugin.commands.ticker = (function(){
	
	// Create an object that contains all of our data and functionality.
	
	var command = {};
	
	// This are the command defaults:
	
	plugin.addCommandDefaults('ticker', {
		'speed': 			100,
		'delay': 			2000,
		'loop': 			'yes'
	});
	
	// The execute function is launched whenever this command is executed:
	
	command.execute = function($that, options){
		
		var containerTag = plugin.findElementTag($that, '>', 'max', 'li');
		
		// Create an array with objects that contain all useful information of a single ticker item:
		
		var messages = [];
		
		$that.find(containerTag).each( function(){
			messages.push({
				'href': $(this).find('a').attr('href'),
				'target': $(this).find('a').attr('target'),
				'text': $(this).text()
			});
		});
		
		// Replace the target element with a DIV and start the ticker function:
		
		var $newThat = $('<div/>');
		$that.replaceWith($newThat);
		window.setTimeout( function() { ticker($newThat, options, messages, 0, 0); }, 0);
		
	};
	
	// The **ticker** function runs the ticker.
	
	var ticker = function($el, options, messages, currentmessage, currentchar){
		
		// The **stopped** variable is used in case the ticker isn't looped:
		
		var stopped = false;
		
		// We only run the ticker animation if the element is inside the viewport and the window in focus:
		
		if ((windowhasfocus || !windowhasfocus && plugin.settings.ignoreFocus) && ($el.jKit_inViewport() || !$el.jKit_inViewport() && plugin.settings.ignoreViewport)){
			
			var timer =  options.speed;
			currentchar++;
			
			// Check if we're at the end of the current ticker message. If yes, start with the next message:
			
			if (currentchar > messages[currentmessage].text.length){
				
				timer = options.delay;
				
				currentmessage++;
				if (currentmessage >= messages.length){
					if (options.loop == 'yes' && messages.length > 1){
						currentmessage = 0;
					} else {
						stopped = true;
					}
				}
				
				if (!stopped){
					setTimeout( function(){
						plugin.triggerEvent('showentry showentry'+(currentmessage+1), $el, options);
					}, timer);
				
					currentchar = 0;
				}
			
			// We are still on the same message, so just display the current amaount of characters, either inside a link or
			// as text:
			
			} else {
				if (messages[currentmessage].href != undefined){
					$el.html('<a href="'+messages[currentmessage].href+'" target="'+messages[currentmessage].target+'">'+messages[currentmessage].text.substr(0,currentchar)+'</a>');
				} else {
					$el.html(messages[currentmessage].text.substr(0,currentchar));
				}
			}
		}
		
		// Set a timeout that starts the next step:
		
		if (!stopped){
			window.setTimeout( function() { ticker($el, options, messages, currentmessage, currentchar); }, timer);
		}
	
	};
	
	return command;

}());