var request = require('request');
var fs = require('fs');

const argvs = process.argv.slice(2);
//argvs[0] -> destination path
//argvs[1] -> file name
//argvs[2] -> origin path

try {
    var n = request.post({ 
                            headers: {'content-type' : 'application/json'},
                            url :'http://192.168.3.133:3000/newFile',
                            json:{
                                path : argvs[0],//'./public/new/mega',
                                name : argvs[1]//'index.html'
                            }
                        });
    var r = request.post('http://192.168.3.133:3000/uploadFile');

    var upload = fs.createReadStream(argvs[2]);//'./public/index.html');

    upload.pipe(r);

    var upload_progress = 0;

    upload.on("data", function (chunk) {
        upload_progress += chunk.length
        console.log(new Date(), upload_progress);
    });

    upload.on("end", function (res) {
        console.log('Finished');
    });
} catch (error) {
    console.log(error);
}