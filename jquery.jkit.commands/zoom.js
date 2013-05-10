
// ##### Zoom Command
//
// The [zoom command](http://jquery-jkit.com/commands/zoom.html) makes it possible to zoom into images on mouseover. To do that it 
// overlays the selected image with a div that has that image as its background.

plugin.commands.zoom = (function(){
	
	// Create an object that contains all of our data and functionality.
	
	var command = {};
	
	// This are the command defaults:
	
	plugin.addCommandDefaults('zoom', {
		'scale': 			2,
		'speed': 			150,
		'lightbox':			'no'
	});
	
	// The execute function is launched whenever this command is executed:
	
	command.execute = function($that, options){
		
		var s = plugin.settings;
		var type = 'zoom';
		
		$that.parent().css('position', 'relative');
		
		$that.on( 'mouseover', function(){
			
			var pos = $that.position();
			var height = $that.height();
			var width = $that.width();
			
			var $zoom = $('<div/>', {
				'class': s.prefix+'-'+type+'-overlay'
			}).css( {
				'position': 'absolute',
				'height': height+'px',
				'width': width+'px',
				'left': pos.left + 'px',
				'top': pos.top + 'px',
				'overflow': 'hidden',
				'background-image': 'url('+$that.attr('src')+')',
				'background-repeat': 'no-repeat',
				'background-color': '#000',
				'opacity': 0
			}).on( 'mouseout', function(){
				$zoom.fadeTo(options.speed, 0, function(){
					$zoom.remove();
					plugin.triggerEvent('zoomout', $that, options);
				});
			}).mousemove(function(e){
				
				// Detect the mouse poition relative to the selected image:
				
				var offset = $(this).offset();
				
				var x = (e.pageX - offset.left) * (options.scale-1);
				var y = (e.pageY - offset.top) * (options.scale-1);
				
				// And than move the background image of the overlayed div:
				
				$zoom.css('background-position', '-'+x+'px -'+y+'px');
			
			}).fadeTo(options.speed, 1, function(){
				plugin.triggerEvent('zoomin', $that, options);
			}).insertAfter($that);
			
			// Optionally add a lightbox to the overlay image:
			
			if (options.lightbox == 'yes'){
				plugin.executeCommand($zoom, 'lightbox', {});
			}
		
		});
		
	};
	
	return command;

}());