var app = angular.module('app', ['ngRoute', 'ngAnimate']).config(['$routeProvider', function($routeProvider){
		$routeProvider
			.when('/start', {templateUrl: 'html/welcome.html'})
			.when('/parserTest', {templateUrl: 'html/parser_test.html', controller: 'parserTestController'})
			.when('/notationSyntax', {templateUrl: 'html/notationSyntax.html'})
			.when('/gridTest', {templateUrl: 'html/grid_test.html', controller: 'gridTestController'})
			.when('/anim', {templateUrl: 'html/anim_test.html'})
			.otherwise({redirectTo: '/start'});
	}]
);	