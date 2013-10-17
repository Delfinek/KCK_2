var app = angular.module('app', []).config(['$routeProvider', function($routeProvider){
		$routeProvider
			.when('/start', {templateUrl: 'html/welcome.html'})
			.when('/parserTest', {templateUrl: 'html/parser_test.html', controller: 'parserTestController'})
			.when('/notationSyntax', {templateUrl: 'html/notationSyntax.html'})
			.otherwise({redirectTo: '/start'});
	}]
);	