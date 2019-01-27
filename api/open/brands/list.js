var db = require("../../../db/mongo");

module.exports = function (request, response) {
    return new Promise(function (resolve, reject) {
        var result = {
            success: false,
            message: ""
        }
 
   
            db.SelectDB("brands", {   }, { _id:1, name: 1, logo: 1 }).then(function (brandResult) {
                
                    result.brands = brandResult;
                    result.success = true; 

                    resolve(result)
                
            }).catch(function (err) {
                result.success = false;
                result.message = "Error";
                result.brands = [];
                reject(result)
            })
 
    });

};