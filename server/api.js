var Restify = require('restify'),
	Mongolian = require('mongolian'),
	ObjectId = require('mongolian').ObjectId,
	validator = require('validator'),
	forEach = require("for-each"),
	server = Restify.createServer({
		name: "fidb"
	}),
	dbserver = new Mongolian,
	db = dbserver.db("fidb"),
	sp500 = db.collection("sp500"),
	port = 5500

server.use(Restify.queryParser())
server.use(Restify.bodyParser())
server.use(Restify.CORS())
server.pre(Restify.pre.sanitizePath())


server.get('/dayly/sp500', function(req, res, next) {
	var days = ["2015-05-15","2015-05-16","2015-05-17","2015-05-18"],
		results = []

	forEach(days,function(day){
		sp500.find({
				time: {
					$gt: new Date(day),
					$lt: new Date(day) + 24 * 60 * 60 * 1000
				}
			},{_id:false,symbol:true,name:true,price:true,time:true})
		.limit(500)
		.sort({id: 1 })
		.toArray(function (err, array) {
				if(err){
					res.statusCode = 403
					console.log("Failed to fetch users",err)
					return next()
				}
				else{
					results.push(array)
					if(results.length == days.length){
						res.send(results)
						return next()
					}
				}
			})
		})
	})
	
})