import { socket, setFileIndex } from "../globals.js"
import { playAudio } from "./audio.js"
import { playVideo } from "./video.js"

let lastFile;

window.addEventListener("resetLastFile",function() {
    lastFile = null;
});

export function showFileViewer(title) {
    let fileTitle = document.getElementById("fileTitle"),
        previews = document.getElementsByClassName("preview"),
        fileViewerWrapper = document.getElementById("fileViewerWrapper");

    //Unhides the file viewer
    fileViewerWrapper.classList.remove("hidden");
    //Sets the title of the file view
    fileTitle.innerText = title;

    for(let preview of previews) {
        preview.classList.add("hidden");
    }
    //Sets the last loaded file = to the current file being opened
    lastFile = title;
    //Loads the file
    loadFile(title)
}

export function loadFile(title) {
    let image = document.getElementById("previewImage"),
        file = document.getElementsByTagName("pre")[0];
    console.log(title, "bithces");
    //Checks if the file is an audio file and plays it
    if(title.match(/.*(.mp3|.m4a|.wav)/g)) {
        playAudio(title);
    }else if(title.match(/.*(.mp4|.mkv|.webm|.ogv)/g)) {
        //Checks the file is video file and plays it
        playVideo(title);
    }else {
        //Otherwise loads the file and displays it onscreen
        socket.emit("getFile",{name:title});
        socket.once("fileGotten",function(data) {
            if(data.type == "image") {
                //If file is an image, loads the image previewer
                image.src = data.contents;
                image.classList.remove("hidden");
            }else {
                file.innerHTML = hljs.highlightAuto(data.contents).value;
                file.scrollTo(0, 0); //Doesn't work yet
                file.classList.remove("hidden");
            }
        });
    }
}
