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
*/
exports.updateUser = function(req, res, next) {
	var r = {};
	var req_user = req.body;
	var user =  new User(req_user);
	User.findUserAndUpdate(req_user,function(result){
		return res.json(result);
	});
}

/*
	update user's follow list (remove)
	user - id
	friend -id
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
	var req_user = req.body;

	req.user.getUsersData(function(result){
		return res.json(result);
	});
	
}
