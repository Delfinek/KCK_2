app.controller('parserTestController', ['$scope', 'notationParser', function($scope, notationParser){
	$scope.notation_input = "(Idz|Pojdz) w $kierunek";
	$scope.user_input = "Idz w lewo";

	$scope.getParsed = function(){
		return notationParser.parseToRegex($scope.notation_input);	
	}

	$scope.match = function(){
		return notationParser.notationMatchesInput($scope.notation_input, $scope.user_input);
	}
}]);