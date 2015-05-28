var Restify = require('restify'),
	Mongolian = require('mongolian'),
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


server.get("/dayly/sp500", function(req, res, next) {
	var days = ["2015-05-15","2015-05-16","2015-05-17","2015-05-18"],
		results = []

	forEach(days,function(day){
		var query = {
				$and: [
					{
						time: {
							$gt: new Date(day)
						},
					},
					{
						time: {
							$lt: new Date(new Date(day).getTime() + 24 * 60 * 60 * 1000)
						}
					}
				]
			},
			fields = {_id:0,time:0}


		// sp500.find(query, { name: 1 }).limit(1).toArray(function(err,data){
		// 	if(err) console.error(err)
		// 	else console.log(data)
		// })

		sp500.find(query,fields).limit(500).sort({time:-1})
		.toArray(function(err, data){
			if(err){
				res.statusCode = 403
				console.log("Failed to fetch data",err)
				return next()
			}
			else{
				console.log(data);
				// db.currentOp()
				results.push(data)
				if(results.length == days.length){
					res.send(results)
					return next()
				}
			}
		})
	})
})

server.listen(port, function() {
  console.log('%s listening at %s', server.name, server.url)
})