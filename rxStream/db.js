use admin
db.createUser({
user:"superadmin",
pwd:"admin",
roles:[
	{
		role:"root",
		db:"admin"
	}
]
})

db.dropUser("superadmin")

db.system.version.update({ "_id" : "authSchema"},{$set: {"currentVersion" : 3} }) 

db.createUser({
user:"superadmin",
pwd:"admin",
roles:[
	{
		role:"root",
		db:"admin"
	}
]
})

use basdb

db.createUser({
user:"bas",
pwd:"bas",
roles:[
	{
		role:"readWrite",
		db:"basdb"
	}
]
})
