
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

		this.objects = [];

		this.isObstacle=function(){
			for(var i in this.objects){
				if(this.objects[i].isObstacle){
					return true;
				}
			}
			return false;
		}

		this.putObject = function(object){
			this.objects.push(object);
		}

		this.getContent = function(){
			return x + " " + y;
		}


	}

	return tile;
}]);

app.service('map',  ['tile', 'object_collection', function(tile, object_collection){
	console.log(object_collection);
	var map = {};
	map.tiles = [];
	map.width = 100;
	map.height = 100;
	console.log(map.width, map.height);
	var cur = 65;
	for(var i=1; i<=map.width; i++){
		map.tiles[i]=[];
		for(var j=1; j<=map.height; j++){
			map.tiles[i][j]=new tile(i,j);
			var ran = Math.round(Math.random()*3)%3;
			if(ran==0){
				map.tiles[i][j].putObject(object_collection.getObjectByID(0));			
			}else if (ran==1){
				map.tiles[i][j].putObject(object_collection.getObjectByID(1));			
			}else{
				map.tiles[i][j].putObject(object_collection.getObjectByID(2));
				map.tiles[i][j].putObject(object_collection.getObjectByID(0));
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
		this.vertical_center_offset = 0;

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
		this.square_size=40;
		this.animation_speed = 200;
		this.max_animation_speed = this.animation_speed*3;
		this.default_anim_ease = 'ease-in-out';
		this.orig_anim_ease = this.default_anim_ease;
		this.anim_ease = this.default_anim_ease;
		this.orig_anim_speed = this.animation_speed;
		this.buffer_size = 8;
		this.width = map.width;
		this.height = map.height;
		this.viewport_size = {
			width:16,
			height:9
		}
		this.squares = [];
		for(var i=1; i<=this.width; i++){
			this.squares[i] = [];
			for(var j=1; j<=this.height; j++){
				this.squares[i][j] = new grid_square(i, j);
			}
		}

		this.offset = {
			x: 50,
			y: -50
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
			if(this.offset.x>this.width-this.viewport_size.width){
				this.offset.x = this.width-this.viewport_size.width+1;
				rubber = true;
			}
			if(this.offset.y>=0 && ver!=0){
				this.offset.y=1;
				rubber = true;
			}
			if(this.offset.y<(-1)*(this.height-this.viewport_size.height)){
				this.offset.y = (-1)*(this.height-this.viewport_size.height+1);
				rubber = true;
			}
			console.log(rubber);
			if(rubber){
				this.anim_ease = 'ease-in';
			}


			//######rubber:


			/*setTimeout(function(){
				self.animation_speed=self.orig_anim_speed;
				if(rubber){
					self.bounceBack();	
				}
				//$rootScope.$apply();
			}, this.animation_speed);*/
			//this.redraw();

			console.log('setting timeout to ', this.animation_speed);
			setTimeout(function(){
				self.redraw();
				//console.log('redraw')
				$rootScope.$apply();
			//}, this.animation_time)
			}, this.animation_speed)
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
			this.redraw();
		}

		this.redraw = function(){
			console.log('redraw');
			var view_center = {
				x: self.offset.x+self.viewport_size.width/2,
				y: self.offset.y-self.viewport_size.height/2
			}
			console.log("view_center", view_center);
			for(var i in this.squares){
				for(var j in this.squares[i]){
					var square = this.squares[i][j];
					square.vertical_center_offset = Math.abs(square.y+view_center.y);
					//console.log(square.y, view_center.y, square.vertical_center_offset);
					if(square.x>this.offset.x - this.buffer_size && square.x <= this.offset.x + this.viewport_size.width + this.buffer_size){
						//if(square.y>this.offset.y && square.y<=this.offset.y + this.viewport_size.height){
						if(square.y>(-1)*this.offset.y-this.buffer_size && square.y<=(-1)*this.offset.y + this.viewport_size.height + this.buffer_size){
							//console.log(square.y, (-1)*this.offset.y + this.viewport_size.height);
							square.visible = true;
						}else{
							square.visible = false;
						}
					}else{
						square.visible = false;
					}
				}
			}
		}

		this.redraw();

		return this;
	}
	return (gridL);
}])

app.factory('sprite', [function(){
	var sprite_factory = function(params){

		//###########   Defaults #########
		this.sprite_filename = 'land.png'
		this.square_size = 35;
		this.frames = {
			'frame1': {
				height:1,
				width:1,
				left_top: [0,0]
			},
			'frame2': {
				height:1,
				width:1,
				left_top: [0,1]
			}
		};
		//###########################

		for(var i in params){
			this[i] = params[i];
		}
	}

	return sprite_factory;
}])

app.factory('object', [function(){
	var obj_factory = function(params){
		this.name;
		this.isObstacle;
		this.sprite;		
		this.current_frame = {};
		for(var i in params){
			this[i] = params[i];
		}

		for(var i in this.sprite.frames){
			this.current_frame = this.sprite.frames[i];
		}
	}

	return obj_factory;
}])

app.service('object_collection', ['object', 'sprite', function(object, sprite){
	var collection = {};
	collection.objects = {};
	collection.objects[0] = new object({
		name: 'grass',
		isObstacle: false,
		perpendicular: false,
		sprite: new sprite({
			sprite_filename: 'nowaTrawa.png',
			//square_size: 35, //not necessary, can be set by default
			frames: {
				'frame1': {
					height:1,
					width:1,
					left_top: [0,0]
				},
				'frame2': {
					height:1,
					width:1,
					left_top: [0,1]
				}
			}
		})
	});
	collection.objects[1] = new object({
		name: 'water',
		isObstacle: true,
		perpendicular: false,
		sprite: new sprite({
			sprite_filename: 'land.png',
			//square_size: 35, //not necessary, can be set by default
			frames: {
				'frame1': {
					height:1,
					width:1,
					left_top: [1,0]
				},
				'frame2': {
					height:1,
					width:1,
					left_top: [1,1]
				}
			}
		})
	});
	collection.objects[2] = new object({
		name: 'tree',
		isObstacle: true,
		perpendicular: true,
		sprite: new sprite({
			sprite_filename: 'tree.png',
			//square_size: 35, //not necessary, can be set by default
			frames: {
				'frame1': {
					height:2,
					width:1,
					left_top: [0,0]
				}
			}
		})
	});

	collection.getObjectByID = function(id){
			return collection.objects[id]
		}

	return collection;
}]);
