let socket = io(window.location.href.split("/")[2]),
    canRequestCode = true,
    template,clone,title,
    folderTemplage,folderClone,folderTitle;

document.onreadystatechange = function() {
    if (document.readyState == "complete") {
        template = document.getElementById("file");
        clone = template.content.querySelector(".file");
        title = clone.querySelector(".title");
        folderTemplate = document.getElementById("folder");
        folderClone = folderTemplate.content.querySelector(".folder");
        folderTitle = folderClone.querySelector(".title");

        console.log(template,title,clone);

        getDirectory();

        document.getElementById("goUp")
        .addEventListener("click",function() {
            goUp();
        });
    }
}

function goUp() {
    socket.emit("goUp");
}

function getDirectory() {
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
            elm.addEventListener("click",function() {
                socket.emit(socket.emit("getDirectory",{dir:elm.querySelector(".title").textContent}));
            })
        });
        data.files.forEach(function(item) {
            title.innerText = item;
            let elm = clone.cloneNode(true);
            filesBox.append(elm);
            elm.querySelector("button").addEventListener("click",function() {
                window.open("/?file="+elm.querySelector(".title").textContent);
            });
        });
    });
}
