
// ##### Background Command
//
// The [background command](http://jquery-jkit.com/commands/background.html) adds an image to the background
// that is scaled to the full width and height of the window, either skewed or just zoomed.

plugin.commands.background = (function(){
	
	// Create an object that contains all of our data and functionality.
	
	var command = {};
	
	// This are the command defaults:
	
	plugin.addCommandDefaults('background', {
		'distort':			'no'
	});
	
	// The execute function is launched whenever this command is executed:
	
	command.execute = function($that, options){
		
		var s = plugin.settings;
		
		// Create a background element with a negative z-index that is scaled to the full size of the window:
		
		var $bg = $('<div/>', {
			id: s.prefix+'-background'
		}).css({
			'position': 'fixed',
			'right': '0px',
			'top': '0px',
			'overflow': 'hidden',
			'z-index': '-1',
			'width': $(window).width(),
			'height': $(window).height()
		}).appendTo('body');
		
		$bg.append($that);
		
		var ow = $that.attr('width');
		var oh = $that.attr('height');
		
		// Do the correct scaling of the image:
		
		scaleFit($bg, $that, ow, oh, options.distort);
		
		// Rescale the image in case the window size changes:
		
		$(window).resize(function() {
			scaleFit($bg, $that, ow, oh, options.distort);
			plugin.triggerEvent('resized', $that, options);
		});
		
	};
	
	// The **scaleFit** function calculates the correct
	// with, height of the image relative to the window and the correct position inside that
	// window based on those dimensions.
	
	scaleFit = function(bg, element, originalWidth, originalHeight, distort){
		
		// First set some basic values. We basically just scale the image to the 
		// full width and height of the window.
		
		var w = $(window).width();
		var h = $(window).height();
		
		bg.css({
			'width': w+'px',
			'height': h+'px'
		});
		
		var top = 0;
		var left = 0;
		
		// If we don't want to distort the image, we now have to do some additional calculations:
		
		if (distort == 'no'){
			
			var imgRatio = originalWidth / originalHeight;
			var screenRatio = w / h;
			
			if (imgRatio > screenRatio){
				w = h * imgRatio;
				left = (w - $(window).width()) / 2 * -1;
			} else {
				h = w / imgRatio;
				top = (h - $(window).height()) / 2 * -1;
			}
		
		}
		
		element.css({
			'position': 'fixed',
			'top': top+'px',
			'left': left+'px',
			'width': w+'px',
			'height': h+'px'
		});
	
	};
	
	return command;

}());