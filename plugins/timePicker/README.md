timePicker
==========
A time picker control for textfields built using jQuery. Inspired by Google Calendar.

Examples
--------

Default:
    
    $("#time1").timePicker();

02.00 AM - 03.30 PM, 15 minutes steps:

    $("#time2").timePicker({
      startTime: "02.00", // Using string. Can take string or Date object.
      endTime: new Date(0, 0, 0, 15, 30, 0), // Using Date object here.
      show24Hours: false,
      separator: '.',
      step: 15});
      
An example how the two helper functions can be used to achieve
advanced functionality.

  - Linking: When changing the first input the second input is updated and the
    duration is kept.
  - Validation: If the second input has a time earlier than the firs input,
    an error class is added.

The example:

    // Use default settings
    $("#time3, #time4").timePicker();

    // Store time used by duration.
    var oldTime = $.timePicker("#time3").getTime();

    // Keep the duration between the two inputs.
    $("#time3").change(function() {
      if ($("#time4").val()) { // Only update when second input has a value.
        // Calculate duration.
        var duration = ($.timePicker("#time4").getTime() - oldTime);
        var time = $.timePicker("#time3").getTime();
        // Calculate and update the time in the second input.
        $.timePicker("#time4").setTime(new Date(new Date(time.getTime() + duration)));
        oldTime = time;
      }
    });
    // Validate.
    $("#time4").change(function() {
      if($.timePicker("#time3").getTime() > $.timePicker(this).getTime()) {
        $(this).addClass("error");
      }
      else {
        $(this).removeClass("error");
      }
    });