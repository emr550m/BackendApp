var db = require("../../../db/mongo");
var ObjectId = require('mongodb').ObjectID;

module.exports = function (request, response) {
    return new Promise(function (resolve, reject) {
        var result = {
            success: false,
            message: ""
        }
 
        var { brandid } = request.body;
   
            db.SelectDB("brands", {  _id:  ObjectId("" + brandid)  }, { models: 1 }).then(function (modelResult) {
                
                    result.models = modelResult[0].models;
                    result.success = true; 

                    resolve(result)
                
            }).catch(function (err) {
                result.success = false;
                result.message = "Error";
                result.models = [];
                reject(result)
            })
 
    });

};