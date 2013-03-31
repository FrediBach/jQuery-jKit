
// ##### Paginate Command
//
// The [paginate command](http://jquery-jkit.com/commands/paginate.html) lets you create paginated content.

plugin.commands.paginate = (function(){
	
	// Create an object that contains all of our data and functionality.
	
	var command = {};
	
	// This are the command defaults:
	
	plugin.addCommandDefaults('paginate', {
		'limit': 			'25',
		'by': 				'node',
		'container': 		'',
		'animation':		'none',
		'speed':			250,
		'easing':			'linear',
		'pos': 				'after'
	});
	
	// The execute function is launched whenever this command is executed:
	
	command.execute = function($that, options){
		
		var s = plugin.settings;
		
		if (options.container != ''){
			var $container = $that.find(options.container);
		} else {
			var $container = $that;
		}
		
		if ($that.attr('id') !== undefined){
			var paginateid = s.prefix+'-paginate-'+$that.attr('id');
		} else {
			var paginateid = s.prefix+'-paginate-uid-'+(++uid);
		}
		
		var pages = [];
		var page = [];
		
		// Paginate has two ways to operate, either by node count or by actual element height in pixels.
		// In the **node mode** we put a specific amount of DOM nodes into each entry of the pages array. 
		// In the **height mode** we actually measure the height of each element and only put DOM nodes into the current page 
		// that actually fit into the maximum height the user has set. 
		
		if (options.by == 'node'){
			
			var cnt = 1;
			
			$container.children().each( function(){
				
				cnt++;
				page.push($(this).detach());
				
				if (cnt > Number(options.limit)){
					cnt = 1;
					pages.push(page);
					page = [];
				}
				
			});
			
		} else {
			
			var height = 0;
			
			$container.children().each( function(){
				
				height += $(this).outerHeight();
				
				if (height > Number(options.limit)){
					height = $(this).outerHeight();
					if (page.length > 0){
						pages.push(page);
					}
					page = [];
				}
				
				page.push($(this).detach());
				
			});
			
		}
		
		if (page.length > 0){
			pages.push(page);
		}
		
		if (pages.length > 1){
			
			// Now as we have the pages set up correctly and we actually have more than one, it's time 
			// to create the output DOM structure. The main element always gets the page data and the 
			// actuall pagination is an unordered list we insert after that element.
			
			var $pagination = $('<ul/>', { 'id': paginateid, 'class': s.prefix+'-pagination' });
			
			$.each( pages, function(i,v){
				
				var $pnav = $('<li/>').html(i+1).on( 'click', function(){
					
					plugin.triggerEvent('showpage showpage'+(i+1), $that, options);
					
					$pagination.find('li').removeClass(s.activeClass);
					$(this).addClass(s.activeClass);
					
					$container.jKit_effect(false, options.animation, options.speed, options.easing, 0, function(){
						$container.html('');
						$.each(v, function(index, value){
							value.clone().appendTo($container);
						});
						$container.jKit_effect(true, options.animation, options.speed, options.easing, 0);
					});
					
				});
				
				if (i == 0){
					$pnav.addClass(s.activeClass);
				}
				$pnav.appendTo($pagination);
				
			});
			
			if (options.pos == 'after'){
				$pagination.insertAfter($that);
			} else {
				$pagination.insertBefore($that);
			}
			
			$container.html('');
			$.each(pages[0], function(index, value){
				value.clone().appendTo($container);
			});
			
		}
		
	};
	
	// Add local functions and variables here ...
	
	return command;

}());