var fs = require('fs');
var express = require('express');
var path = require('path');
var shell = require('shelljs');
var filePath = ''
var filename = ''


var app = express();
app.use(express.json());
app.use(express.static('public'));


function createDir(){
    try {
        if(!fs.exists(filePath)){
            shell.mkdir('-p',filePath);
        }
    } catch (error) {
        console.log(error)
    }
}

function copyFile(file, newDir){
    var source = fs.createReadStream(file);
    var dest = fs.createWriteStream(newDir);
  
    source.pipe(dest);
    source.on('end', function() { console.log('Succesfully copied'); });
    source.on('error', function(err) { console.log(err); });
};

app.post('/newFile', function(req, res){
    try {
        filePath = req.body.path;
        filename = req.body.name;
        createDir();
        path.join(filePath, '/');
        res.send('200 OK');
    } catch (error) {
        res.send('400 ERROR');
    }
});

app.post('/uploadFile', function (req, res, next) {
    try {
        req.pipe(fs.createWriteStream(path.join(filePath, filename)));
        req.on('end', next);

        //update latest
        var ltsFile = path.join(path.join(filePath, 'lts/'),filename);
        copyFile(path.join(filePath, filename), ltsFile);

        res.send('200 OK');
    } catch (error) {
        res.send(error);
    }
});

app.listen(3000, '192.168.3.133');

console.log('Listenning!');