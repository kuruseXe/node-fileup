(function () {
    "use strict"
    const express = require('express'),
          multer  = require('multer'),
          basicAuth = require('basic-auth-connect'),
          fs = require('fs'),
          config = require('./conf/config.js'),
          list = require('./conf/flist.js'),
          upload = multer({ dest: 'uploads/' }),
          app = express();
    
    app.use(basicAuth(config.auth.name, config.auth.passwd));

    app.post('/', upload.single('data'), (req, res) => {
        console.log(req.file);
        let destDir = './' + req.file.destination;
        if (req.file.originalname.match(/\.(csv|json)$/) !== null) {
            destDir = list.flist.base + '/' + list.flist.hpname + '/data/';
        } else if (req.file.originalname.match(/\.css$/) !== null) {
            destDir = list.flist.base + '/' + list.flist.hpname + '/css/';
        } else if (req.file.originalname.match(/\.js$/) !== null) {
            destDir = list.flist.base + '/' + list.flist.hpname + '/js/';
        } else if (req.file.originalname.match(/\.html$/) !== null) {
            destDir = list.flist.base + '/' + list.flist.hpname + '/';
        }
        const strpath = './' + req.file.path;
        const detstpath = destDir + req.file.originalname;
        fs.copyFile(strpath, detstpath, (err) => {
            if (err) throw err;
            console.log('copy success');
            fs.unlink(strpath, (err) => {
                if (err) throw err;
                console.log('delete success');
            });
        });
        res.end('success');
    });

    app.listen(config.port, () => {
        console.log('Example app listening on port ' + config.port + '!');
    });

})();

