
// ##### Filter Command
//
// The [filter command](http://jquery-jkit.com/commands/filter.html) lets you filter DOM nodes based on some input.

plugin.commands.filter = (function(){
	
	// Create an object that contains all of our data and functionality.
	
	var command = {};
	
	// This are the command defaults:
	
	plugin.addCommandDefaults('filter', {
		'by': 				'class',
		'affected': 		'',
		'animation':		'slide',
		'speed':			250,
		'easing':			'linear',
		'logic': 			'and',
		'global': 			'no'
	});
	
	// The execute function is launched whenever this command is executed:
	
	command.execute = function($that, options){
		
		// The filter has to run on init and after every change of elements that have the **jkit-filter** class, 
		// so we have our own function we can call on all those events, the **filterElements** function, and 
		// let that function do all the hard work.
		
		$that.find('.jkit-filter').each( function(){
			$(this)
				.data('oldval', $.trim( $(this).val() ) )
				.on( 'change click input', function(){
					
					if ( $.trim( $(this).val() ) != $(this).data('oldval') ){
						
						$(this).data('oldval', $.trim( $(this).val() ) );
						
						if (options.loader !== undefined) $(options.loader).show();
						plugin.triggerEvent('clicked', $that, options);
						
						filterElements($that, options);
						
					}
					
				});
		});
		
		// In case there's already a filter value set, we need to trigger the filtering right now:
		
		$that.find('.jkit-filter').each( function(){
			if ($.trim($(this).val()) != ''){
				
				if (options.loader !== undefined) $(options.loader).show();
				plugin.triggerEvent('clicked', $that, options);
				filterElements($that, options);
				
				return false;
			}
		});
		
	};
	
	// The **filterElements** function is used by the filter command. It's doing the heavy lifting for the command.
	
	var filterElements = function($el, options){
		
		// First we need to go through each filter element to find out by what we have to filter the affected
		// elemnts. We're splitting each elements value to get the separate words into an array.
		
		var selections = [];
		
		$el.find('.jkit-filter').each( function(){
			var vals = [];
			var valsplit = $(this).val().split(' ');
			$.each( valsplit, function(i,v){
				v = $.trim(v);
				if (v != '') vals.push(v);
			});
			selections = selections.concat(vals);
		});
		
		// Where do we have to look for our affected DOM nodes? Inside the body or inside the current element?
		
		if (options.global == 'yes'){
			$container = $('body');
		} else {
			$container = $el;
		}
		
		// Loop through all affected elements and check if they have to be displayed or not.
		
		$container.find(options.affected).each( function(){
			
			// First create a few cashes to speed up the following loop through the filter selections:
			
			var $current = $(this);
			
			if (options.by == 'text'){
				var currentText = $current.text().toLowerCase();
			}
			
			if (selections.length > 0){
				
				// As we have two options, one where we need to find each selection and one where we
				// only have to find one of the selections, we first have to create an array with all
				// found selections:
				
				var found = [];
				
				$.each( selections, function(i,v){
					if (options.by == 'class'){
						if ($current.hasClass(v)){
							found.push(v);
						}
					} else if (options.by == 'text'){
						if (currentText.indexOf(v.toLowerCase()) > -1){
							found.push(v);
						}
					}
				});
				
				// Hide or show the element based on our search result:
				
				if ( found.length == selections.length || (found.length > 0 && options.logic == 'or') ){
					$current.jKit_effect(true, options.animation, options.speed, options.easing, 0);
				} else {
					$current.jKit_effect(false, options.animation, options.speed, options.easing, 0);
				}
			
			} else {
				$current.jKit_effect(true, options.animation, options.speed, options.easing, 0);
			}
		
		});
		
		// Fire the complete event at the right time and hide the optional loader animation:
		
		setTimeout( function(){
			if (options.loader !== undefined) $(options.loader).hide();
			plugin.triggerEvent('complete', $el, options);
		}, options.speed);
	
	};
	
	return command;

}());