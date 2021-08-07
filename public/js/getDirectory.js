import { socket, isShifting, setIsShifting, selectedFiles, setSelectedFiles, lastDirectory, setLastDirectory,
         History, addToHistory, setFiles, setFolders, files, folders, setFileIndex } from "./globals.js"
import { loadFile, showFileViewer } from "./fileViewer/loadFile.js"

let folderTemplate, folderClone,
    folderTitle, title,
    template, clone,
    folderName
;

export function init() {
    template = document.getElementById("file");
    clone = template.content.querySelector(".file");
    title = clone.querySelector(".title");
    folderName = document.getElementById("folderName");

    folderTemplate = document.getElementById("folder");
    folderClone = folderTemplate.content.querySelector(".folder");
    folderTitle = folderClone.querySelector(".title");
}

export function getDirectory(directory, fromBrowser) {
    return new Promise((resolve, reject) => {
        downloadSelected.disabled = true;
        console.log(directory, lastDirectory, fromBrowser);
        //Gets the named diectory if it is defined
        if((directory != lastDirectory || fromBrowser) && directory != undefined) {
            socket.emit("getNamedDirectory", {directory: directory});
        }else {
            //Gets the base directory
            socket.emit("getDirectory");
        }

        //If the folder has content, show it on screen
        socket.once("folderContents", (data) => {
            let dir = data.dir;
            dir = dir.replace("C:\\", "");
            //Replaces a backslash if the directory starts with one
            folderName.value = dir.replace(/^\\/, "");
            //Saves the directory path in local storage
            setLastDirectory(dir);

            localStorage.setItem("directory", dir);
            setFiles(data.files);
            setFolders(data.folders);
            showItems(data.empty);
            resolve(true);
        });

        //Error if the file doesn't exist
        socket.once("enoent", () => {
            folderName.value = lastDirectory;
            reject("false");
        });
    });
}

//Shows the files and folders on the screen
export function showItems(notEmpty) {
    let filesBox = document.getElementById("files"),
        emptyFolder = document.getElementById("emptyFolder");
    //Removes all files and folders from the screen
    document.querySelectorAll('.file, .folder').forEach(e => e.remove());

    //Scrolls to top of folder
    filesBox.scrollTo(0, 0);

    //Loops through the files and folders and shows them on screen
    if(!notEmpty) {
        emptyFolder.classList.add("hidden");
        folders.forEach(function(item) {
            folderTitle.innerText = item;
            let elm = folderClone.cloneNode(true);
            filesBox.append(elm);
            clickFolder(elm);
        });

        files.forEach(function(item) {
            title.innerText = item;
            let elm = clone.cloneNode(true);
            filesBox.append(elm);
            clickFile(elm);
        });
    }else {
        //Shows the empty folder indicator
        emptyFolder.classList.remove("hidden");
    }
}

//When double clicking on a folder, displays the content of this folder
function clickFolder(elm) {
    elm.addEventListener("dblclick",function() {
        // current directory + title of the folder
        getDirectory(folderName.value+"\\"+elm.querySelector(".title").textContent).then(exists => {
            setIsShifting(false);
            setSelectedFiles([]);
            addToHistory(folderName.value);
            console.log(History);
            downloadSelected.disabled = true;
            window.dispatchEvent(new Event("resetLastFile"));
        });
    });
}

function clickFile(elm) {
    //Downloads the file
    elm.querySelectorAll("button")[0].addEventListener("click",function() {
        window.open("/download?file="+[elm.querySelector(".title").textContent]);
    });
    //Opens the file viewer and displays the file
    elm.querySelectorAll("button")[1].addEventListener("click",function() {
        //Sets the position of the currently opened file so you can go backwards
        //and forwards between files
        setFileIndex(files.indexOf(elm.querySelector(".title").textContent));
        showFileViewer(elm.querySelector(".title").textContent);
    });
    elm.addEventListener("dblclick",function() {
        //Sets the position of the currently opened file so you can go backwards
        //and forwards between files
        setFileIndex(files.indexOf(elm.querySelector(".title").textContent));
        showFileViewer(elm.querySelector(".title").textContent);
    });
    //Checks if the user is shift clicking and selects the file is doing so
    elm.addEventListener("click",function() {
        let ttl = elm.querySelector(".title").textContent;
        if(isShifting) {
            //Toggles selected style to the file
            elm.classList.toggle("bg-gray-900");
            //Checks if the file is selected
            if(elm.classList.contains("bg-gray-900")) {
                //Adds the file to the selected files array
                downloadSelected.disabled = false;
                selectedFiles.push(ttl);
                downloadSelected.classList.remove("bg-green-800");
                downloadSelected.classList.add("bg-green-500");
            }else {
                //Removes the file from the array
                selectedFiles.splice(selectedFiles.indexOf(ttl),1);
                downloadSelected.classList.remove("bg-green-500");
                downloadSelected.classList.add("bg-green-800");
            }
            //Hides the download button if nothing is selected
            if(selectedFiles.length === 0) {
                downloadSelected.classList.remove("bg-green-500");
                downloadSelected.classList.add("bg-green-800");
            }
        }else {
            //Unselects everything if a file is clicked when not shift clicking
            downloadSelected.classList.remove("bg-green-500");
            downloadSelected.classList.add("bg-green-800");
            setSelectedFiles([]);
            downloadSelected.disabled = true;
            document.querySelectorAll(".file").forEach(file => {
                file.classList.remove("bg-gray-900");
            });
        }
    });
}
