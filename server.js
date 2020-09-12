let express = require("express"),
    app = express(),
    path = require("path"),
    fs = require("fs"),
    dir = __dirname,
    res;

let code;
app.use(express.static(__dirname));
app.get("/", function(req,res) {
    if(Object.keys(req.query).length !== 0) {
        res.download(dir+"/"+req.query.file);
    }else {
        res.redirect("/public");
    }
});
let server = app.listen(process.env.PORT|| 8080,function() {
    console.log("Server is running");
});

let io = require("socket.io").listen(server)

io.on("connection",function(client) {
    client.on("goUp",function() {
        if(dir.substring(0, dir.lastIndexOf('\\')) != "") {
            dir = dir.substring(0, dir.lastIndexOf('\\'));
            getDirectory(dir);
        }
    });

    client.on("getDirectory",function(data) {
        let dd = data != undefined ? dir+"\\"+data.dir : __dirname;

        getDirectory(dd);
    });

    client.on("downloadFile",function(data) {
        const file = dir+"\\"+data.file;
        console.log(res);
    });

    client.on("getFile",function(data) {
        fs.readFile(dir+"\\"+data.name,"utf8",function(error,data) {
            if(error) throw error;
            io.to(client.id).emit("fileGotten",{contents:data});
        });
    });

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
