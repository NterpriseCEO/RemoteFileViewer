import { socket, secondsToHms } from "../globals.js"

let isLoaded = false,
    openAudio = "";

const audio = document.getElementsByTagName('audio')[0],
    playIcon = document.getElementById("playAudioIcon"),
    pauseIcon = document.getElementById("pauseAudioIcon"),
    fullTime = document.getElementById("audioFullTime");

let musicVisual = document.getElementById("musicVisual"),
    //The reference to the canvas with the visualiser
    ctx = musicVisual.getContext("2d"),
    //Represents an audio processing graph build from audio modules
    //linked together, eachj of them represented by an AudioNode
    audioCtx = new AudioContext(),
    //creates ana AnalyserNode which can be used to expose audio time
    //and frequency data and create frequency data and create data visualisations
    analyser = audioCtx.createAnalyser(),
    //Width of the audio bars
    barWidth = 0,
    //height of the audio bars
    barHeight = 0,
    //amount of bars
    bars = 160,
    //Creates a MediaStreamAudioSourceNode associated with a MediaStream representing
    //an audio stream which may be stored in a local file or sent to another computer
    source = audioCtx.createMediaElementSource(audio),
    //Creates an array of 8 bit unsigned integers out of an unsigned integers
    //half that of the audioCtx.fftSize
    data = new Uint8Array(analyser.frequencyBinCount),
    canvasHeight,
    animationFrames,
    //a copy of the last animation frame before audio pause
    copy;

export function audioPlayer() {
    const playPause = document.getElementById("playPauseAudio"),
        audioTime = document.getElementById("audioTime"),
        audioWrap = document.getElementById("audioWrap"),
        audioControls = document.getElementById("audioControls"),
        audioTimeWrap = document.getElementById("audioTimeWrap"),
        downloadAudio = document.getElementById("downloadAudio"),
        rewind = document.getElementById("rewindAudio"),
        fastForward = document.getElementById("fastForwardAudio"),
        unmuted = document.getElementById("unmutedAudio"),
        muted = document.getElementById("mutedAudio"),
        audioVolumeWrap = document.getElementById("audioVolumeWrap"),
        audioVolume = document.getElementById("audioVolumeInner"),
        volume = document.getElementById("audioVolume"),
        currentTime = document.getElementById("audioCurrentTime");

    let timeout,
        isClicking = false,
        isClicking2 = false,
        isHovering = false;

    source.connect(analyser);
    source.connect(audioCtx.destination);

    //Sets the width and height of the canvas music visualiser
    const checkDimensions = setInterval(() => {
        if(musicVisual.offsetWidth && musicVisual.offsetHeight) {
            musicVisual.width = musicVisual.offsetWidth;
            musicVisual.height = musicVisual.offsetHeight;
            barWidth = (musicVisual.width / bars);
            canvasHeight = musicVisual.height;
            //Cancels the interval once the visualiser has been sized
            clearInterval(checkDimensions);
        }
    });

    isLoaded = true;

    playPause.addEventListener("click",function() {
        togglePause();
    });

    //Toggles play/pause of the audio when clicking on the audio itself
    audio.addEventListener("click",function() {
        togglePause();
    });

    //Resets the audio to the beginning when it is finished
    audio.addEventListener("ended", function() {
        this.currentTime = 0;
        playIcon.classList.remove("hidden");
        pauseIcon.classList.add("hidden");
        audio.pause();
    });

    //Downloads the audio on click
    downloadAudio.addEventListener("click", function() {
        window.open("/download?file="+openAudio);
    });

    document.onkeydown = (e) => {
        console.log(e.code);
        switch (e.code) {
            case "Enter":
            case "Space":
                togglePause();
                break;
            case "ArrowLeft":
                audio.currentTime-=5;
                break;
            case "ArrowRight":
                audio.currentTime+=5;
                break;
            case "ArrowUp":
                //Increases the volume and hides the mute icon
                if(audio.volume <= 0.99) {
                    audio.volume+=0.01;
                }
                muted.classList.add("hidden");
                unmuted.classList.remove("hidden");
                break;
            case "ArrowDown":
                //Decreases the volume and shows the mute icon when the volume is at 0
                if(audio.volume < 0.01) {
                    unmuted.classList.add("hidden");
                    muted.classList.remove("hidden");
                    audio.volume = 0;
                }else {
                    audio.volume-=0.01;
                }
                break;
        }
    }

    //Updates the size of the audio current time and the width of the audio scrubber
    audio.addEventListener("timeupdate",function() {
        audioTime.style.width = (this.currentTime/this.duration)*100+"%";
        currentTime.innerText = secondsToHms(this.currentTime);
    });
    //Pauses the audio if not picture in picture
    window.addEventListener("pauseMedia",function() {
        cancelAnimationFrame(animationFrames);
        audio.pause();
        audio.src = "";
    });

    //Rewinds the audio 5 seconds
    rewind.addEventListener("click", () => {
        audio.currentTime-=5;
    });
    //Fast forwards the audio 5 seconds
    fastForward.addEventListener("click", () => {
        audio.currentTime+=5;
    });

    //Used to detect start of dragging on the audio scrubber
    audioTimeWrap.addEventListener("mousedown", () => {
        isClicking = true;
    });

    //If clicking the audio scubber, sets the size of the audio scruber to the cursor position
    //An goes to that point in the audio
    audioTimeWrap.addEventListener("mousemove", e => {
        if(isClicking) {
            //width = cursor position in window - cursor position starting from left size of the scrubber
            audioTime.style.width = (e.clientX-audioTime.getBoundingClientRect().left)+"px";
            //Current time = audio duration * width of scrubber indicator / width of full audio scrubber
            audio.currentTime = audio.duration*(parseInt(audioTime.style.width)/parseInt(audioTimeWrap.getBoundingClientRect().width));
        }
    });

    //Stops audio scrubbing
    audioTimeWrap.addEventListener("mouseup", () => {
        isClicking = false;
    });

    //Same as mouse drag but for click only
    audioTimeWrap.addEventListener("click", e => {
        audioTime.style.width = (e.clientX-audioTime.getBoundingClientRect().left)+"px";
        audio.currentTime = audio.duration*(parseInt(audioTime.style.width)/parseInt(audioTimeWrap.getBoundingClientRect().width));
    });

    //Same as audio scrubbing but for audio volume
    audioVolumeWrap.addEventListener("click", e => {
        audioVolume.style.width = (e.clientX-audioVolume.getBoundingClientRect().left)+"px";
        audio.volume = (parseInt(audioVolume.style.width)/parseInt(audioVolumeWrap.getBoundingClientRect().width));
    });

    //Sets the volume slider width when audio is changed
    audio.addEventListener("volumechange", () => {
        audioVolume.style.width = (audioVolumeWrap.getBoundingClientRect().width*audio.volume)+"px";
    });

    //For audio slider dragging
    audioVolumeWrap.addEventListener("mousedown", () => {
        isClicking2 = true;
    });

    //Sets the width of the audio volume slider when dragging it
    audioVolumeWrap.addEventListener("mousemove", e => {
        if(isClicking2) {
            audioVolume.style.width = (e.clientX-audioVolume.getBoundingClientRect().left)+"px";
            audio.volume = (parseInt(audioVolume.style.width)/parseInt(audioVolumeWrap.getBoundingClientRect().width));
        }
    });

    //Stops dragging of the audio scrubber
    audioVolumeWrap.addEventListener("mouseup", () => {
        isClicking2 = false;
    });

    //Shows the volume slider on hover
    volume.addEventListener("mouseover", () => {
        audioVolumeWrap.classList.remove("hidden");
    });
    //Hides the volume slider
    volume.addEventListener("mouseout", () => {
        let interval = setInterval(function() {
            if(!isHovering) {
                audioVolumeWrap.classList.add("hidden");
                clearInterval(interval);
            }
        }, 2000);
    });
    //Shows the audio slider when hovering over the audio volume icon
    audioVolumeWrap.addEventListener("mouseover", function() {
        isHovering = true;
        audioVolumeWrap.classList.remove("hidden");
    });
    audioVolumeWrap.addEventListener("mouseout", function() {
        isHovering = false;
    });
}

function togglePause() {
    playIcon.classList.toggle("hidden");
    pauseIcon.classList.toggle("hidden");
    audio.paused ? audio.play() : audio.pause();
    //Creates a copy of the canvas to display on the screen when paused
    copy = ctx.getImageData(0, 0, musicVisual.width, musicVisual.height);
}

export function playAudio(title) {
    //Initialises the audio editor if it isn't already
    if(!isLoaded) {
        audioPlayer();
    }

    audio.src = "/getMedia/"+title;

    openAudio = title;

    playIcon.classList.add("hidden");
    pauseIcon.classList.remove("hidden");
    //Unhides the audio element
    document.getElementById("audioWrap").classList.remove("hidden");

    audio.play();
    animationFrames = requestAnimationFrame(animation);
    //Sets the duration of the audio onscreen when the audio is fully loaded
    let waitForDuration = setInterval(() =>{
        console.log(audio.duration);
        if(!isNaN(audio.duration)) {
            clearInterval(waitForDuration);
            console.log(secondsToHms(audio.duration));
            console.log(fullTime.innerText, fullTime);
            fullTime.innerText = secondsToHms(audio.duration);
        }
    }, 10);
}

function animation() {
    //Sets the bar colour to white
    ctx.strokeStyle = "white";
    //Clears the last frame from the canvas
    ctx.clearRect(0, 0, musicVisual.width, musicVisual.height);
    //Copies the current frequency data into a Uint8Array (unsigned byte array) passed into it
    analyser.getByteFrequencyData(data);
    //If paused, displays the last frame of the canvas
    if(audio.paused) {
        ctx.putImageData(copy, 0, 0);
    }else {
        //Otherwise, loops through the data and draws the bars
        for(var i = 0; i < bars; i++){

            //Sets the bar height to percentage of canvas height
            barHeight = (canvasHeight/255)*data[i];
            //sets the x position to bar i times barwidth=1
            let x = i*(barWidth+1),
                //Sets the y to bottom of the canvas
                y = canvasHeight,
                //sets the y top to bottom of canvas - bar height
                y_end = y-barHeight;

            //Draws the bar lines
            ctx.lineWidth = barWidth;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x, y_end);
            ctx.stroke();
        }
    }
    //Requests that the browser calls the animation function before the next canvas browser repaint
    //Sets the value of animationFrames so that the animation can be cancled after closing the audio previewer
    animationFrames = requestAnimationFrame(animation);
}
