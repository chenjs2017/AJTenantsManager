var myApp = angular.module("myApp", [ "ngRoute" ]);
myApp.config(function ($routeProvider) {
    $routeProvider
	.when("/tenants",  { controller: "tenantsController", templateUrl: "new_tenants.html" })
	.when("/users/:id",  { controller: "usersController", templateUrl: "new_users.html" })
    .when("/users",  { controller: "usersController", templateUrl: "new_users.html" })
	.when("/user/:pName/:dName/:id",  { controller: "userController", templateUrl: "new_user.html" })
	.when("/licenses/:id",  { controller: "licensesController", templateUrl: "new_licenses.html" })
    .when("/",  { redirectTo: "/tenants" })
});
//provider
(function() {
    var urlBase = "http://40.114.125.137:8080/"
    myApp.service("myProvider", function ($http) {
	this.getJsonCallback = (function (localUrl, callback, logResult){
	    var url = urlBase + localUrl;
	    if (logResult == true){
		console.log("in getJsonCallback: " + url);
	    }
	    
	    $http.get(url).then (function (response) {
		if (logResult == true){
		    console.log("in getJsonCallback: " + JSON.stringify(response));
		}
		if (response.data.error){
		    //response.data.error is user defined error
		    callback(response.data.error);
		} else {
		    callback(null, response.data);
		}
		
	    }, function (data){
		if (logResult == true){
		    console.log("in getJsonCallback: " + JSON.stringify(data));
		}
		callback(data.statusText);
	    });
	});
	
	this.getJson = (function (localUrl, scope, listName, errorName, logResult) {
	    if (!errorName){
		errorName = 'err';
	    }
	    if (!listName) {
		listName = 'lst';
	    }
	    scope[errorName] = 'Connecting';
	    this.getJsonCallback(localUrl, function(err,data){
		if (err){
		    scope[errorName] = err;
		} else {
		    scope[errorName] = null;
		    scope[listName] = data;
		}
	    }, logResult);
	});
    });
})();
//uses
(function() {
    myApp.controller("usersController", function ($scope, $location, $routeParams, myProvider) {
	$scope.id = $routeParams.id;
	if (!$scope.id)
	{
	    $scope.id='';
	}
	myProvider.getJson('users?id=' + $scope.id, $scope, null, null, true);
	$scope.resetPassword = function (pName) {
	    myProvider.getJsonCallback(
		'resetPassword?id=' + $scope.id + '&pName=' + pName ,function(err, data){
		    if (err){
			alert('Operation faild, error message:' + err)
		    }else {
			alert('Operation succeed...');
		    }
		},
		true
	    );
	}
    });
})();
//single User
(function() {
    function userController ($scope, $location, $routeParams, myProvider) {
	$scope.pName = $routeParams.pName;
	$scope.dName = $routeParams.dName;
	$scope.id = $routeParams.id;
	loadData();

	$scope.remove = (function (sku) {
	    myProvider.getJsonCallback(
		'setLicense?op=0&id=' + $scope.id + '&pName=' + $scope.pName + '&sku=' + sku, loadData);

	});

	$scope.add = (function (sku) {
    	    myProvider.getJsonCallback(
		'setLicense?op=1&id=' + $scope.id + '&pName=' + $scope.pName + '&sku=' + sku, loadData);
	});
	
	function loadData(err, data){
	    if (err) {
		$scope.err = err;
	    } else {
		myProvider.getJson(
		    'userLicenses?id=' + $scope.id + '&pName=' + $scope.pName,
		    $scope, 'userLicenses');
		myProvider.getJson(
		    'skus?id=' + $scope.id,
		    $scope, 'accountLicenses');
	    }
	}
    }
    myApp.controller("userController", userController);
})();
//licenses
(function() {
    myApp.controller("licensesController", function ($scope, $location, $routeParams, myProvider) {
	$scope.id = $routeParams.id;
	myProvider.getJson('skus?id=' + $scope.id,$scope);
    });
})();

//tenants
(function() {
    myApp.controller("tenantsController", function ($scope, $location, $routeParams, myProvider){
	myProvider.getJson('tenants',$scope);
    });
})();

