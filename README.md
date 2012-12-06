jQuery-jKit
===========

A very easy to use, cross platform, jQuery based UI toolkit, that's still small in size, has the features you need, and doesn't get in your way of doing things!

Full Documentation
------------------

Get the full documentation over here: [jquery-jkit.com](http://jquery-jkit.com/)

Basics
------

  <script type="text/javascript" src="jquery.jkit.1.0.42.min.js"></script>

Attach it to the whole body or any other element:

  <script type="text/javascript">
  $(document).ready(function(){
    $('body').jKit();
  });
  </script>

Apply one of the many commands to some element with the rel attribute:

  rel="jKit[command:option=value;anotheroption=anothervalue]"

Or if you don't want to misuse the rel attribute (recommended), do it the HTML5 way:

  data-jkit="[command:option=value;anotheroption=anothervalue]"

And of course you can execute a command through JavaScript if needed:

  $('#myelement').jKit('scroll', { 'speed': 1000, 'dynamic': 'no' });


Commands
--------

- background
- hide
- remove
- show
- showandhide
- loop
- limit
- scroll
- lightbox
- partially
- random
- slideshow
- gallery
- tabs
- accordion
- carousel
- parallax
- animation
- menu
- tooltip
- form
- validate
- plugin
- lorem
- binding
- macro
- template
- chart
- encode
- split
- live
- key
- ajax
- replace
- cycle
- fontsize
- swap
- ticker
- sort
