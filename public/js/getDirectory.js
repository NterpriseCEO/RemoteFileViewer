import { socket, isShifting, setIsShifting, selectedFiles, setSelectedFiles, lastDirectory, setLastDirectory,
         History, addToHistory, setFiles, setFolders, files, folders, setFileIndex, isListView, setIsListView } from "./globals.js"
import { loadFile, showFileViewer } from "./fileViewer/loadFile.js"

let folderClone,
    folderTitle, title, gridTitle, gridFolderTitle,
    template, clone, gridClone, gridFolderClone,
    folderName,
    filesBox,
    changeSizeSelect;

export function init() {
    filesBox = document.querySelector(".filesView:not(.hidden)"),

    template = document.getElementById("file");
    clone = template.content.querySelector(".file");
    title = clone.querySelector(".title");

    gridClone = template.content.querySelector(".gridFile");
    gridTitle = gridClone.querySelector(".title");

    folderName = document.getElementById("folderName");

    folderClone = template.content.querySelector(".folder");
    folderTitle = folderClone.querySelector(".title");

    gridFolderClone = template.content.querySelector(".gridFolder");
    gridFolderTitle = gridFolderClone.querySelector(".title");

    changeSizeSelect = document.getElementById("changeIconSize");

    changeSizeSelect.addEventListener("change", () => {
        let cloneSvg = clone.querySelector("svg").classList,
            gridCloneSvg = gridClone.querySelector("svg").classList,
            folderCloneSvg = folderClone.querySelector("svg").classList,
            gridFolderCloneSvg = gridFolderClone.querySelector("svg").classList;
        cloneSvg.remove("h-10");
        cloneSvg.remove("h-16");
        cloneSvg.remove("h-24");
        cloneSvg.remove("h-48");
        cloneSvg.add(changeSizeSelect.value);

        gridCloneSvg.remove("h-10");
        gridCloneSvg.remove("h-16");
        gridCloneSvg.remove("h-24");
        gridCloneSvg.remove("h-48");
        gridCloneSvg.add(changeSizeSelect.value);

        folderCloneSvg.remove("h-10");
        folderCloneSvg.remove("h-16");
        folderCloneSvg.remove("h-24");
        folderCloneSvg.remove("h-48");
        folderCloneSvg.add(changeSizeSelect.value);

        gridFolderCloneSvg.remove("h-10");
        gridFolderCloneSvg.remove("h-16");
        gridFolderCloneSvg.remove("h-24");
        gridFolderCloneSvg.remove("h-48");
        gridFolderCloneSvg.add(changeSizeSelect.value);
        showItems(false);
    });
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
export function showItems(notEmpty, filter) {
    let emptyFolder = document.getElementById("emptyFolder");

    filesBox = document.querySelector(".filesView:not(.hidden)"),
    console.log(filesBox);

    //Removes all files and folders from the screen
    document.querySelectorAll('.file, .folder').forEach(e => e.remove());

    //Scrolls to top of folder
    filesBox.scrollTo(0, 0);

    //Loops through the files and folders and shows them on screen
    if(!notEmpty) {
        emptyFolder.classList.add("hidden");
        if(filter) {
            //shows only the neccesary files and folders based on the searchbar value
            folders.filter(folder => {
                if(folder.indexOf(filter) > -1) {
                    addFolder(folder);
                }
            });
            files.filter(file => {
                console.log(file.indexOf(filter) > -1, filter, file);
                if(file.indexOf(filter) > -1) {
                    addItem(file);
                }
            });
        }else {
            //Shows all files
            folders.forEach(function(item) {
                addFolder(item);
            });

            files.forEach(function(item) {
                addFile(item);
            });
        }
    }else {
        //Shows the empty folder indicator
        emptyFolder.classList.remove("hidden");
    }
}

function addFile(name) {
    const file = (isListView ? title : gridTitle);
    file.innerText = name;
    file.setAttribute("title", name);
    let elm = (isListView ? clone : gridClone).cloneNode(true);

    filesBox.append(elm);
    clickFile(elm);
}

function addFolder(name) {
    const folder = (isListView ? folderTitle : gridFolderTitle);
    folder.innerText = name;
    folder.setAttribute("title", name)
    let elm = (isListView ? folderClone : gridFolderClone).cloneNode(true);
    filesBox.append(elm);
    clickFolder(elm);
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
