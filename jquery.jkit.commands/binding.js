
// ##### Binding Command
//
// The [binding command](http://jquery-jkit.com/commands/binding.html) lets you bind different 
// kind of values and even functions to different things, for example attributes. It's a very
// powerfull command with tons of options.

plugin.commands.binding = (function(){
	
	// Create an object that contains all of our data and functionality.
	
	var command = {};
	
	// This are the command defaults:
	
	plugin.addCommandDefaults('binding', {
		'selector':			'',
		'source':			'val',
		'variable':			'',
		'mode':				'text',
		'interval':			100,
		'math':				'',
		'condition': 		'',
		'if':				'',
		'else':				'',
		'speed':			0,
		'easing':			'linear',
		'search': 			'',
		'trigger': 			'no',
		'accuracy': 		'',
		'min': 				'',
		'max': 				'',
		'applyto': 			'',
		'delay': 			0
	});
	
	// The execute function is launched whenever this command is executed:
	
	command.execute = function($that, options){
		
		window.setTimeout( function() { binding($that, options); }, options.delay);
		
	};
	
	// The **binding** function connects different things to other things.
	// It's a really powerfull function with many options.
	
	var binding = function(el, options){
		
		// Only run the code if the window has focus:
		
		if (windowhasfocus || !windowhasfocus && plugin.settings.ignoreFocus){
			
			// First we need to get our value or multiple values that we later convert into one. 
			// Only run the following code if we didn't bind to a function already.
			
			if (options.value == undefined){
				
				// If the selector option is set, we don't use a variable for our source, that means
				// we have to get our variable from the selector element:
				
				if (options.selector != ''){
					
					// The selector can have multiple elements that we have to check. And the source option
					// can be separated with a dot, so prepare those two things first:
					
					var selsplit = options.selector.split('|');
					var sourcesplit = options.source.split('.');
					
					// Now create an array that holds one or all of our values and run through each selector:
					
					var values = [];
					$.each(selsplit, function(i, v) {
						
						// The selector is either a jQuery selector string or "this" that references the 
						// current element or "parent" that references the parent of the current element.
						
						var $v;
						
						if (v == 'this'){
							$v = (el);
						} else if (v == 'parent'){
							$v = $(el).parent();
						} else {
							var vsplit = v.split('.');
							
							if (vsplit.length == 1){
								$v = $(vsplit[0]);
							} else if (vsplit[0] == 'each'){
								$v = el.find(vsplit[1]);
							} else if (vsplit[0] == 'children') {
								$v = el.children(vsplit[1]);
							}
						}
						
						// A jQuery selector string can match more than one string, so run through all of them:
						
						$v.each( function(){
							
							// The source option defines from where exactly we get our value. There are quite
							// a few options.
							
							switch(sourcesplit[0]){
								
								// We can trigger this binding by an event. This will simply call this function again
								// as soon as the event fires with the value set to 1.
								
								case 'event':
									
									$(this).on( sourcesplit[1], function(e){
										options.value = 1;
										binding(el, options);
										if (options.macro != undefined) plugin.applyMacro($(el), options.macro);
									});
									
									break;
								
								// "html" will get the HTML of the element:
									
								case 'html':
									
									var temp = $(this).html();
									
									break;
								
								// "text" will get the putre text of the element:
								
								case 'text':
									
									var temp = $(this).text();
									
									break;
								
								// "attr" will get a specific attribute that is specified after the dot, for example
								// **attr.id**:
								
								case 'attr':
									
									var temp = $(this).attr(sourcesplit[1]);
									
									break;
								
								// "css" will get a specific css value that is specified after the dot, for example
								// **css.width**. Many of the options will be calculated by jQuery so that we get
								// the correct result in any browser.
								
								case 'css':
									if (sourcesplit[1] == 'height'){
										var temp = $(this).height();
									} else if (sourcesplit[1] == 'innerHeight'){
										var temp = $(this).innerHeight();
									} else if (sourcesplit[1] == 'outerHeight'){
										var temp = $(this).outerHeight();
									} else if (sourcesplit[1] == 'width'){
										var temp = $(this).width();
									} else if (sourcesplit[1] == 'innerWidth'){
										var temp = $(this).innerWidth();
									} else if (sourcesplit[1] == 'outerWidth'){
										var temp = $(this).outerWidth();
									} else if (sourcesplit[1] == 'scrollTop'){
										var temp = $(this).scrollTop();
									} else if (sourcesplit[1] == 'scrollLeft'){
										var temp = $(this).scrollLeft();
									} else {
										var temp = $(this).css(sourcesplit[1]);
									}
									
									break;
								
								// "scroll" will get the page scroll offset, either from top or from the left side: 
								
								case 'scroll':
									
									switch(sourcesplit[1]){
										case 'top':
											var temp = $(window).scrollTop();
											break;
										case 'left':
											var temp = $(window).scrollLeft();
											break;
									}
									
									break;
									
								// "clearance" will calculate the clearence around an element in relation to the window. If
								// nothing is supplied after the dot, each side will be checked.
									
								case 'clearance':
									
									var cTop = el.offset().top-$(window).scrollTop();
									var cBottom = $(window).scrollTop() + $(window).height() - ( el.offset().top + el.height() );
									
									var cRight = ($(window).width() + $(window).scrollLeft()) - (el.offset().left + el.width());
									var cLeft = el.offset().left - $(window).scrollLeft();
									
									switch(sourcesplit[1]){
										case 'bottom':
											var temp = cBottom;
											break;
										case 'top':
											var temp = cTop;
											break;
										case 'right':
											var temp = cRight;
											break;
										case 'left':
											var temp = cLeft;
											break;
										default:
											var temp = Math.min.apply(Math, [ cBottom, cTop, cRight, cLeft ]);
									}
									
									break;
								
								// "has" tries to find out if the element has a specific thing and gives back either
								// true or false:
									
								case 'has':
									
									switch(sourcesplit[1]){
										case 'class':
											var temp = $(this).hasClass(options.search);
											break;
										case 'text':
											var temp = $.fn.jKit_stringOccurrences($(this).text().toLowerCase(), options.search.toLowerCase());
											break;
										case 'attribute':
											var temp = ($(this).attr(options.search) !== undefined);
											break;
										case 'val':
											var temp = $.fn.jKit_stringOccurrences($(this).val().toLowerCase(), options.search.toLowerCase());
											break;
										case 'element':
											var temp = $(this).find(options.search).length;
											break;
										case 'children':
											var temp = $(this).children(options.search).length;
											break;
										case 'hash':
											var temp = (window.location.hash == options.search);
											break;
									}
									
									break;
									
								// "location" needs the second option after the dot and gets something from the location
								// object, for example the hash, like this: **location.hash**
								
								case 'location':
									
									var temp = window.location[sourcesplit[1]];
									
									break;
								
								// "val" will get the value of the element:
								
								case 'val':
								default:
									var temp = $(this).val();
							}
							
							values.push(temp);
						
						});
					});
					
					// If there's a third option supplied with the source, for example **css.height.max**, we use 
					// that to calculate the final valus from all values in the array. If the fird option isn't 
					// supplied, we just take the first value.
					
					if (sourcesplit[2] != undefined){
						var value = '';
						
						switch(sourcesplit[2]){
							case 'max':
								value = Math.max.apply(Math, values);
								break;
							case 'min':
								value = Math.min.apply(Math, values);
								break;
							case 'sum':
								value = values.reduce(function(a,b){return a+b;});
								break;
							case 'avg':
								value = values.reduce(function(a,b){return a+b;}) / values.length;
								break;
						}
					
					} else {
						var value = values[0];
					}
				
				} else if (options.variable != ''){
					var value = window[options.variable];
				}
				
			} else {
				value = options.value;
			}
			
			// In case we have a numeric value, there are a few options more we can apply. The **accuracy**
			// option reduces the accuracy of the value down to this number. The **min** and **max** options
			// limit the value to either a minimum or a maximum value.
			
			if (!isNaN(value) && parseInt(value) == value){
				
				if (options.accuracy != ''){
					value = Math.round(value / options.accuracy) * options.accuracy;
				}
		
				if (options.min != '' && value < options.min){
					value = options.min;
				}
				
				if (options.max != '' && value > options.max){
					value = options.max;
				}
				
			}
			
			// If the **condition** option is set or the current value is a boolean, we have to decide if either the
			// **if** option will be used (if supllied) or the value in the **else** option (if supllied).
			
			var doit;
			var rev = false;
			
			if (options.condition != ''){
				doit = false;
				eval('if ('+options.condition.replace(/[^a-zA-Z 0-9#\<\>\=\.\!\']+/g, '')+') doit = true;');
			} else {
				if (value === false){
					doit = false;
					rev = true;
				} else {
					doit = true;
				}
			}
			
			// Next we add some logic that either fires the **true** or **false** event in case our value changes.
			// To make this possible, we store the value in the "global" commandkeys array entry for the current command call.
			
			if (commandkeys[options.commandkey]['condition'] == undefined || commandkeys[options.commandkey]['condition'] != doit){
				
				if (doit){
					plugin.triggerEvent('true', $(el), options);
				} else {
					plugin.triggerEvent('false', $(el), options);
				}
				
				commandkeys[options.commandkey]['condition'] = doit;
				
			}
			
			if (rev){
				doit = true;
			}
			
			// Use the **if** or **else** value if supplied:
			
			if (!doit && options['else'] != ''){
				doit = true;
				value = options['else'];
			} else if (doit && options['if'] != ''){
				doit = true;
				value = options['if'];
			}
			
			// Time to use the value to set something, but only if the condition wasn't false:
			
			if (doit){
				
				// The math option lets us do some additional calculation on our value:
				
				if (options.math != ''){
					eval('value = '+options.math.replace(/[^a-zA-Z 0-9\+\-\*\/\.]+/g, '')+';');
				}
				
				// Do we have to trigger some additional events?
				
				if (options.trigger == 'yes'){
					if (commandkeys[options.commandkey]['triggervalue'] == undefined || commandkeys[options.commandkey]['triggervalue'] != value){
						if (commandkeys[options.commandkey]['triggervalue'] !== undefined){
							plugin.triggerEvent('notvalue'+commandkeys[options.commandkey]['triggervalue'], $(el), options);
						}
						plugin.triggerEvent('value'+value, $(el), options);
						commandkeys[options.commandkey]['triggervalue'] = value;
					}
				}
				
				// Do we have to apply the result to specified DOM nodes or the default source element?
				
				var $els = el;
				
				if (options.applyto != ''){
					
					var applysplit = options.applyto.split('.');
					
					if (applysplit.length == 1){
						$els = $(applysplit[0]);
					} else if (applysplit[0] == 'each'){
						$els = el.find(applysplit[1]);
					} else if (applysplit[0] == 'children') {
						$els = el.children(applysplit[1]);
					}
				
				}
				
				$els.each( function(){
					
					var $el = $(this);
					
					// The **mode** option defines what we have to do with our value. There are quite a few options.
					// The **attr** and **css** modes take a second option that is separated with a dot.
				
					var modesplit = options.mode.split('.');
					switch(modesplit[0]){
						case 'text':
							$el.text(value);
							break;
						case 'html':
							$el.html(value);
							break;
						case 'val':
							$el.val(value);
							break;
						case 'attr':
							$el.attr(modesplit[1], value);
							break;
						case 'css':
							if (modesplit[1] == 'display'){
								if ($.trim(value) == '' || $.trim(value) == 0 || !value){
									value = 'none';
								} else {
									if (modesplit[2] !== undefined){
										value = modesplit[2];
									}
								}
							}
						
							// CSS values can be animated if needed:
						
							if (options.speed > 0){
								var style = {};
								style[modesplit[1]] =  value;
								$el.animate(style, options.speed, options.easing);
							} else {
								$el.css(modesplit[1], value);
							}
							break;
						case 'none':
							break;
						default:
						
							// The default behavior is to call a custom function if one exits with that name:
					
							if (modesplit[0] != undefined){
								var fn = window[modesplit[0]];
								if(typeof fn === 'function') {
									fn(value,$el);
								}
							}
					}
					
				});
					
			}
		
		}
		
		// Do we have to set an interval?
		
		if (options.interval != -1){
			window.setTimeout( function() { binding(el, options); }, options.interval);
		}
	
	};
	
	return command;

}());