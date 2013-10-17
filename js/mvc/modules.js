var app = angular.module('app', []).config(['$routeProvider', function($routeProvider){
		$routeProvider
			.when('/start', {templateUrl: 'html/welcome.html'})
			.when('/parserTest', {templateUrl: 'html/parser_test.html'})
			.otherwise({redirectTo: '/start'});
	}]
);	