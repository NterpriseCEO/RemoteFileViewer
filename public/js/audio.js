import { socket } from "./globals.js"

let playPause,
    player,
    audio;

export function audioPlayer() {
    playPause = document.getElementById("playPause");
    player = document.getElementById('audio'),
    audio = document.getElementsByTagName('audio')[0];;

    playPause.addEventListener("click",function() {
        console.log(playPause.innerText.startsWith("▶"));
        if(playPause.innerText.startsWith("▶")) {
            playPause.innerText = "||";
            audio.play();
        }else {
            playPause.innerText = "▶";
            audio.pause();
        }
    });
    audio.addEventListener("ended", function() {
        this.currentTime = 0;
        playPause.innerText = "▶";
        this.pause();
    });
}

export function playAudio(title) {
    socket.emit("getAudio",{name:title});
    player.classList.remove("hide");
    ss(socket).once('audioStream', function(stream, data) {
        let parts = [];
        stream.on('data', function(chunk){
            parts.push(chunk);
        });
        stream.on('end', function () {
            audio.src = (window.URL || window.webkitURL).createObjectURL(new Blob(parts));
            audio.play();
        });
    });
}
