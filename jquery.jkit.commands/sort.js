
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