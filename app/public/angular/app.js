var userPermissions = ["email","public_profile","user_friends", //"user_checkins", "friends_checkins",
  "user_tagged_places","user_posts", "user_relationships","user_events","user_hometown", "user_work_history", "user_location"];
var tempPermissions = ["email","public_profile","user_friends"];
var model = {
  user : {},
  // domain: "http://localhost:8080/",
  domain: "http://x-find.herokuapp.com/",
  user_target:{
    name: "user name",
    method: "method",
    index :-1
  },
  follow:[],
  targets:[
    {
      image:'img/Curiosity_Icon 2.png',
      goal:'curiosity',
      number :'1 :',
      text: 'iterested but not to much.',
      method:'curiosity'
    },
    {
      image:'img/Tracking_Icon 2.png',
      goal:'tracking',
      number :'2 :',
      text: "need to know where he/she and that they're up to.",
      method:'tracking'
    },
    {
      image:'img/Avoidance_Icon 2.png',
      goal:'avoidance',
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
      },tempPermissions);
    }

    $scope.$on('updateUser', function(event, args) {
      console.log('update user broadcast',args)
      $scope.updateUser(args)
      // if the user authenticated then brings all the other users 
      $rootScope.$broadcast("getUsers",args.authResponse.userID);
      $rootScope.$broadcast("updateNav",args.authResponse.userID);
      changePageTo('findFriendPage');
    });

    $scope.updateUser = function(response){
      Facebook.api('/me', function(response) {
        $http.post(model.domain+"user/updateUser",response).success(function(data){
          model.user = data.user;
        }).error = errHandler;
      });
    }
  }
]);

xfind.controller('findFriendCtrl',['$scope', '$http','sharedProperties',
  function($scope, $http, sharedProperties){
    
    $scope.$on('getUsers', function(event,userid) {
      console.log('get users broadcast',userid)
      $scope.getUsers(userid);
    });

    $scope.getUsers = function(userid){
      $http.get(model.domain+"user/getAppUsers?id="+userid).success(function(data){
        model.users = data.users;
        $scope.users = data.users;
        //console.log($route)
      })
      .error  = errHandler;
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
     
     if ($scope.selectedIndex== -1) return;
      var args = {
        user: model.user.id,
        friend: (sharedProperties.getSelectedUser())?sharedProperties.getSelectedUser().id:null,
        method:$scope.targets[$scope.selectedIndex].method
      }

      if (args.user && args.friend && args.method)
        $http.post(model.domain+"user/addFollowList",args).success(function(data){
          if (data.status != 1) return;
          data.followed_user.method = data.method;
          var index = model.follow.map(function(val,key){
              return val['id']
          }).indexOf(data.followed_user.id)
          if (index != -1)
            model.follow[index]=data.followed_user;
          else model.follow.push(data.followed_user);
          
          model.user_target.name = data.followed_user.name;
          model.user_target.method = data.followed_user.method;
          model.user_target.index = index;
          console.log(data)
        })
        .error = errHandler;
    };
  }
]);

xfind.controller('mapCtrl',['$scope', '$http',
  function($scope, $http){
    $scope.user_target = model.user_target;

    $scope.hours = function(){
      console.log(model.follow[$scope.user_target.index])
    }
    $scope.lastWeek = function(){
      console.log(model.follow[$scope.user_target.index])
    }
    $scope.forecast = function(){
      console.log(model.follow[$scope.user_target.index])
    }
  }
]);

xfind.controller('panelCtrl',['$scope', '$http',
  function($scope, $http){
    $scope.follow = model.follow;
    $scope.targets = model.targets;
    $scope.selectedoption = '';

    
    
    $scope.$on('updateNav', function(event,userid) {
      console.log('update nav broadcast',userid)
      $scope.updateNav(userid);
    });

    $scope.updateNav = function (userid) {
        $http.post(model.domain+"user/getFollowedUsersData",{user:userid}).success(function(data){
          if (data.status != 1) return;
          console.log('getFollowedUsersData',data)
          data.follow.forEach(function(val,key){
            data.follow[key]._id.method = data.follow[key].method;
            model.follow.push(data.follow[key]._id)
          })
          
        })
        .error = errHandler;
    }


    $scope.itemClicked = function ($index) {
      if ($scope.selectedIndex == $index)
        $scope.selectedIndex = -1;
      else $scope.selectedIndex = $index;
    }
     $scope.showData = function($index){
        console.log($scope.follow[$index])
        model.user_target.name = $scope.follow[$index].name;
        model.user_target.method = $scope.follow[$index].method;
        model.user_target.index = $index;
     }
     
  }
]);

function errHandler(err){
  console.log(err);
}