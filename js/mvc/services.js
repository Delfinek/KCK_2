
var lastts = Date.now();
var total_ts = 0;
function ts(text){
	var dif = Date.now()-lastts;
	total_ts=total_ts + dif;
	console.log(text, dif, ",   ", total_ts + " total");
	ts_reset();
}

function ts_reset(){
	lastts = Date.now();
}

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
	map.width = 100;
	map.height = 100;
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

app.factory('Grid', ['grid_square', 'map', '$rootScope', function(grid_square, map, $rootScope){
	var gridL = function(){
		var self = this;
		this.square_size=35;
		this.animation_speed = 200;
		this.max_animation_speed = this.animation_speed*3;
		this.default_anim_ease = 'ease-in-out';
		this.orig_anim_ease = this.default_anim_ease;
		this.anim_ease = this.default_anim_ease;
		this.orig_anim_speed = this.animation_speed;
		this.width = map.width;
		this.height = map.height;
		this.viewport_size = {
			width:15,
			height:15
		}
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

		this.temp_offset = {
			x:0,
			y:0
		}

		this.move = function(hor,ver){
			this.offset.x += parseInt(hor);
			this.offset.y += parseInt(ver);
			var distance = Math.sqrt(Math.pow(hor, 2)+Math.pow(ver,2));
			console.log(distance);
			var new_speed = this.animation_speed * distance;
			if(new_speed<this.max_animation_speed){
				this.animation_speed = new_speed;
			}else{
				this.animation_speed = this.max_animation_speed;
			}
			var rubber = false;
			if(this.offset.x<=0 && hor!=0){
				this.offset.x=-1;
				rubber = true;
			}
			if(this.offset.y>=0 && ver!=0){
				this.offset.y=1;
				rubber = true;
			}
			console.log(rubber);
			if(rubber){
				this.anim_ease = 'ease-in';
			}
			setTimeout(function(){
				self.animation_speed=self.orig_anim_speed;
				if(rubber){
					self.bounceBack();					
				}
				//$rootScope.$apply();
			}, this.animation_speed);				
		}

		this.bounceBack = function(){
			if(this.offset.x<0){
				this.offset.x=0;
			}
			var max_width = this.width-this.viewport_size.width;
			if(this.offset.x>max_width){
				this.offset.x=max_width;
			}
			if(this.offset.y>0){
				this.offset.y=0;
			}
			var max_height = this.height-this.viewport_size.height;
			if(this.offset.x>max_height){
				this.offset.x=max_height;
			}
			this.anim_ease = 'ease-in-out';
			this.animation_speed = 200;
			setTimeout(function(){
				self.anim_ease = self.orig_anim_ease;
				self.animation_speed = self.orig_anim_speed;
				$rootScope.$apply();
			}, this.animation_speed)
		}



		return this;
	}
	return (gridL);
}])