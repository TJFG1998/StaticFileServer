const fs = require('fs');
const express = require('express');
const path = require('path');
const shell = require('shelljs');
const targz = require('targz');
const serveIndex = require('serve-index')

let filePath;
let filename;
let ltsFilePath;

const app = express();
app.use(express.json());


//function to create a new directory
function createDir(filePath, ltsFilePath){
    var b = fs.exists(filePath, function(error){
        if(error){
            console.log("ERROR: ", error);
        }
        else{
            shell.mkdir('-p',filePath);
        }
    });
    var c = fs.exists(ltsFilePath, function(error){
        console.log("ERROR: ", error);
        shell.mkdir('-p',filePath);
    });
}

//function to extract the files from the upload
const extractFiles = async(oldDir, newDirs) => {
    newDirs.forEach(element => {
        console.log("Extracted to ", element);
        targz.decompress({
            src: oldDir,
            dest: element
        }, (err) => {
            if(err) {
                throw new Error(err);
            }
        });            
    });
}

//recieve the initial information about the file
app.post('/newFile', function(req, res){
    filePath = req.body.path;
    filename = req.body.name;
    ltsFilePath = req.body.lts
    console.log(req.body);
    createDir(filePath, ltsFilePath);
    path.join(filePath, '/');
    res.send('200 OK');
});

//completes the process by upload the file
app.post('/uploadFile', async (req, res, next) => {
    req.pipe(fs.createWriteStream(path.join(filePath, filename)));
    req.on('end', next);

    await extractFiles(path.join(filePath, filename), [filePath, ltsFilePath]);

    res.status(200).json({ ok:true });

    fs.unlink(path.join(filePath, filename), (err) => {
        err ? console.log(err) : "";
    });
});

app.use('/public', express.static('public'), serveIndex('public', {'icons': true}))

app.listen(3000, (error) => {
    if(error)
        console.log(error);
    else
        console.log('Server is running in port 3000');
});
