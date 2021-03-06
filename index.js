var express = require("express");
var bodyParser = require('body-parser')
var db = require("./db/mongo")
var mongoSanitize = require('express-mongo-sanitize');
var log = require("./logger");
var sessionUtil = require("./utility/session");

db.OpenDB();
var app = express();

app.use(bodyParser.json({ limit: '50mb' }));
app.use(mongoSanitize({ replaceWith: '_' }));

app.use('/cdn', express.static(__dirname + '/static_files'));

app.use(["/api/open", "/api/open*"], function (request, response, next) {
    var requestRedirect = require("./api/open" + request.url);

    requestRedirect(request, response).then(function (result) {
        response.json(result);

        log.info("INFO_START:");
        log.info("PATH:\t" + request.path);
        log.info("REQUEST:\n" + JSON.stringify(request.body));
        log.info("RESULT:\n" + JSON.stringify(result));
        log.info("INFO_END:\n\n");

        next();
    }).catch(function (err) {
        next({ body: err, reqBody: request.body, message: "Error" });
    });
});

app.use(["/api/auth", "/api/auth*"], function (request, response, next) {

    var requestRedirect = require("./api/auth" + request.url);
    var { username, session } = request.body;
    if (username && session) {
        sessionUtil.checksession(session, username).then(function (returnValue) {


            requestRedirect(request, response).then(function (result) {
                response.json(result);

                log.info("INFO_START:");
                log.info("PATH:\t" + request.path);
                log.info("REQUEST:\n" + JSON.stringify(request.body));
                log.info("RESULT:\n" + JSON.stringify(result));
                log.info("INFO_END:\n\n");

                next();
            }).catch(function (err) {
                next({ body: err, reqBody: request.body, message: "Error" });
            });
        }).catch(function (err) {
            next({ body: err, reqBody: request.body, message: "Error" });
        });
    } else {
        var result = {
            success: false,
            message: "Auth Error"
        }
        next({ body: result, reqBody: request.body, message: "Error" });
    }
})

app.use(function (err, req, res, next) {
    var result = {
        success: false,
        message: 'Api Error'
    }
    if (err.body)
        result = err.body;

    log.error("ERROR_START:");
    log.error("PATH:\t" + req.path);
    if (err.reqBody) {
        log.error("REQUEST:\n" + JSON.stringify(err.reqBody));
    }
    if (err.body) {
        log.error("RESPONSE:\n" + JSON.stringify(err.body));
    } else {
        log.error("RESPONSE:\n" + err);
    }
    log.error("TITLE:\t" + err.message);
    if (err.stack)
        log.error("STACK TRACE:\n" + err.stack);
    log.error("ERROR_END:\n\n");

    res.json(result);
})

app.listen(process.ENV.port, () => console.log('Backend App Started!'))
