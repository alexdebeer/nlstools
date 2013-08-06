/**
 * 
 */

(function ($) {
	function createButton(appendPoint, buttonLabel, clickFunction) {
		var thebutton = $.ninja.button({html: buttonLabel}).select(function(){
			clickFunction();
			thebutton.deselect();
		});
		$(appendPoint).append(thebutton);
		return thebutton; //In case its needed
	}
	
	function createSlider(appendPoint, sliderLabel, values, slideFunction) {
		var extravalues = $.map(values, function(x){
			return {html: x.toString(), numeric: x};
		});
		var theslider = $.ninja.slider(
				{html: sliderLabel,
					value: 0,
					values: extravalues}
		).select(function(input){
			alert(input.value.numeric);
			slideFunction(input.value.numeric);
		});
		$(appendPoint).append(theslider);
		return theslider; //In case its needed
	}
	
    //var button = createButton('NinjaButton', function(){
    //	button.deselect();
    //});

    $(document).ready(function () {
    	createButton('#PPP', 'PPP', function(){});
    	createButton('#SSP', 'SSP', function(){});
    	createSlider('#but2', 'NinjaSlider', [1,2,3], function(){});
    	//$('#usageButton').append(button);
    });
}(jQuery));
