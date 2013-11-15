app.controller('parserTestController', ['$scope', 'notationParser', 'speechRecognition', function($scope, notationParser, speechRecognition){
	$scope.notation_input = "(Idz|Pojdz) w (yis)? #kierunek";
	$scope.user_input = "Idz w lewo";
	$scope.language = "en_US";

	$scope.$watch('language', function(newVal){
		speechRecognition.setLan(newVal);
	});

	$scope.getParsed = function(){
		return notationParser.parseToRegex($scope.notation_input).toString();	
	}

	$scope.match = function(){
		return notationParser.notationMatchesInput($scope.notation_input, $scope.user_input);
	}

	speechRecognition.onResult = function(){
		//alert('i am called' + $scope.notation_input);
		//alert(speechRecognition.result);
		$scope.user_input = speechRecognition.result;
		$scope.$apply();
	}

	$scope.getVoice = function(){
		return speechRecognition.getResult();
	}

	$scope.startVoice = function(){
		speechRecognition.start();
	}

	$scope.stopVoice = function(){
		speechRecognition.stop();
	}
}]);

app.controller('gridTestController', ['$scope', 'Grid', function($scope, Grid){
	$scope.grid = new Grid();
	//console.log('gridView', $scope.gridView);

	$scope.step = 8;

	$scope.move = function(a,b){
		$scope.grid.move(a,b);
	}
}])

app.controller('testController', ['$scope', function($scope){
	$scope.arr  = [1,2,3];

	$scope.add = function(){
		$scope.arr.push(Math.round(Math.random()*1000));
	}
}]);