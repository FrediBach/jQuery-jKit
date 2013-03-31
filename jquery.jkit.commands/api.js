
// ##### Command Template
//
// This is a template for commands. It should be used as a starting point to create new commands.

plugin.commands.api = (function(){
	
	// Create an object that contains all of our data and functionality.
	
	var command = {};
	
	// This are the command defaults:
	
	plugin.addCommandDefaults('api', {
		'format': 			'json',
		'value': 			'',
		'url': 				'',
		'interval': 		-1,
		'template': 		''
	});
	
	// The execute function is launched whenever this command is executed:
	
	command.execute = function($that, options){
		
		if (options.url != ''){
			readAPI($that, options);
		}
		
	};
	
	var readAPI = function($el, options){
		
		if (options.format == 'json'){
			
			// Create an ajax jsonp request:
			
			$.ajax({
				type: "GET",
				url: options.url,
				contentType: "application/json; charset=utf-8",
				dataType: "jsonp",
				error: function(){
					plugin.triggerEvent('error', $el, options);
				},
				success: function(data) {
					
					// If a template is supplied in the options, use it to display the data we just received:
					
					if (options.template != '' && plugin.commands.template !== undefined){
						
						// First we add the template HTML to our element:
						
						$el.html(plugin.commands.template.templates[options.template].template.clone().show());
						
						// Than we add the data to each element that has the **data-jkit-api** attribute:
						
						$el.find('[data-jkit-api]').each(function(){
							var value = $(this).attr('data-jkit-api');
							try {
								$(this).text(eval('data.'+value.replace(/[^a-zA-Z0-9\.\[\]\_]+/g, '')));
							} catch(err) { }
						});
						
						// And lastly, we remove all elements that have the **data-jkit-api-if** attribute, but
						// didn't get a value from the API:
						
						$el.find('[data-jkit-api-if]').each(function(){
							var value = $(this).attr('data-jkit-api-if');
							var test = undefined;
							try {
								eval('test = data.'+value.replace(/[^a-zA-Z0-9\.\[\]\_]+/g, ''));
							} catch(err) { }
							if (test == undefined){
								$(this).remove();
							}
						});
						
					// In case we don't use a template, just add the specified value as text to the element:
					
					} else {
						
						if (options.value != ''){
							try {
								$el.text(eval('data.'+options.value.replace(/[^a-zA-Z0-9\.\[\]\_]+/g, '')));
							} catch(err) { }
						} else {
							$el.text(data);
						}
					
					}
					
					// Trigger some stuff now as everythimng is set up:
					
					if (options.macro != undefined) plugin.applyMacro($el, options.macro);
					plugin.triggerEvent('complete', $el, options);
					
					// Do we have to read the API in a specific interval? If yes, set a timeout:
					
					if (options.interval > -1){
						setTimeout( function(){
							readAPI($el, options);
						}, options.interval*1000);
					}
				
				}
			});
		}
	
	};
	
	return command;

}());