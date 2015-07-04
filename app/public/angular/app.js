var model = {
  user : {},
  //domain: "http://localhost:8080/"
  domain: "http://xfind.herokuapp.com/"
}

var xfind = angular.module("xfindApp",  ['facebook'])
  .config(function(FacebookProvider) {
    // Set your appId through the setAppId method or
    // use the shortcut in the initialize method directly.
    FacebookProvider.init('910934928965878');
  })
  .service('sharedProperties', function () {
     var property = {};
     return {
      getProperty: function () {
          return property;
      },
      setProperty: function(value) {
          property = value;
      }
    }
  });

xfind.run(function($rootScope,Facebook,sharedProperties){
  Facebook.getLoginStatus(function(response) {
    if(response.status === 'connected') {
      sharedProperties.setProperty(response);
      $rootScope.$broadcast("updateUser",response);
    } 
    else {
      console.log(response);
    }
  });
});

xfind.controller('loginCtrl',['$rootScope','$scope', '$http','Facebook','sharedProperties',
  function($rootScope,$scope, $http, Facebook,sharedProperties){
    //$scope.shoes = model;

    $scope.fbLogin = function(){
      Facebook.login(function(response) {
        $scope.$emit('updateUser', response);
      });
    }

    $scope.$on('updateUser', function(event, args) {
      console.log('update user broadcast')
      $scope.updateUser(args)
      // if the user authenticated then brings all the other users 
      $rootScope.$broadcast("getUsers");
      changePageTo('findFriendPage');
    });

    $scope.updateUser = function(response){
      Facebook.api('/me', function(response) {
        $http.post(model.domain+"user/updateUser",response).success(function(data){
          model.user = data;
        }).error(function(err){
           console.log(err);
        });
      });
    }
  }
]);

xfind.controller('findFriendCtrl',['$scope', '$http',
  function($scope, $http){
    
    $scope.$on('getUsers', function(event) {
      console.log('get users broadcast')
      $scope.getUsers();
    });

    $scope.getUsers = function(){
      $http.post(model.domain+"user/getAppUsers").success(function(data){
        model.users = data;
      });
    }

    // $scope.getShoeById = function(getShoeId){
    //   console.log(getShoeId) 
    //   $http.get(model.domain+"/getShoeById/?id=" + getShoeId).success(function(data){
    //     console.log(data)
    //     $scope.shoes.items = data;
    //   });
    // }
  }
]);


xfind.controller('targetCtrl',['$scope', '$http',
  function($scope, $http){
    $scope.shoes = model;

    $scope.refresh = function(){
      $http.get(model.domain+"/getAllShoes").success(function(data){
        model.items = data;
      });
    }

    $scope.getShoeById = function(getShoeId){
      console.log(getShoeId) 
      $http.get(model.domain+"/getShoeById/?id=" + getShoeId).success(function(data){
        console.log(data)
        $scope.shoes.items = data;
      });
    }
  }
]);

xfind.controller('mapCtrl',['$scope', '$http',
  function($scope, $http){
    $scope.shoes = model;

    $scope.refresh = function(){
      $http.get(model.domain+"/getAllShoes").success(function(data){
        model.items = data;
      });
    }

    $scope.getShoeById = function(getShoeId){
      console.log(getShoeId) 
      $http.get(model.domain+"/getShoeById/?id=" + getShoeId).success(function(data){
        console.log(data)
        $scope.shoes.items = data;
      });
    }
  }
]);

xfind.controller('panelCtrl',['$scope', '$http',
  function($scope, $http){
    $scope.shoes = model;

    $scope.refresh = function(){
      $http.get(model.domain+"/getAllShoes").success(function(data){
        model.items = data;
      });
    }

    $scope.getShoeById = function(getShoeId){
      console.log(getShoeId) 
      $http.get(model.domain+"/getShoeById/?id=" + getShoeId).success(function(data){
        console.log(data)
        $scope.shoes.items = data;
      });
    }
  }
]);