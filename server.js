let express = require("express"),
    app = express(),
    path = require("path"),
    fs = require("fs"),
    ss = require("socket.io-stream"),
    dir = __dirname,
    res;

let code;
app.use(express.static(__dirname));
let server = app.listen(process.env.PORT|| 8080,function() {
    console.log("Server is running");
});

let io = require("socket.io").listen(server);

io.on("connection",function(client) {
    //let randomNum = (Math.floor(Math.random()*90000) + 10000).toString();
    client.join("theroom");

    app.get("/", function(req,res) {
        console.log(req.query);
        if(Object.keys(req.query).length !== 0) {
            let files = req.query.file.split(",");
            res.download(dir+"\\"+files[0],function(error) {
                if(error) {
                    socket.emit("fileError",error);
                }
                if(files.length > 1) {
                    files.shift();
                    io.to("theroom").emit("filesToDownload",{files:files});
                }
            });
        }else {
            res.redirect("/public");
        }
    });

    client.on("goUp",function() {
        if(dir.substring(0, dir.lastIndexOf('\\')) != "") {
            dir = dir.substring(0, dir.lastIndexOf('\\'));
            dir = dir === "C:" ? "C:\\" : dir;
            getDirectory(dir);
        }
    });

    client.on("getDirectory",function(data) {
        let dd = data != undefined ? dir+"\\"+data.dir : __dirname;

        getDirectory(dd);
    });

    client.on("getFile",function(data) {
        let lowerName = data.name.toLowerCase();
        console.log(lowerName);
        if(lowerName.endsWith(".png") || lowerName.endsWith(".jpg") || lowerName.endsWith(".gif") || lowerName.endsWith(".webm")) {
            io.to(client.id).emit("fileGotten",{contents:base64_encode(dir+"\\"+data.name),type:"image"})
        }else {
            fs.readFile(dir+"\\"+data.name,"utf8",function(error,data2) {
                if(error) throw error;
                io.to(client.id).emit("fileGotten",{contents:data2});
            });
        }
    });

    client.on('getAudio', function (data) {
        var stream = ss.createStream();
        let file = dir+"\\"+data.name;
        ss(client).emit('audioStream', stream, {name:file});
        fs.createReadStream(file).pipe(stream);
    });

    // function to encode file data to base64 encoded string
    function base64_encode(file) {
        return "data:image/*;base64,"+fs.readFileSync(file, { encoding: 'base64' });
    }

    function getDirectory(DIR) {
        var fls = [], folders = [];
        var f = 0, fldr = 0, num = 0;

        fs.readdir(DIR,function(error,files) {
            try {
                if(error) {
                    console.log(error)
                    io.to(client.id).emit("folderContents",{empty:true});
                }
                if(files.length == 0) {
                    io.to(client.id).emit("folderContents",{empty:true});
                }
                files.forEach(function(file,index) {
                    fs.lstat(DIR+"/"+file,
                    function(error,stats) {
                        num++
                        if(!error && stats.isDirectory()) {
                            folders[fldr++] = file;
                        }else {
                            fls[f++] = file;
                        }
                        if(num == files.length) {
                            folders.sort(function (a, b) {
                                return a.toLowerCase().localeCompare(b.toLowerCase());
                            });
                            fls.sort(function (a, b) {
                                return a.toLowerCase().localeCompare(b.toLowerCase());
                            });
                            dir = DIR;
                            io.to(client.id).emit("folderContents",{files:fls,folders:folders,dir:DIR});
                        }
                    });
                });
            }catch(e) {
                console.log(e);
            }
        });
    }
});
