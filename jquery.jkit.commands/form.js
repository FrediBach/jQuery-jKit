
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