import { socket, secondsToHms } from "../globals.js"

let isLoaded = false,
    openVideo = "";

const video = document.getElementsByTagName('video')[0],
    playIcon = document.getElementById("playIcon"),
    pauseIcon = document.getElementById("pauseIcon"),
    fullTime = document.getElementById("fullTime");

export function videoPlayer() {
    const playPause = document.getElementById("playPause"),
        videoTime = document.getElementById("videoTime"),
        videoWrap = document.getElementById("videoWrap"),
        videoControls = document.getElementById("videoControls"),
        videoTimeWrap = document.getElementById("videoTimeWrap"),
        downloadVideo = document.getElementById("downloadVideo"),
        rewind = document.getElementById("rewind"),
        fastForward = document.getElementById("fastForward"),
        unmuted = document.getElementById("unmuted"),
        muted = document.getElementById("muted"),
        videoVolumeWrap = document.getElementById("videoVolumeWrap"),
        videoVolume = document.getElementById("videoVolume"),
        volume = document.getElementById("volume"),
        currentTime = document.getElementById("currentTime");

    let timeout,
        isClicking = false,
        isClicking2 = false,
        isHovering = false;

    isLoaded = true;

    playPause.addEventListener("click",function() {
        togglePause();
    });

    //Toggles play/pause of the video when clicking on the video itself
    video.addEventListener("click",function() {
        togglePause();
    });

    //Resets the video to the beggining when it is finished
    video.addEventListener("ended", function() {
        this.currentTime = 0;
        playIcon.classList.remove("hidden");
        pauseIcon.classList.add("hidden");
        video.pause();
    });

    //Shows the video controls and hides them ater 2 seconds of inactivity
    videoWrap.addEventListener("mousemove", e => {
        clearTimeout(timeout);
        videoControls.classList.remove("opacity-0");
        timeout = setTimeout(() => {
            if(!video.paused) {
                videoControls.classList.add("opacity-0");
            }
        }, 2000);
    });

    //Downloads the video on click
    downloadVideo.addEventListener("click", function() {
        window.open("/download?file="+openVideo);
    });

    document.onkeydown = (e) => {
        console.log(e.code);
        switch (e.code) {
            case "Enter":
            case "Space":
                togglePause();
                break;
            case "Escape":
                //Hides the video controls
                videoControls.classList.add("opacity-0");
                break;
            case "ArrowLeft":
                video.currentTime-=5;
                break;
            case "ArrowRight":
                video.currentTime+=5;
                break;
            case "ArrowUp":
                //Increases the volume and hides the mute icon
                if(video.volume <= 0.99) {
                    video.volume+=0.01;
                }
                muted.classList.add("hidden");
                unmuted.classList.remove("hidden");
                break;
            case "ArrowDown":
                //Decreases the volume and shows the mute icon when the volume is at 0
                if(video.volume < 0.01) {
                    unmuted.classList.add("hidden");
                    muted.classList.remove("hidden");
                    video.volume = 0;
                }else {
                    video.volume-=0.01;
                }
                break;
        }
    }

    //Updates the size of the video current time and the width of the video scrubber
    video.addEventListener("timeupdate",function() {
        videoTime.style.width = (this.currentTime/this.duration)*100+"%";
        currentTime.innerText = secondsToHms(video.currentTime);
    });
    //Pauses the video if not picture in picture
    window.addEventListener("pauseMedia",function() {
        //If the video is not picture in picture - stops the video
        if (document.pictureInPictureElement === null) {
            video.pause();
            video.src = "";
        }
    });

    //Prevents the controls from hiding when interacting with them
    videoControls.addEventListener("click", () => {
        clearTimeout(timeout);
    });

    //Rewinds the video 5 seconds
    rewind.addEventListener("click", () => {
        video.currentTime-=5;
    });
    //Fast forwards the video 5 seconds
    fastForward.addEventListener("click", () => {
        video.currentTime+=5;
    });

    //Used to detect start of dragging on the video scrubber
    videoTimeWrap.addEventListener("mousedown", () => {
        isClicking = true;
    });

    //If clicking the video scubber, sets the size of the video scruber to the cursor position
    //An goes to that point in the video
    videoTimeWrap.addEventListener("mousemove", e => {
        if(isClicking) {
            //width = cursor position in window - cursor position starting from left size of the scrubber
            videoTime.style.width = (e.clientX-videoTime.getBoundingClientRect().left)+"px";
            //Current time = video duration * width of scrubber indicator / width of full video scrubber
            video.currentTime = video.duration*(parseInt(videoTime.style.width)/parseInt(videoTimeWrap.getBoundingClientRect().width));
        }
    });

    //Stops video scrubbing
    videoTimeWrap.addEventListener("mouseup", () => {
        isClicking = false;
    });

    //Same as mouse drag but for click only
    videoTimeWrap.addEventListener("click", e => {
        videoTime.style.width = (e.clientX-videoTime.getBoundingClientRect().left)+"px";
        video.currentTime = video.duration*(parseInt(videoTime.style.width)/parseInt(videoTimeWrap.getBoundingClientRect().width));
    });

    //Same as video scrubbing but for audio volume
    videoVolumeWrap.addEventListener("click", e => {
        videoVolume.style.width = (e.clientX-videoVolume.getBoundingClientRect().left)+"px";
        video.volume = (parseInt(videoVolume.style.width)/parseInt(videoVolumeWrap.getBoundingClientRect().width));
    });

    //Sets the volume slider width whjen audio is changed
    video.addEventListener("volumechange", () => {
        videoVolume.style.width = (videoVolumeWrap.getBoundingClientRect().width*video.volume)+"px";
    });

    //Detects if leaving picture in picture mode
    video.addEventListener('leavepictureinpicture', () => {
        if (document.pictureInPictureElement === null) {
            video.pause();
            video.src = "";
        }
    });

    //For audio slider dragging
    videoVolumeWrap.addEventListener("mousedown", () => {
        isClicking2 = true;
    });

    videoVolumeWrap.addEventListener("mousemove", e => {
        if(isClicking2) {
            videoVolume.style.width = (e.clientX-videoVolume.getBoundingClientRect().left)+"px";
            video.volume = (parseInt(videoVolume.style.width)/parseInt(videoVolumeWrap.getBoundingClientRect().width));
        }
    });

    videoVolumeWrap.addEventListener("mouseup", () => {
        isClicking2 = false;
    });

    //Shows the volume slider on hover
    volume.addEventListener("mouseover", () => {
        videoVolumeWrap.classList.remove("hidden");
    });
    //Hides the volume slider
    volume.addEventListener("mouseout", () => {
        let interval = setInterval(function() {
            if(!isHovering) {
                videoVolumeWrap.classList.add("hidden");
                clearInterval(interval);
            }
        }, 2000);
    });
    //Prevents the volume slider from hiding when hovering over it
    videoVolumeWrap.addEventListener("mouseover", function() {
        isHovering = true;
    });
    //Lets the volume slider be hidden in the volume mouseout event above
    videoVolumeWrap.addEventListener("mouseout", function() {
        isHovering = false;
    });
}

function togglePause() {
    playIcon.classList.toggle("hidden");
    pauseIcon.classList.toggle("hidden");
    video.paused ? video.play() : video.pause();
}

export function playVideo(title) {
    //Initialises the video editor if it isn't already
    if(!isLoaded) {
        videoPlayer();
    }

    video.src = "/getMedia/"+title;

    openVideo = title;

    playIcon.classList.add("hidden");
    pauseIcon.classList.remove("hidden");
    //Unhides the video element
    document.getElementById("videoWrap").classList.remove("hidden");
    video.play();
    //Sets the duration of the video onscreen when the video is fully loaded
    let waitForDuration = setInterval(() =>{
        if(!isNaN(video.duration)) {
            clearInterval(waitForDuration);
            fullTime.innerText = secondsToHms(video.duration);
        }
    }, 10);
}
