import { socket } from "./globals.js"
import { playAudio } from "./audio.js"

export function loadFile(elm) {
    document.getElementsByTagName("pre")[0].innerText = "";
    document.getElementById("fileTitle").innerText = elm.querySelector(".title").textContent;
    document.getElementById("fileViewer").classList.remove("hide");
    document.getElementById("fileTree").classList.add("noScroll");
    let previews = document.getElementsByClassName("preview"),
        title = elm.querySelector(".title").textContent;
    for(let preview of previews) {
        preview.classList.add("hide");
    }
    if(title.endsWith(".mp3") || title.endsWith(".m4a") || title.endsWith(".wav")) {
        playAudio(title)
    }else {
        socket.emit("getFile",{name:elm.querySelector(".title").textContent});
        socket.once("fileGotten",function(data) {
            if(data.type == "image") {
                document.getElementById("previewImage").src = data.contents;
                document.getElementById("previewImage").classList.remove("hide");
            }else {
                document.getElementsByTagName("pre")[0].innerText = data.contents;
                document.getElementsByTagName("pre")[0].classList.remove("hide");
            }
        });
    }
}
