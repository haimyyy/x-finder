var model = {
  user : {},
  domain: "http://localhost:8080/",
  //domain: "http://x-find.herokuapp.com/",
  targets:[
    {
      image:'img/Curiosity_Icon 2.png',
      goal:'goal: curiosity',
      number :'1 :',
      text: 'iterested but not to much.',
      method:'curiosity'
    },
    {
      image:'img/Tracking_Icon 2.png',
      goal:'goal: tracking',
      number :'2 :',
      text: "need to know where he/she and that they're up to.",
      method:'tracking'
    },
    {
      image:'img/Avoidance_Icon 2.png',
      goal:'goal: avoidance',
      number :'3 :',
      text: "don't want to see or run into him or at no way.",
      method:'avoidance'
    }
  ]
}

var xfind = angular.module("xfindApp",  ['facebook'])
  .config(function(FacebookProvider) {
    // Set your appId through the setAppId method or
    // use the shortcut in the initialize method directly.
    FacebookProvider.init('910934928965878');
  })
  .service('sharedProperties', function () {
     var property = {};
     var selectedUser = {};
     return {
      getProperty: function () {
          return property;
      },
      setProperty: function(value) {
          property = value;
      },
      getSelectedUser: function () {
          return selectedUser;
      },
      setSelectedUser: function(value) {
          selectedUser = value;
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

    $scope.fbLogin = function(){
      Facebook.login(function(response) {
        $scope.$emit('updateUser', response);
      });
    }

    $scope.$on('updateUser', function(event, args) {
      console.log('update user broadcast',args)
      $scope.updateUser(args)
      // if the user authenticated then brings all the other users 
      $rootScope.$broadcast("getUsers",args.authResponse.userID);
      changePageTo('findFriendPage');
    });

    $scope.updateUser = function(response){
      Facebook.api('/me', function(response) {
        $http.post(model.domain+"user/updateUser",response).success(function(data){
          model.user = data.user;
        }).error(function(err){
           console.log(err);
        });
      });
    }
  }
]);

xfind.controller('findFriendCtrl',['$scope','$route', '$http','sharedProperties',
  function($scope,$route, $http, sharedProperties){
    
    $scope.$on('getUsers', function(event,userid) {
      console.log('get users broadcast',userid)
      $scope.getUsers(userid);
    });

    $scope.getUsers = function(userid){
      $http.get(model.domain+"user/getAppUsers?id="+userid).success(function(data){
        model.users = data.users;
        $scope.users = data.users;
        //console.log($route)
      });
    }

    $scope.selectedIndex = -1; 

    $scope.itemClicked = function ($index) {
      if ($scope.selectedIndex == $index)
        $scope.selectedIndex = -1;
      else $scope.selectedIndex = $index;
    };

    $scope.selectedUser = function () {
      console.log($scope.users[$scope.selectedIndex]);
      sharedProperties.setSelectedUser($scope.users[$scope.selectedIndex])
    };
  }
]);


xfind.controller('targetCtrl',['$scope', '$http','sharedProperties',
  function($scope, $http, sharedProperties){
    $scope.targets = model.targets;

    $scope.selectedIndex = -1; 

    $scope.itemClicked = function ($index) {
      if ($scope.selectedIndex == $index)
        $scope.selectedIndex = -1;
      else $scope.selectedIndex = $index;
    };

    $scope.selectedTarget = function () {
      console.log($scope.targets[$scope.selectedIndex]);
      var args = {
        user: model.user.id,
        friend: sharedProperties.getSelectedUser().id,
        method:$scope.targets[$scope.selectedIndex].method
      }
      if (args.user && args.friend && args.method)
        $http.post(model.domain+"user/addFollowList",args).success(function(data){
          console.log(data)
        })
        .error(function(err){
          console.log(err)
        });
    };
  }
]);

xfind.controller('mapCtrl',['$scope', '$http',
  function($scope, $http){

  }
]);

xfind.controller('panelCtrl',['$scope', '$http',
  function($scope, $http){
    $scope.follow = model.user.follow;

  }
]);