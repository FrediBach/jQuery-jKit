/**
 * ztInputHint Plugin
 *
 * @version 1.2 (04/03/2010)
 * @requires jQuery v1.3+
 * @author Zeljko Trulec <trulec.de>
 * @copyright Copyright (c) 2010, Zeljko Trulec
 * @see https://code.google.com/p/ztinputhint/
 * 
 * Distributed under the terms of the GNU General Public License
 * http://www.gnu.org/licenses/gpl-3.0.html
 *
 */
/**
 * Add dummyfields to display hints for text- and password-fields (will not be submit)
 *
 * @example $("input").ztInputHint();
 * @example $("input#username").ztInputHint({
 *   hint: 'Benutzername',
 *   sourceAttrib: 'alt',
 *   hintClass: 'icon'
 * });
 *
 * @param hint            Manually specified text to use as hint (will override sourceAttrib)
 * @param sourceAttrib    Automatic pick this attribute to use as hint
 * @param hintClass       Classname to use
 *
 * @return jQuery Object
 * @type jQuery
 *
 * @name jQuery.fn.ztinputhint
 * @cat Plugins/Forms
 */
(function($){
	$.fn.ztinputhint = function(options) {
		var defaults = {
			hint: null,                           // manually specified text to use as hint (will override sourceAttrib)
			sourceAttrib: 'title',                // automatic pick this attribute to use as hint
			hintClass: false                      // Class to use
		};
		
		// if options (as object) are passed, overwrite default settings
		if(options && typeof options == 'object') {
			$.extend(defaults, options);
		}
		
		// if anything is passed as string
		else if(options) {
			defaults.hint = options;
		}
		
		return this.each(function() {
			var container = $(this);
			
			if (!container.is('input:text, input:password')) {
				return false;
			}
			
			// w/o name-attrib it will not be submitted
			var dummyName = 'ztInputHint_' + container.attr('name');
			var dummyInput = '<input type="text" value="" style="display: none;" />';
			var textHint = defaults.hint || container.attr(defaults.sourceAttrib);
			var classHint = defaults.hintClass || container.attr('class');
			
			// insert dummy-element in front of the target
			$(dummyInput).insertBefore(container);
			var dummy = container.prev('input:first');
			
			// just if there is a hint and the value of the container is empty
			if (textHint) {
				
				// set attributes of dummy-element
				dummy.attr('class', classHint);
				dummy.attr('size', container.attr('size'));
				dummy.css('width', container.css('width'));
				dummy.attr('tabIndex', container.attr('tabIndex'));
				dummy.val(textHint);
				
				container.attr('autocomplete', 'off');
				
				// on focus hide dummy, show real
				dummy.focus(function() {
					// $(this) = dummy
					$(this).hide();
					cont = $(this).next('input:first');
					cont.show();
					cont.focus();
				});
				
				// on blur hide real, show dummy
				container.blur(function() {
					if ($(this).val() == '') {
						$(this).prev('input:first').show();
						$(this).hide();
					}
				});
				
				
				if (defaults.iconClass && !container.hasClass(defaults.iconClass)) {
					container.addClass(defaults.iconClass);
				}
				
				// initialize
				container.blur();
			}
		});
	};
	$.fn.ztInputHint = $.fn.ztinputhint;
})(jQuery);