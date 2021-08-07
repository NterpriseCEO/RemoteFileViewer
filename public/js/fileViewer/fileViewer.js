import { showFileViewer } from "./loadFile.js";
import { files, fileIndex, setFileIndex } from "../globals.js";

let previousFile = document.getElementById("previousFile"),
    nextFile = document.getElementById("nextFile");

//CLoses the file viewer
document.getElementById("close")
.addEventListener("click",function() {
    //Hides the file previewer
    document.getElementById("fileViewerWrapper").classList.add("hidden");
    document.getElementById("fileTree").classList.remove("noScroll");
    window.dispatchEvent(new Event("pauseMedia"));
});

//Shows the next file in the list until at
//the beggining of the list
previousFile.addEventListener("click", () => {
    setFileIndex(fileIndex > 0 ? fileIndex-1 : files.length-1);
    showFileViewer(files[fileIndex]);
});

//Shows the next file in the list until at
//the end of the list
nextFile.addEventListener("click", () => {
    setFileIndex(fileIndex < files.length-1 ? fileIndex+1 : 0);
    showFileViewer(files[fileIndex]);
});

document.onkeydown = (e) => {
    if(e.code === "ArrowLeft") {
        setFileIndex(fileIndex > 0 ? fileIndex-1 : files.length-1);
        showFileViewer(files[fileIndex]);
    }else if(e.code === "ArrowRight") {
        setFileIndex(fileIndex < files.length-1 ? fileIndex+1 : 0);
        showFileViewer(files[fileIndex]);
    }
}
