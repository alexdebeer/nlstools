/**
 * 
 */


function createButton(appendPoint, buttonLabel, clickFunction) {
	var thebutton = $.ninja.button({html: buttonLabel}).select(function(){
		clickFunction();
		thebutton.deselect();
	});
	$(appendPoint).append(thebutton);
	return thebutton; //In case its needed
}

function createSlider(appendPoint, sliderLabel, values, defaultvalue, slideFunction) {
	var extravalues = $.map(values, function(x){
		return {html: x.toString(), numeric: x};
	});
	
	var thevalue = 0;
	for (var i=0; i<values.length; i++){
		if(values[i] == defaultvalue){
			thevalue = i;
		}
	}
	
	var theslider = $.ninja.slider(
			{html: sliderLabel,
				value: thevalue,
				values: extravalues}
	).select(function(input){
		//alert(input.value.numeric);
		slideFunction(input.value.numeric);
	});
	$(appendPoint).append(theslider);
	return theslider; //In case its needed
}

//var button = createButton('NinjaButton', function(){
//	button.deselect();
//});

function loadConfig(callback){
	callback(createConfig());
};

function wave(start, stop, step){
	var outp = new Array();
	while(start != stop){
		outp.push(start);
		start += step;
	}
	return outp;
};

var cleanAndRangeData = function(data){
	var max = 0;
	for (var j=1; j < data.length; j++){
		for (var i=1; i<5; i++){
			if (data[j][i]> max) { max = data[j][i]; }
		}
	}
	for (var j=1; j< data.length; j++){
		data[j][0] = Math.floor(data[j][0]*10000)/10000;
		for (var i=1; i<5; i++){
			data[j][i] = data[j][i]/max;
			data[j][i] = Math.floor(data[j][i]*10000)/10000;
			
		}
	}
	return(data);
};
		
function drawChart(config) {
	if(chartReady){
		calculate(wave(-180,180,1), config, function(data){
			cleandata = cleanAndRangeData(data);
			var chartdata = google.visualization.arrayToDataTable(
				cleandata);
				/*[
		    ['Year', 'Sales', 'Expenses'],
		    ['2004',  1000,      config.particle.radius],
		    ['2005',  1170,      config.particle.radius],
		    ['2006',  660,       1120],
		    ['2007',  1030,      540]
		 ]);*/
			
			var options = {
					title: 'Itensity'
			};
			var chart = new google.visualization.LineChart(document.getElementById('Graph'));
			chart.draw(chartdata, options);
		});
	}
}

var chartReady=false;

google.load("visualization", "1", {packages:["corechart"]});
google.setOnLoadCallback(function(){
	loadConfig(function(config) {
		chartReady=true;
		drawChart(config);
		
	});
});




(function ($) {
	$(document).ready(function () {
		loadConfig(function(config){
			//createButton('#PPP', 'PPP', function(){});
			//createButton('#SSP', 'SSP', function(){});
			
			
			createSlider('#Radius', 'Radius', wave(10,1000,1), config.particle.radius, function(value){
				config.particle.radius = value;
				drawChart(config);				
			});
			createSlider('#Lambda1', 'Visible Wavelength (nm)', wave(10,1000,1), config.beams.visible, function(value){
				config.beams.visible = value;
				drawChart(config);				
			});
			createSlider('#Lambda2', 'Infared Wavelength (nm)', wave(10,4000,1), config.beams.ir, function(value){
				config.beams.ir = value;
				drawChart(config);				
			});
		});
	    	//$('#usageButton').append(button);
	    });
}(jQuery));
