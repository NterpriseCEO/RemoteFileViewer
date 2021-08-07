/*
    Needs error checking for file permissions errors i.e.
    "Documents and Settings" in the "C:\" directory
*/

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

app.get("/", function(req,res) {
    res.redirect("/public");
});

//When the user requests an audio / video file
app.get('/getMedia/:file', function(req, res) {
    console.log("hello", req.params.file);
    const range = req.headers.range;
    const split = req.params.file.split(".")
    const extension = split[split.length-1];
    console.log(extension);
    if (!range) {
        res.status(400).send("Requires Range header");
    }

    const DIR = dir;

    const mediaPath = DIR+"/"+req.params.file,
          mediaSize = fs.statSync(mediaPath).size,
          CHUNK_SIZE = 10 ** 6,
          start = Number(range.replace(/\D/g, "")),
          end = Math.min(start + CHUNK_SIZE, mediaSize - 1);

    // Create headers
    // TODO: "Video" needs to change to audio dynamicaly
    const contentLength = end - start + 1,
          headers = {
              "Content-Range": `bytes ${start}-${end}/${mediaSize}`,
              "Accept-Ranges": "bytes",
              "Content-Length": contentLength,
              "Content-Type": "video/"+extension,
          };

    res.writeHead(206, headers);
    // create video read stream for this particular chunk
    const mediaStream = fs.createReadStream(mediaPath, { start, end });
    // Stream the video chunk to the client
    mediaStream.pipe(res);
});

io.on("connection",function(client) {
    //let randomNum = (Math.floor(Math.random()*90000) + 10000).toString();
    client.join("theroom");
    //WHen the user requests to download a file
    app.get("/download/", function(req,res) {
        console.log(req.query, 'hellooooooo');
        //Checks if the amount of files is not 0
        if(Object.keys(req.query).length !== 0) {
            //Splits the file names by comma
            let files = req.query.file.split(",");
            //Downloads the first file
            res.download(dir+"\\"+files[0],function(error) {
                if(error) {
                    //Sends back an error if there is one
                    console.log(dir+"\\"+files[0]);
                    io.emit("fileError",error);
                }
                //If theres > 1 file, completes round trip to the client
                //which then requests that the next file is downloaded in a cycle
                if(files.length > 1) {
                    //Removes the first file from the directory
                    files.shift();
                    console.log(files);
                    io.to("theroom").emit("filesToDownload",{files:files});
                }
            });
        }
    });

    // client.on("goUp",function() {
    //     if(dir.substring(0, dir.lastIndexOf('\\')) != "") {
    //         dir = dir.substring(0, dir.lastIndexOf('\\'));
    //         dir = dir === "C:" ? "C:\\" : dir;
    //         getDirectory(dir);
    //     }
    // });

    client.on("getDirectory",function(data) {
        //let dd = data != undefined ? dir+"\\"+data.dir : "C:\\Users\\Owner\\Videos\\YouTube\\commonAssets";
        //When the client wants to get a directory's contents
        let directory = data != undefined ? dir+"\\"+data.dir : "C:\\";
        getDirectory(directory);
    });

    //When the client wants to get a named directory's contents
    client.on("getNamedDirectory", function(data) {
        console.log("C:\\"+data.directory);
        //If it exists, gets its contents
        if(fs.existsSync("C:\\"+data.directory)) {
            getDirectory("C:\\"+data.directory);
        }else {
            //Otherwise, returns an error
            io.to(client.id).emit("enoent");
        }
    });

    //Returns the contents of a file to the client when requested
    client.on("getFile",function(data) {
        let lowerName = data.name.toLowerCase();
        //If image format, return the image as base64 string
        if(lowerName.match(/.*(.png|.jpg|.jpeg|.jpe|.jif|.jfi|.jfif|.gif|.webp|.jp2|.j2k|.jpf|.jpx|.jpm|.mj2)/g)) {
            io.to(client.id).emit("fileGotten",{contents:base64_encode(dir+"\\"+data.name),type:"image"})
        }else {
            //Otherwise return its raw contents
            fs.readFile(dir+"\\"+data.name,"utf8",function(error,data2) {
                if(error) throw error;
                io.to(client.id).emit("fileGotten",{contents:data2});
            });
        }
    });

    // client.on('getMedia', function (data) {
    //     var stream = ss.createStream();
    //     let file = "/media/"+data.name;
    //     fs.readdir(__dirname+"/media", function(err, files) {
    //         if (err) throw err;
    //
    //         if(files.length === 0) {
    //             let input = fs.createReadStream(dir+"\\"+data.name),
    //             output = fs.createWriteStream(__dirname+file)
    //             input.pipe(output);
    //             input.on("close", function() {
    //                 io.to(client.id).emit("fileGotten",{name:file});
    //             });
    //         }
    //
    //         for (const file of files) {
    //             fs.unlinkSync(path.join(__dirname+"/media", file), function(error) {
    //                 if (err) throw err;
    //             });
    //         }
    //         let input = fs.createReadStream(dir+"\\"+data.name),
    //         output = fs.createWriteStream(__dirname+file)
    //         input.pipe(output);
    //         input.on("close", function() {
    //             io.to(client.id).emit("fileGotten",{name:file});
    //         });
    //     });
    //     //const stat = fs.statSync(file);
    //     //ss(client).emit('audioStream', stream, {name:file, stat:stat});
    //     //fs.createReadStream(file).pipe(stream);
    // });

    // function to encode file data to base64 encoded string
    function base64_encode(file) {
        return "data:image/*;base64,"+fs.readFileSync(file, { encoding: 'base64' });
    }

    function getDirectory(DIR) {
        var fls = [], folders = [];
        var f = 0, fldr = 0, num = 0;

        //Reads the requested directory
        fs.readdir(DIR,function(error,files) {
            try {
                //Returns error if folder is empty or other error
                if(error) {
                    console.log(error)
                    io.to(client.id).emit("folderContents",{empty: true, dir: DIR});
                }
                if(files.length == 0) {
                    io.to(client.id).emit("folderContents",{empty: true, dir: DIR});
                }
                //Loops through all files, and checks if they are files or directories
                files.forEach(function(file,index) {
                    fs.lstat(DIR+"/"+file,
                    function(error,stats) {
                        num++
                        //If is a directory, adds item to the folders array
                        if(!error && stats.isDirectory()) {
                            folders[fldr++] = file;
                        }else {
                            //Adds item to the files array
                            fls[f++] = file;
                        }
                        //When all files / folders have been dealt with
                        //sorts the files / folders in order and returns them to the client
                        if(num == files.length) {
                            folders.sort(function (a, b) {
                                return a.toLowerCase().localeCompare(b.toLowerCase());
                            });
                            fls.sort(function (a, b) {
                                return a.toLowerCase().localeCompare(b.toLowerCase());
                            });
                            dir = DIR;
                            io.to(client.id).emit("folderContents",{files: fls, folders: folders, dir: DIR});
                        }
                    });
                });
            }catch(e) {
                console.log(e);
            }
        });
    }
});
