var userPermissions = ["email","public_profile","user_friends", //"user_checkins", "friends_checkins",
  "user_tagged_places","user_posts", "user_relationships","user_events","user_hometown", "user_work_history", "user_location"];
var tempPermissions = ["email","public_profile","user_friends"];
var model = {
  user : {},
  //domain: "http://localhost:8080/",
  domain: "http://x-find.herokuapp.com/",
  user_target:{
    name: "USER NAME",
    method: "METHOD",
    id: 0,
    index :-1
  },
  follow:[],
  targets:[
    {
      image:'img/TargetPage_Curiosity.png',
      goal:'CURIOSITY',
      number :'1 :',
      width : "15%",
      text: 'iterested but not to much.',
      method:'CURIOSITY'
    },
    {
      image:'img/TargetPage_Tracking.png',
      goal:'TRACKING',
      number :'2 :',
      width : "10%",
      text: "need to know where he/she and that they're up to.",
      method:'TRACKING'
    },
    {
      image:'img/TargetPage_Avoidance.png',
      goal:'AVOIDANCE',
      number :'3 :',
      width : "15%",
      text: "don't want to see or run into him or at no way.",
      method:'AVOIDANCE'
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

xfind.controller('findFriendCtrl',['$scope','$rootScope','$http','sharedProperties',
  function($scope,$rootScope,$http,sharedProperties){
    $scope.$on('getUsers', function(event,userid) {
      console.log('get users broadcast',userid)
      $scope.getUsers(userid);
      
    });

    $scope.getUsers = function(userid){
      $http.get(model.domain+"user/getAppUsers?id="+userid).success(function(data){
        model.users = data.users;
        $scope.users = model.users;
        
      })
      .error  = errHandler;
    }

    $scope.clearSearch = function () {
        $scope.searchText = "";

    };

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
          model.user_target.id = data.followed_user.id;
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
      MapSingelton.getMap().removeMarkers()
      console.log(model.follow[$scope.user_target.index])
      var temp_obj = model.follow[$scope.user_target.index];

      if ($scope.user_target.method == 'TRACKING') {

          MapSingelton.getMap().setMarker(new Marker
            (new Date().getTime(),new google.maps.LatLng(31.7963186,35.175359),"avishay",'avoidance_green'))
      }
      else if ($scope.user_target.method == 'CURIOSITY') {

      }
      else if ($scope.user_target.method == 'AVOIDANCE') {

      }

    }
    $scope.lastWeek = function(){
      MapSingelton.getMap().removeMarkers()
      console.log(model.follow[$scope.user_target.index])
      var temp_obj = model.follow[$scope.user_target.index];

      if ($scope.user_target.method == 'TRACKING') {

      }
      else if ($scope.user_target.method == 'CURIOSITY') {

      }
      else if ($scope.user_target.method == 'AVOIDANCE') {

      }
    }
    $scope.forecast = function(){
      MapSingelton.getMap().removeMarkers()
      console.log(model.follow[$scope.user_target.index])
      var temp_obj = model.follow[$scope.user_target.index];

      if ($scope.user_target.method == 'TRACKING') {

      }
      else if ($scope.user_target.method == 'CURIOSITY') {

      }
      else if ($scope.user_target.method == 'AVOIDANCE') {

      }
    }
  }
]);

xfind.controller('panelCtrl',['$scope', '$http',
  function($scope, $http){
    $scope.follow = model.follow;
    $scope.targets = model.targets;
    $scope.selectedoption = '';
    $scope.panelStyle = { 'height': window.innerHeight+"px" };

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
        model.user_target.id = $scope.follow[$index].id;
        model.user_target.index = $index;
     }
     $scope.delete = function($index){
       var args= {
        user: model.user.id,
        friend: model.follow[$index].id
       }
       
        $http.post(model.domain+"user/removeFollowList",args).success(function(data){
            console.log(data)
            if (data.status != 1) return;
            var temp = model.follow[$index];
            model.follow.splice($index,1);
            if (temp.id == model.user_target.id){
              model.user_target.name = 'USER NAME';
              model.user_target.method = 'METHOD';
              model.user_target.id = 0;
              model.user_target.index = -1;
            }

            $( "#nav-panel" ).panel( "close" );
        }).error = errHandler;
     }
     $scope.save = function($index){
      var args= {
        user: model.user.id,
        friend: model.follow[$index].id,
        method : model.follow[$index].method
       }
        $http.post(model.domain+"user/addFollowList",args).success(function(data){
            console.log(data)
            if (data.status != 1) return;
            if (model.follow[$index].id == model.user_target.id){
              model.user_target.method = model.follow[$index].method;
            }

            $( "#nav-panel" ).panel( "close" );
        }).error = errHandler;
     }

  }
])
// .directive('myChange', function() {
//   return function(scope, element) {
//     element.bind('change', function(e) {
//       console.log(e);
//     });
//   }
// });

function errHandler(err){
  console.log(err);
}