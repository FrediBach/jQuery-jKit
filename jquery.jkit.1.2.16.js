//
// # jQuery Plugin: jKit
//
// > A very easy to use, cross platform jQuery UI toolkit that's still small in size, has the 
// > features you need and doesn't get in your way.
//
// Put jQuery and jKit on all your pages and HTML becomes so much better. And the best thing?
// You really don't have to be a programmer to create a trully amazing website!
//
// jKit has 99% of all the features you ever need. You don't have to check out dozens of plugins,
// learn how to use them, only to find out they don't work in a specific browser.
//
// And even if jKit doesn't have that one feature you need right now, jKit is fully extendable
// with plugins and command replacements, all that and your API always stays the same.
//
// - Version: `1.2.16`
// - Release date: `10. 5. 2013`
// - [API Documentation & Demos](http://jquery-jkit.com/)
// - [Source Documentation](http://jquery-jkit.com/sourcemakeup/?file=js/jquery.jkit.1.2.16.js) (made 
//	 with [sourceMakeup](http://jquery-jkit.com/sourcemakeup))
// - [Download](https://github.com/FrediBach/jQuery-jKit/archive/master.zip)
//
// ## Copyright
//
// - (c) 2012/2013 by *Fredi Bach*
// - [Home](http://fredibach.ch/)
//
// ## License
//
// jKit is open source and MIT licensed. For more informations read the **license.txt** file
//
// ## Basic Usage
//
// Inside your head tag or at the bottom of your page before the closing body tag:
//
//     <script src="js/jquery-1.9.1.min.js"></script>
//     <script src="js/jquery.easing.1.3.js"></script>
//     <script src="js/jquery.jkit.1.2.16.min.js"></script>
//
//     <script type="text/javascript">
//         $(document).ready(function(){
//         	$('body').jKit();
//         });
//     </script>
//
// On your HTML elements:
//
//     <p data-jkit="[hide:delay=2000;speed=500]">
//         Hidden after two seconds
//     </p>
//
//
// ## The Source

// Create our plugins local scope, make sure **$** is mapped to jQuery and guarantee that **undefined** really is **undefined**.

(function($, undefined) {
	
	// Create our main function with the following parameters:
	//
	// - **element** contains the DOM element where jKit is applied to
	// - **options** is either a string with a single command name or a JavaScript object with all options or undefined
	// - **moreoptions** is optionally used in case options contains the a command string and contains the options object
	
	$.jKit = function(element, options, moreoptions) {
		
		// Define all plugin defaults. These can be overwritten by the plugins options set on init.
		
		var defaults = {
			
			// First we set some general defaults:
			
			prefix: 'jkit',
			dataAttribute: 'data-jkit',
			activeClass: 'active',
			errorClass: 'error',
			successClass: 'success',
			ignoreFocus: false,
			ignoreViewport: false,
			keyNavigation: true,
			touchNavigation: true,
			plugins: {},
			replacements: {},
			delimiter: ',',
			loadminified: true,
			
			// {!} codeblock: macros
			
			// Now we set some default macros for often used command/parameter combinations:
			
			macros: {
				'hide-if-empty': 'binding:selector=this;source=text;mode=css.display',
				'smooth-blink': 'loop:speed1=2000;duration1=250;speed2=250;duration2=2000'
			},
			
			// {!} codeblock: /macros
			
			// Next we're defining all the default options for each command. You can get a good overview of them 
			// on the official [cheat sheet](http://jquery-jkit.com/pages/cheatsheet.php).
			
			commands: {}
		};
		
		// Set an alias to **this** so that we can use it everywhere inside our plugin:
		
		var plugin = this;
		
		// Define some info variables that can be read with the special info command:
		
		plugin.version = '1.2.16';
		plugin.inc = [];
		
		// Create an object for the plugin settings:
		
		plugin.settings = {};
		
		// Create an opject to store all jKit command implementations
		
		plugin.commands = {};
		
		// Array to stor all command execution so that we can find out if something was already executed
		
		plugin.executions = {};
		
		// And while were're at it, cache the DOM element:
		
		var $element = $(element),
			element = element;
		
		// In case we are just applying a single command, we need to take the options from the **moreoptions** parameter:
		
		if (typeof options == 'string'){
			var singlecommand = options;
			if (moreoptions == undefined){
				moreoptions = {};
			}
			options = moreoptions;
		}
		
		// For a few things, we need some local plugin variables and objects, let's set them now:
		
		var startX, startY;
		var windowhasfocus = true;
		var uid = 0;
		var commandkeys = {};
		
		// We want to know if the current window is in focus or not, we can do this with the **window** object (just not in IE7 & 8):
		
		if ($.support.htmlSerialize || $.support.opacity){
			$(window).focus(function() {
				windowhasfocus = true;
			}).blur(function() {
				windowhasfocus = false;
			});
		}
		
		// ## Plugin Functions
		
		// The following collection of functions are internally used. There is a way to call them with an external script,
		// **but you should know what you're doing!** Here's an exmaple:
		//
		//     $('body').data('jKit').executeCommand('body', 'lightbox');
		//
		// The above code would call the **plugin.executeCommand()** function.
		
		// ### init
		//
		// The **init** function is called on plugin init and sets up all the stuff we need.
		
		plugin.init = function($el){
			
			// In case this function is called without a specific DOM node, use the plugins main DOM element:
			
			if ($el == undefined) $el = $element;
			
			// Extend the plugin defaults with the applied options:
			
			plugin.settings = $.extend({}, defaults, options);
			var s = plugin.settings;
			
			if (singlecommand != undefined){
				
				// If this is an initialization of a single command, all we have to do is execute that one command:
				
				plugin.executeCommand($el, singlecommand, options);
			
			} else {
				
				// It's now time to find all DOM nodes that want to execute a jKit command. You can either use the **data-jkit** attribute,
				// or the **rel** attribute. **However, we strongly recommend to use the data-jkit attribute!** The rel attribute support 
				// will probably removed at some point.
				
				$el.find("*[rel^=jKit], *["+s.dataAttribute+"]").each( function(){
					
					var that = this;
					
					// Get the rel or data-jkit attribute and extract all individual commands (they have to be inside square brackets):
					
					var rel = $(this).attr('rel');
					var data = plugin.getDataCommands($(this));
					
					if (data != ''){
						rel = $.trim(data).substring(1);
					} else {
						rel = $.trim(rel).substring(5);
					}
					rel = rel.substring(0, rel.length-1);
					rel = rel.replace(/\]\s+\[/g, "][");
					relsplit = rel.split('][');
					
					// Now look at each command seperately:
					
					$.each( relsplit, function(index, value){
						
						// First convert all the escaped characters into internal jKit strings. Later we convert them back and unescape them.
						
						value = value
									.replace(/\\=/g,'|jkit-eq|')
									.replace(/\\:/g,'|jkit-dp|')
									.replace(/\\;/g,'|jkit-sc|')
									.replace(/\\\[/g,'|jkit-sbo|')
									.replace(/\\\]/g,'|jkit-sbc|')
									.replace(/\\\*/g,'|jkit-st|')
									.replace(/\\ /g,'|jkit-sp|');
						
						value = $.trim(value);
						
						// Is this a macro call? Let's check if we find a macro with this name:
						
						if (s.macros[value] != undefined) value = s.macros[value];
						
						// Now it's time to parse the options:
						
						var options = plugin.parseOptions(value);
						
						// It's still possible that this is a macro, just with changed options. Let's check that and apply the macro if needed:
						
						if (s.macros[options.type] != undefined){
							var macrooptions = plugin.parseOptions(s.macros[options.type]);
							options.type = macrooptions.type;
							options = $.extend({}, macrooptions, options);
						}
						
						// If this is a macro definition, add the current command string to the macros array:
						
						if (options.type == 'macro' && relsplit[index-1] != undefined){
							
							plugin.settings.macros[options.name] = relsplit[index-1];
						
						// If this is the special repeat command, parse the options and than add it to the delivered event handler:
						
						} else if (options.type == 'repeat' && relsplit[index-1] != undefined){
							
							var prevoptions = plugin.parseOptions(relsplit[index-1]);
							
							$el.on( options.onevent, function(){
								if (options.delay == undefined) options.delay = 0;
								setTimeout( function(){
									plugin.executeCommand($(that), prevoptions.type, prevoptions);
								}, options.delay);
							});
							
						} else if (options.type == 'info'){
							
							var output = 'jKit version: '+plugin.version+'\n';
							output += 'Included commands: '+plugin.inc.join(', ')+'\n';
							console.log(output);
							console.log($el);
							
						} else {
							
							// Looks like this isn't one of the special use commands, so lets execute one of the regular ones.
							
							// If the targets option is set, we first have to find out to which target nodes we have to apply the command:
							
							var targets = [];
							if (options.target != undefined){
								
								var targetsplit = options.target.split('.');
								targetsplit = [targetsplit.shift(), targetsplit.join('.')]
								if (targetsplit[1] == undefined){
									targetsplit[1] = '*';
								}
								
								switch(targetsplit[0]){
									case 'children':
										$(that).children(targetsplit[1]).each( function(){
											targets.push(this);
										});
										break;
									case 'each':
										$(that).find(targetsplit[1]).each( function(){
											targets.push(this);
										});
										break;
									default:
										targets.push(that);
								}
							} else {
								targets.push(that);
							}
							
							$.each( targets, function(i,v){
								
								// First parse all dynamic options. They are declared like this:
								//
								//     [command:myoption={rand|0-1000}]
								//
								
								var thisoptions = plugin.parseDynamicOptions(options);
								
								// Now it's time to find out what the command key is for this specific command call. 
								// This can be set either by the commandkey option, the dot syntax or if both are not
								// set, we take the elements id attribute or as a last option, we just generate an unique id.
								
								if (thisoptions.commandkey == undefined){
									var id = $(that).attr("id");
									if (id != undefined){
										thisoptions.commandkey = id;
									} else {
										thisoptions.commandkey = s.prefix+'-uid-'+(++uid);
									}
								}
								
								// Now as we have the commandkey, we store it in the plugins commandkey array together 
								// with some other useful information for later use:
								
								if (thisoptions.commandkey != undefined){
									commandkeys[thisoptions.commandkey] = {
										'el': v,
										'options': thisoptions,
										'execs': 0
									};
								}
								
								// Next we need to check if we have to immediately execute the command or if we have to 
								// execute it later on a specific event:
								
								if (thisoptions.onevent !== undefined || thisoptions.andonevent !== undefined){
									
									var events = [];
									if (thisoptions.onevent !== undefined) events.push(thisoptions.onevent);
									if (thisoptions.andonevent !== undefined) events.push(thisoptions.andonevent);
									var e = events.join(' ');
									
									$el.on( e, function(){
										if (s.replacements[thisoptions.type] != undefined && typeof(s.replacements[thisoptions.type]) === "function"){
											s.replacements[thisoptions.type].call(plugin, v, thisoptions.type, thisoptions);
										} else {
											plugin.executeCommand(v, thisoptions.type, thisoptions);
										}
									});
								
								}
								
								if (thisoptions.onevent === undefined){
									
									// If this is a command that follows another command we need to make sure that
									// the command before this one in the command chain has already been executed:
									
									if (relsplit[index-1] != undefined){
										
										var prevcmd = '';

										if (relsplit[(index-1)] != undefined){
											var prevoptions = plugin.parseOptions(relsplit[index-1]);
											prevcmd = prevoptions.type + '.' + thisoptions.commandkey + '.executed';
										}

										if (prevcmd != '' && plugin.executions[prevoptions.type + '.' + thisoptions.commandkey + '.executed'] === undefined){
											$el.on( prevcmd, function(){
												if (s.replacements[thisoptions.type] != undefined && typeof(s.replacements[thisoptions.type]) === "function"){
													s.replacements[thisoptions.type].call(plugin, v, thisoptions.type, thisoptions);
												} else {
													plugin.executeCommand(v, thisoptions.type, thisoptions);
												}
											});
										} else {
											if (s.replacements[thisoptions.type] != undefined && typeof(s.replacements[thisoptions.type]) === "function"){
												s.replacements[thisoptions.type].call(plugin, v, thisoptions.type, thisoptions);
											} else {
												plugin.executeCommand(v, thisoptions.type, thisoptions);
											}
										}
									
									} else {
									
										// If we don't have an event set, we execute it immediately. Wee need to
										// check if a command replacement for this command is available and if yes, call it.
									
										if (s.replacements[thisoptions.type] != undefined && typeof(s.replacements[thisoptions.type]) === "function"){
											s.replacements[thisoptions.type].call(plugin, v, thisoptions.type, thisoptions);
										} else {
											plugin.executeCommand(v, thisoptions.type, thisoptions);
										}
									
									}
								
								}
							
							});
						
						}
					
					});
				
				});
			
			}
		
		};
		
		
		// ### getDataCommands
		//
		// The **getDataCommands** function returns all jKit data element values that have to be executed. They can be spread over multiple
		// attributes with different values for different element sizes (responsive):
		//
		//     <div data-jkit="[tabs]" data-jkit-lt-500-width="[show]" data-jkit-gt-499-width="[hide]">
		//         ...
		//     </div>
		
		plugin.getDataCommands = function($el){
			
			var s = plugin.settings;
			var el = $el.get(0);
			var commands = '';
			
			for (var i=0, attrs=el.attributes, l=attrs.length; i<l; i++){
				
			    var attr = attrs.item(i).nodeName;
				var attrsplit = attr.split('-');
				
				if ( attrsplit[0] + '-' + attrsplit[1] == s.dataAttribute ){
					
					if (attrsplit.length > 2){
						
						if (attrsplit[4] !== undefined && attrsplit[4] == 'height'){
							var size = $el.height();
						} else {
							var size = $el.width();
						}
						
						if ( 	attrsplit[2] !== undefined && attrsplit[3] !== undefined && (
								(attrsplit[2] == 'gt' && size > parseInt(attrsplit[3]))
								|| (attrsplit[2] == 'lt' && size < parseInt(attrsplit[3])) ) 
						){
							commands += $el.attr(attr);
						}
						
					} else {
						
						commands += $el.attr(attr);
						
					}
					
				}
				
			}
			
			return commands;
			
		}
		
		
		// ### applyMacro
		//
		// The **applyMacro** function lets us execute predefined macros.
		
		plugin.applyMacro = function($el, macro){
			
			var s = plugin.settings;
			
			if (s.macros[macro] != undefined){
				var value = s.macros[macro];
				var options = plugin.parseOptions(value);
				
				if (s.replacements[options.type] != undefined && typeof(s.replacements[options.type]) === "function"){
					s.replacements[options.type].call(plugin, $el, options.type, options);
				} else {
					plugin.executeCommand($el, options.type, options);
				}
			}
		
		};
		
		// ### parseOptions
		//
		// The **parseOptions** function takes a command string and creates an array out of it with all options. 
		// It automatically detects the command type and command key. An input string can look like this 
		// (optionally with additional spaces and newlines):
		// 
		//     mycommand.mykey:firstoption=value1;secondoption=value2
		//
		
		plugin.parseOptions = function(string){
			
			var relsplit = string.split(':');
			var commandsplit = relsplit[0].split('.');
			
			var options = { 'type': $.trim(commandsplit[0]) };
			
			if (commandsplit[1] !== undefined){
				options['commandkey'] = commandsplit[1];
			}
			
			if (options.execute == undefined){
				options.execute = 'always';
			}
			
			if (relsplit.length > 1){
				var optionssplit = relsplit[1].split(';');
				
				$.each( optionssplit, function(key, value){
					var optionssplit2 = value.split('=');
					options[$.trim(optionssplit2[0])] = $.trim(optionssplit2[1]);
				});
			}
			
			return options;
		
		};
		
		
		// ### fixSpeed
		//
		// The **fixSpeed** function is used to make sure that a speed option has a correct value, either
		// "slow", "fast" or an integer.
		
		plugin.fixSpeed = function(speed){
			
			if (speed != 'fast' && speed != 'slow'){
				speed = parseInt(speed);
			}
			
			return speed;
		};
		
		
		// ### parseDynamicOptions
		//
		// The **parseDynamicOptions** looks for dynamic options that look like this:
		// 
		//     [command:myoption={rand|0-1000}]
		//
		// Currently only the random options are supported, but more stuff is planned, like increase or decrease.
		
		plugin.parseDynamicOptions = function(options){
			
			var parsedoptions = {};
			
			for (index in options){
				var v = options[index];
				
				if (v !== undefined && v.indexOf("{") > -1 && v.indexOf("|") > 0 && v.indexOf("}") > 1){
					
					var option = '';
					var dyn = false;
					var dynstr = '';
					var parse = false;
					
					for (var i=0; i<=(v.length-1);i++){
						
						if (!dyn && v.charAt(i) == '{'){
							dyn = true;
						} else if (dyn && v.charAt(i) == '}'){
							dyn = false;
							parse = true;
						}
						
						if (dyn || parse){
							dynstr += v.charAt(i);
							if (parse){
								dynstr = dynstr.slice(1, -1);
								var dynsplit = dynstr.split('|');
								
								if (dynsplit[0] == 'rand'){
									var valsplit = dynsplit[1].split('-');
									option += plugin.getRandom(Number(valsplit[0]), Number(valsplit[1]));
								}
								
								parse = false;
								dynstr = '';
							}
						} else {
							option += v.charAt(i);
						}
						
					}
					
					parsedoptions[index] = option;
					
				} else {
					parsedoptions[index] = v;
				}
			}
			
			return parsedoptions;
		}
		
		// ### getRandom
		//
		// The **getRandom** function simply generates a random number between a minimum number and a maximum number.
		
		plugin.getRandom = function(min, max) {
			if(min > max) {
				return -1;
			}
			
			if(min == max) {
				return min;
			}
			
			var r;
			do {
				r = Math.random();
			}
			while(r == 1.0);
			
			return min + parseInt(r * (max-min+1));
		}
		
		// ### findElementTag
		//
		// The **findElementTag** function makes it possible to find the tag name of a specific element in a 
		// previously defined structure. This makes it possible to write agnostic HTML for tab or similar structures.
		// For example on the tab command, both this structures would be succesfully detected:
		//
		//     div (container)
		//         div (element)
		//             h3 (title)
		//             div (content)
		//
		//     ul (container)
		//         li (element)
		//             h2 (title)
		//             p (content)
		//
		// Check the tab command to get an example of how to use the function.
		
		plugin.findElementTag = function($container, selector, pos, defaultval){
			
			var output = '';
			
			if ( pos !== undefined && !isNaN(pos) && parseInt(pos) == pos ){
				if ($container.find(selector).length > pos){
					output = $($container.find(selector).get(pos)).prop('tagName');
				}
			} else { 
				
				var tags = {};
				
				$container.find(selector).each( function(i){
					if (i < 25){
						var tag = $(this).prop('tagName');
						if (tag[0] != ''){
							if (tags[tag] !== undefined){
								tags[tag]++;
							} else {
								tags[tag] = 1;
							}
						}
					} else {
						return false;
					}
				});
				
				var max = 0;
				var maxkey = '';
				for (var key in tags){
					if (tags[key] > max){
						max = tags[key];
						maxkey = key;
					}
				}
				output = maxkey;
			}
			
			if (output !== undefined && output != ''){
				return output;
			} else {
				return defaultval;
			}
			
		};
		
		// ### addDefaults
		//
		// The **addDefaults** function adds all the default options to the options array. Additionally 
		// all speed options are fixed if needed.
		
		plugin.addDefaults = function(command, options){
			
			if (plugin.settings.commands[command] != undefined){
				var c = plugin.settings.commands[command];
				
				$.each(c, function(i, v){
					if (options[i] == undefined) options[i] = v;
					if (i.indexOf('speed') > -1) options[i] = plugin.fixSpeed(options[i]);
				});
			}
			
			return options;
		};
		
		// ### executeCommand
		//
		// The **executeCommand** function is used to execute a command on a specific DOM node with an array of options.
		
		plugin.executeCommand = function(that, type, options){
			
			// First create a few shortcuts:
			
			var s = plugin.settings;
			var $that = $(that);
			
			// Create a temporary array in case this command isn't already implemented or loaded. The array acts as a 
			// command queue that stores all executions of this command till the command is actually loaded.
			
			if (plugin.commands[type] === undefined){
				plugin.commands[type] = [];
			}
			
			// As long as this plugin command is an array, we know that it isn't loaded already, so load it!
			
			if ($.isArray(plugin.commands[type])){
				
				// Craete an entry in the command queue with the current element and options:
				
				plugin.commands[type].push({
					'el': that,
					'options': options
				});
				
				// We only have to start the ajax in case this was the first command in the queue:
				
				if (s.loadminified){
					var commandurl = 'jquery.jkit.commands/' + type + '.min.js';
				} else {
					var commandurl = 'jquery.jkit.commands/' + type + '.js';
				}
				
				if (plugin.commands[type].length == 1){
					$.ajax({
						url: 'jquery.jkit.commands/' + type + '.js',
						success: function(data){
							
							// The script loaded succesfully! Store the queue in a temporary array and than eval the
							// loaded script. This way it will be loaded in the current scope and add itself to the plugin
							// object. The jQuery.getScript method would load it globally, that's of no use to us.
							
							if (data.indexOf('plugin.commands.') !== -1){
								var queue = plugin.commands[type];
								eval(data);
							
								// Now execute all commands in our queue:
							
								$.each(queue, function(i,v){
									plugin.executeCommand(v.el, type, v.options);
								});
							}
							
						},
						dataType: "text"
					});
				}
				
				// We can stop this function now. It will be called again with the same options as soon as the command is loaded.
				
				return $that;
				
			}
			
			// Everything below here will be executes if the command is loaded.
			
			// Trigger the **jkit-commandinit** event on the main element with all useful information attached to it. 
			// This event is currently not used internally, but can of course be listened to from outside the plugin.
			
			$element.trigger('jkit-commandinit', { 'element': $that, 'type': type, 'options': options });
			
			// Check if there is a limit set on how many times we're allowed to execute this command (based on the command key)
			
			if (options.commandkey !== undefined){
				commandkeys[options.commandkey]['execs']++;
				if ((options.execute == 'once' && commandkeys[options.commandkey]['execs'] > 1) || (!isNaN(options.execute) && commandkeys[options.commandkey]['execs'] > options.execute)){
					return $that;
				}
			}
			
			// Add all default options where there isn't an option set:
			
			options = plugin.addDefaults(type, options);
			
			$.each( options, function(i,v){
				
				// Convert jKit's special escaping strings to their regular characters:
				
				if (typeof v == 'string'){
					options[i] = v = v
						.replace(/\|jkit\-eq\|/g,'=')
						.replace(/\|jkit\-dp\|/g,':')
						.replace(/\|jkit\-sc\|/g,';')
						.replace(/\|jkit\-sbo\|/g,'[')
						.replace(/\|jkit\-sbc\|/g,']')
						.replace(/\|jkit\-st\|/g,'*')
						.replace(/\|jkit\-sp\|/g,' ');
				}
				
				// Call or get all dynamic options (those with an asterix at the end):
				
				if (typeof v == 'string' && v.slice(-1) == '*'){
					options[i] = window[v.slice(0, -1)];
					if (typeof options[i] == 'function'){
						options[i] = options[i].call(that);
					}
				}
			});
			
			// Execute the commands main function:
			
			plugin.commands[ type ].execute($that, options);
			if (type != 'remove'){
				$element.trigger(type + '.' + options.commandkey + '.executed', {});
				plugin.executions[type + '.' + options.commandkey + '.executed'] = true;
			}
			
			return $that;
		
		};
		
		// ### triggerEvent
		//
		// The **triggerEvent** function is used by various commands to trigger an event on an element with
		// the commands options added to it:
		
		plugin.triggerEvent = function(event, $el, options){
			
			if (options.commandkey !== undefined){
				
				var eventsplit = event.split(' ');
				
				$.each( eventsplit, function(i,v){
					$element.trigger(options.commandkey+'.'+v, { 'element': $el, 'options': options });
				});
			
			}
		
		};
		
		// ### cssFromString
		//
		// The **cssFromString** function is used by the animation command. It parses a specially formated string
		// and creates an object that contains all CSS data. Here's an exmaple of the string format:
		//
		//     width(50%),height(50px)
		//
		
		plugin.cssFromString = function(css){
			
			var partsplit = css.split(',');
			var cssdata = {};
			
			$.each( partsplit, function(i,v){
				
				var innersplit = v.split('(');
				
				if (innersplit.length == 2){
					var property = innersplit[0];
					var value = innersplit[1].slice(0,-1);
					cssdata[property] = value;
				}
				
			});
			
			return cssdata;
		};
		
		
		plugin.addCommandDefaults = function(c, d){
			
			// Add the defaults:
			
			defaults.commands[c] = d;
			
			// And trigger the *loaded event* for this command (command.name.loaded) so everyone knows that this command is ready:
			
			$element.trigger('command.'+c+'.loaded', {});
		
		};
		
		
		// ### addKeypressEvents
		//
		// The **addKeypressEvents** function is used by the key command and various other features and adds a specific keycode event 
		// to an element.
		
		plugin.addKeypressEvents = function($el, code){
			
			// Check first if key navigations aren't globally switched off:
			
			if (plugin.settings.keyNavigation){
				
				// Listen to the documents keydown event:
				
				$(document).keydown(function(e){
					
					// Only add the event if this isn't a textaream, select or text input:
					
					if ( this !== e.target && (/textarea|select/i.test( e.target.nodeName ) || e.target.type === "text") ) return;
					
					// Map keycodes to their identifiers:
					
					var keys = {
						8: "backspace",
						9: "tab",
						13: "return",
						16: "shift",
						17: "ctrl",
						18: "alt",
						19: "pause",
						20: "capslock",
						27: "esc",
						32: "space",
						33: "pageup",
						34: "pagedown",
						35: "end",
						36: "home",
						37: "left",
						38: "up",
						39: "right",
						40: "down",
						45: "insert",
						46: "del",
						96: "0",
						97: "1",
						98: "2",
						99: "3",
						100: "4",
						101: "5",
						102: "6",
						103: "7",
						104: "8",
						105: "9",
						106: "*",
						107: "+",
						109: "-",
						110: ".",
						111 : "/",
						112: "f1",
						113: "f2",
						114: "f3",
						115: "f4",
						116: "f5",
						117: "f6",
						118: "f7",
						119: "f8",
						120: "f9",
						121: "f10",
						122: "f11",
						123: "f12",
						144: "numlock",
						145: "scroll",
						191: "/",
						224: "meta"
					};
					
					// Add the alphabet:
					
					for(var i=48; i<=90; i++){
						keys[i] = String.fromCharCode(i).toLowerCase();
					}
					
					if ($.inArray(e.which, keys)){
						
						// Add special keys:
						
						var special = '';
						if (e.altKey) special += 'alt+';
						if (e.ctrlKey) special += 'ctrl+';
						if (e.metaKey) special += 'meta+';
						if (e.shiftKey) special += 'shift+';
						
						var keycode = special+keys[e.which];
						
						// If the code matches, trigger the event:
						
						if (keycode == code){
							$el.trigger(special+keys[e.which]);
							e.preventDefault();
						}
					
					}
				
				});
			}
		}
		
		
		
		// ## jKit Commands
		//
		// Below are all commands included in this version of jKit. All other commands will be autoloaded.
		
		
		// ##### Init Command
		//
		// The init command is a special internal command that inits a DOM node with jKit. It
		// shares all the features of other commands, but is always included and a central part
		// of jKit.

		plugin.commands.init = (function(){
			
			var command = {};
			
			plugin.addCommandDefaults('init', {});
			
			command.execute = function($that, options){
				
				plugin.init($that);
				plugin.triggerEvent('complete', $that, options);

			};

			return command;

		}());
		
		
		
		// ##### Encode Command
		//
		// The [encode command](http://jquery-jkit.com/commands/encode.html) apply various encodings to the content of an element.
		// If the option is code, the content is not only HTML encoded, it can even remove the extra tab whitespace you get if you 
		// have that content indented inside the code element.
		
		plugin.commands.encode = (function(){
			
			// Create an object that contains all of our data and functionality.
			
			var command = {};
			
			// This are the command defaults:
			
			plugin.addCommandDefaults('encode', {
				'format':			'code',
				'fix': 				'yes'
			});
			
			// The execute function is launched whenever this command is executed:
			
			command.execute = function($that, options){
				
				switch(options.format) {
					case 'code':
						var src = $that.html();
						if (options.fix == 'yes'){
							src = preFix(src);
						}
						$that.html(src.replace(/</g, '&lt;').replace(/>/g, '&gt;'));
						break;
					case 'text':
						$that.html($that.text());
						break;
					case 'esc':
						$that.html(escape($that.html()));
						break;
					case 'uri':
						$that.html(encodeURI($that.html()));
						break;
				}
				
			};
			
			var preFix = function(str){
				
				var lines = str.split("\n");
				var min = 9999;
				
				$.each( lines, function(i,v){
					if ($.trim(v) != ''){
						
						var cnt = -1;
						
						while(v.charAt(cnt+1) == "\t"){
							cnt++;
						}
						cnt++;
						
						if (cnt < min){
							min = cnt;
						}
					
					}
				});
				
				$.each( lines, function(i,v){
					lines[i] = v.substr(min);
				});
				
				return lines.join("\n");
			};
			
			return command;
		
		}());


		// ##### Chart Command
		//
		// The [chart command](http://jquery-jkit.com/commands/chart.html) let's us create simple horizontal bar charts using 
		// different sized divs. This is definitely a good candidate for a command replacement using the canvas element to draw
		// different charts.
		
		plugin.commands.chart = (function(){
			
			// Create an object that contains all of our data and functionality.
			
			var command = {};
			
			// This are the command defaults:
			
			plugin.addCommandDefaults('chart', {
				'max':				0,
				'delaysteps':		100,
				'speed':			500,
				'easing':			'linear'
			});
			
			// The execute function is launched whenever this command is executed:
			
			command.execute = function($that, options){
				
				var s = plugin.settings;
				
				// First get the main label from the THEAD and the main element id:
				
				var label = $that.find('thead > tr > th.label').text();
				var id = $that.attr('id');
				
				// Now get all data column labels from the THEAD
				
				var datalabels = [];
				
				$that.find('thead > tr > th').each( function(){
					if (!$(this).hasClass('label')){
						datalabels.push( $(this).text() );
					}
				});
				
				// And the last thing we need is all the data from the tbody:
				
				// {!} task: Why do we get the TH from TBODY? This should be TDs!
				
				var max = 0;
				var plots = [];
				
				$that.find('tbody tr').each( function(){
					var plot = { 'label': $(this).find('th.label').text(), 'data': [] };
					$(this).find('th').each( function(){
						if (!$(this).hasClass('label')){
							var val = Number($(this).text());
							max = Math.max(val, max);
							plot.data.push(val);
						}
					});
					plots.push(plot);
				});
				
				// Set the maximum value for our chart either from the options or from all the data values:
				
				if (options.max > 0 && max < options.max){
					max = options.max;
				}
				
				// Time to construct our chart element:
				
				var $chart = $('<div/>', {
					id: id,
					'class': s.prefix+'-chart'
				});
				
				// Now loop through each data label and add the data from each plot to it. We are using a delay for each
				// plot and increase that delay with each new data label. This way we get a nice animation where every plot
				// is shown a little bit later.
				
				var steps = 0;
				var delay = 0;
				
				$.each(datalabels, function(i,v){
					
					steps++;
					var $step = $('<div/>', { 'class': s.prefix+'-chart-step' }).html('<label>'+v+'</label>').appendTo($chart);
					
					$.each( plots, function(i2,v2){
						
						if (plots[i2].data[i] > 0){
							
							var $plot = $('<div/>', { 'class': s.prefix+'-chart-plot '+s.prefix+'-chart-plot'+i2 }).appendTo($step);
							
							$('<div/>')
								.text(plots[i2].label)
								.delay(delay)
								.animate({ 'width': (plots[i2].data[i]/max*100)+'%' }, options.speed, options.easing)
								.appendTo($plot);
							
							$('<span/>', { 'class': s.prefix+'-chart-info' })
								.text(label+' '+plots[i2].label+': '+plots[i2].data[i]+' '+options.units)
								.appendTo($plot);
						
						}
					
					});
					
					if (steps == datalabels.length){
						setTimeout( function(){
							plugin.triggerEvent('complete', $that, options);
						}, options.speed+delay);
					}
					
					delay += Number(options.delaysteps);
				});
				
				// Evyerything is set up, so replace the original element with our new chart:
				
				$that.replaceWith($chart);
				
			};
			
			// Add local functions and variables here ...
			
			return command;
		
		}());


		// ##### Animation Command
		//
		// The [animation command](http://jquery-jkit.com/commands/animation.html) has two uses. Either it can be used
		// to animate the CSS of an element or it can be used to animated a kind of keyframe animation with attribute
		// tweenings.
		
		plugin.commands.animation = (function(){
			
			// Create an object that contains all of our data and functionality.
			
			var command = {};
			
			// This are the command defaults:
			
			plugin.addCommandDefaults('animation', {
				'fps':				25,
				'loop':				'no',
				'from': 			'',
				'to': 				'',
				'speed': 			'500',
				'easing': 			'linear',
				'delay':			0,
				'on': 				''
			});
			
			// The execute function is launched whenever this command is executed:
			
			command.execute = function($that, options){
				
				var s = plugin.settings;
				
				// First check if this is a CSS animation:
				
				if (options.to != ''){
					
					// If the **from** option is set, we first have to set the initial CSS:
					
					if (options.from != ''){
						$that.css( plugin.cssFromString(options.from) );
					}
					
					// use setTimeout to delay the animation, even if the delay is zero:
					
					setTimeout(function() {
						
						// Either add an event that starts the animation or start it right away:
						
						// {!} task: Dublicate code and the delay doesn't make much sense with an event like this.
						
						if (options.on != ''){
							$that.on( options.on, function(){
								$that.animate( plugin.cssFromString(options.to), options.speed, options.easing, function(){
									if (options.macro != undefined) plugin.applyMacro($that, options.macro);
									plugin.triggerEvent('complete', $that, options);
								});
							});
						} else {
							$that.animate( plugin.cssFromString(options.to), options.speed, options.easing, function(){
								if (options.macro != undefined) plugin.applyMacro($el, options.macro);
								plugin.triggerEvent('complete', $that, options);
							});
						}
					}, options.delay);
				
				} else {
					
					// This is a keyframe animation. Let's first set some initial variables:
					
					options.interval = 1000 / options.fps;
					
					var frames = [];
					
					var pos = 0;
					var lastframe = 0;
					
					// Loop through each keyframe and collect all the useful information
					// we can find and parse the frame command that sets each frames options.
					
					$that.children().each( function(){
						var rel = $(this).attr('rel');
						var data = $(this).attr(s.dataAttribute);
						
						if (data != undefined){
							var start = data.indexOf('[');
							var end = data.indexOf(']');
							var optionstring = data.substring(start+1, end);
						} else {
							var start = rel.indexOf('[');
							var end = rel.indexOf(']');
							var optionstring = rel.substring(start+1, end);
						}
						
						var frame = plugin.parseOptions(optionstring);
						
						frame.el = $(this);
						if (frame.easing == undefined) frame.easing = 'linear';
						
						frame.start = pos;
						pos += parseInt(frame.steps);
						frame.end = pos;
						lastframe = pos;
						pos++;
						
						frames.push(frame);
					});
					
					options.lastframe = lastframe;
					
					$that.css('overflow', 'hidden');
					
					// Replace the original elements content with the first frame only:
					
					$that.html(frames[0].el);
					
					// And now start the animation:
					
					window.setTimeout( function() { animation(frames, -1, $that, options); }, 0);
				
				}
				
			};
			
			var animation = function(frames, current, el, options){
				
				if ((windowhasfocus || !windowhasfocus && plugin.settings.ignoreFocus) && (el.jKit_inViewport() || !el.jKit_inViewport() && plugin.settings.ignoreViewport)){
					
					plugin.triggerEvent('showframe showframe'+(current+1), el, options);
					
					// Loop through each frame and run the frames action in case it matches the current frame number:
					
					$.each( frames, function(index, value){
						if (value.start == current){
							
							// First add the new element by cloning it from the frames object and calculate the duration
							// this frame is visible:
							
							el.html(value.el.clone());
							var duration = (value.end - value.start) * options.interval;
							
							// Depending on the action that is set for this frame, we need to start different kind of animations:
							
							if (value.action == 'fadeout'){
								el.children(":first").show().fadeTo(duration, 0, value.easing);
							} else if (value.action == 'fadein'){
								el.children(":first").hide().fadeTo(duration, 1, value.easing);
							} else if (value.action == 'fadeinout'){
								el.children(":first").hide().fadeTo(duration/2, 1, value.easing).fadeTo(duration/2, 0, value.easing);
							} else if (value.action == 'tween'){
								var next = frames[index+1].el;
								el.children(":first").animate({
									'font-size': next.css('font-size'),
									'letter-spacing': next.css('letter-spacing'),
									'color': next.css('color'),
									'opacity': next.css('opacity'),
									'background-color': next.css('background-color'),
									'padding-top': next.css('padding-top'),
									'padding-bottom': next.css('padding-bottom'),
									'padding-left': next.css('padding-left'),
									'padding-right': next.css('padding-right')
								}, duration, value.easing);
							}
						
						}
					})
					
					// Move one step forward:
					
					current++;
					var nextloop = false;
					if (current > options.lastframe){
						current = 0;
						nextloop = true;
					}
					
					// Is the animation finsihes or do we have to go to the next step?
					
					if ((nextloop && options.loop == "yes") || !nextloop){
						window.setTimeout( function() { animation(frames, current, el, options); }, options.interval);
					}
					
					// Some additional stuff to trigger in case the animation is finished:
					
					if (options.loop == "no"){
						if (options.macro != undefined) plugin.applyMacro(el, options.macro);
						plugin.triggerEvent('complete', el, options);
					}
				
				} else {
					window.setTimeout( function() { animation(frames, current, el, options); }, options.interval);
				}
			
			};
			
			return command;
		
		}());


		// ##### Tooltip Command
		//
		// The [tooltip command](http://jquery-jkit.com/commands/tooltip.html) displays additional information for
		// an element on mouseover.
		
		plugin.commands.tooltip = (function(){
			
			// Create an object that contains all of our data and functionality.
			
			var command = {};
			
			// This are the command defaults:
			
			plugin.addCommandDefaults('tooltip', {
				'text':				'',
				'content': 			'',
				'color':			'#fff',
				'background':		'#000',
				'classname':		'',
				'follow': 			'no',
				'event': 			'mouse',
				'yoffset': 			20
			});
			
			// The execute function is launched whenever this command is executed:
			
			command.execute = function($that, options){
				
				var s = plugin.settings;
				var visible = false;
				
				// Create the tooltip div if it doesn't already exist:
				
				if ($('div#'+s.prefix+'-tooltip').length == 0){
					$('<div/>', {
						id: s.prefix+'-tooltip'
					})
					.css('position', 'absolute')
					.hide().appendTo('body');
				}
				
				$tip = $('div#'+s.prefix+'-tooltip');
				
				// Get the text from the DOM node, title or alt attribute if it isn't set in the options:
				
				if (options.content != ''){
					options.text = $(options.content).html();
				} else {
					if (options.text == '') options.text = $.trim($that.attr('title'));
					if (options.text == '') options.text = $.trim($that.attr('alt'));
				}
				
				// Display the tooltip on mouseenter or focus:
				
				var onevent = 'mouseenter';
				var offevent = 'mouseleave click';
				
				if (options.event == 'focus'){
					onevent = 'focus';
					offevent = 'blur';
				}
				
				$that.on(onevent, function(e){
					
					// Has this tooltip custom styling either by class or by supplying color values?
					
					if (options.classname != ''){
						$tip.html(options.text).removeClass().css({ 'background': '', 'color': '' }).addClass(options.classname);
					} else {
						$tip.html(options.text).removeClass().css({ 'background': options.background, 'color': options.color });
					}
					
					if (options.event == 'focus'){
						
						// Set the position based on the element that came into focus:
						
						$tip.css({ 'top': $that.offset().top+$that.outerHeight(), 'left': $that.offset().left });
						
					} else {
					
						// Correctly position the tooltip based on the mouse position:
					
						$tip.css('top', (e.pageY+options.yoffset)).css('left', e.pageX);
					
						// Fix the tooltip position so that we don't get tooltips we can't read because their outside
						// the window:
					
						if ( parseInt($tip.css('left')) > $(window).width() / 2 ){
							$tip.css('left', '0px').css('left', e.pageX - $tip.width());
						}
						
					}
					
					// Stop any possible previous animations and start fading it in:
					
					$tip.stop(true, true).fadeIn(200);
					
					plugin.triggerEvent('open', $that, options);
					
					visible = true;
				
				// Fade out the tooltip on mouseleave:
				
				}).on(offevent, function(e){
					
					var speed = 200;
					if ($tip.is(':animated')){
						speed = 0;
					}
					
					$tip.stop(true, true).fadeOut(speed, function(){
						visible = false;
					});
					
					plugin.triggerEvent('closed', $that, options);
				
				});
				
				// If the "follow" option is "true", we let the tooltip follow the mouse:
				
				if (options.follow == 'yes'){
					$('body').on('mousemove', function(e){
						if (visible){
							$tip.css('top', (e.pageY+options.yoffset)).css('left', e.pageX);
						}
					});
				}
				
			};
			
			return command;
		
		}());


		// ##### Show Command
		//
		// The [show command](http://jquery-jkit.com/commands/show.html) is used to reveal an element, animated or not.
		
		plugin.commands.show = (function(){
			
			// Create an object that contains all of our data and functionality.
			
			var command = {};
			
			// This are the command defaults:
			
			plugin.addCommandDefaults('show', {
				'delay':			0,
				'speed':			500,
				'animation':		'fade',
				'easing':			'linear'
			});
			
			// The execute function is launched whenever this command is executed:
			
			command.execute = function($that, options){
				
				$that.hide().jKit_effect(true, options.animation, options.speed, options.easing, options.delay, function(){
					plugin.triggerEvent('complete', $that, options);
				});
				
			};
			
			return command;
		
		}());


		// ##### Swap Command
		//
		// The [swap command](http://jquery-jkit.com/commands/swap.html) replaces a DOM node attribute, for 
		// example an image, with another value on hover.
		
		plugin.commands.swap = (function(){
			
			// Create an object that contains all of our data and functionality.
			
			var command = {};
			
			// This are the command defaults:
			
			plugin.addCommandDefaults('swap', {
				'versions': 		'_off,_on',
				'attribute': 		'src'
			});
			
			// The execute function is launched whenever this command is executed:
			
			command.execute = function($that, options){
				
				var s = plugin.settings;
				
				var versions = options.versions.split(s.delimiter);
				var active = false;
				
				// We have to store the original attributes value to swap the attribute back on mouseleave:
				
				var original = $that.attr(options.attribute);
				var replacement = $that.attr(options.attribute).replace(versions[0],versions[1]);
				
				// In case the attribute is an image source, we have to preload the image or the swapping could have a delay:
				
				if (options.attribute == 'src'){
					$('<img/>')[0].src = replacement;
				}
				
				// Finally, add the two event handlers with the swapping code:
				
				$that.on( 'mouseenter click', function(){
					if (!active){
						$that.attr(options.attribute, replacement );
						plugin.triggerEvent('active', $that, options);
						active = true;
					}
				}).on( 'mouseleave click', function(){
					if (active){
						$that.attr(options.attribute, original );
						plugin.triggerEvent('inactive', $that, options);
						active = false;
					}
				});
				
			};
			
			return command;
		
		}());


		// ##### Limit Command
		//
		// The [limit command](http://jquery-jkit.com/commands/limit.html) either limts the
		// characters of a string or the elements inside a container by a set number.
		
		plugin.commands.limit = (function(){
			
			// Create an object that contains all of our data and functionality.
			
			var command = {};
			
			// This are the command defaults:
			
			plugin.addCommandDefaults('limit', {
				'elements':			'children',
				'count':			5,
				'animation':		'none',
				'speed':			250,
				'easing':			'linear',
				'endstring':		'...'
			});
			
			// The execute function is launched whenever this command is executed:
			
			command.execute = function($that, options){
				
				// Limit the number of elements. Set speed to zero if you want to hide them immediately
				// or use an animation:
				
				if (options.elements == 'children'){
					
					$that.children(':gt('+(options.count-1)+')').each(function(){
						$(this).jKit_effect(false, options.animation, options.speed, options.easing);
					});
					
					setTimeout( function(){
						plugin.triggerEvent('complete', $that, options);
					}, options.speed);
				
				// Limit the number of characters in a string:
				
				} else {
					
					var newtext = $that.text().substr(0,options.count);
					
					// Add an endstring if needed:
					
					if (newtext != $that.text()){
						newtext = newtext.substr(0,newtext.length-options.endstring.length)+options.endstring;
						$that.text(newtext);
					}
					
				}
				
			};
			
			return command;
		
		}());


		// ##### Lorem Command
		//
		// The [lorem command](http://jquery-jkit.com/commands/lorem.html) adds lorem ipsum text or paragraphs to 
		// your element, very usefull for "work in progress" projects.
		
		plugin.commands.lorem = (function(){
			
			// Create an object that contains all of our data and functionality.
			
			var command = {};
			
			// This are the command defaults:
			
			plugin.addCommandDefaults('lorem', {
				'paragraphs':		0,
				'length':			'',
				'random':			'no'
			});
			
			// The execute function is launched whenever this command is executed:
			
			command.execute = function($that, options){
				
				// The lorem ipsum text:
				
				var lorem = [
					'Lorem ipsum dolor sit amet, consectetur adipisici elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquid ex ea commodi consequat. Quis aute iure reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint obcaecat cupiditat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
					'Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim qui blandit praesent luptatum zzril delenit augue duis dolore te feugait nulla facilisi. Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.',
					'Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat. Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim qui blandit praesent luptatum zzril delenit augue duis dolore te feugait nulla facilisi.',
					'Nam liber tempor cum soluta nobis eleifend option congue nihil imperdiet doming id quod mazim placerat facer possim assum. Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat.',
					'Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis.',
					'At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, At accusam aliquyam diam diam dolore dolores duo eirmod eos erat, et nonumy sed tempor et et invidunt justo labore Stet clita ea et gubergren, kasd magna no rebum. sanctus sea sed takimata ut vero voluptua. est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat.',
					'Consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.'
				];
				
				var text = '';
				
				// Randomize the paragraphs first?
				
				if (options.random == "yes"){
					lorem = $.fn.jKit_arrayShuffle(lorem);
				}
				
				// Add a specific number of paragraphs:
				
				if (options.paragraphs > 0){
				
					for ( var i=1; i<=options.paragraphs; i++ ) {
						text += '<p>'+lorem[(i-1)%7]+'</p>';
					}
				
				// Or add a specific number of characters: 	
					
				} else {
					if (options.length != undefined && options.length != ''){
						
						var i=1;
						
						while(text.length < options.length-1){
							text += lorem[(i-1)%7]+' ';
							text = text.substring(0, options.length-1);
							i++;
						}
					
					} else {
						text = lorem[0];
					}
				}
				
				$that.html(text);
				
			};
			
			return command;
		
		}());


		// ##### Plugin Command
		//
		// The [plugin command](http://jquery-jkit.com/commands/plugin.html) makes it possible to add jQuery plugins
		// that can be used the same way as jKit commands.
		
		plugin.commands.plugin = (function(){
			
			// Create an object that contains all of our data and functionality.
			
			var command = {};
			
			// This are the command defaults:
			
			plugin.addCommandDefaults('plugin', {
				'script': 			''
			});
			
			// The execute function is launched whenever this command is executed:
			
			command.execute = function($that, options){
				
				var s = plugin.settings;
				
				// First check if this is a plugin we registered on plugin init:
				
				if (s.plugins[options.script] != undefined){
					
					options.functioncall = s.plugins[options.script]['fn'];
					if (s.plugins[options.script]['option'] != undefined){
						options.option = s.plugins[options.script]['option'];
					}
					
					options.script = s.plugins[options.script]['path'];
				}
				
				// Temporarly enable ajax caching:
				
				$.ajaxSetup({ cache: true });
				
				// 
				
				if (options.script != undefined){
					
					// Load the script from the server:
					
					$.getScript(options.script, function() {
						
						// The plugin has loaded, now all we need to do is correctly initialize it
						// by calling the correct function name with the correct set of parameters:
						
						if (options.option != undefined){
							$that[ options.functioncall ]( options[options.option] );
						} else {
							delete(options.type);
							delete(options.script);
							$that[ options.functioncall ]( options );
						}
						
						plugin.triggerEvent('complete', $that, options);
					
					});
				}
				
				// Stop ajax caching again:
				
				$.ajaxSetup({ cache: false });
				
			};
			
			return command;
		
		}());


		// ##### Split Command
		//
		// The [split command](http://jquery-jkit.com/commands/split.html) can take a string, for example a comma separeted one, 
		// and create new HTML elements out of the individual parts. This way a simple comma separated list can be transformed 
		// into an unordered list.
		
		plugin.commands.split = (function(){
			
			// Create an object that contains all of our data and functionality.
			
			var command = {};
			
			// This are the command defaults:
			
			plugin.addCommandDefaults('split', {
				'separator': 		'',
				'container': 		'span',
				'before':			'',
				'after':			''
			});
			
			// The execute function is launched whenever this command is executed:
			
			command.execute = function($that, options){
				
				var parts = $that.text().split(options.separator);
				$that.html('');
				
				$.each( parts, function(i,v){
					$('<'+options.container+'/>').text(v).appendTo($that);
				});
				
				$that.html(options.before+$that.html()+options.after);
				
			};
			
			return command;
		
		}());


		// ##### Random Command
		//
		// The [random command](http://jquery-jkit.com/commands/random.html) can be used to randomly select a 
		// specific amount of elements from a collection of elements. All not selected ones will either be hidden 
		// or completely removed from the DOM.
		
		plugin.commands.random = (function(){
			
			// Create an object that contains all of our data and functionality.
			
			var command = {};
			
			// This are the command defaults:
			
			plugin.addCommandDefaults('random', {
				'count': 			1,
				'remove': 			'yes'
			});
			
			// The execute function is launched whenever this command is executed:
			
			command.execute = function($that, options){
				
				var childs = $that.children().size();
				var shownrs = [];
				
				// Create an array of index numbers of our randomly selected elements:
				
				while(shownrs.length < options.count){
					var shownr = Math.floor(Math.random() * childs);
					if ($.inArray(shownr, shownrs) == -1){
						shownrs.push(shownr);
					}
				}
				
				// Now loop through all elements and only show those we just slected:
				
				var i = 0;
				$that.children().each( function(){
					if ($.inArray(i, shownrs) == -1){
						if (options.remove == 'yes'){
							$(this).remove();
						} else {
							$(this).hide();
						}
					} else {
						$(this).show();
					}
					i++;
				});
				
			};
			
			return command;
		
		}());


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


		// ##### Replace Command
		//
		// The [replace command](http://jquery-jkit.com/commands/replace.html) makes it possible to replace content 
		// based on a regex pattern. It acts on the HTML level, so not only text is replacable!
		
		plugin.commands.replace = (function(){
			
			// Create an object that contains all of our data and functionality.
			
			var command = {};
			
			// This are the command defaults:
			
			plugin.addCommandDefaults('replace', {
				'modifier': 		'g',
				'search': 			'',
				'replacement': 		''
			});
			
			// The execute function is launched whenever this command is executed:
			
			command.execute = function($that, options){
				
				var str = new RegExp(options.search, options.modifier);
				$that.html($that.html().replace(str,options.replacement));
				
			};
			
			return command;
		
		}());


		// ##### Sort Command
		//
		// The [sort command](http://jquery-jkit.com/commands/sort.html) helps you convert a normal table into a sortable table
		// by converting TH elements of a table into clickable buttons that sort the
		// table based on the data inside the same column as the TH.
		
		plugin.commands.sort = (function(){
			
			// Create an object that contains all of our data and functionality.
			
			var command = {};
			
			// This are the command defaults:
			
			plugin.addCommandDefaults('sort', {
				'what': 			'text',
				'by': 				'',
				'start':			0,
				'end':				0
			});
			
			// The execute function is launched whenever this command is executed:
			
			command.execute = function($that, options){
				
				var s = plugin.settings;
				
				// First we need to know the exact position of the current TH inside the heading TR, the index:
				
				var index = $that.parent().children().index($that);
				
				$that.on('click', function(){
					
					plugin.triggerEvent('clicked', $that, options);
					
					// First we have to create an array with the content we need to base the sort on:
					
					var rows = [];
					$that.parent().parent().parent().find('tbody > tr').each( function(){
						
						var $td = $(this).find('td:nth-child('+(index+1)+')');
						
						switch(options.what){
							case 'html':
								var str = $td.html();
								break;
							case 'class':
								var str = $td.attr('class');
								break;
							default:
								var str = $td.text();
								break;
						}
						
						if (options.start > 0 || options.end > 0){
							if (options.end > options.start){
								str = str.substring(options.start, options.end);
							} else {
								str = str.substring(options.start);
							}
						}
						
						rows.push({ 'content': $(this).html(), 'search': str });
					
					});
					
					// {!} task: It should be possible to use way less code in the code below! 
					
					// Now sort the array. There are currently three different ways to sort:
					//
					// - **alpha**: Will sort the array by the alphabetically
					// - **num**: Will sort the array numerically
					// - **date**: Will sort the array as a date
					//
					// Depending on the current class of the TH, we either sort ascending or descending.
					
					if ($that.hasClass(s.prefix+'-sort-down')){
						$that.parent().find('th').removeClass(s.prefix+'-sort-down').removeClass(s.prefix+'-sort-up');
						$that.addClass(s.prefix+'-sort-up');
						rows.sort( function(a,b){
							if (options.by == 'num'){
								a.search = Number(a.search);
								b.search = Number(b.search);
							}
							if (options.by == 'date'){
								var a = new Date(a.search);
								var b = new Date(b.search);
								return (a.getTime() - b.getTime());
							} else {
								if (a.search > b.search) return -1;
								if (a.search < b.search) return 1;
								return 0;
							}
						});
					} else {
						$that.parent().find('th').removeClass(s.prefix+'-sort-down').removeClass(s.prefix+'-sort-up');
						$that.addClass(s.prefix+'-sort-down');
						rows.sort( function(a,b){
							if (options.by == 'num'){
								a.search = Number(a.search);
								b.search = Number(b.search);
							}
							if (options.by == 'date'){
								var a = new Date(a.search);
								var b = new Date(b.search);
								return (b.getTime() - a.getTime());
							} else {
								if (a.search < b.search) return -1;
								if (a.search > b.search) return 1;
								return 0;
							}
						});
					}
					
					// Everything is ready, let's clear the whole TBODY of the table and add the sorted rows:
					
					var $body = $that.parent().parent().parent().find('tbody');
					$body.html('');
					
					var tbody = '';
					$.each( rows, function(i,v){
						tbody += '<tr>'+v.content+'</tr>';
					});
					
					$body.html(tbody);
					
					plugin.triggerEvent('complete', $that, options);
				
				});
				
			};
			
			return command;
		
		}());


		// ##### Respond Command
		//
		// The [respond command](http://jquery-jkit.com/commands/respond.html) can helps you create better responsive websites,
		// especially if it's built modularly. It makes it possible to use something similar to "Element Queries".
		
		plugin.commands.respond = (function(){
			
			// Create an object that contains all of our data and functionality.
			
			var command = {};
			
			// This are the command defaults:
			
			plugin.addCommandDefaults('respond', {});
			
			// The execute function is launched whenever this command is executed:
			
			command.execute = function($that, options){
				
				// Onlyx run the command if the *width* option is set:
				
				if (options.width != undefined){
					
					// Split the string into an array that contain all widths, sorted from the smallest to the biggest:
					
					var widths = options.width.split(',');
					widths.sort( function(a,b){
						return parseInt(a)-parseInt(b);
					});
					
					// Now execute and bind the **setClasses** function:
					
					setClasses($that, widths);
					
					$(window).resize(function(){
						setClasses($that, widths);
					});
				}
				
			};
			
			// The **setClasses** function sets the ^correct class based on the elements width.
			
			var setClasses = function($that, widths){
				
				// Set some initial variables:
				
				var w = $that.width();
				var responseClass = '';
				
				// Find out which class (if any) we have to set:
				
				for(var x in widths){
					if (parseInt(widths[x]) < w){
						responseClass = plugin.settings.prefix+'-respond-'+widths[x];
					}
				}
				
				// Get all currently set classes and remove them from the element:
				
				if ($that.attr('class') == undefined){
					var classList = [];
				} else {
					var classList = $that.attr('class').split(/\s+/);
				}
				
				$that.removeClass();
				
				// Add all needed classes back to the element together with the respond class:
				
				for(var x in classList){
					if (classList[x].indexOf(plugin.settings.prefix+'-respond') == -1){
						$that.addClass(classList[x]);
					}
				}
				
				$that.addClass(responseClass);
				
			};
			
			return command;
		
		}());


		// ##### Parallax Command
		//
		// The [parallax command](http://jquery-jkit.com/commands/parallax.html) is used to create a parallax scrolling
		// effect with different layers that look like a 3D scenery. Sidescrolling games in the old days used this kind 
		// of faked 3D effect quite a lot.
		
		plugin.commands.parallax = (function(){
			
			// Create an object that contains all of our data and functionality.
			
			var command = {};
			
			// This are the command defaults:
			
			plugin.addCommandDefaults('parallax', {
				'strength':			5,
				'axis':				'x',
				'scope':			'global',
				'detect': 			'mousemove'
			});
			
			// The execute function is launched whenever this command is executed:
			
			command.execute = function($that, options){
				
				var s = plugin.settings;
				
				var strength = options.strength / 10;
				
				// We have to attach our event to different DOM elements based on the the type of parallax we want.
				// The first option will use window scrolling to set the position of each layer, the other two use
				// the mouse position for that.
				
				if (options.detect == 'scroll'){
					var $capture = $(window);
				} else if (options.scope == 'global'){
					var $capture = $(document);
				} else {
					var $capture = $that;
				}
				
				// Set the correct event:
				
				$capture.on( options.detect, function(event) {
					
					// We only want to go through all calculations if needed, so check if our element is inside the viewport 
					// and that the window has focus:
					
					if ((windowhasfocus || !windowhasfocus && s.ignoreFocus) && ($that.jKit_inViewport() || !$that.jKit_inViewport() && s.ignoreViewport)){
						var cnt = 1;
						
						// Get either the scroll or the mouse position:
						
						if (options.detect == 'scroll'){
							var xaxis = $(window).scrollLeft() + $(window).width() / 2;
							var yaxis = $(window).scrollTop() + $(window).height() / 2;
						} else {
							var xaxis = event.pageX;
							var yaxis = event.pageY;
						}
						
						// Loop through each layer and set the correct positions of each one of them:
						
						$that.children().each( function(){
							
							var box = $that.offset();
							
							if (options.axis == 'x' || options.axis == 'both'){
								var offsetx = (xaxis-box.left-($that.width()/2))*strength*cnt*-1 - $(this).width()/2 + $that.width()/2;
								$(this).css({ 'left': offsetx+'px' });
							}
							if (options.axis == 'y' || options.axis == 'both'){
								var offsety = (yaxis-box.top-($that.height()/2))*strength*cnt*-1 - $(this).height()/2 + $that.height()/2;
								$(this).css({ 'top': offsety+'px' });
							}
							
							cnt++;
						
						});
					}
				
				});
				
			};
			
			return command;
		
		}());


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


		// ##### Partially Command
		//
		// The [partially command](http://jquery-jkit.com/commands/partially.html) let's us display an element
		// only partially in case it is bigger than our supplied maximum height. The whole height is shown only 
		// on specific user action (hover over element or click of the *down* key)
		
		plugin.commands.partially = (function(){
			
			// Create an object that contains all of our data and functionality.
			
			var command = {};
			
			// This are the command defaults:
			
			plugin.addCommandDefaults('partially', {
				'height':			200,
				'text':				'more ...',
				'speed':			250,
				'easing':			'linear',
				'on': 				'mouseover',
				'area':				'',
				'alphaon': 			0.9,
				'alphaoff':			0
			});
			
			// The execute function is launched whenever this command is executed:
			
			command.execute = function($that, options){
				
				var s = plugin.settings;
				
				// First store the original height, we need it later.
				
				var originalHeight = $that.height();
				
				// Only add the magic is we need, in other words, if the lement is higher than our maximum height:
				
				if (originalHeight > options.height){
					
					// We can only add our *more div* if it's relatively positioned, so force that one on it:
					
					$that.css('position', 'relative');
					
					// Create the *more div*:
					
					var $morediv = $('<div/>')
							.addClass(s.prefix+'-morediv')
							.appendTo($that)
							.html(options.text)
							.css( { width: $that.outerWidth()+'px', opacity: options.alphaon });
					
					// Add the event handlers and animations:
					
					plugin.addKeypressEvents($that, 'down');
					plugin.addKeypressEvents($that, 'up');
					
					if (options.on == 'click' || $.fn.jKit_iOS()){
						var openEvent = 'click';
						var closeEvent = 'click';
					} else {
						var openEvent = 'mouseenter';
						var closeEvent = 'mouseleave';
					}
					
					// If the **area** option is set to "morediv", we add the event handler only onto the more div
					// and don't block the content inside the main element from receiving events.
					
					if (options.area == 'morediv'){
						$area = $morediv;
					} else {
						$area = $that;
					}
					
					$that.css({ 'height': options.height+'px', 'overflow': 'hidden' });
					
					$area.on( openEvent+' down', function() {
						if ($that.height() < originalHeight){
							$morediv.fadeTo(options.speed, options.alphaoff);
							$that.animate({ 'height': originalHeight+'px' }, options.speed, options.easing, function(){
								plugin.triggerEvent('open', $that, options);
							});
						}
					}).on( closeEvent+' up',  function(){
						if ($that.height() == originalHeight){
							$morediv.fadeTo(options.speed, options.alphaon);
							$that.animate({ 'height': options.height+'px' }, options.speed, options.easing, function(){
								plugin.triggerEvent('closed', $that, options);
							});
						}
					});
					
				}
				
			};
			
			return command;
		
		}());


		// ##### Showandhide Command
		//
		// The [showandhide command](http://jquery-jkit.com/commands/showandhide.html) is used to reveal an element
		// and than hide it again, animated or not.
		
		plugin.commands.showandhide = (function(){
			
			// Create an object that contains all of our data and functionality.
			
			var command = {};
			
			// This are the command defaults:
			
			plugin.addCommandDefaults('showandhide', {
				'delay':			0,
				'speed':			500,
				'duration':			10000,
				'animation':		'fade',
				'easing':			'linear'
			});
			
			// The execute function is launched whenever this command is executed:
			
			command.execute = function($that, options){
				
				$that.hide().jKit_effect(true, options.animation, options.speed, options.easing, options.delay, function(){
					plugin.triggerEvent('shown', $that, options);
					$that.jKit_effect(false, options.animation, options.speed, options.easing, options.duration, function(){
						plugin.triggerEvent('complete', $that, options);
					});
				});
				
			};
			
			return command;
		
		}());


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


		// ##### Slideshow Command
		//
		// The [slideshow command](http://jquery-jkit.com/commands/slideshow.html) is being used to create 
		// slideshows of either images or any other kind of HTML content.
		
		plugin.commands.slideshow = (function(){
			
			// Create an object that contains all of our data and functionality.
			
			var command = {};
			
			// This are the command defaults:
			
			plugin.addCommandDefaults('slideshow', {
				'shuffle':			'no',
				'interval':			3000,
				'speed':			250,
				'animation':		'fade',
				'easing':			'linear',
				'on': 				''
			});
			
			// The execute function is launched whenever this command is executed:
			
			command.execute = function($that, options){
				
				// Get all slides:
				
				var slides = $that.children();
				
				// If needed, shuffle the slides into a random order:
				
				if (options.shuffle == 'yes'){
					var tmp, rand;
					var slidecount = slides.length;
					for(var i =0; i < slidecount; i++){
						rand = Math.floor(Math.random() * slidecount);
						tmp = slides[i];
						slides[i] = slides[rand];
						slides[rand] = tmp;
					}
				}
				
				$that.css( { 'position': 'relative' } );
				
				// Add the first slide and set a hidden data attribute so we know
				// if the slideshow is running or not.
				
				$that.html(slides[0]);
				$.data($that, 'anim', false);
				
				if (options.on != ''){
					
					// In case the **on** option is set to **mouseover**, we have to set an
					// additional **mouseleave** event.
					
					if (options.on == 'mouseover'){
						$that.on( 'mouseleave', function(){
							$.data($that, 'anim', false);
						});
					}
					
					// Set the correct events and use a setTimeout function to call the slideshow function:
					
					$that.on( options.on, function(){
						if (options.on == 'click'){
							if ($.data($that, 'anim')){
								$.data($that, 'anim', false);
							} else {
								$.data($that, 'anim', true);
								window.setTimeout( function() { slideshow(slides, 0, $that, options); }, 0);
							}
						} else if (options.on == 'mouseover'){
							if (!$.data($that, 'anim')){
								$.data($that, 'anim', true);
								window.setTimeout( function() { slideshow(slides, 0, $that, options); }, 0);
							}
						}
					});
				
				} else {
					
					// No event is set, so we just run the slideshow right now:
					
					$.data($that, 'anim', true);
					window.setTimeout( function() { slideshow(slides, 0, $that, options); }, options.interval);
					
				}
				
			};
			
			// The **slideshow** function replaces one slide with the next one. This one is
			// is really simple, so not much to comment, just that the old element is first being hidden and than the new one shown,
			// with or whitout an animation.
			
			var slideshow = function(slides, current, el, options){
				
				if ($.data(el, 'anim')){
					if ((windowhasfocus || !windowhasfocus && plugin.settings.ignoreFocus) && (el.jKit_inViewport() || !el.jKit_inViewport() && plugin.settings.ignoreViewport)){
						
						if (current < (slides.length-1)){
							current++;
						} else {
							current = 0;
						}
						
						plugin.triggerEvent('hideentry hideentry'+(current+1), el, options);
						
						el.jKit_effect(false, options.animation, options.speed, options.easing, 0, function(){
							el.html(slides[current]);
							
							plugin.triggerEvent('showentry showentry'+(current+1), el, options);
							
							el.jKit_effect(true, options.animation, options.speed, options.easing, 0, function(){
								window.setTimeout( function() { slideshow(slides, current, el, options); }, options.interval);
							});
						});
					
					} else {
						window.setTimeout( function() { slideshow(slides, current, el, options); }, options.interval);
					}
				}
			
			};
			
			return command;
		
		}());


		// ##### Cycle Command
		//
		// The [cycle command](http://jquery-jkit.com/commands/cycle.html) let's you "cycle" through
		// a sequence of values and apply them to a set of DOM nodes. This can be classes, html, attributes or css.
		
		plugin.commands.cycle = (function(){
			
			// Create an object that contains all of our data and functionality.
			
			var command = {};
			
			// This are the command defaults:
			
			plugin.addCommandDefaults('cycle', {
				'what': 			'class',
				'where': 			'li',
				'scope': 			'children',
				'sequence': 		'odd,even'
			});
			
			// The execute function is launched whenever this command is executed:
			
			command.execute = function($that, options){
				
				var s = plugin.settings;
				
				var seq = options.sequence.split(s.delimiter);
				var pos = 0;
				
				var sel = options.where;
				if (options.scope == 'children'){
					sel = '> '+sel;
				}
				
				$that.find(sel).each( function(){
					if (seq[pos] != undefined && seq[pos] != ''){
						switch(options.what){
							case 'class':
								$(this).addClass(seq[pos]);
								break;
							case 'html':
								$(this).html(seq[pos]);
								break;
							default:
								
								// If it's not a class or html, it has to be a dot separated combination like for exmaple
								// **css.color** or **attr.id**, so split it:
							
								var what = options.what.split('.');
								if (what[0] == 'attr'){
									$(this).attr(what[1], seq[pos]);
								} else if (what[0] == 'css'){
									$(this).css(what[1], seq[pos]);
								}
						}
					}
					pos++;
					if (pos > seq.length-1) pos = 0;
				});
				
			};
			
			return command;
		
		}());


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


		// ##### Accordion Command
		//
		// The [accordion command](http://jquery-jkit.com/commands/accordion.html) creates a content navigation
		// that acts like an accordion.
		
		plugin.commands.accordion = (function(){
			
			// Create an object that contains all of our data and functionality.
			
			var command = {};
			
			// This are the command defaults:
			
			plugin.addCommandDefaults('accordion', {
				'active':			1,
				'animation':		'slide',
				'speed':			250,
				'easing':			'linear'
			});
			
			// The execute function is launched whenever this command is executed:
			
			command.execute = function($that, options){
				
				var s = plugin.settings;
				
				// First try to find out which kind of HTML elements are used to structure the data:
				
				var containerTag = plugin.findElementTag($that, '>', 'max', 'div');
				var titleTag = plugin.findElementTag($that, '> '+containerTag+' >', 0, 'h3');
				var contentTag = plugin.findElementTag($that, '> '+containerTag+' >', 1, 'div');
				
				// Next we need to create an array that contains all the titles and content (yes, this
				// is so similar to the tabs command, that even the array is called "tabs"):
				
				// {!} task: Can we save code if we combine this one and the tab command? They are very similar!
				
				var tabs = [];
				$that.children(containerTag).each( function(){
					tabs.push({
						'title': $(this).children(titleTag).detach(),
						'content': $(this).children(contentTag).detach()
					});
				});
				
				// Prepare the original element so that we can add the navigation:
				
				$that.html('');
				var $tabnav = $('<ul/>', { }).appendTo($that);
				
				var current = 1;
				if (options.active == 0) current = -1;
				
				// Loop through each element and create the correct data structure with all events and animations:
				
				$.each( tabs, function(index, value){
					
					var $litemp = $('<li/>', { }).append(value.title).css('cursor', 'pointer').appendTo($tabnav);
					
					if (options.active-1 == index){
						$litemp.append(value.content).children(titleTag).addClass(s.activeClass);
						current = index;
					} else {
						$litemp.append(value.content.hide());
					}
					
					$litemp.find('> '+titleTag).on( 'click', function(e){
						if (index != current){
							plugin.triggerEvent('showentry showentry'+(index+1), $that, options);
							$tabnav.find('> li > '+titleTag).removeClass(s.activeClass);
							$(this).addClass(s.activeClass);
							if (options.animation == 'slide'){
								$tabnav.find('> li:nth-child('+(current+1)+') > '+contentTag).slideUp(options.speed, options.easing);
								$tabnav.find('> li:nth-child('+(index+1)+') > '+contentTag).slideDown(options.speed, options.easing);
							} else {
								$tabnav.find('> li:nth-child('+(current+1)+') > '+contentTag).hide();
								$tabnav.find('> li:nth-child('+(index+1)+') > '+contentTag).show();
							}
							current = index;
						} else {
							plugin.triggerEvent('hideentry hideentry'+(index+1), $that, options);
							$(this).removeClass(s.activeClass).next().slideUp(options.speed, options.easing);
							current = -1;
						}
					});
				
				});
				
			};
			
			// Add local functions and variables here ...
			
			return command;
		
		}());


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


		// ##### Tabs Command
		//
		// The [tabs command](http://jquery-jkit.com/commands/tabs.html) is used to create a tab navigation
		// of different content elements.
		
		plugin.commands.tabs = (function(){
			
			// Create an object that contains all of our data and functionality.
			
			var command = {};
			
			// This are the command defaults:
			
			plugin.addCommandDefaults('tabs', {
				'active':			1,
				'animation':		'none',
				'speed':			250,
				'easing':			'linear'
			});
			
			// The execute function is launched whenever this command is executed:
			
			command.execute = function($that, options){
				
				var s = plugin.settings;
				
				// First try to find out which kind of HTML elements are used to structure the data:
				
				var containerTag = plugin.findElementTag($that, '>', 'max', 'div');
				var titleTag = plugin.findElementTag($that, '> '+containerTag+' >', 0, 'h3');
				var contentTag = plugin.findElementTag($that, '> '+containerTag+' >', 1, 'div');
				
				// Next we need to create an array the contains all the tab titles and content:
				
				var tabs = [];
				$that.children(containerTag).each( function(){
					tabs.push({ 'title': $(this).children(titleTag).html(), 'content': $(this).children(contentTag).detach() });
				});
				
				// Prepare the original element so that we can add the navigation:
				
				$that.html('');
				var $tabnav = $('<ul/>', { }).appendTo($that);
				
				// We need a jQuery element right now but can only set it after the following loop has finished:  
				
				var $tabcontent = $;
				
				$.each( tabs, function(index, value){
					
					// Create a list element and add it to the tab naviagtion:
					
					var $litemp = $('<li/>', { }).html(value.title).css('cursor', 'pointer').appendTo($tabnav);
					
					// Is this tab active? If yes, add the "active" class:
					
					if (options.active-1 == index){
						$litemp.addClass(s.activeClass);
					}
					
					// Create a callback for each list and fire it on the click event:
					
					// {!} task: Was there a reason for this callback variable? Can't we just use an anonymos function inside the event?
					
					var callback = function(){
						plugin.triggerEvent('showentry showentry'+(index+1), $that, options);
						
						$tabcontent.jKit_effect(false, options.animation, options.speed, options.easing, 0, function(){
							$(this).remove();
							$tabcontent = tabs[index].content.appendTo($that).hide();
							$tabcontent.jKit_effect(true, options.animation, options.speed, options.easing);
						});
						
						$tabnav.find('li').removeClass(s.activeClass);
						$tabnav.find('li:nth-child('+(index+1)+')').addClass(s.activeClass);
					};
					
					$litemp.on( 'click ', function(){
						callback();
					});
					
				});
				
				// Do we have to display an initial content or do we start without a tab selected?
				
				if (tabs[options.active-1] != undefined){
					$tabcontent = tabs[options.active-1].content.appendTo($that);
				}
				
			};
			
			// Add local functions and variables here ...
			
			return command;
		
		}());


		// ##### Key Command
		//
		// The [key command](http://jquery-jkit.com/commands/key.html) let's us create hotkeys 
		// for links. If thge link has an **onclick** attribute, we fire that one, if not, we're just 
		// going to open the href, either as a popup or inside the same window, whatever the target 
		// attribute tells us.
		
		plugin.commands.key = (function(){
			
			// Create an object that contains all of our data and functionality.
			
			var command = {};
			
			// This are the command defaults:
			
			plugin.addCommandDefaults('key', {});
			
			// The execute function is launched whenever this command is executed:
			
			command.execute = function($that, options){
				
				if (options.code != undefined){
					
					// First we need to add the event handling for this keycode to the element ...
					
					plugin.addKeypressEvents($that, options.code);
					
					// Because only now we can listen to it:
					
					$that.on( options.code, function(){
						if ($that.attr('onclick') !== undefined){
							$that.click();
						} else {
							if ($that.attr('target') !== undefined && $that.attr('target') == '_blank'){
								
								// Sadly we can't open pages in a new tab or regular window, so we have to open it in a popup instead:
								
								window.open($that.attr('href'), '_blank', false);
							} else {
								window.location.href = $that.attr('href');
							}
						}
						if (options.macro != undefined) plugin.applyMacro($that, options.macro);
						plugin.triggerEvent('pressed', $that, options);
					});
				
				}
				
			};
			
			return command;
		
		}());


		// ##### Scroll Command
		//
		// The [scroll command](http://jquery-jkit.com/commands/scroll.html) let's us scroll smoothly to
		// an anchor on the page or if the HREF attribute is empty, we just scroll to the top.
		
		plugin.commands.scroll = (function(){
			
			// Create an object that contains all of our data and functionality.
			
			var command = {};
			
			// This are the command defaults:
			
			plugin.addCommandDefaults('scroll', {
				'speed': 			500,
				'dynamic': 			'yes',
				'easing': 			'linear',
				'offset': 			0
			});
			
			// The execute function is launched whenever this command is executed:
			
			command.execute = function($that, options){
				
				$that.click(function() {
					
					plugin.triggerEvent('clicked', $that, options);
					
					// Get the position of our target element:
					
					if ($(this).attr("href") == ''){
						var ypos = 0;
					} else {
						var ypos = $($that.attr("href")).offset().top;
					}
					
					ypos = ypos + parseInt(options.offset);
					
					// The dynamic option changes the scroll animation duration based on the distance between 
					// us and the target element:
					
					if (options.dynamic == 'yes'){
						options.speed = Math.abs($(document).scrollTop() - ypos) / 1000 * options.speed;
					}
					
					// Finally animate the **scrollTop** of the whole HTML page to scroll inside the current window:
					
					$('html, body').animate({ scrollTop: ypos+'px' }, options.speed, options.easing, function(){
						plugin.triggerEvent('complete', $that, options);
					});
					
					return false;
					
				});
				
			};
			
			return command;
		
		}());


		// ##### Form Command
		//
		// The [form command](http://jquery-jkit.com/commands/form.html) can convert a regular web form into
		// an ajax submitted form. Additionally it adds various validation options.
		
		plugin.commands.form = (function(){
			
			// Create an object that contains all of our data and functionality.
			
			var command = {};
			
			// This are the command defaults:
			
			plugin.addCommandDefaults('form', {
				'validateonly':		'no'
			});
			
			// The execute function is launched whenever this command is executed:
			
			command.execute = function($that, options){
				
				var s = plugin.settings;
				
				// Add a hidden field that will contain a list of required fileds so that our PHP script can check
				// against them.
				
				$that.append('<input type="hidden" name="'+s.prefix+'-requireds" id="'+s.prefix+'-requireds">');
				
				if (options.error != undefined) options.formerror = options.error;
				
				var requireds = [];
				
				// Add an on submit event so that we can do our work before the form is being submitted:
				
				$that.on('submit', function() {
					
					// Create an error array and remove all error nodes previously set:
					
					var errors = [];
					$(this).find('span.'+s.errorClass).remove();
					
					// Parse the validation commands:
					
					// {!} task: Can't we use the default parsing here so that we save code and get all features?
					
					$(this).find("*[rel^=jKit], *["+s.dataAttribute+"]").each( function(){
						
						var rel = $(this).attr('rel');
						var data = $(this).attr(s.dataAttribute);
						
						if (data != undefined){
							var start = data.indexOf('[');
							var end = data.indexOf(']');
							var optionstring = data.substring(start+1, end);
						} else {
							var start = rel.indexOf('[');
							var end = rel.indexOf(']');
							var optionstring = rel.substring(start+1, end);
						}
						
						var options = plugin.parseOptions(optionstring);
						
						var type = options.type;
						var elerror = false;
						var required = false;
						
						if (options.required == undefined) options.required = false;
						
						// Check if this form element is required and if yes, check if there is something entered:
						
						if (options.required == 'true'){
							if ($(this).val() == ''){
								elerror = true;
								errors.push( { 'element': $(this), 'error': 'required' } );
							}
							required = true;
							if ($.inArray($(this).attr('name'), requireds) == -1){
								requireds.push($(this).attr('name'));
							}
						}
						
						// Check if we really have to go through all validation checks:
						
						if ((required || $(this).val() != '') || options.type == 'group'){
							
							// Is this a valid email?
							if (options.type == 'email' && !$.fn.jKit_emailCheck($(this).val())){
								elerror = true;
								errors.push( { 'element': $(this), 'error': 'email' } );
							}
							
							// Is this a valid url (http:// or https://)?
							if (options.type == 'url' && !$.fn.jKit_urlCheck($(this).val())){
								elerror = true;
								errors.push( { 'element': $(this), 'error': 'url' } );
							}
							
							// Is this a valid date?
							if (options.type == 'date' && !$.fn.jKit_dateCheck($(this).val())){
								elerror = true;
								errors.push( { 'element': $(this), 'error': 'date' } );
							}
							
							// Is this date older than some other date?
							if (options.type == 'date' &&  (new Date($(this).val()).getTime() <= new Date($(options.older).val()).getTime()) ){
								elerror = true;
								errors.push( { 'element': $(this), 'error': 'older' } );
							}
							
							// Is this date younger than some other date?
							if (options.type == 'date' &&  (new Date($(this).val()).getTime() >= new Date($(options.younger).val()).getTime()) ){
								elerror = true;
								errors.push( { 'element': $(this), 'error': 'younger' } );
							}
							
							// Is this a valid time?
							if (options.type == 'time' && !$.fn.jKit_timeCheck($(this).val())){
								elerror = true;
								errors.push( { 'element': $(this), 'error': 'time' } );
							}
							
							// Is this a valid phone number?
							if (options.type == 'phone' && !$.fn.jKit_phoneCheck($(this).val())){
								elerror = true;
								errors.push( { 'element': $(this), 'error': 'phone' } );
							}
							
							// Is this a float?
							if (options.type == 'float' && isNaN($(this).val())){
								elerror = true;
								errors.push( { 'element': $(this), 'error': 'float' } );
							}
							
							// Is this a int?
							if (options.type == 'int' && parseInt($(this).val()) != $(this).val()){
								elerror = true;
								errors.push( { 'element': $(this), 'error': 'int' } );
							}
							
							// min (numeric)?
							if ((options.type == 'int' || options.type == 'float') && options.min != undefined && $(this).val() < options.min && options.type != 'group'){
								elerror = true;
								errors.push( { 'element': $(this), 'error': 'min' } );
							}
							
							// max (numeric)?
							if ((options.type == 'int' || options.type == 'float') && options.max != undefined && $(this).val() > options.max && options.type != 'group'){
								elerror = true;
								errors.push( { 'element': $(this), 'error': 'max' } );
							}
							
							// Is this bigger than x (numeric)?
							if ((options.type == 'int' || options.type == 'float') && options.bigger != undefined && $(this).val() > $(options.bigger).val()){
								elerror = true;
								errors.push( { 'element': $(this), 'error': 'bigger' } );
							}
							
							// Is this smaller than x (numeric)?
							if ((options.type == 'int' || options.type == 'float') && options.smaller != undefined && $(this).val() < $(options.smaller).val()){
								elerror = true;
								errors.push( { 'element': $(this), 'error': 'smaller' } );
							}
							
							// min (length)?
							if ((options.type != 'int' && options.type != 'float') && options.min != undefined && $(this).val().length < options.min && options.type != 'group'){
								elerror = true;
								errors.push( { 'element': $(this), 'error': 'minlength' } );
							}
							
							// max (length)?
							if ((options.type != 'int' && options.type != 'float') && options.max != undefined && $(this).val().length > options.max && options.type != 'group'){
								elerror = true;
								errors.push( { 'element': $(this), 'error': 'maxlength' } );
							}
							
							// Is the length of the entered string exactly the specified value?
							if (options.length != undefined && $(this).val().length != options.length){
								elerror = true;
								errors.push( { 'element': $(this), 'error': 'length' } );
							}
							
							// Is this longer than x (length)?
							if ((options.type != 'int' && options.type != 'float') && options.longer != undefined && $(this).val().length > $(options.longer).val().length){
								elerror = true;
								errors.push( { 'element': $(this), 'error': 'longer' } );
							}
							
							// Is this shorter than x (length)?
							if ((options.type != 'int' && options.type != 'float') && options.shorter != undefined && $(this).val().length < $(options.shorter).val().length){
								elerror = true;
								errors.push( { 'element': $(this), 'error': 'shorter' } );
							}
							
							// Check password strength (0=bad, 100=perfect)?
							if (options.strength != undefined && $.fn.jKit_passwordStrength($(this).val()) < options.strength){
								elerror = true;
								errors.push( { 'element': $(this), 'error': 'strength' } );
							}
							
							// Is this the same as x?
							if (options.same != undefined && $(this).val() != $(options.same).val()){
								elerror = true;
								errors.push( { 'element': $(this), 'error': 'same' } );
							}
							
							// Is this different than x?
							if (options.different != undefined && $(this).val() != $(options.different).val()){
								elerror = true;
								errors.push( { 'element': $(this), 'error': 'different' } );
							}
							
							// Has this file the correct extension?
							if (options.type == 'extension'){
								var opts = options.options.split(s.delimiter);
								var filesplit = $(this).val().split('.');
								var ext = filesplit[filesplit.length-1];
								if ($.inArray(ext,opts) == -1) {
									elerror = true;
									errors.push( { 'element': $(this), 'error': 'ext' } );
								}
							}
							
							// Is the correct amount of elements checked in this group?
							if (options.type == 'group'){
								if (options.min != undefined || options.max != undefined){
									var checked = 0;
									$(this).children('input[type=checkbox][checked]').each( function(){
										checked++;
									});
									if ((options.min != undefined && options.min > checked) || (options.max != undefined && checked > options.max)){
										elerror = true;
										errors.push( { 'element': $(this), 'error': 'group' } );
									}
								} else {
									if ($(this).find("input[name='"+options.name+"']:checked").val() == undefined){
										elerror = true;
										errors.push( { 'element': $(this), 'error': 'group' } );
									}
								}
							}
							
							// Call a custom function that checks this field:
							if (options.type == 'custom' && options.checkfunction != undefined){
								var fn = window[options.checkfunction];
								if(typeof fn === 'function') {
									if ( !fn( $(this).val() ) ){
										elerror = true;
										errors.push( { 'element': $(this), 'error': 'custom' } );
									}
								}
							}
						
						}
						
						// Display and error if anything didn't validate correctly:
						
						if (elerror){
							if (options.error != undefined){
								$(this).after('<span class="'+s.errorClass+'">'+options.error+'</span>');
							}
							$(this).addClass(s.errorClass);
						} else {
							$(this).removeClass(s.errorClass);
						}
					
					});
					
					// No errors? Than go on ...
					
					if (errors.length == 0){
						
						// If this form doesn't use an ajax submit, than just fire  the "complete" event:
						
						if (options.validateonly == "yes"){
							
							plugin.triggerEvent('complete', $that, options);
							
							return true;
						
						// This is an ajax submit:
						
						} else {
							
							var action = $(this).attr('action');
							
							$that.removeClass(s.errorClass);
							
							if (options.success == undefined) options.success = 'Your form has been sent.';
							
							// Put all the required fields, comma separated, into the hidden field: 
							
							$that.find('input#'+s.prefix+'-requireds').val(requireds.join(s.delimiter));
							
							// Post send the serialized data to our form script: 
							
							$.post(action, $that.serialize(), function(data, textStatus, jqXHR) {
								$that.find('.'+s.errorClass).hide();
								
								// Check if everything got through correctly:
								
								if (data.sent != undefined && data.sent == true){
									if (options.success.charAt(0) == '#'){
										$that.html($(options.success).show());
									} else {
										$that.html('<p class="'+s.successClass+'">'+options.success+'</p>');
									}
									plugin.triggerEvent('complete', $that, options);
									if (options.macro != undefined) plugin.applyMacro($that, options.macro);
								} else {
									for (x in data.error){
										var field = data.error[x];
										$that.find('*[name='+field+']').addClass(s.errorClass).after('<span class="'+s.errorClass+'">'+options.error+'</span>');
									}
									plugin.triggerEvent('error', $that, options);
								}
							
							// Something didn't really work. Is there even a compatible form script? Show error:
								
							}).error(function(xhr, ajaxOptions, thrownError){
								alert(thrownError);
								$that.append('<span class="'+s.errorClass+'">There was an error submitting the form: Error Code '+xhr.status+'</span>');
							});
							
							// Return **false** so that the browser doesn't submit the form himself:
							
							return false;
						
						}
					
					} else {
						
						// Do we have to display an error for the whole form?
						
						$that.addClass(s.errorClass);
						if (options.formerror != undefined){
							$that.append('<span class="'+s.errorClass+'">'+options.formerror+'</span>');
						}
						plugin.triggerEvent('error', $that, options);
						
						// Return **false** so that the browser doesn't submit the form himself:
						
						return false;
					}
				
				});
				
			};
			
			return command;
		
		}());


		// ##### Ajax Command
		//
		// The [ajax command](http://jquery-jkit.com/commands/ajax.html) can do a few thing. The normal use case is a link 
		// that loads some extra content through an ajax call on click. But the command can be used to lazy load images, too.
		
		plugin.commands.ajax = (function(){
			
			// Create an object that contains all of our data and functionality.
			
			var command = {};
			
			// This are the command defaults:
			
			plugin.addCommandDefaults('ajax', {
				'animation':		'slide',
				'speed':			250,
				'easing':			'linear',
				'when': 			'click'
			});
			
			// The execute function is launched whenever this command is executed:
			
			command.execute = function($that, options){
				
				var s = plugin.settings;
				
				// If the href option is set, take it from the option, if not, take it from our element: 
				
				if (options.href != undefined && options.href != ''){
					var href = options.href;
				} else {
					var href = $that.attr('href');
				}
				
				if (options.when == 'load' || options.when == 'viewport' || options.when == 'shown'){
					
					// If the option **when** is **load*, than we're just loading the content:
					
					if (options.when == 'load'){
						$that.load(href, function(){
							plugin.triggerEvent('complete', $that, options);
						});
						
					// If it's **viewport** or **shown**, we're going to wait till the content enters the viewport or is being shown (think resonsive) before 
					// we load the content or the image (lazy load), whatever our options say:
						
					} else {
						var myInterval = setInterval(function(){
							if ( (options.when == 'viewport' && ($that.jKit_inViewport() || !$that.jKit_inViewport() && s.ignoreViewport)) || (options.when == 'shown' && $that.css('display') != 'none') ){
								if (options.src != undefined){
									$that.attr('src', options.src);
									plugin.triggerEvent('complete', $that, options);
								} else {
									$that.load(href, function(){
										plugin.init($that);
										plugin.triggerEvent('complete', $that, options);
									});
								}
								window.clearInterval(myInterval);
							}
						},100);
					}
				
				// This is our default use case, load the content on click:
					
				} else {
					$that.on('click', function(){
						loadAndReplace(href, options, $that);
						return false;
					});
				}
				
			};
			
			var loadAndReplace = function(href, options, $el){
				
				// Create an unique temporary id we can use to store and access our loaded content.
				
				var tempid = plugin.settings.prefix+'_ajax_temp_'+$.fn.jKit_getUnixtime();
				
				// Hide the affected element:
				
				$(options.element).jKit_effect(false, options.animation, options.speed, options.easing, 0, function(){
					
					// Prepare the current element and create a div we use to store the loaded content:
					
					$(options.element).html('');
					
					jQuery('<div/>', {
						id: tempid
					}).appendTo('body');
					
					// Load the content from the supplied url and tell jQuery which element we need from it:
					
					$('#'+tempid).load(href+' '+options.element, function() {
						
						// Add the content from our temporary div to our real element and initialize the content
						// in case there are an jKit commands on it:
						
						$(options.element).html( $('#'+tempid+' '+options.element).html() );
						plugin.init($(options.element));
						
						// Trigger some stuff and show the content we just added:
						
						plugin.triggerEvent('complete', $el, options);
						
						$(options.element).jKit_effect(true, options.animation, options.speed, options.easing);
						
						if (options.macro != undefined) plugin.applyMacro($(options.element), options.macro);
						
						// Remove our temporary item:
						
						$('#'+tempid).remove();
					
					});
				
				});
			
			};
			
			return command;
		
		}());


		// ##### Command Template
		//
		// This is a template for commands. It should be used as a starting point to create new commands.
		
		plugin.commands.hide = (function(){
			
			// Create an object that contains all of our data and functionality.
			
			var command = {};
			
			// This are the command defaults:
			
			plugin.addCommandDefaults('hide', {
				'delay': 			0,
				'speed': 			500,
				'animation': 		'fade',
				'easing': 			'linear'
			});
			
			// The execute function is launched whenever this command is executed:
			
			command.execute = function($that, options){
				
				$that.jKit_effect(false, options.animation, options.speed, options.easing, options.delay, function(){
					plugin.triggerEvent('complete', $that, options);
				});
				
			};
			
			return command;
		
		}());


		// ##### Fontsize Command
		//
		// The [fontsize command](http://jquery-jkit.com/commands/fontsize.html) can be used to change the size of text. 
		// It can be limited to specific elements. You can even use it to change other CSS related sizes, for example the 
		// width of an element, with the **style** option.
		
		plugin.commands.fontsize = (function(){
			
			// Create an object that contains all of our data and functionality.
			
			var command = {};
			
			// This are the command defaults:
			
			plugin.addCommandDefaults('fontsize', {
				'steps': 			2,
				'min': 				6,
				'max': 				72,
				'affected':			'p',
				'style': 			'font-size'
			});
			
			// The execute function is launched whenever this command is executed:
			
			command.execute = function($that, options){
				
				$that.on( 'click', function(){
					
					$element.find(options.affected).each( function(){
						
						var newsize = parseInt($(this).css(options.style)) + parseInt(options.steps);
						
						if (newsize >= parseInt(options.min) && newsize <= parseInt(options.max) ){
							$(this).css(options.style, newsize );
						}
					
					});
					
					plugin.triggerEvent('changed', $that, options);
					
					return false;
				});
				
			};
			
			return command;
		
		}());


		// ##### Remove Command
		//
		// The [remove command](http://jquery-jkit.com/commands/remove.html) is used to completely remove the element 
		// from the DOM.
		
		plugin.commands.remove = (function(){
			
			// Create an object that contains all of our data and functionality.
			
			var command = {};
			
			// This are the command defaults:
			
			plugin.addCommandDefaults('remove', {
				'delay':			0
			});
			
			// The execute function is launched whenever this command is executed:
			
			command.execute = function($that, options){
				
				$that.delay(options.delay).hide(0, function(){
					$that.remove();
					plugin.triggerEvent('complete', $that, options);
				});
				
			};
			
			return command;
		
		}());


		// ##### Loop Command
		//
		// The [loop command](http://jquery-jkit.com/commands/loop.html) does the sam thing as the **showandhide** command,
		// but repeats itself again, and again ... actually, pretty much forever. **Oh, and lease don't use it as a blink tag!!!**
		
		plugin.commands.loop = (function(){
			
			// Create an object that contains all of our data and functionality.
			
			var command = {};
			
			// This are the command defaults:
			
			plugin.addCommandDefaults('loop', {
				'speed1':			500,
				'speed2':			500,
				'duration1':		2000,
				'duration2':		2000,
				'easing1':			'linear',
				'easing2':			'linear',
				'animation':		'fade'
			});
			
			// The execute function is launched whenever this command is executed:
			
			command.execute = function($that, options){
				loop($that.hide(), options);
			};
			
			// The local **loop** function is used by the loop the command and basically just shows and hides and element and than starts
			// the next interval.
		
			var loop = function($that, options){
				
				if ((windowhasfocus || !windowhasfocus && plugin.settings.ignoreFocus) && ($that.jKit_inViewport() || !$that.jKit_inViewport && plugin.settings.ignoreViewport)){
		
					plugin.triggerEvent('show', $that, options);
		
					$that.jKit_effect(true, options.animation, options.speed1, options.easing1, options.duration1, function(){
						plugin.triggerEvent('hide', $that, options);
						$that.jKit_effect(false, options.animation, options.speed2, options.easing2, options.duration2, loop($that, options));
					});
		
				} else {
					window.setTimeout( function() { loop($that, options); }, 100);
				}
		
			};
			
			return command;
		
		}());


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


		// ##### Carousel Command
		//
		// The [carousel command](http://jquery-jkit.com/commands/carousel.html) is used to display a
		// subset of elements like a carousel, new one in, old one out.
		
		plugin.commands.carousel = (function(){
			
			// Create an object that contains all of our data and functionality.
			
			var command = {};
			
			// This are the command defaults:
			
			plugin.addCommandDefaults('carousel', {
				'autoplay': 		"yes",
				'limit': 			5,
				'animation':		'grow',
				'speed':			250,
				'easing':			'linear',
				'interval':			5000,
				'prevhtml':			'&lt;',
				'nexthtml':			'&gt;'
			});
			
			// The execute function is launched whenever this command is executed:
			
			command.execute = function($that, options){
				
				var s = plugin.settings;
				
				var cnt = 0;
				
				// First hide all elements that are over our limit of elements we want to show:
				
				$that.children().each( function(){
					cnt++;
					if (cnt > options.limit){
						$(this).hide();
					}
				});
				
				// Add our **prev** and **next** button elements so the user can control the carousel:
				
				var $prevdiv = $('<a/>', {
					'class': s.prefix+'-carousel-prev'
				}).html(options.prevhtml).on( 'click left', function(){
					carousel($that, options, 'prev');
				}).insertAfter($that);
				
				var $nextdiv = $('<a/>', {
					'class': s.prefix+'-carousel-next'
				}).html(options.nexthtml).on( 'click right', function(){
					carousel($that, options, 'next');
				}).insertAfter($that);
				
				// Add some additional keyboard events:
				
				plugin.addKeypressEvents($prevdiv, 'left');
				plugin.addKeypressEvents($nextdiv, 'right');
				
				// Start autoplay if needed:
				
				if (options.autoplay == 'yes'){
					window.setTimeout( function() { carousel($that, options); }, options.interval);
				}
				
			};
			
			// The **carousel** function moves the carousel either one forward, or
			// one backward.
			
			carousel = function($el, options, dir){
				
				// Every manual interaction stops the autoplay:
				
				if (dir != undefined){
					options.autoplay = false;
				}
				
				// Only run the carousel if we're inside the viewport and the window has focus:
				
				if ((windowhasfocus || !windowhasfocus && plugin.settings.ignoreFocus) && ($el.jKit_inViewport() || !$el.jKit_inViewport() && plugin.settings.ignoreViewport)){
					
					// Check if we're in the middle of an animation:
					
					var isAnimated = false;
					$el.children().each( function(){
						if ( $(this).is(':animated') ) {
							isAnimated = true;
						}
					});
					
					// We only move the carousel if it isn't animating right now:
					
					if (!isAnimated) {
						
						// What number is the last element?
						
						var pos = Math.min(options.limit, $el.children().length);
						
						// Step one forward:
						
						if (dir == 'next' || dir == undefined) {
		
							plugin.triggerEvent('shownext', $el, options);
		
							$el.children(':first-child').jKit_effect(false, options.animation, options.speed, options.easing, 0, function(){
								$el.append($el.children(':nth-child(1)'));
								$el.children(':nth-child('+pos+')').jKit_effect(true, options.animation, options.speed, options.easing, 0);
							});
						
						// Step one backward:
							
						} else if (dir == 'prev') {
		
							plugin.triggerEvent('showprev', $el, options);
		
							$el.children(':nth-child('+pos+')').jKit_effect(false, options.animation, options.speed, options.easing, 0, function(){
								$el.prepend( $el.children(':last-child') );
								$el.children(':first-child').jKit_effect(true, options.animation, options.speed, options.easing, 0);
							});
							     
						}
						
					}
					
					// Is autoplay is on? Than set the interval: 
					
					if (options.autoplay == 'yes'){
						window.setTimeout( function() { carousel($el, options); }, options.interval);
					}
				
				} else {
					window.setTimeout( function() { carousel($el, options); }, options.interval);
				}
			
			};
			
			return command;
		
		}());


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


		// ##### Summary Command
		//
		// The [summary command](http://jquery-jkit.com/commands/summary.html) creates a summary on specific content, for example the headers in a content div.
		// The summary itself is either a linked list or a dropdown with automated events.
		
		plugin.commands.summary = (function(){
			
			// Create an object that contains all of our data and functionality.
			
			var command = {};
			
			// This are the command defaults:
			
			plugin.addCommandDefaults('summary', {
				'what': 			'',
				'linked': 			'yes',
				'from': 			'',
				'scope': 			'children',
				'style': 			'ul',
				'indent': 			'no'
			});
			
			// The execute function is launched whenever this command is executed:
			
			command.execute = function($that, options){
				
				var s = plugin.settings;
				
				var output = '';
				var jumpid = '';
				
				var pre = ''
				if (options.scope == 'children'){
					pre = '> ';
				}
				
				if (options.what == 'headers'){
					options.what = ':header';
				}
				
				$(options.from).find(pre+options.what).each( function(){
					
					var $current = $(this);
					
					// If we're using all headers for our summary, than we have to do some extra work to get them
					// indented correctly.
					
					var space = '';
					if (options.what == ':header' && options.indent == 'yes'){
						var tag = $current.prop('tagName');
						if (tag.length == 2 && tag[1] != ''){
							var spaces = tag[1]-1;
							for (var i=1; i<=spaces;i++){
								space += '&nbsp; &nbsp; ';
							}
						}
					}
					
					// A summary can either be linked or just text:
					
					if (options.linked == 'yes'){
						
						if ($current.attr('id') !== undefined){
							var id = $current.attr('id');
						} else {
							var id = s.prefix+'-uid-'+(++uid);
							$current.attr('id', id);
						}
						
						if (window.location.hash == '#'+id){
							jumpid = id;
						}
						
						if (options.style == 'select'){
							output += '<option value="'+id+'">'+space+$(this).text()+'</option>';
						} else {
							output += '<li><a href="#'+id+'">'+space+$(this).text()+'</a></li>';
						}
						
					} else {
						if (options.style == 'select'){
							output += '<option value="">'+space+$(this).text()+'</option>';
						} else {
							output += '<li>'+space+$(this).text()+'</li>';
						}
					}
				});
				
				if (output != ''){
					
					$that.html('<'+options.style+'>'+output+'</'+options.style+'>');
					
					// In case this is a dropdown summary that is linked, we have to manually add 
					// an event on change so we can jump to the anchors as needed:
					
					if (options.style == 'select' && options.linked == 'yes'){
						$that.find('select').on( 'change', function(){
							window.location.hash = '#'+$(this).val();
							$(this).blur();
						});
					}
					
					// And lastly if we create a select and have detected a hash, we need to set that select to the correct value
					// and jump to the correct element:
					
					if (options.style == 'select' && options.linked == 'yes' && jumpid != ''){
						
						$that.find('select').val(jumpid);
						
						if ($that.find('#'+jumpid).offset() !== undefined){
							var ypos = $that.find('#'+jumpid).offset().top;
							$('html, body').css({ scrollTop: ypos+'px' });
						}
						
					}
					
				}
				
			};
			
			return command;
		
		}());


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


		// ##### Command Template
		//
		// This is a template for commands. It should be used as a starting point to create new commands.
		
		plugin.commands.live = (function(){
			
			// Create an object that contains all of our data and functionality.
			
			var command = {};
			
			// This are the command defaults:
			
			plugin.addCommandDefaults('live', {
				'interval': 		60
			});
			
			// The execute function is launched whenever this command is executed:
			
			command.execute = function($that, options){
				
				if ($that.attr('src') !== undefined) {
					window.setInterval( function() {
						updateSrc($that, options);
						plugin.triggerEvent('reloaded', $that, options);
					}, options.interval*1000);
				}
				
			};
			
			// The **updateSrc** function changes the src url in a way that forces the browser
			// to reload the src from the server.
			
			var updateSrc = function($el, options){
				
				if ((windowhasfocus || !windowhasfocus && plugin.settings.ignoreFocus) && ($el.jKit_inViewport() || !$el.jKit_inViewport() && plugin.settings.ignoreViewport)){
					
					var srcSplit = $el.attr('src').split('?');
					
					$el.attr('src', srcSplit[0]+'?t='+$.fn.jKit_getUnixtime());
				
				}
			
			};
			
			return command;
		
		}());


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


		// ##### Menu Command
		//
		// The [menu command](http://jquery-jkit.com/commands/menu.html) adds some additional features 
		// to a CSS based menu.
		
		plugin.commands.menu = (function(){
			
			// Create an object that contains all of our data and functionality.
			
			var command = {};
			
			// This are the command defaults:
			
			plugin.addCommandDefaults('menu', {
				'autoactive': 		'no'
			});
			
			// The execute function is launched whenever this command is executed:
			
			command.execute = function($that, options){
				
				var s = plugin.settings;
				
				// Add an active class to the menu link that matches the current page url:
				
				if (options.autoactive == 'yes'){
					
					var path = window.location.toString().split('#')[0].split("/");
					
					$that.find("a").filter(function() {
						return $(this).attr("href") == path[path.length-1];
					}).addClass(s.activeClass);
					
				}
				
				// Add mouseover events and a click event for touch devices:
				
				$that.find("li").hover(function(){
					
					$(this).addClass("hover");
					$('ul:first',this).css('visibility', 'visible');
				
				}, function(){
					
					$(this).removeClass("hover");
					$('ul:first',this).css('visibility', 'hidden');
				
				}).on( 'click', function(){
					
					$(this).addClass("hover");
					$('ul:first',this).css('visibility', 'visible');
				
				});
				
			};
			
			return command;
		
		}());


		
		
		
		// Now as all included plugin commands are defined, we add the keys of them to the internal **inc** array so that 
		// the special **info** command can display them.

		for (x in plugin.commands){
			if (x != 'init'){
				plugin.inc.push(x);
			}
		}
		
		
		// Start the plugin by running the initialization function:
		
		plugin.init();
	
	};
	
	
	// ## jQuery Plugin Functions
	//
	// The following functions act as jQuery plugins.
	
	
	// ### jKit_effect
	//
	// The **jKit_effect** plugin function is used by all kind of jKit commands that perform animations. 
	
	$.fn.jKit_effect = function(show, type, speed, easing, delay, fn){
		
		// This is a real jQuery plugin, so make sure chaining works:
		
		return this.each(function() {
			
			// Do we have to call a callback function? If not, just create an empty one:
			
			if (fn == undefined) fn = function(){};
			
			// If we didn't set a delay, set the delay variable to zero:
			
			if (delay == undefined) delay = 0;
			
			// We now have all we need, so run the animation we need:
			
			if (type == 'fade'){
				if (show){
					$(this).delay(delay).fadeTo(speed, 1.0, easing, fn);
				} else {
					$(this).delay(delay).fadeTo(speed, 0, easing, fn);
				}
			} else if (type == 'slide'){
				if (show){
					$(this).delay(delay).slideDown(speed, easing, fn);
				} else {
					$(this).delay(delay).slideUp(speed, easing, fn);
				}
			} else if (type == 'none'){
				if (show){
					$(this).delay(delay).show();
				} else {
					$(this).delay(delay).hide();
				}
				fn();
			} else {
				if (show){
					$(this).delay(delay).show(speed, easing, fn);
				} else {
					$(this).delay(delay).hide(speed, easing, fn);
				}
			}
		});
	};
	
	
	// ### jKit_getUnixtime
	//
	// The **jKit_getUnixtime** plugin function returns an unix timestamp based on the current date.
	
	$.fn.jKit_getUnixtime = function(){
		var now = new Date;
		var unixtime_ms = now.getTime();
		return parseInt(unixtime_ms / 1000);
	};
	
	
	// ### jKit_arrayShuffle
	//
	// The **jKit_arrayShuffle** plugin function is used to shuffle an array randomly.
	
	$.fn.jKit_arrayShuffle = function(arr){
		var tmp, rand;
		for(var i =0; i < arr.length; i++){
			rand = Math.floor(Math.random() * arr.length);
			tmp = arr[i];
			arr[i] = arr[rand];
			arr[rand] = tmp;
		}
		return arr;
	};
	
	// ### jKit_stringOccurrences
	//
	// The **jKit_stringOccurrences** plugin function is used to count the times a string is found inside
	// another string.
	
	$.fn.jKit_stringOccurrences = function(string, substring){
		
		var n = 0;
		var pos = 0;
		
		while (true){
			pos = string.indexOf(substring, pos);
			if (pos != -1) {
				n++;
				pos += substring.length;
			} else {
				break;
			}
		}
		
		return (n);
	
	};
	
	
	// ### jKit_emailCheck
	//
	// The **jKit_emailCheck** plugin function is used by the validation command to check if an
	// email address is valid.
	
	$.fn.jKit_emailCheck = function(string){
		var filter = /^[a-z0-9\._-]+@([a-z0-9_-]+\.)+[a-z]{2,6}$/i;
		return filter.test(string);
	};
	
	
	// ### jKit_urlCheck
	//
	// The **jKit_urlCheck** plugin function is used by the validation command to check if an
	// url is valid.
	
	$.fn.jKit_urlCheck = function(string){
		var filter = /^(?:(ftp|http|https):\/\/)?(?:[\w\-]+\.)+[a-z]{2,6}$/i;
		return filter.test(string);
	};
	
	
	// ### jKit_dateCheck
	//
	// The **jKit_dateCheck** plugin function is used by the validation command to check if the
	// date string is valid.
	
	$.fn.jKit_dateCheck = function(string){
		
		return $.fn.jKit_regexTests(string, [
			/^[0-9]{2}\.[0-9]{2}\.[0-9]{2}$/i, // 01.01.12
			/^[0-9]{1,2}\.[0-9]{1,2}\.[0-9]{2}$/i, // 1.1.12
			/^[0-9]{1,2}\.[0-9]{1,2}\.[0-9]{4}$/i, // 1.1.2012
			/^[0-9]{2}\.[0-9]{2}\.[0-9]{4}$/i, // 01.01.2012
			/^[0-9]{4}\-[0-9]{2}\-[0-9]{2}$/i, // 2012-01-01
			/^[0-9]{2}\/[0-9]{2}\/[0-9]{4}$/i // 01/01/2012
		]);
		
	};
	
	
	// ### jKit_timeCheck
	//
	// The **jKit_timeCheck** plugin function is used by the validation command to check if the
	// time string is valid.
	
	$.fn.jKit_timeCheck = function(string){
		
		return $.fn.jKit_regexTests(string, [
			/^[0-9]{1,2}\:[0-9]{2}$/i, // 1:59
			/^[0-9]{1,2}\:[0-9]{2}\:[0-9]{2}$/i // 1:59:59
		]);
		
	};
	
	
	// ### jKit_phoneCheck
	//
	// The **jKit_phoneCheck** plugin function is used by the validation command to check if the
	// phone string is valid.
	
	$.fn.jKit_phoneCheck = function(string){
		
		return $.fn.jKit_regexTests(string, [
			/^(\+|0)([\d ])+(0|\(0\))+[\d ]+(-\d*)?\d$/, // +41 (0)76 123 45 67
			/^(\+|0)[\d ]+(-\d*)?\d$/, // +41 142-124-23
			/^((((\(\d{3}\))|(\d{3}-))\d{3}-\d{4})|(\+?\d{2}((-| )\d{1,8}){1,5}))(( x| ext)\d{1,5}){0,1}$/ // NAND and int formats
		]);
		
	};
	
	
	// ### jKit_passwordStrength
	//
	// The **jKit_passwordStrength** plugin function is used by the validation command to check if the
	// password strength is good enough. The function calculates a score from 0 to 100 based on various
	// checks.
	
	$.fn.jKit_passwordStrength = function(passwd){
		var intScore = 0
		
		if (passwd.length < 5){
			intScore = intScore + 5;
		} else if (passwd.length > 4 && passwd.length < 8){
			intScore = intScore + 15;
		} else if (passwd.length >= 8){
			intScore = intScore + 30;
		}
		
		if (passwd.match(/[a-z]/)) intScore = intScore + 5;
		if (passwd.match(/[A-Z]/)) intScore = intScore + 10;
		if (passwd.match(/\d+/)) intScore = intScore + 10;
		if (passwd.match(/(.*[0-9].*[0-9].*[0-9])/)) intScore = intScore + 10;
		if (passwd.match(/.[!,@,#,$,%,^,&,*,?,_,~]/)) intScore = intScore + 10;
		if (passwd.match(/(.*[!,@,#,$,%,^,&,*,?,_,~].*[!,@,#,$,%,^,&,*,?,_,~])/)) intScore = intScore + 10;
		if (passwd.match(/([a-z].*[A-Z])|([A-Z].*[a-z])/)) intScore = intScore + 5;
		if (passwd.match(/([a-zA-Z])/) && passwd.match(/([0-9])/)) intScore = intScore + 5;
		if (passwd.match(/([a-zA-Z0-9].*[!,@,#,$,%,^,&,*,?,_,~])|([!,@,#,$,%,^,&,*,?,_,~].*[a-zA-Z0-9])/)) intScore = intScore + 5;
		
		return intScore;
	};
	
	
	// ### jKit_regexTests
	//
	// The **jKit_regexTests** plugin function is mainly used by the validation commands to test for different patterns.
	// The first argument is the string to test, the second contains an array of all patterns to test and the third is a boolean that can be set to true if
	// all patterns need to be found.
	
	$.fn.jKit_regexTests = function(string, tests, checkall){
		
		if (checkall === undefined) checkall = false;
		
		var matches = 0;
		
		for (var x in tests){
			if ( tests[x].test(string) ) matches++;
		}
		
		return (checkall && matches == tests.length) || (!checkall && matches > 0);
	
	};
	
	
	// ### jKit_getAttributes
	//
	// The **jKit_getAttributes** plugin function returns an array with all attributes that are 
	// set on a specific DOM node.
	
	$.fn.jKit_getAttributes = function(){
		return this.each(function() {
			var map = {};
			var attributes = $(this)[0].attributes;
			var aLength = attributes.length;
			
			for (var a = 0; a < aLength; a++) {
					map[attributes[a].name.toLowerCase()] = attributes[a].value;
			}
			
			return map;
		});
	};
	
	
	// ### jKit_setAttributes
	//
	// The **jKit_setAttributes** plugin function creates a set of supplied attributes on an emelemnt.
	
	$.fn.jKit_setAttributes = function(attr){
		return this.each(function() {
			$.each( attr, function(i,v){
				try {
					$(this).attr(String(i),String(v));
				} catch(err) {}
			});
		});
	};
	
	
	// ### jKit_iOS
	//
	// The **jKit_iOS** plugin function checks the user agent if the current device runs iOS.
	
	$.fn.jKit_iOS = function(){
		return navigator.userAgent.match(/(iPod|iPhone|iPad)/i);
	};
	
	
	// ### jKit_belowTheFold
	//
	// The **jKit_belowTheFold** plugin function checks if the supplied element is below the page fold.
	
	$.fn.jKit_belowTheFold = function(){
		var fold = $(window).height() + $(window).scrollTop();
		return fold <= $(this).offset().top;
	};
	
	
	// ### jKit_aboveTheTop
	//
	// The **jKit_aboveTheTop** plugin function checks if the supplied element is above the top of the currently visible part of the page.
	
	$.fn.jKit_aboveTheTop = function(){
		var top = $(window).scrollTop();
		return top >= $(this).offset().top + $(this).height();
	};
	
	
	// ### jKit_rightOfScreen
	//
	// The **jKit_rightOfScreen** plugin function checks if the supplied element is right from the current voiewport.
	
	$.fn.jKit_rightOfScreen = function(){
		var fold = $(window).width() + $(window).scrollLeft();
		return fold <= $(this).offset().left;
	};
	
	
	// ### jKit_leftOfScreen
	//
	// The **jKit_leftOfScreen** plugin function checks if the supplied element is left from the current voiewport.
	
	$.fn.jKit_leftOfScreen = function(){
		var left = $(window).scrollLeft();
		return left >= $(this).offset().left + $(this).width();
	};
	
	
	// ### jKit_inViewport
	//
	// The **jKit_inViewport** plugin function checks if the supplied element is inside the viewport.
	
	$.fn.jKit_inViewport = function(){
		return !$(this).jKit_belowTheFold() && !$(this).jKit_aboveTheTop() && !$(this).jKit_rightOfScreen() && !$(this).jKit_leftOfScreen();
	};
	
	
	// ### jKit
	//
	// The **jKit** function registers jKit as a jQuery plugin.
	
	$.fn.jKit = function(options, moreoptions) {
		
		return this.each(function() {
			var plugin = new $.jKit(this, options, moreoptions);
			$(this).data('jKit', plugin);
		});
	
	};

})(jQuery);