#!/usr/bin/env node

var SecureConf = require('secure-conf');
var sconf      = new SecureConf();

sconf.encryptFile(
    "./dbConnect.json",
    "./dbConnect.enc",
    function(err, f, ef, ec) {
        if (err) {
            console.log("failed to encrypt %s, error is %s", f, err);
        } else {
            console.log("encrypt %s to %s complete.", f, ef);
            console.log("encrypted contents are %s", ec);
        }
    }
);
