var userPermissionsArr = ["email","public_profile","user_friends","user_tagged_places", "user_relationships","user_events","user_hometown", "user_work_history", "user_location","user_posts"];
var userPermissions = "email,public_profile,user_friends,user_tagged_places,user_relationships,user_events,user_hometown,user_work_history,user_location,user_posts";
var tempPermissions = ["email","public_profile","user_friends"];
var userDetails = "?fields=id,name,picture{url},email,gender,first_name,last_name,relationship_status,significant_other,locale,work,hometown,events,tagged,location";
var model = {
  user : {},
  // domain: "http://localhost:8080/",
  // domain: "http://x-find.herokuapp.com/",
  domain:(document.domain == 'localhost')?'http://localhost:8080/':"http://x-find.herokuapp.com/",
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
      style:"width : 15%; max-width:70px",
      text: 'interested but not too much.',
      method:'CURIOSITY'
    },
    {
      image:'img/TargetPage_Tracking.png',
      goal:'TRACKING',
      number :'2 :',
      style:"width : 10%; max-width:60px",
      text: "need to know where he/she was and what they're up to.",
      method:'TRACKING'
    },
    {
      image:'img/TargetPage_Avoidance.png',
      goal:'AVOIDANCE',
      number :'3 :',
      style:"width : 15%; max-width:70px",
      text: "don't want to see or run into him or her at no way.",
      method:'AVOIDANCE'
    }
  ]
}

var xfind = angular.module("xfindApp",  ['ngFacebook'])
  .config(function( $facebookProvider) {
     $facebookProvider.setAppId('910934928965878');
     $facebookProvider.setVersion("v2.4");
     $facebookProvider.setPermissions(userPermissionsArr);
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

xfind.run(function($rootScope,$window,$facebook,sharedProperties){
  (function(d, s, id) {
      var js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) return;
      js = d.createElement(s); js.id = id;
      js.src = "//connect.facebook.net/en_US/sdk.js";
      fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));

    $rootScope.$on('fb.load', function() {
      $window.dispatchEvent(new Event('fb.load'));
    });
    
    $window.onresize = function(){
      fixHeaderSubTitle();
    }

     $rootScope.$on('fb.auth.authResponseChange', function() {
        $rootScope.status = $facebook.isConnected();
        console.log('facebook status',$rootScope.status);
        if($rootScope.status) {
            //$facebook.clearCache();
            $rootScope.$broadcast("updateUser",$facebook.getAuthResponse());
        }
    });
});

xfind.controller('loginCtrl',['$rootScope','$scope', '$http','$facebook','sharedProperties',
  function($rootScope,$scope, $http, $facebook,sharedProperties){

    $scope.fbLogin = function(){
      $facebook.login();
    }

    $scope.fbLogout = function(){
      $facebook.logout();
    }

    $scope.$on('updateUser', function(event, args) {
      console.log('update user broadcast',args)
      $scope.updateUser(args)
      // if the user authenticated then brings all the other users 
      $rootScope.$broadcast("getUsers",args.userID);
      $rootScope.$broadcast("updateNav",args.userID);
      changePageTo('findFriendPage');
    });

    $scope.updateUser = function(response){

      var accessToken = response.accessToken;
      $facebook.api('/me'+userDetails).then(function(user) {
          user.access_token = accessToken;
          model.user = user;
          console.log('update user', user)
          $http.post(model.domain+"user/updateUser",user).success(function(data){
            // if (data.status != 1) return;
            // model.user = data.user;
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
      if ($scope.selectedIndex == -1) return
      console.log($scope.users[$scope.selectedIndex]);
      sharedProperties.setSelectedUser($scope.users[$scope.selectedIndex])
    };
  }
]);


xfind.controller('targetCtrl',['$scope', '$http','$rootScope','sharedProperties',
  function($scope, $http, $rootScope,sharedProperties){
    $scope.targets = model.targets;

    $scope.selectedIndex = -1; 

    $scope.itemClicked = function ($index) {
      if ($scope.selectedIndex == $index)
        $scope.selectedIndex = -1;
      else $scope.selectedIndex = $index;
    };

    $scope.selectedTarget = function () {
      console.log($scope.targets[$scope.selectedIndex]);
     //debugger
     if ($scope.selectedIndex== -1) return;
      var args = {
        user: model.user.id,
        friend: (sharedProperties.getSelectedUser())?sharedProperties.getSelectedUser().id:null,
        method:$scope.targets[$scope.selectedIndex].method
      }
      
      if (args.user && args.friend && args.method)
        $http.post(model.domain+"user/addFollowList",args)
         .success(function(data){
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

            $rootScope.$broadcast("displayData");
            
            console.log(data)
         })
        .error = errHandler;
    };
  }
]);

xfind.controller('mapCtrl',['$scope', '$http',
  function($scope, $http){
    $scope.user_target = model.user_target;
      var DY = new Date(); // Date Yesterday
      var DLW = new Date(); // Date Last Week
      DY.setDate(DY.getDate() - 1);
      DY=DY.getTime();
      DLW.setDate(DLW.getDate() - 7);
      DLW=DLW.getTime();
      
    // var user = model.follow[$scope.user_target.index];
    
    $scope.timeIndex=0;
    $scope.timeClicked = function ($index) {
      $scope.timeIndex = $index;
      clearMap();
    };

    $scope.$on('displayData', function(event) {
      console.log('displayData and userIcon broadcast')

      clearMap();
      MapSingelton.getMap().changeMyImage(model.user_target.method);
      if ( $scope.timeIndex==0)
          $scope.hours();
      else if ( $scope.timeIndex==1)
          $scope.lastWeek();
      else if ( $scope.timeIndex==2)
          $scope.forecast();


    });

    function clearMap(){
      MapSingelton.getMap().removeMarkers();
      MapSingelton.getMap().clearPopup()
    }

    $scope.hours = function(){
      //MapSingelton.getMap().removeMarkers()
      console.log(model.user_target);
      var temp_obj = model.follow[$scope.user_target.index];

      displayCommonPlaces(temp_obj,$scope.user_target.method,'green');
      displayFacebookEvents(temp_obj,$scope.user_target.method,'green');

      // if ($scope.user_target.method == 'TRACKING') {
      //   // displayCommonPlaces(temp_obj,'TRACKING');
      //   $.each(temp_obj.tagged_places,function(i,val){
      //      var tagTime = val.time;
      //       if(DY<tagTime){
      //          console.log("in time")
      //       MapSingelton.getMap().setMarker(new Marker
      //       (tagTime,new google.maps.LatLng(val.latitude,val.longitude),val.name,'tracking_green'))
      //     } 
      //   })
      // }
      // else if ($scope.user_target.method == 'CURIOSITY') {
      //   // displayCommonPlaces(temp_obj,'CURIOSITY');
      //   $.each(temp_obj.tagged_places,function(i,val){
      //      var tagTime = val.time;
      //       if(DY<tagTime){
      //          console.log("in time")
      //       MapSingelton.getMap().setMarker(new Marker
      //       (tagTime,new google.maps.LatLng(val.latitude,val.longitude),val.name,'curiosity_green'))
      //     } 
      //   })
      // }
      // else if ($scope.user_target.method == 'AVOIDANCE') {
      //   // displayCommonPlaces(temp_obj,'AVOIDANCE');
      //   $.each(temp_obj.tagged_places,function(i,val){
      //      var tagTime = val.time;
      //       if(DY<tagTime){
      //         console.log("in time")
      //       MapSingelton.getMap().setMarker(new Marker
      //       (tagTime,new google.maps.LatLng(val.latitude,val.longitude),val.name,'avoidance_green'))
      //     } 
      //   })
      // }

    }
    $scope.lastWeek = function(){
      
      console.log(model.follow[$scope.user_target.index])
      var temp_obj = model.follow[$scope.user_target.index];

      displayCommonPlaces(temp_obj,$scope.user_target.method,'green');
      displayFacebookEvents(temp_obj,$scope.user_target.method,'green');
      
      // if ($scope.user_target.method == 'TRACKING') {
      //   // displayCommonPlaces(temp_obj,'TRACKING');
      //   $.each(temp_obj.tagged_places,function(i,val){
      //      var tagTime = val.time;
      //       if(DLW<tagTime){
      //         console.log("in time",val)
      //       MapSingelton.getMap().setMarker(new Marker
      //       (tagTime,new google.maps.LatLng(val.latitude,val.longitude),val.name,'tracking_green'))
      //     } 
      //   })
      // }
      // else if ($scope.user_target.method == 'CURIOSITY') {
      //   // displayCommonPlaces(temp_obj,'CURIOSITY');
      //   $.each(temp_obj.tagged_places,function(i,val){
      //      var tagTime = val.time;
      //       if(DLW<tagTime){
      //          console.log("in time",val)
      //       MapSingelton.getMap().setMarker(new Marker
      //       (tagTime,new google.maps.LatLng(val.latitude,val.longitude),val.name,'curiosity_green'))
      //     } 
      //   })
      // }
      // else if ($scope.user_target.method == 'AVOIDANCE') {
      //   // displayCommonPlaces(temp_obj,'AVOIDANCE');
      //   $.each(temp_obj.tagged_places,function(i,val){
      //      var tagTime = val.time;
      //       if(DLW<tagTime){
      //          console.log("in time",val)
      //       MapSingelton.getMap().setMarker(new Marker
      //       (tagTime,new google.maps.LatLng(val.latitude,val.longitude),val.name,'avoidance_green'))
      //     } 
      //   })
      // }
    }
    $scope.forecast = function(){
      //MapSingelton.getMap().removeMarkers()
      console.log(model.follow[$scope.user_target.index])
      var temp_obj = model.follow[$scope.user_target.index];

      displayCommonPlaces(temp_obj,$scope.user_target.method,'red');
      displayFacebookEvents(temp_obj,$scope.user_target.method,'red');

      // if ($scope.user_target.method == 'TRACKING') {
      //   // displayCommonPlacesForeCast(temp_obj,'TRACKING');
      //   // displayFacebookEvents(temp_obj,'TRACKING');
      //   $.each(temp_obj.future_events,function(i,val){
      //      var tagTime = val.time;
      //       MapSingelton.getMap().setMarker(new Marker
      //       (tagTime,new google.maps.LatLng(val.latitude,val.longitude),val.name,'tracking_red'))
      //   })
      // }
      // else if ($scope.user_target.method == 'CURIOSITY') {
      //     // displayCommonPlacesForeCast(temp_obj,'CURIOSITY');
      //     // displayFacebookEvents(temp_obj,'CURIOSITY');
      //   $.each(temp_obj.future_events,function(i,val){
      //      var tagTime = val.time;
      //       MapSingelton.getMap().setMarker(new Marker
      //       (tagTime,new google.maps.LatLng(val.latitude,val.longitude),val.name,'curiosity_red'))
          
      //   })
      // }
      // else if ($scope.user_target.method == 'AVOIDANCE') {
      //   // displayCommonPlacesForeCast(temp_obj,'AVOIDANCE');
      //   // displayFacebookEvents(temp_obj,'AVOIDANCE');
      //   $.each(temp_obj.future_events,function(i,val){
      //      var tagTime = val.time;
      //       MapSingelton.getMap().setMarker(new Marker
      //       (tagTime,new google.maps.LatLng(val.latitude,val.longitude),val.name,'avoidance_red'))
          
      //   })
      // }
    }
  }
]);
function displayFacebookEvents(user_obj,method,color){

    switch (method) {
      case 'TRACKING':{
          $.each(user_obj.events.data,function(i,val){
              //if(val.rsvp_status=="attending"){
              var tagTime = val.start_time.split("T")[1].split("+")[0];
              if(val.place.location){
               MapSingelton.getMap().setMarker(new Marker
                    (tagTime,new google.maps.LatLng(val.place.latitude,val.place.longitude),val.name,'tracking_red')) 
              }
            //}
          });
          break;
        }
      case 'CURIOSITY':{
          $.each(user_obj.events.data,function(i,val){
              //if(val.rsvp_status=="attending"){
              var tagTime = val.start_time.split("T")[1].split("+")[0];
              
              if(val.place.location){
               MapSingelton.getMap().setMarker(new Marker
                    (tagTime,new google.maps.LatLng(val.place.latitude,val.place.longitude),val.name,'curiosity_red')) 
              }
            //}
          });
          break;
      }   
      case 'AVOIDANCE':{
           $.each(user_obj.events.data,function(i,val){
              //if(val.rsvp_status=="attending"){
              var tagTime = val.start_time.split("T")[1].split("+")[0];
              
              if(val.place.location){
               MapSingelton.getMap().setMarker(new Marker
                    (tagTime,new google.maps.LatLng(val.place.latitude,val.place.longitude),val.name,'avoidance_red')) 
              }
            //}
          });     break;
      }  
    }
}
function displayCommonPlaces( user_obj, method,color){
  switch (method) {
      case 'TRACKING':{
            MapSingelton.getMap().setMarker(new Marker
            (new Date().getTime(),new google.maps.LatLng(user_obj.hometown.latitude,user_obj.hometown.longitude),user_obj.hometown.name,'tracking_'+color))
         MapSingelton.getMap().setMarker(new Marker
            (new Date().getTime(),new google.maps.LatLng(user_obj.work_place.latitude,user_obj.work_place.longitude),user_obj.work_place.name,'tracking_'+color))
         
          break;
        }
      case 'CURIOSITY':{
           MapSingelton.getMap().setMarker(new Marker
            (new Date().getTime(),new google.maps.LatLng(user_obj.hometown.latitude,user_obj.hometown.longitude),user_obj.hometown.name,'curiosity_'+color))
         MapSingelton.getMap().setMarker(new Marker
            (new Date().getTime(),new google.maps.LatLng(user_obj.work_place.latitude,user_obj.work_place.longitude),user_obj.work_place.name,'curiosity_'+color))
          break;
      }   
      case 'AVOIDANCE':{
           MapSingelton.getMap().setMarker(new Marker
            (new Date().getTime(),new google.maps.LatLng(user_obj.hometown.latitude,user_obj.hometown.longitude),user_obj.hometown.name,'avoidance_'+color))
         MapSingelton.getMap().setMarker(new Marker
            (new Date().getTime(),new google.maps.LatLng(user_obj.work_place.latitude,user_obj.work_place.longitude),user_obj.work_place.name,'avoidance_'+color))
          break;
      }  
    }
}
function displayCommonPlacesForeCast( user_obj, method){
    switch (method) {
      case 'TRACKING':{
            MapSingelton.getMap().setMarker(new Marker
            (new Date().getTime(),new google.maps.LatLng(user_obj.hometown.latitude,user_obj.hometown.longitude),user_obj.hometown.name,'tracking_red'))
         MapSingelton.getMap().setMarker(new Marker
            (new Date().getTime(),new google.maps.LatLng(user_obj.work_place.latitude,user_obj.work_place.longitude),user_obj.work_place.name,'tracking_red'))
         
          break;
        }
      case 'CURIOSITY':{
           MapSingelton.getMap().setMarker(new Marker
            (new Date().getTime(),new google.maps.LatLng(user_obj.hometown.latitude,user_obj.hometown.longitude),user_obj.hometown.name,'curiosity_red'))
         MapSingelton.getMap().setMarker(new Marker
            (new Date().getTime(),new google.maps.LatLng(user_obj.work_place.latitude,user_obj.work_place.longitude),user_obj.work_place.name,'curiosity_red'))
          break;
      }   
      case 'AVOIDANCE':{
           MapSingelton.getMap().setMarker(new Marker
            (new Date().getTime(),new google.maps.LatLng(user_obj.hometown.latitude,user_obj.hometown.longitude),user_obj.hometown.name,'avoidance_red'))
         MapSingelton.getMap().setMarker(new Marker
            (new Date().getTime(),new google.maps.LatLng(user_obj.work_place.latitude,user_obj.work_place.longitude),user_obj.work_place.name,'avoidance_red'))
          break;
      }  
    }
}
xfind.controller('panelCtrl',['$scope', '$http','$rootScope',
  function($scope, $http,$rootScope){
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

         closeNav();
        $rootScope.$broadcast("displayData");
     }
     $scope.delete = function($index){
       var args= {
        user: model.user.id,
        friend: model.follow[$index].id
       }
        if (window.confirm("Do you really want to Delete?"))
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
            closeNav();
        }).error = errHandler;
     }

     function closeNav(){
         $( "#nav-panel" ).panel( "close" );
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