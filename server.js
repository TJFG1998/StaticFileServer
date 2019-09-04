const fs = require('fs');
const express = require('express');
const path = require('path');
const shell = require('shelljs');
const targz = require('targz');
const serveIndex = require('serve-index')

let filePath;
let filename;
const app = express();
app.use(express.json());


//function to create a new directory
function createDir(filePath){
    var b = fs.exists(filePath, function(error){
        if(error){
            console.log("ERROR: ", error);
        }
        else{
            shell.mkdir('-p',filePath);
        }
    });
}

//function to extract the files from the upload
const extractFiles = async(oldDir, newDir) => {
    targz.decompress({
        src: oldDir,
        dest: newDir
    }, (err) => {
        if(err) {
            throw new Error(err);
        }
    }); 
}

//receive the initial information about the file
app.post('/newFile', function(req, res){
    filePath = req.body.path;
    filename = req.body.name;
    console.log(req.body);
    createDir(filePath);
    path.join(filePath, '/');
    res.send('200 OK');
});

//completes the process by upload the file
app.post('/uploadFile', async (req, res, next) => {
    req.pipe(fs.createWriteStream(path.join(filePath, filename)));
    req.on('end', next);

    await extractFiles(path.join(filePath, filename), filePath);

    res.status(200).json({ ok:true });

    fs.unlink(path.join(filePath, filename), (err) => {
        err ? console.log(err) : "";
    });
});

//download a file from server
app.get('/download/:file',(req, res) => {
    res.download(path.join('./public/files/',req.params.file), req.params.file); 
});

//display a video
app.get('/video/:id', function(req, res) {
    const path = './public/videos/' + req.params.id;
    const stat = fs.statSync(path);
    const fileSize = stat.size;
    const range = req.headers.range;
    if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize-1;
        const chunksize = (end-start) + 1;
        const file = fs.createReadStream(path, {start, end});
        const head = {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': 'video/mp4',
        };
        res.writeHead(206, head);
        file.pipe(res);
    } 
    else {
      const head = {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
      };
      res.writeHead(200, head);
      fs.createReadStream(path).pipe(res);
    }
});

app.use('/public', express.static('public'), serveIndex('public', {'icons': true}))

app.listen(process.env.PORT, (error) => {
    if(error)
        console.log(error);
    else
        console.log('Server is running in port 3000');
});
