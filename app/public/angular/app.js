var model = {
  user : {},
  domain: "http://localhost:8080/",
  //domain: "http://x-find.herokuapp.com/",
  user_target:{
    user: "user name",
    method: "method"
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
      });
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
          model.follow.push(data.followed_user);
          console.log(data)
        })
        .error = errHandler;
    };
  }
]);

xfind.controller('mapCtrl',['$scope', '$http',
  function($scope, $http){
    $scope.user_target = model.user_target;

  }
]);

xfind.controller('panelCtrl',['$scope', '$http',
  function($scope, $http){
    $scope.follow = model.follow;
    
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

     $scope.insertNavHeader = function () {
        //$('[data-role=panel] [data-role=listview]').prepend('<li class="navTitle" data-rel="close" ng-click="closeNav()"> Espionage </li>')
     }
     $scope.closeNav = function(){
        $('[data-role=panel]').panel( "close" );
     }

    $scope.itemClicked = function ($index) {
      if ($scope.selectedIndex == $index)
        $scope.selectedIndex = -1;
      else $scope.selectedIndex = $index;
    };
     $scope.showData = function(e){
        // obj = $(e.target)
        // if ($(obj).hasClass('downPos')){
        //   $(obj).removeClass('downPos')
        //   $(obj).parent().children().filter('section').css({'display':'none'})
        // }
        // else {
        //   $('.categories').css('display','none')
        //   $('.panel .navUserRow span').removeClass('downPos')
        //   $(obj).addClass('downPos')
        //   $(obj).parent().children().filter('section').css({'display':'block'})
        // }
     }
     
  }
])
.directive(
  "repeatComplete",
  function( $rootScope ) {

      // Because we can have multiple ng-repeat directives in
      // the same container, we need a way to differentiate
      // the different sets of elements. We'll add a unique ID
      // to each set.
      var uuid = 0;


      // I compile the DOM node before it is linked by the
      // ng-repeat directive.
      function compile( tElement, tAttributes ) {

          // Get the unique ID that we'll be using for this
          // particular instance of the directive.
          var id = ++uuid;

          // Add the unique ID so we know how to query for
          // DOM elements during the digests.
          tElement.attr( "repeat-complete-id", id );

          // Since this directive doesn't have a linking phase,
          // remove it from the DOM node.
          tElement.removeAttr( "repeat-complete" );

          // Keep track of the expression we're going to
          // invoke once the ng-repeat has finished
          // rendering.
          var completeExpression = tAttributes.repeatComplete;

          // Get the element that contains the list. We'll
          // use this element as the launch point for our
          // DOM search query.
          var parent = tElement.parent();

          // Get the scope associated with the parent - we
          // want to get as close to the ngRepeat so that our
          // watcher will automatically unbind as soon as the
          // parent scope is destroyed.
          var parentScope = ( parent.scope() || $rootScope );

          // Since we are outside of the ng-repeat directive,
          // we'll have to check the state of the DOM during
          // each $digest phase; BUT, we only need to do this
          // once, so save a referene to the un-watcher.
          var unbindWatcher = parentScope.$watch(
              function() {

                  console.info( "Digest running." );

                  // Now that we're in a digest, check to see
                  // if there are any ngRepeat items being
                  // rendered. Since we want to know when the
                  // list has completed, we only need the last
                  // one we can find.
                  var lastItem = parent.children( "*[ repeat-complete-id = '" + id + "' ]:last" );

                  // If no items have been rendered yet, stop.
                  if ( ! lastItem.length ) {

                      return;

                  }

                  // Get the local ng-repeat scope for the item.
                  var itemScope = lastItem.scope();

                  // If the item is the "last" item as defined
                  // by the ng-repeat directive, then we know
                  // that the ng-repeat directive has finished
                  // rendering its list (for the first time).
                  if ( itemScope.$last ) {

                      // Stop watching for changes - we only
                      // care about the first complete rendering.
                      unbindWatcher();

                      // Invoke the callback.
                      itemScope.$eval( completeExpression );

                  }

              }
          );

      }

      // Return the directive configuration. It's important
      // that this compiles before the ngRepeat directive
      // compiles the DOM node.
      return({
          compile: compile,
          priority: 1001,
          restrict: "A"
      });

  }
);

function errHandler(err){
  console.log(err);
}