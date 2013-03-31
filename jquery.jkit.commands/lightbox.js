
// ##### Lightbox Command
//
// The [lightbox command](http://jquery-jkit.com/commands/lightbox.html) can be used to overlay a
// bigger version of an image on click, content in an overlayed iframe or to display a modal dialog 
// box above the content.

plugin.commands.lightbox = (function(){
	
	// Create an object that contains all of our data and functionality.
	
	var command = {};
	
	var lightboxes = {};
	
	// This are the command defaults:
	
	plugin.addCommandDefaults('lightbox', {
		'speed': 			500,
		'opacity': 			0.7,
		'clearance': 		200,
		'closer': 			'x',
		'next': 			'>',
		'prev': 			'<',
		'modal': 			'no',
		'width': 			'',
		'height': 			'',
		'titleHeight': 		20,
		'group': 			''
	});
	
	// The execute function is launched whenever this command is executed:
	
	command.execute = function($that, options){
		
		var s = plugin.settings;
		var type = 'lightbox';
		
		// First we need to find out what the source is we're going to display in the lightbox.
		// If the href is set, we take that one, if not we check the src attribute and if that's 
		// not set, we check if the element has a background image:
		
		var src = '';
		if ($that.attr('href') !== undefined) src = $that.attr('href');
		if (src == '' && $that.attr('src') !== undefined) src = $that.attr('src');
		if (src == '' && $that.css('background-image') !== undefined){
			src = $that.css('background-image').replace('"','').replace('"','').replace('url(','').replace(')','');
		}
		
		// In case we didn't find a source, we just ignore this command:
		
		if (src != ''){
			
			// A lightbox can be part of a group of lightbox content, for example to display a gallery of image.
			// To achive this feature, we're using an array that is set on plugin init and available thoughout
			// the whole plugin. 
			
			if (options.group != ''){
				if (lightboxes[options.group] == undefined){
					lightboxes[options.group] = [];
				}
				lightboxes[options.group].push($that);
			}
			
			// A lightbox will always open on click:
			
			$that.on( 'click', function() {
				
				plugin.triggerEvent('clicked', $that, options);
				
				// If this is not a modal window, we have to create an overlay that darkens the 
				// whole content:
				
				if (options.modal == 'no'){
					var $overlay = $('<div/>', {
						id: s.prefix+'-'+type+'-bg',
						'class': s.prefix+'-'+type+'-closer '+s.prefix+'-'+type+'-el'
					}).fadeTo(options.speed, options.opacity).appendTo('body');
				}
				
				// We need another DIV for the content that's placed right above the overlay:
			
				var $content = $('<div/>', {
					id: s.prefix+'-'+type+'-content',
					'class': s.prefix+'-'+type+'-el'
				}).fadeTo(0,0.01).appendTo('body');
				
				// iOS devices need a small hack to display the content correctly in case the
				// page is scrolled:
				
				if ($.fn.jKit_iOS()) $content.css('top', $(window).scrollTop()+'px');
				
				// If there's a fixed width or height set in the options, we have to overwrite the default
				// css values and fix the alignement:
				
				if (options.width != ''){
					$content.css({ 'width': options.width });
					$content.css({ 'left': (($(window).width() - $content.outerWidth()) / 2) + 'px' });
				}
				if (options.height != ''){
					$content.css({ 'height': options.height });
					$content.css({ 'top': (($(window).height() - $content.outerHeight()) / 2) + 'px' });
				}
				
				// Time to create the DOM nodes that contain the navigational elements and close button:
				
				var $nav = $('<div/>', {
					id: s.prefix+'-'+type+'-nav',
					'class': s.prefix+'-'+type+'-el'
				}).hide().fadeTo(options.speed, 1).appendTo('body');
			
				var $closer = $('<span/>', {
					'class': s.prefix+'-'+type+'-closer'
				}).html(options.closer).prependTo($nav);
				
				// The navigational element has to be placed based on the content element:
				
				var offset = $content.offset();
			
				$nav.css({
					'top': (offset.top-options.titleHeight-$(window).scrollTop())+'px',
					'left': (offset.left+$content.outerWidth()-$nav.width())+'px'
				});
				
				// In case this one is part of a group, we need to create the navigation and
				// bind all the needed events to it. Both, the left and the right navigation isn't 
				// always needed, so we have to check for those cases, as well.
				
				if (options.group != ''){
					var $next = $('<span/>', {
						id: s.prefix+'-'+type+'-nav-next'
					}).prependTo($nav);
				
					var $prev = $('<span/>', {
						id: s.prefix+'-'+type+'-nav-prev'
					}).prependTo($nav);
				
					plugin.addKeypressEvents($next, 'right');
					plugin.addKeypressEvents($prev, 'left');
				
					if (lightboxes[options.group][lightboxes[options.group].length-1] != $that){
						$next.html(options.next).on( 'click right', function(){
							$.each(lightboxes[options.group], function(i,v){
								if (v == $that){
									$('.'+plugin.settings.prefix+'-'+type+'-el').fadeTo(options.speed, 0, function(){
										$(this).remove();
									});
									lightboxes[options.group][i+1].click();
								}
							});
						});
					}
					if (lightboxes[options.group][0] != $that){
						$prev.html(options.prev).on( 'click left', function(){
							$.each(lightboxes[options.group], function(i,v){
								if (v == $that){
									$('.'+plugin.settings.prefix+'-'+type+'-el').fadeTo(options.speed, 0, function(){
										$(this).remove();
									});
									lightboxes[options.group][i-1].click();
								}
							});
						});
					}
				}
				
				// The last element we have to create and poistion corrently is the optional content title: 
			
				$title = $('<div/>', {
					id: s.prefix+'-'+type+'-title',
					'class': s.prefix+'-'+type+'-el'
				}).css({
					'top': (offset.top-options.titleHeight-$(window).scrollTop())+'px',
					'left': (offset.left)+'px',
					'width': $content.width()+'px'
				}).hide().text($that.attr('title')).fadeTo(options.speed, 1).appendTo('body');
				
				// Because IE is a stupid browser and doesn't fire the load element correctly in older versions
				// if the image is already in the cash, we have to force load a new version of the image:
				
				if (!$.support.leadingWhitespace){
					src = src+ "?" + new Date().getTime();
				}
				
				// Time to load the image or iframe content. The little trick here is to always try to load 
				// an image, even if there isn't one supplied, because this way we can use the error callback 
				// to find out if we actually have an image or not. As soon as the load event has fired, we
				// can get the width an height and will be able to calculate all the placement and scaling 
				// information we need.
				
				var img = new Image();
				$(img)
					.load(function () {
					
						var scalex = ($(this).outerWidth() + options.clearance) / $(window).width();
						var scaley = ($(this).outerHeight() + options.clearance) / $(window).height();
						var scale = Math.max(scalex,scaley);
						if (scale > 1){
							var oh = $(this).height();
							$(this).width($(this).width() / scale);
							$(this).height(oh / scale);
						}
						
						var xmargin = ( $(window).width() - $(this).outerWidth() ) / 2;
						var ymargin = ( $(window).height() - $(this).outerHeight() ) / 2;
						
						$content
							.width($(this).width())
							.height($(this).height())
							.css({ 'left': xmargin+'px', 'top': ymargin+'px' })
							.fadeTo(options.speed, 1);
						$(this).hide().fadeTo(options.speed, 1);
						
						if ($that.attr('title') != ''){
							$title.css({
								'top': (ymargin-options.titleHeight)+'px',
								'left': xmargin+'px',
								'width': $(this).width()+'px'
							});
						}
					
						$nav.css({
							'top': (ymargin-options.titleHeight)+'px',
							'left': (xmargin+$content.outerWidth()-$nav.width())+'px'
						});
				
					})
					.attr('src', src)
					.appendTo($content)
					.error(function(){
						$content.html('<iframe id="'+s.prefix+'-'+type+'-iframe" src="'+src+'" style="border:none;width:100%;height:100%"></iframe>').fadeTo(options.speed, 1);
					});
				
				// And finally, we make our closing button functional:
				
				$('.'+s.prefix+'-'+type+'-closer').click(function(){
					$('.'+s.prefix+'-'+type+'-el').fadeTo(options.speed, 0, function(){
						$(this).remove();
					});
				});
				
				// Return false so that we stay on the current page:
			
				return false;
		
			});
			
		}
		
	};
	
	// The **closeLightbox** function is used to close the active lightbox programmatically
	// from inside the lightbox content.
	
	plugin.closeLightbox = function(){
		$('.'+plugin.settings.prefix+'-lightbox-el').fadeTo('fast', 0, function(){
			$(this).remove();
		});
	};
	
	return command;

}());