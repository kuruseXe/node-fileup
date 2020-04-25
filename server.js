(() => {
    "use strict"
    const express = require('express'),
          multer  = require('multer'),
          basicAuth = require('basic-auth-connect'),
          fs = require('fs'),
          log4js = require('log4js'),
          config = require('./conf/config.js'),
          list = require('./conf/flist.js'),
          upload = multer({ dest: 'uploads/' }),
          app = express();

    log4js.configure('./conf/log-config.json');

    const sysLogger = log4js.getLogger('system'),
          acsLogger = log4js.getLogger('access'),
          errLogger = log4js.getLogger('error');
    
    app.use(log4js.connectLogger(acsLogger));

    app.use(basicAuth((user, pass) => {
        return config.auth[user] && config.auth[user] === pass;
    }));

    app.post('/', upload.single('data'), (req, res) => {
        acsLogger.info(req.connection.remoteAddress
                    + ' - - \"RECIVE / FILE/' + req.file.originalname + '\"');
        acsLogger.info("user : " + req.user);
        let user = req.user;
        let destDir = './' + req.file.destination;
        if (req.file.originalname.match(/\.(csv|json)$/) !== null) {
            destDir = list.flist[user].base
                + '/' + list.flist[user].hpname 
                + '/' + list.flist[user].data + '/';
        } else if (req.file.originalname.match(/\.css$/) !== null) {
            destDir = list.flist[user].base 
                + '/' + list.flist[user].hpname 
                + '/' + list.flist[user].css + '/';
        } else if (req.file.originalname.match(/\.js$/) !== null) {
            destDir = list.flist[user].base 
                + '/' + list.flist[user].hpname 
                + '/' + list.flist[user].js + '/';
        } else if (req.file.originalname.match(/\.html$/) !== null) {
            destDir = list.flist[user].base 
                + '/' + list.flist[user].hpname 
                + '/';
        }
        const strpath = './' + req.file.path;
        const detstpath = destDir + req.file.originalname;
        fs.copyFile(strpath, detstpath, (err) => {
            if (err) {
                errLogger.info(err);
            } else {
                acsLogger.info(req.connection.remoteAddress
                    + ' - - \"COPY TO ' 
                    + destDir + req.file.originalname + '\" - success');
                fs.unlink(strpath, (err) => {
                    if (err) {
                        errLogger.info(err);
                    } else {
                        acsLogger.info(req.connection.remoteAddress
                            + ' - - \"DELETE ' + req.file.filename + '\" - success');
                    }
                });
            }
        });
        res.end('success');
    });

    app.listen(config.port, () => {
        sysLogger.info('Node file uploader listening on port ' + config.port + '!');
    });

})();

