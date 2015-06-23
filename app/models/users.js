var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = mongoose.Types.ObjectId; 

User_schema = new Schema( 
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
			id: {type: Schema.ObjectId , ref:'User'},
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
 			r.status= 0;
 			r.msg.push('failed while retriving user');
 			return callback(r);
 		}
 		else if (foundedUser){
			//update user details
 			r.status= 1;
 			r.user=foundedUser;
			r.msg.push('user founded');
			return callback(r);
 		}
 		else{
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
 			r.length=foundedUser.follow.length;
 			r.follow=foundedUser.follow;
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
			currUser.follow.pull({ "_id": foundedUser._id });
			currUser.save();
 			r.status= 1;
 			r.length=currUser.follow.length;
 			r.follow=currUser.follow;
			r.msg.push('user follow list updated');
			return callback(r);
 		}
 		else{
			r.status= 0;
			r.msg.push('user does not exist');
			return callback(r);
 		}
 	}); 
}

User_schema.methods.addToFollowList = function (user,callback) {
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
			//currUser.follow.push({ _id: foundedUser._id, method:user.method });
			currUser.update({$addToSet:{follow:{ _id: foundedUser._id, method:user.method }}}).exec(function(err){
				if (err){
					r.status= 0;
		 			r.msg.push('failed while updating user');
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

User_schema.methods.getUsersData = function (callback) {
 	var r = {msg:[],follow:[]};
 	//select populate match
	//populate({'path':'user_id',match:{'name':'kenan'}})
	return this.model('users').find({id:this.id})
	.populate('follow')//{path:this.id,match:{id:{$each:{$in:this.follow}}}}
 	.exec(function(err,foundedUsers){
 		if (err){
 			r.status= 0;
 			r.msg.push('failed while retriving user');
 			return callback(r);
 		}
 		else if (foundedUsers){
			//update user details
 			r.status= 1;
 			r.follow=foundedUsers;
			r.msg.push('user follow list updated');
			return callback(r);
 		}
 		else{
			r.status= 0;
			r.msg.push('user does not exist');
			return callback(r);
 		}
 	});
}

User = mongoose.model('users', User_schema);
