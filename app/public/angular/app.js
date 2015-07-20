var userPermissionsArr = ["email","public_profile","user_friends","user_tagged_places", "user_relationships","user_events","user_hometown", "user_work_history", "user_location","user_posts"];
var userPermissions = "email,public_profile,user_friends,user_tagged_places,user_relationships,user_events,user_hometown,user_work_history,user_location,user_posts";
var tempPermissions = ["email","public_profile","user_friends"];
var userDetails = "?fields=id,name,picture{url},email,gender,first_name,last_name,relationship_status,significant_other,locale,work,hometown,events,tagged,location";
var model = {
  user : {},
  domain: "http://x-find.herokuapp.com/",
  //domain:(document.domain == 'localhost')?'http://localhost:8080/':"http://x-find.herokuapp.com/",
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
    //define facebook configuration
     $facebookProvider.setAppId('910934928965878');
     $facebookProvider.setVersion("v2.4");
     $facebookProvider.setPermissions(userPermissionsArr);
  })
  .service('sharedProperties', function () {
     //porperties to share between the scopes
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
  // fb sdk
  (function(d, s, id) {
      var js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) return;
      js = d.createElement(s); js.id = id;
      js.src = "//connect.facebook.net/en_US/sdk.js";
      fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));
    print("ng run")
    //exec on fb load
    $rootScope.$on('fb.load', function() {
      $window.dispatchEvent(new Event('fb.load'));
    });
    
    $window.onresize = function(){
      fixHeaderSubTitle();
    }

    // listen when auth execute 
     $rootScope.$on('fb.auth.authResponseChange', function() {
        $rootScope.status = $facebook.isConnected();
        print('facebook status',$rootScope.status);
        if($rootScope.status) {
            //update user info broadcast when he logged in
            $rootScope.$broadcast("updateUser",$facebook.getAuthResponse());
        }
    });
});

xfind.controller('loginCtrl',['$rootScope','$scope', '$http','$facebook','sharedProperties',
  function($rootScope,$scope, $http, $facebook,sconsoleharedProperties){

    $scope.fbLogin = function(){
      $facebook.login();
    }

    $scope.fbLogout = function(){
      $facebook.logout();
    }

    // update the user data event 
    // here there are 2 events
    // 1.get users app list 2. update map navigation bar with the followed users if exist
    $scope.$on('updateUser', function(event, args) {
      print('update user broadcast',args)
      $scope.updateUser(args)
      // if the user authenticated then brings all the other users 
      $rootScope.$broadcast("getUsers",args.userID);
      $rootScope.$broadcast("updateNav",args.userID);
      changePageTo('findFriendPage');
    });

    $scope.updateUser = function(response){

      var accessToken = response.accessToken;
      // get user data from FB
      $facebook.api('/me'+userDetails).then(function(user) {
          user.access_token = accessToken;
          model.user = user;
          print('update user', user)
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
    // on get users recieve event
    $scope.$on('getUsers', function(event,userid) {
      print('get users broadcast',userid)
      $scope.getUsers(userid);
      
    });
    //get app users
    $scope.getUsers = function(userid){
      $http.get(model.domain+"user/getAppUsers?id="+userid).success(function(data){
        model.users = data.users;
        $scope.users = model.users;
        
      })
      .error  = errHandler;
    }
    //filter friend search box
    $scope.clearSearch = function () {
        $scope.searchText = "";
    };

    $scope.selectedIndex = -1; 

    //the selected friend index
    $scope.itemClicked = function ($index) {
      if ($scope.selectedIndex == $index)
        $scope.selectedIndex = -1;
      else $scope.selectedIndex = $index;
    };

    //the selected user will bw stored in the sharedProperties we already defined
    $scope.selectedUser = function () {
      if ($scope.selectedIndex == -1) return
      print($scope.users[$scope.selectedIndex]);
      sharedProperties.setSelectedUser($scope.users[$scope.selectedIndex])
    };
  }
]);


xfind.controller('targetCtrl',['$scope', '$http','$rootScope','sharedProperties',
  function($scope, $http, $rootScope,sharedProperties){
    $scope.targets = model.targets;

    $scope.selectedIndex = -1; 

    //selected target index
    $scope.itemClicked = function ($index) {
      if ($scope.selectedIndex == $index)
        $scope.selectedIndex = -1;
      else $scope.selectedIndex = $index;
    };

    //the target we choosed
    $scope.selectedTarget = function () {
      print($scope.targets[$scope.selectedIndex]);
     //debugger
     if ($scope.selectedIndex== -1) return;
      var args = {
        user: model.user.id,
        friend: (sharedProperties.getSelectedUser())?sharedProperties.getSelectedUser().id:null,
        method:$scope.targets[$scope.selectedIndex].method
      }
      
      // update the user followed friends
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
            //update the global model with the saved data 
            model.user_target.name = data.followed_user.name;
            model.user_target.method = data.followed_user.method;
            model.user_target.id = data.followed_user.id;
            model.user_target.index = index;

            //display the data on screen
            $rootScope.$broadcast("displayData");
            
            print(data)
         })
        .error = errHandler;
    };
  }
]);

xfind.controller('mapCtrl',['$scope', '$http',
  function($scope, $http){
    // update the selected user 
    $scope.user_target = model.user_target;
      var DY = new Date(); // Date Yesterday
      var DLW = new Date(); // Date Last Week
      DY.setDate(DY.getDate() - 1);
      DY=DY.getTime();
      DLW.setDate(DLW.getDate() - 7);
      DLW=DLW.getTime();
      
    // define 24hours as defualt    
    $scope.timeIndex=0;
    $scope.timeClicked = function ($index) {
      $scope.timeIndex = $index;
      clearMap();
    };

    //exec when selecting a new user to follow
    $scope.$on('displayData', function(event) {
      print('displayData and userIcon broadcast')

      clearMap();
      
      //clear the map
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
    //filte the user data by hours
    $scope.hours = function(){
      print(model.user_target);
      var temp_obj = model.follow[$scope.user_target.index];
      var time ="hours";

      displayCommonPlaces(temp_obj,$scope.user_target.method,'green');
      displayFacebookEvents(temp_obj,$scope.user_target.method,'green',0);

    }
    //filte the user data by lastweek
    $scope.lastWeek = function(){
      
      print(model.follow[$scope.user_target.index])
      var temp_obj = model.follow[$scope.user_target.index];
      var time ="lastWeek";

      displayCommonPlaces(temp_obj,$scope.user_target.method,'green');
      displayFacebookEvents(temp_obj,$scope.user_target.method,'green',1);
      
    }
    //filte the user data by forecast
    $scope.forecast = function(){
      print(model.follow[$scope.user_target.index])
      var temp_obj = model.follow[$scope.user_target.index];
      var time ="forecast";

      displayCommonPlaces(temp_obj,$scope.user_target.method,'red');
      displayFacebookEvents(temp_obj,$scope.user_target.method,'red',2);

      
    }
  }
]);

function displayFacebookEvents(user_obj,method,color,time){
    switch (time){
      case 0:{
        var date= new Date();
        date.setDate(date.getDate() - 1);
        date.setYear(date.getFullYear()-2);
        date= date.getTime();
        break;
      }
      case 1:{
        var date= new Date();
        date.setDate(date.getDate() - 7);
        date.setYear(date.getFullYear()-3);
        date= date.getTime();
        break;
      }
      case 2:{
        var date= new Date();
        date.setDate(date.getDate());
        date.setYear(date.getFullYear()-1);
        date= date.getTime();
      }
    }

    switch (method) {
      case 'TRACKING':{
          $.each(user_obj.events.data,function(i,val){
              //if(val.rsvp_status=="attending"){
              var t =new Date(val.start_time.toString())
              t=t.getTime();
              if (time == 2){
                if(t > date ){
                  if(val.place.location && val.place.location.latitude != 0 && val.place.location.longitude != 0){
                    MapSingelton.getMap().setMarker(new Marker
                        (val.start_time,new google.maps.LatLng(val.place.location.latitude,val.place.location.longitude),val.name,'tracking_'+color)) 
                   }
                }
              }
              else {
                if(t > date && t < new Date().getTime() ){
                  if(val.place.location && val.place.location.latitude != 0 && val.place.location.longitude != 0){
                    MapSingelton.getMap().setMarker(new Marker
                        (val.start_time,new google.maps.LatLng(val.place.location.latitude,val.place.location.longitude),val.name,'tracking_'+color)) 
                   }
                }
              }
            //}
          });
          break;
        }
      case 'CURIOSITY':{
          $.each(user_obj.events.data,function(i,val){
              //if(val.rsvp_status=="attending"){
              var t =new Date(val.start_time.toString())
              t=t.getTime();
               if (time == 2){
                if(t > date ){
                  if(val.place.location && val.place.location.latitude != 0 && val.place.location.longitude != 0){
                    MapSingelton.getMap().setMarker(new Marker
                        (val.start_time,new google.maps.LatLng(val.place.location.latitude,val.place.location.longitude),val.name,'curiosity_'+color)) 
                   }
                }
              }
              else {
                if(t > date && t < new Date().getTime() ){
                  if(val.place.location && val.place.location.latitude != 0 && val.place.location.longitude != 0){
                    MapSingelton.getMap().setMarker(new Marker
                        (val.start_time,new google.maps.LatLng(val.place.location.latitude,val.place.location.longitude),val.name,'curiosity_'+color)) 
                   }
                }
              }
              
            //}
          });
          break;
      }   
      case 'AVOIDANCE':{
          $.each(user_obj.events.data,function(i,val){
              //if(val.rsvp_status=="attending"){
          var t =new Date(val.start_time.toString())
          t=t.getTime();
           if (time == 2){
                if(t > date ){
                  if(val.place.location && val.place.location.latitude != 0 && val.place.location.longitude != 0){
                    MapSingelton.getMap().setMarker(new Marker
                        (val.start_time,new google.maps.LatLng(val.place.location.latitude,val.place.location.longitude),val.name,'avoidance_'+color)) 
                   }
                }
              }
              else {
                if(t > date && t < new Date().getTime() ){
                  if(val.place.location && val.place.location.latitude != 0 && val.place.location.longitude != 0){
                    MapSingelton.getMap().setMarker(new Marker
                        (val.start_time,new google.maps.LatLng(val.place.location.latitude,val.place.location.longitude),val.name,'avoidance_'+color)) 
                   }
                }
              }
         
            //}
          });     break;
      }  
    }
}


function displayCommonPlaces( user_obj, method,color){
  switch (method) {
      case 'TRACKING':{
        if (user_obj.hometown.latitude!=0 && user_obj.hometown.longitude !=0)
            MapSingelton.getMap().setMarker(new Marker
            (new Date(),new google.maps.LatLng(user_obj.hometown.latitude,user_obj.hometown.longitude),user_obj.hometown.name,'tracking_'+color))
         if (user_obj.work_place.latitude!=0 && user_obj.work_place.longitude !=0)
         MapSingelton.getMap().setMarker(new Marker
            (new Date(),new google.maps.LatLng(user_obj.work_place.latitude,user_obj.work_place.longitude),user_obj.work_place.name,'tracking_'+color))
         
          break;
        }
      case 'CURIOSITY':{
        if (user_obj.hometown.latitude!=0 && user_obj.hometown.longitude !=0)
           MapSingelton.getMap().setMarker(new Marker
            (new Date(),new google.maps.LatLng(user_obj.hometown.latitude,user_obj.hometown.longitude),user_obj.hometown.name,'curiosity_'+color))
         if (user_obj.work_place.latitude!=0 && user_obj.work_place.longitude !=0)
         MapSingelton.getMap().setMarker(new Marker
            (new Date(),new google.maps.LatLng(user_obj.work_place.latitude,user_obj.work_place.longitude),user_obj.work_place.name,'curiosity_'+color))
          break;
      }   
      case 'AVOIDANCE':{
        if (user_obj.hometown.latitude!=0 && user_obj.hometown.longitude !=0)
           MapSingelton.getMap().setMarker(new Marker
            (new Date(),new google.maps.LatLng(user_obj.hometown.latitude,user_obj.hometown.longitude),user_obj.hometown.name,'avoidance_'+color))
       if (user_obj.work_place.latitude!=0 && user_obj.work_place.longitude !=0)
         MapSingelton.getMap().setMarker(new Marker
            (new Date(),new google.maps.LatLng(user_obj.work_place.latitude,user_obj.work_place.longitude),user_obj.work_place.name,'avoidance_'+color))
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
     print('update nav broadcast',userid)
      $scope.updateNav(userid);
    });

    $scope.updateNav = function (userid) {
        $http.post(model.domain+"user/getFollowedUsersData",{user:userid}).success(function(data){
          if (data.status != 1) return;
          print('getFollowedUsersData',data)
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
        print($scope.follow[$index])
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
            print(data)
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
         fixHeaderSubTitle();
     }
     $scope.save = function($index){
      var args= {
        user: model.user.id,
        friend: model.follow[$index].id,
        method : model.follow[$index].method
       }
        $http.post(model.domain+"user/addFollowList",args).success(function(data){
            print(data)
            if (data.status != 1) return;
            if (model.follow[$index].id == model.user_target.id){
              model.user_target.method = model.follow[$index].method;
            }

            $( "#nav-panel" ).panel( "close" );
        }).error = errHandler;

     }

  }
])

function print(text){
  //console.log(text)
}

function errHandler(err){
  print(err);
}