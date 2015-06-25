var userDetails = "?fields=id,name,picture{url},email,gender,first_name,last_name,relationship_status,significant_other";
var userPermissions = ["email","public_profile","user_friends", //"user_checkins", "friends_checkins",
	"user_tagged_places","user_posts", "user_relationships","user_events","user_hometown", "user_work_history", "user_location"];
var tempPermissions = ["email","public_profile","user_friends"];

window.fbAsyncInit = function() {
	FB.init({
		appId : '910934928965878',
		cookie : true, // enable cookies to allow the server to access
		xfbml : true, // parse social plugins on this page
		version : 'v2.2' // use version 2.2
	});

	FB.getLoginStatus(function(response) {
		statusChangeCallback(response);
	});

};

// Load the SDK asynchronously
( function(d, s, id) {
	var js, fjs = d.getElementsByTagName(s)[0];
	if (d.getElementById(id))
		return;
	js = d.createElement(s);
	js.id = id;
	js.src = "//connect.facebook.net/en_US/sdk.js";
	fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

function statusChangeCallback(response) {
	console.log('statusChangeCallback');
	console.log(response);
	if (response.status === 'connected') {
		$('#fbAction').html('fb logout').attr('onclick','fbLogout()');

		getUserDetails(response);
	} else if (response.status === 'not_authorized') {
		$('#fbAction').html('fb login').attr('onclick','fbLogin()');
		
		console.log('Please log ' + 'into this app.');
	} else {
		$('#fbAction').html('fb login').attr('onclick','fbLogin()');

		console.log('Please log ' + 'into Facebook.');
	}
}

function checkLoginState() {
	FB.getLoginStatus(function(response) {
		statusChangeCallback(response);
	});
}

function fbLogin() {
	FB.login( function(response) {
    console.log(response);
    checkLoginState();
  },
  tempPermissions);
}

function fbLogout() {
	FB.logout( function(response) {
    console.log(response);
    checkLoginState();
  });
}

// Here we run a very simple test of the Graph API after login is
// successful.  See statusChangeCallback() for when this call is made.
function getUserDetails(connection) {
	console.log('Welcome!  Fetching your information.... ');
	FB.api('/me'+userDetails, function(response) {
		console.log('Successful login for: ' , response);
		response.access_token = connection.authResponse.accessToken;
		$.ajax({
			type : "post",
			url : g_domain+'user/updateUser',
			dataType : 'json',
			data: response,
			success : updateUserSuccess,
			error : updateUserError
		});
	});
}
function updateUserSuccess(data){
	console.log(data)
	//changePageTo("findFriendPage")
	changePageTo("mapPage")
}
function updateUserError(XMLHttpRequest, textStatus, errorThrown){
	console.log(XMLHttpRequest, textStatus, errorThrown)
}