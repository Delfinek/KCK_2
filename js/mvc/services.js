app.service('notationParser', [function(){
	var parser = {};

	parser.parseToRegex = function(input){
		input = input.replace(/\?/g, "\\?");
		input = input.replace(/\)\\\?/g, ")?");


		//!!!!remove unnecesasary escapes





		//first parse all the (opt1|opt2|...) alternatives
		var opt_reg = /\([\w\| ]+\)/g;
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
		var hash_param_reg = /\#\w+/g;
		var new_param_names = input.match(hash_param_reg);
		for(var i in new_param_names){
			param_names.push(new_param_names[i]);
		}
		var processed_input = input;
		for(var i in param_names){
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
			match = match.replace("(", "((");
			match = match.replace(")?", ")\\W+)?");
			return match;
		});
		processed_input = processed_input.replace(")?\\W+", ")?");
		processed_input="^" + processed_input + "$"; 	
		var ret = new RegExp(processed_input);
		return ret;
	}

	parser.notationMatchesInput = function(notation, input){
		if(input==undefined){
			return false;
		}else{
			input = input.toLowerCase();
			notation = notation.toLowerCase();
			var regex = parser.parseToRegex(notation);
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
		if(typeof ret.onResult =='function'){
			ret.onResult();
		};
	}

	ret.getResult = function(){
		return ret.result;
	}

	ret.stop = function(){
		recognition.stop();
	}

	return ret;

}])


app.factory('tile', [function(){
	var tile = function(x,y){

		this.isObstacle=false;

		this.getContent = function(){
			return x + " " + y;
		}


	}

	return tile;
}]);

app.service('map',  ['tile', function(tile){
	var map = {};
	map.tiles = [];
	map.width = 20;
	map.height = 20;
	var cur = 65;
	for(var i=1; i<=map.width; i++){
		map.tiles[i]=[];
		for(var j=1; j<=map.height; j++){
			map.tiles[i][j]=new tile(i,j);
			if((i+j)%2==0){
				map.tiles[i][j].isObstacle = true;				
			}
			//console.log(map.tiles[i][j].getContentL());
			cur++;
		}
	}

	map.getTile = function(x,y){
 		return map.tiles[x][y];
	}

	return map;
}]);

app.factory('grid_square', ['map', function(map){
	var grid_square = function(x, y){

		//to remove
			this.x=x;
		this.y=y;
		this.tile = map.getTile(x,y);

		this.getContent = function(){
			return map.getTile(x,y);
		}

		this.setPosition = function(xNew, yNew){
			x = xNew;
			y = yNew;
			this.reloadTile();
		}

		this.getX = function(){
			return x;
		}

		this.getY = function(){
			return y;
		}

		this.reloadTile = function(){
			this.tile = map.getTile(x,y);
		}

	}

	return grid_square;
}])

app.factory('Grid', ['grid_square', 'map', function(grid_square, map){
	var gridL = function(){
		this.width = 10;
		this.height = 10;////why doesn't it work correctly for 10+?
		this.squares = [];
		for(var i=1; i<=this.width; i++){
			this.squares[i] = [];
			for(var j=1; j<=this.height; j++){
				this.squares[i][j] = new grid_square(i, j);
			}
		}

		this.offset = {
			x: 0,
			y: 0
		}


		this.move = function(hor,ver){
			max_offset = {
				x: map.width - this.width,
				y: map.height - this.height
			}
			this.offset.x-=ver;
			this.offset.y+=hor;
			if(this.offset.x>max_offset.x){
				this.offset.x=max_offset.x;
			}
			if(this.offset.y>max_offset.y){
				this.offset.y=max_offset.y;
			}
			if(this.offset.x<0){
				this.offset.x=0;
			}
			if(this.offset.y<0){
				this.offset.y=0;
			}
			this.redraw();
		}

		this.redraw = function(){
			for(var i in this.squares){
				for(var j in this.squares[i]){
					var square = this.squares[i][j];
					if(square instanceof grid_square){
						var newX = parseInt(i)+parseInt(this.offset.x);
						var newY = parseInt(j)+parseInt(this.offset.y);
						square.setPosition(newX, newY);	
					}
					//var oldX = square.getX();
					//var oldY = square.getY();
				}
			}
		}

		this.redraw();


		return this;
	}
	return (gridL);
}])