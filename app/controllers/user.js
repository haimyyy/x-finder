/*
	authenticate user
*/
exports.authenticateUser = function(req, res, next) {
	var r = {msg:[]};
	var req_user = req.body;
	User.getUserById(req_user.user,function(result){
		if (result.user){
			req.user = result.user;
			next();
		}
		else {
			r.status=0;
			r.msg.push("user is not authenticated")
			return res.json(r);
		}
	});
}
/*
	insert or update the user
	user - data
*/
exports.updateUser = function(req, res, next) {
	var r = {};
	var req_user = req.body;
	console.log('user to update: ',req_user)
	var user =  new User(req_user);
	User.findUserAndUpdate(req_user,function(result){
		return res.json(result);
	});
}

/*
	get app users
	user - id
*/
exports.getAppUsers = function(req, res, next) {
	var r = {};
	var req_user = req.query.id;
	User.getAllUsers(req_user,function(result){
		return res.json(result);
	});
}
/*
	update user's follow list (remove)
	user - id
	friend -id
	method - ''
*/
exports.removeFollowList = function(req, res, next) {
	var r = {};
	var req_user = req.body;
	
	req.user.removeFromFollowList(req_user,function(result){
		return res.json(result);
	});
}
/*
	update user's follow list (add)
	user - id
	friend -id
	method - ''
*/
exports.addFollowList = function(req, res, next) {
	var r = {};
	var req_user = req.body;

	req.user.addToFollowList(req_user,function(result){
		return res.json(result);
	});
	
}
/*
	update user's follow list (remove)
	user - id
	friend -id
*/
exports.getFollowedUsersData = function(req, res, next) {
	var r = {};
	// var req_user = req.body;
	req.user.getUsersData(function(result){
		return res.json(result);
	});
	
}
