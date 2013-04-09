
// ##### Template Command
//
// The [template command](http://jquery-jkit.com/commands/template.html) implements a simple 
// templating engine.

plugin.commands.template = (function(){
	
	// Create an object that contains all of our data and functionality.
	
	var command = {};
	
	command.templates = {};
	
	// This are the command defaults:
	
	plugin.addCommandDefaults('template', {
		'action': 			'set',
		'name':				'template',
		'dynamic': 			'no',
		'addhtml': 			'+'
	});
	
	// The execute function is launched whenever this command is executed:
	
	command.execute = function($that, options){
		
		var s = plugin.settings;
		
		// Apply a template or define a new one?
		
		if (options.action == 'apply'){
			
			$el = $that;
			
			// Do we have to apply the template to more than one element?
			
			if (options.children != undefined && options.children != ''){
				
				$el = $that.children(options.children);
				
				var cnt = 0;
				$el.each( function(){
					cnt++;
					applyTemplate($(this), options, cnt, $el.length);
				});
			} else {
				applyTemplate($that, options);
			}
			
			// If this is a dynamic template, we need to create the *add div* that
			// acts like a button and adds a new element with the correct options:
			
			if (options.dynamic == 'yes'){
				var $addDiv = $('<a/>', {
					'class': s.prefix+'-'+type+'-add'
				}).html(options.addhtml).on( 'click', function(){
					
					$el = $($that.get(0));
					
					var cnt = $el.children(options.children).length + 1;
					
					$el.find('.if-entry-last').hide();
					applyTemplate($('<'+options.children+'/>').appendTo($el), options, cnt, cnt);
					
					plugin.triggerEvent('added', $that, options);
				
				}).insertAfter($that);
			
			}
		
		} else {
			
			// Templates are stored in a "global" plugin array:
			
			if (command.templates[options.name] == undefined){
				command.templates[options.name] = [];
			}
			
			// Define the dynamic variables:
			
			if (options.vars == undefined){
				var vars = [];
			} else {
				var vars = options.vars.split(s.delimiter);
			}
			
			// Add the template to the "global" array:
			
			command.templates[options.name] = { 'template': $that.detach(), 'vars': vars };
		
		}
		
	};
	
	// The **applyTemplate** function is used by the template command. It adds the template with all it's
	// options to the suoplied element.
	
	var applyTemplate = function($el, options, cnt, entries){
		
		// Loop through each template variable, find the correct element inside the supplied content element,
		// init each of the elements in case there are any jKit commands on them and finally store the value or HTML
		// in an array.
		
		var content = {};
		$.each( command.templates[options.name].vars, function(i,v){
			var $subEls = $el.find('.'+v);
			plugin.init($subEls);
			if ($subEls.val() != ''){
				content[v] = $subEls.val();
			} else {
				content[v] = $subEls.html();
			}
		});
		
		// Now add the template to the container element:
		
		$el.html(command.templates[options.name].template.clone().show());
		
		// Hide all elements that have an **if-entry-x** class. We later show them again if needed.
		
		$el.find('[class^="if-entry-"]').hide();
		
		// Rename dynamic attributes so that we don't get dublicate ids:
		
		renameDynamicAttributes($el, cnt);
		
		// Add the content and show hidden elements if needed:
		
		$.each( command.templates[options.name].vars, function(i,v){
			
			var $subEl = $el.find('.'+v);
			
			if ($subEl.is("input") || $subEl.is("select") || $subEl.is("textarea")){
				$subEl.val(content[v]);
			} else {
				$subEl.html(content[v]);
			}
			
			if (content[v] == undefined && $el.find('.if-'+v).length > 0){
				$el.find('.if-'+v).remove();
			}
			
			if (cnt == 1) $el.find('.if-entry-first').show();
			if (cnt == entries) $el.find('.if-entry-last').show();
			$el.find('.if-entry-nr-'+cnt).show();
		
		});
	
	};
	
	
	// The **renameDynamicAttributes** function is used by the **plugin.applyTemplate** function. It's 
	// used to rename attributes on dynamic elements so that we get unique elements.
	
	var renameDynamicAttributes = function($el, cnt){
		$el.find('[class^="dynamic-"]').each( function(){
			
			var $subEl = $(this);
			var classList = $(this).attr('class').split(/\s+/);
			
			$.each( classList, function(i,v){
				
				var attribute = v.substr(8);
				
				if (attribute != '' && $subEl.attr(attribute)){
					
					var currentAttr = $subEl.attr(attribute);
					var pos = currentAttr.lastIndexOf('_');
					if (pos > -1){
						currentAttr = currentAttr.substr(0,pos);
					}
					
					$subEl.attr(attribute, currentAttr+'_'+cnt);
				
				}
			
			});
		
		});
	};
	
	return command;

}());