let socket = io(window.location.href.split("/")[2]),
    isShifting = false,
    selectedFiles = [];

export function setSelectedFiles(value) {
    selectedFiles = value;
}
export function setIsShifting(value) {
    isShifting = value;
}

export {
    socket,
    isShifting,
    selectedFiles
}
