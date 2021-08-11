let socket = io(window.location.href.split("/")[2]),
    isShifting = false,
    selectedFiles = [],
    lastDirectory = "",
    History = [],
    historyPos = 0;

let files,
    folders,
    fileIndex = 0,
    isListView = true;

export function setSelectedFiles(value) {
    selectedFiles = value;
}
export function setIsShifting(value) {
    isShifting = value;
}
export function setLastDirectory(value) {
    lastDirectory = value;
}

export function addToHistory(item) {
    //Sets the length of the history to the index of the current item
    History.length = historyPos;
    //Adds a new item to the inventory
    History.push(item);
    historyPos++;
}

export function setHistoryPos(value) {
    historyPos = value;
}

//Converts seconds in hours / minutes / seconds
export function secondsToHms(d) {
    d = Number(d);
    var h = Math.floor(d / 3600); //Hours
    var m = Math.floor(d % 3600 / 60); //Minutes
    var s = Math.floor(d % 3600 % 60); //Seconds

    return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export function setFiles(value) {
    files = value;
}

export function setFolders(value) {
    folders = value;
}

//Adds leading zeroes when a number has one digit
export function pad(num) {
    while (num.toString().length < 2) {
        num = "0" + num;
    }
    return num;
}

export function setFileIndex(value) {
    fileIndex = value;
}

export function setIsListView(value) {
    isListView = value;
}


export {
    socket,
    isShifting,
    selectedFiles,
    lastDirectory,
    History,
    historyPos,
    files,
    folders,
    fileIndex,
    isListView
}
