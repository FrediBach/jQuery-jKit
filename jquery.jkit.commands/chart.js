
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