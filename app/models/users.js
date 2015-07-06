var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = mongoose.Types.ObjectId; 

var User_schema = new Schema( 
	{
		id : { type : String ,  index : true, unique : true , required :true},
		access_token : { type : String, default:''},
		email : { type : String, default:''},
		gender: { type : String, default:''},
		name : { type : String, default:''},
		first_name: { type : String, default:''},
		last_name: { type : String, default:''},
		relationship_status: { type : String, default:''},
		significant_other: {
			id: { type : String, default:''}, 
			name: { type : String, default:''} 
		},
		picture:{
			data:{
				url:{ type : String, default:''}
			}
		},
		follow : [{
			user_id: {type: Schema.ObjectId , ref:"User"},
			method: { type : String, default:''}
		}],
		location: {
			name: { type : String, default:''},
			latitude: { type : Number, default:0},
			longitude: { type : Number, default:0}
		},
		future_events: [{
			time: { type : Number, default:0},
			name: { type : String, default:''},
			latitude: { type : Number, default:0},
			longitude: { type : Number, default:0},
			attending: { type : Boolean, default:true},
			default:[]
		}],
		tagged_places:[{
			time: { type : Number, default:0},
			name: { type : String, default:''},
			latitude: { type : Number, default:0},
			longitude: { type : Number, default:0},
			default:[]
		}],
		work_place:{
			name: { type : String, default:''},
			latitude: { type : Number, default:0},
			longitude: { type : Number, default:0}
		},
		hometown:{
			name: { type : String, default:''},
			latitude: { type : Number, default:0},
			longitude: { type : Number, default:0}
		}
	});

User_schema.statics.getUserById = function (req_user,callback) {
 	var r = {msg:[]};
 	return this.model('users').findOne({ id : req_user },
 	function(err,foundedUser){
 		if (err){
 			console.log('getUserById:: failed while retriving user');
 			r.status= 0;
 			r.msg.push('failed while retriving user');
 			return callback(r);
 		}
 		else if (foundedUser){
			//update user details
			console.log('getUserById:: user founded');
 			r.status= 1;
 			r.user=foundedUser;
			r.msg.push('user founded');
			return callback(r);
 		}
 		else{
 			console.log('getUserById:: user did not found');
			r.status= 0;
			r.msg.push('user did not found');
			return callback(r);
 		}
 	}); 
}

User_schema.statics.getAllUsers = function (user,callback) {
 	var r = {msg:[]};
 	return this.model('users').find()
 	.select('name id picture relationship_status')
 	.exec(function(err,foundedUsers){
 		if (err){
 			console.log('getAllUsers:: failed while retriving user');
 			r.status= 0;
 			r.msg.push('failed while retriving user');
 			return callback(r);
 		}
 		else if (foundedUsers){
			//update user details
			var index = foundedUsers.map(function(user){
            	return user['id'];
          	}).indexOf(user);

			foundedUsers.splice(index,1)
			console.log('getAllUsers:: user founded');
 			r.status= 1;
 			r.users=foundedUsers;
 			r.length=foundedUsers.length;
			r.msg.push('user founded');
			return callback(r);
 		}
 		else{
 			console.log('getAllUsers:: user did not found');
			r.status= 0;
			r.msg.push('user did not found');
			return callback(r);
 		}
 	}); 
}

User_schema.statics.findUserAndUpdate = function (req_user,callback) {
 	var r = {msg:[],follow:[]};
 	return this.model('users').findOneAndUpdate({ id : req_user.id }, {$set : req_user },
 	function(err,foundedUser){
 		if (err){
 			r.status= 0;
 			r.msg.push('failed while retriving user');
 			return callback(r);
 		}
 		else if (foundedUser){
			//update user details
 			r.status= 1;
 			r.user=foundedUser;
			r.msg.push('user updated');
			return callback(r);
 		}
 		else{
 			// save the new user
 			new User(req_user).save(function(err){
 				if (err){
 					r.status= 0;
 					r.msg.push('failed while saving user');
 					return callback(r)
 				}
 				r.status= 1;
				r.msg.push('user saved');
				return callback(r);
 			});
 		}
 	}); 
}

User_schema.methods.removeFromFollowList = function (user,callback) {
 	var r = {msg:[],follow:[]};
 	var currUser = this;
 	return this.model('users').findOne({ id : user.friend })
 	.exec(function(err,foundedUser){
 		if (err){
 			r.status= 0;
 			r.msg.push('failed while retriving user');
 			return callback(r);
 		}
 		else if (foundedUser){
			//update user details
			currUser.follow.pull({ _id: '5583d4c9b9fb2203001edb93' });
			currUser.save(function(err){
				if (err){
		 			r.status= 0;
		 			r.msg.push('failed pulling user');
		 			return callback(r);
		 		}
				r.status= 1;
	 			r.length=currUser.follow.length;
	 			r.follow=currUser.follow;
				r.msg.push('user follow list updated');
				return callback(r);
			});
 			
 		}
 		else{
			r.status= 0;
			r.msg.push('user does not exist');
			return callback(r);
 		}
 	}); 
}

User_schema.methods.addToFollowList = function (req_user,callback) {
 	var r = {msg:[]};
 	var currUser = this;
 	return this.model('users').findOne({ id : req_user.friend }) 
 	.exec(function(err,foundedUser){
 		if (err){
 			r.status= 0;
 			r.msg.push('failed while retriving user');
 			return callback(r);
 		}
 		else if (foundedUser){
			//update user details
			//var data = { _id: foundedUser._id, method:req_user.method };
			var index = currUser.follow.map(function(user){
					return user['_id'].toString();
			}).indexOf(foundedUser._id.toString());
			
			if (index == -1){
				currUser.follow.push({ _id: foundedUser._id, method:req_user.method })
			}
			else{
				currUser.follow[index].method = req_user.method;
			}
			currUser.save(function(err){
				if (err){
					r.status= 0;
		 			r.msg.push('failed while updating user');
		 			return callback(r);
				}
				r.status= 1;
				r.method=req_user.method;
	 			r.followed_user=foundedUser;
				r.msg.push('user follow list updated');
				return callback(r);
			});
			// currUser.update({$addToSet:{follow:data}}, {safe : true, fsync : true})
			// .exec(function(err){
				
			// });
 		}
 		else{
			r.status= 0;
			r.msg.push('user does not exist');
			return callback(r);
 		}
 	}); 
}

User_schema.methods.getUsersData = function (callback) {
 	var r = {msg:[],follow:[]};

	return this.model('users').findOne(this._id)
 	// .populate('follow')
 	.populate('follow._id')
 	// .populate(this.follow,'user_id')
 	.select('name id follow')
 	.exec(function(err,foundedUsers){
 		if (err){
 			console.log('getUsersData:: failed while db user searching');
 			r.status= 0;
 			r.msg.push('failed while db user searching');
 			return callback(r);
 		}
 		else if (foundedUsers){
			//update user details
			console.log('getUsersData:: user follow list');
 			r.status= 1;
 			r.length = foundedUsers.length;
 			r.follow=foundedUsers.follow;
			r.msg.push('user follow list');
			return callback(r);
 		}
 		else{
 			console.log('getUsersData:: followed user does not exist');
			r.status= 0;
			r.msg.push('followed user does not exist');
			return callback(r);
 		}
 	});
}

User = mongoose.model('users', User_schema);
