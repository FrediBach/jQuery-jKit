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
 */
(function($){$.fn.ztinputhint=function(g){var h={hint:null,sourceAttrib:'title',hintClass:false};if(g&&typeof g=='object'){$.extend(h,g)}else if(g){h.hint=g}return this.each(function(){var a=$(this);if(!a.is('input:text, input:password')){return false}var b='ztInputHint_'+a.attr('name');var c='<input type="text" value="" style="display: none;" />';var d=h.hint||a.attr(h.sourceAttrib);var e=h.hintClass||a.attr('class');$(c).insertBefore(a);var f=a.prev('input:first');if(d){f.attr('class',e);f.attr('size',a.attr('size'));f.attr('tabIndex',a.attr('tabIndex'));f.val(d);a.attr('autocomplete','off');f.focus(function(){$(this).hide();cont=$(this).next('input:first');cont.show();cont.focus()});a.blur(function(){if($(this).val()==''){$(this).prev('input:first').show();$(this).hide()}});if(h.iconClass&&!a.hasClass(h.iconClass)){a.addClass(h.iconClass)}a.blur()}})};$.fn.ztInputHint=$.fn.ztinputhint})(jQuery);