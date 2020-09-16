import { socket, isShifting, selectedFiles, setSelectedFiles } from "./globals.js"
import { loadFile } from "./loadFile.js"
import { audioPlayer } from "./audio.js"

let folderTemplate, folderClone,
    folderTitle, title,
    template, clone;


export function init() {
    template = document.getElementById("file");
    clone = template.content.querySelector(".file");
    title = clone.querySelector(".title");

    folderTemplate = document.getElementById("folder");
    folderClone = folderTemplate.content.querySelector(".folder");
    folderTitle = folderClone.querySelector(".title");
}
export function getDirectory() {
    socket.emit("getDirectory");
    let filesBox = document.getElementById("files"),
        folderName = document.getElementById("folderName");
    socket.on("folderContents",function(data) {
        while(filesBox.firstChild) {
            filesBox.removeChild(filesBox.firstChild);
        }
        folderName.innerText = data.dir;
        data.folders.forEach(function(item) {
            folderTitle.innerText = item;
            let elm = folderClone.cloneNode(true);
            filesBox.append(elm);
            elm.addEventListener("dblclick",function() {
                socket.emit(socket.emit("getDirectory",{dir:elm.querySelector(".title").textContent}));
                isShifting = false;
                setSelectedFiles([]);
            });
        });
        data.files.forEach(function(item) {
            title.innerText = item;
            let elm = clone.cloneNode(true);
            filesBox.append(elm);
            elm.querySelectorAll("button")[0].addEventListener("click",function() {
                window.open("/?file="+[elm.querySelector(".title").textContent]);
            });
            elm.querySelectorAll("button")[1].addEventListener("click",function() {
                loadFile(elm);
            });
            elm.addEventListener("dblclick",function() {
                loadFile(elm);
            });
            elm.addEventListener("click",function() {
                let ttl = elm.querySelector(".title").textContent;
                if(isShifting) {
                    elm.classList.toggle("selected");
                    if(elm.classList.contains("selected")) {
                        selectedFiles.push(ttl);
                        downloadSelected.classList.remove("hide");
                    }else {
                        selectedFiles.splice(selectedFiles.indexOf(ttl),1);
                    }
                    if(selectedFiles.length === 0) {
                        downloadSelected.classList.add("hide");
                    }
                }
                console.log(selectedFiles);
            });
        });
    });
}
