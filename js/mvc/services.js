app.service('notationParser', [function(){
	var parser = {};

	parser.parseToRegex = function(input){
		input = input.replace(/\?/g, "\\?");
		console.log(input);
		input = input.replace(/\)\\\?/g, ")?");
		console.log(input);


		//!!!!remove unnecesasary escapes





		//first parse all the (opt1|opt2|...) alternatives
		var opt_reg = /\([\w\| ]+\)/g;
		//console.log(input);
		//console.log(opt_reg);
		var matches = input.match(opt_reg);
		for(var i in matches){
			var match = matches[i];
			//var processed_match = match
		}
		//if parameter starts with "#", its value does not contain spaces. If it starts with "$", its value can contain spaces
		var dollar_param_reg = /\$\w+/g;
		var param_names = [];
		var new_param_names = input.match(dollar_param_reg);
		for(var i in new_param_names){
			param_names.push(new_param_names[i]);
		}
		////console.log(param_names);
		var hash_param_reg = /\#\w+/g;
		var new_param_names = input.match(hash_param_reg);
		for(var i in new_param_names){
			param_names.push(new_param_names[i]);
		}
		var processed_input = input;
		for(var i in param_names){
			//console.log(param_names[i]);
			var new_regex;
			if(param_names[i][0]=="$"){
				new_regex = "[\\w ]+";
			}else{
				new_regex = "[\\w]+";
			}
			processed_input = processed_input.replace(param_names[i], new_regex)
		}
		processed_input = processed_input.replace(/[ ,.;]+/g, "\\W+");
		processed_input = processed_input.replace(/\([^\(]*\)\?/, function(match){
			//alert(match);
			match = match.replace("(", "((");
			match = match.replace(")?", ")\\W+)?");
			return match;
		});
		processed_input = processed_input.replace(")?\\W+", ")?");
		processed_input="^" + processed_input + "$"; 	
		var ret = new RegExp(processed_input);
		//console.log(ret);
		return ret;
	}

	parser.notationMatchesInput = function(notation, input){
		if(input==undefined){
			return false;
		}else{
			input = input.toLowerCase();
			notation = notation.toLowerCase();
			console.log(input);
			var regex = parser.parseToRegex(notation);
			//console.log("!", regex);
			return input.match(regex)!=null;			
		}
	}

	return parser;
}]);

app.service('speechRecognition', [function(){
	var ret = {};
	var recognition = new webkitSpeechRecognition();

	recognition.continuous = true;
  	recognition.interimResults = true;

	ret.result = "";

	ret.start = function(){
		recognition.start();
	}

	ret.onResult;

	ret.setLan = function(newVal){
		recognition.lang = newVal;
	}

	recognition.onresult = function(event){
		var interim_transcript = '';
	    for (var i = event.resultIndex; i < event.results.length; ++i) {
	      if (event.results[i].isFinal) {
	        ret.result += event.results[i][0].transcript;
	      } else {
	        //ret.result += event.results[i][0].transcript;
	      }
	    }
	    console.log(ret.result);
	    //console.log(ret.onResult);
		if(typeof ret.onResult =='function'){
			ret.onResult();
		};
	    //result = capitalize(result);
	}

	ret.getResult = function(){
		return ret.result;
	}

	ret.stop = function(){
		recognition.stop();
	}

	return ret;

}])