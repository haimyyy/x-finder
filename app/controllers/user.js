/*
	insert or update the user
*/
exports.updateUser = function(req, res, next) {
	var r = {};
	var req_user = req.body;
	var user =  new User(req_user);
	User.findUserAndUpdate(req_user,function(result){
		//console.log('findUserAndUpdate result',result)
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
	User.getUserById(req_user.user,function(result){
		if (result.user)
			result.user.removeFromFollowList(req_user,function(result){
				//console.log('addFollowListActions result',result)
				return res.json(result);
			});
		else return res.json(result)
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
	User.getUserById(req_user.user,function(result){
		if (result.user)
			result.user.addToFollowList(req_user,function(result){
				//console.log('addFollowListActions result',result)
				return res.json(result);
			});
		else return res.json(result)
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

	User.getUserById(req_user.user,function(result){
		if (result.user)
			result.user.getUsersData(function(result){
				//console.log('getFollowedUsersData result',result)
				return res.json(result);
			});
		else return res.json(result)
	});
}
