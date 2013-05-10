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
		
		
		// --- add commands here --- //
		
		
		
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