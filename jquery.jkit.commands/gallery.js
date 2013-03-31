
// ##### Gallery Command
//
// The [gallery command](http://jquery-jkit.com/commands/gallery.html) takes a bunch of images and creates
// a gallery out of it.

plugin.commands.gallery = (function(){
	
	// Create an object that contains all of our data and functionality.
	
	var command = {};
	
	// This are the command defaults:
	
	plugin.addCommandDefaults('gallery', {
		'active':			1,
		'event':			'click',
		'showcaptions':		'yes',
		'animation':		'none',
		'speed':			500,
		'easing':			'linear',
		'lightbox': 		'no'
	});
	
	// The execute function is launched whenever this command is executed:
	
	command.execute = function($that, options){
		
		var s = plugin.settings;
		var type = 'gallery';
		
		// First get all images into an array:
		
		var images = $that.children();
		
		// Now put the active image only into the original element:
		
		$that.html($that.children(':nth-child('+options.active+')').clone());
		
		// In case we need additional lightbox functionality, add it:
		
		if (options.lightbox == 'yes'){
			plugin.executeCommand($that.find('img'), 'lightbox', {});
		}
		
		// Create the element that will contain the thumbnails and insert it after the gallery:
		
		var $thumbdiv = $('<div/>', {
			id: s.prefix+'-'+$that.attr('id')+'-'+type+'-thumbs'
		}).addClass(s.prefix+'-'+type+'-thumbs').insertAfter($that);
		
		// In case we want to show image captions, create an element for it:
		
		if (options.showcaptions == 'yes'){
			var $captiondiv = $('<div/>', {
				id: s.prefix+'-'+$that.attr('id')+'-'+type+'-captions'
			}).addClass(s.prefix+'-'+type+'-captions').text($(images[options.active-1]).attr('title')).insertAfter($that);
		}
		
		// Now loop through all images and add them to the thumbnail div. Add the correct events and 
		// animations to each of them and optionally the lightbox functionality.
		
		$.each( images, function(index, value){
			
			if (options.event != 'click' && options.lightbox == 'yes'){
				plugin.executeCommand($(value), 'lightbox', { 'group': s.prefix+'-'+$that.attr('id')+'-'+type });
			}
			
			if (options.active-1 == index){
				$(value).addClass(s.activeClass);
			}
			
			$(value)
				.on( options.event, function() {
					
					plugin.triggerEvent('hideentry', $that, options);
					
					$that.jKit_effect(false, options.animation, options.speed, options.easing, 0, function(){
						$that.find('img').attr('src', $(value).attr('src'));
						
						if (options.lightbox == 'yes'){
							plugin.executeCommand($that.find('img').unbind('click'), 'lightbox', {});
						}
						
						plugin.triggerEvent('showentry showentry'+(index+1), $that, options);
						
						$that.jKit_effect(true, options.animation, options.speed, options.easing, 0);
						$thumbdiv.find('img').removeClass(s.activeClass);
						$(value).addClass(s.activeClass);
						
						if (options.showcaptions == 'yes'){
							$captiondiv.text($(value).attr('title'));
						}
					});
						
				})
				.css({ 'cursor': 'pointer' })
				.appendTo($thumbdiv);
		});
		
	};
	
	return command;

}());