import { socket, isShifting, setIsShifting, selectedFiles, setSelectedFiles } from "./globals.js"
import { getDirectory, init } from "./getDirectory.js"
import { audioPlayer } from "./audio.js"

let downloadSelected;

document.onreadystatechange = function() {
    if (document.readyState == "complete") {
        downloadSelected = document.getElementById("downloadSelected");

        init();
        audioPlayer();
        getDirectory();

        document.getElementById("goUp")
        .addEventListener("click",function() {
            setSelectedFiles([]);
            downloadSelected.classList.add("hide");
            socket.emit("goUp");
        });

        document.getElementById("close")
        .addEventListener("click",function() {
            document.getElementById("fileViewer").classList.add("hide");
            document.getElementById("fileTree").classList.remove("noScroll");
        });

        downloadSelected.addEventListener("click",function() {
            window.open("/?file="+selectedFiles);
        });

        document.addEventListener("keydown",function(e) {
            if(e.keyCode === 16) {
                setIsShifting(true);
            }
        });
        document.addEventListener("keyup",function(e) {
            setIsShifting(false);
        });
        socket.on("filesToDownload",function(data) {
            console.log("thisthsiohodifhsodifhsodifhsodifhsodifhaosidfh");
            window.open("/?file="+data.files);
        });
        socket.on("fileError",function(error) {
            alert(error);
        });
    }
}
