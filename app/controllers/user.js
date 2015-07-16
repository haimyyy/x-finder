/*
	authenticate user
*/
exports.authenticateUser = function(req, res, next) {
	var r = {msg:[]};
	var req_user = req.body;
	console.log('authenticateUser')

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
	recieve user - data
*/
exports.updateUser = function(req, res, next) {
	var r = {status:0,msg:[]};
	var req_user = req.body;
	console.log('updateUser')
	if (!req_user.id) return res.json(r);
	console.log('user to update: ',req_user.id)
	var user =  new User(req_user);
	User.findUserAndUpdate(req_user,function(result){
		return res.json(result);
	});
}

/*
	get app users
	recieve user - id
*/
exports.getAppUsers = function(req, res, next) {
	var r = {};
	var req_user = req.query.id;
	console.log('getAppUsers')
	User.getAllUsers(req_user,function(result){
		return res.json(result);
	});
}
/*
	update user's follow list (remove)
	recieve user - id
			friend -id
			method - ''
*/
exports.removeFollowList = function(req, res, next) {
	var r = {};
	var req_user = req.body;
	console.log('removeFollowList')
	req.user.removeFromFollowList(req_user,function(result){
		return res.json(result);
	});
}
/*
	update user's follow list (add)
	recieve user - id
			friend -id
			method - ''
*/
exports.addFollowList = function(req, res, next) {
	var r = {};
	var req_user = req.body;
	console.log('addFollowList')
	req.user.addToFollowList(req_user,function(result){
		return res.json(result);
	});
	
}
/*
	update user's follow list (remove)
	recieve user - id
			friend -id
*/
exports.getFollowedUsersData = function(req, res, next) {
	var r = {};
	console.log('getFollowedUsersData')
	req.user.getUsersData(function(result){
		return res.json(result);
	});
	
}
