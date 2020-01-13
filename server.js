(function () {
    "use strict"
    const express = require('express'),
          multer  = require('multer'),
          basicAuth = require('basic-auth-connect'),
          config = require('./conf/config.js'),
          upload = multer({ dest: 'uploads/' }),
          app = express();
    
    app.use(basicAuth(config.auth.name, config.auth.passwd));

    app.post('/', upload.single('data'), (req, res) => {
        console.log(req.file);
        res.end('success');
    });

    app.listen(config.port, () => {
        console.log('Example app listening on port ' + config.port + '!');
    });

})();

