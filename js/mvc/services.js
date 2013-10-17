app.service('notationParser', [function(){
	var parser = {};

	parser.parseToRegex = function(input){
		//first parse all the (opt1|opt2|...) alternatives
		var opt_reg = /\([\w\| ]+\)/g;
		console.log(input);
		console.log(opt_reg);
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
		//console.log(param_names);
		var hash_param_reg = /\#\w+/g;
		var new_param_names = input.match(hash_param_reg);
		for(var i in new_param_names){
			param_names.push(new_param_names[i]);
		}
		var processed_input = input;
		for(var i in param_names){
			console.log(param_names[i]);
			var new_regex;
			if(param_names[i][0]=="$"){
				new_regex = "[\\w ]+";
			}else{
				new_regex = "[\\w]+";
			}
			processed_input = processed_input.replace(param_names[i], new_regex)
		}
		var ret = new RegExp(processed_input);
		console.log(ret);
		return ret;
	}

	parser.notationMatchesInput = function(notation, input){
		var regex = parser.parseToRegex(notation);
		console.log("!", regex);
		return input.match(regex)!=null;
	}

	return parser;
}]);