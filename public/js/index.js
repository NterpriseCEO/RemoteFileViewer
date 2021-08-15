import { socket, isShifting, setIsShifting, selectedFiles, setSelectedFiles, lastDirectory, setLastDirectory, History, addToHistory,
         historyPos, setHistoryPos, files, folders, isListView, setIsListView } from "./globals.js"
import { getDirectory, init, showItems } from "./getDirectory.js"
import "./fileViewer/fileViewer.js"
import "./sidebar.js";

let downloadSelected,
    folderName,
    backButton,
    forwardsButton,
    sortButton,
    searchBar,
    clearSearch,
    sortAscending,
    sortDescending,
    ascending = true,
    changeLayoutButton,
    listViewIcon,
    gridViewIcon,
    listView,
    gridView,
    changeSizeSelect;

document.onreadystatechange = async function() {
    if (document.readyState == "complete") {

        //The file path gotten via query strings
        const params = new URLSearchParams(window.location.search);
        let directory = params.get("directory");

        backButton = document.getElementById("historyBack");
        forwardsButton = document.getElementById("historyForwards");


        //The download button for downloading all selected files
        downloadSelected = document.getElementById("downloadSelected");
        //The input that shows the folder path
        folderName = document.getElementById("folderName");

        searchBar = document.getElementById("search");

        clearSearch = document.getElementById("clearSearch");

        //The button and icons for sorting A-Z and Z-A
        sortButton = document.getElementById("sortItems");
        sortAscending = document.getElementById("sortAscending");
        sortDescending = document.getElementById("sortDescending");

        //The buttons and icons for changing the screen layout
        changeLayoutButton = document.getElementById("changeLayout");
        listViewIcon = document.getElementById("listViewIcon");
        gridViewIcon = document.getElementById("gridViewIcon");
        listView = document.getElementById("listView");
        gridView = document.getElementById("gridView");

        //Initialised everything
        init();

        //CHecks if the user passed a folder path via the directory query string
        if(directory !== null) {
            directory = directory.replace("%20", "").replace(/\\$/, "");
            directory = directory.replace("%20", "");
            getDirectory(directory, true).then(exists => {
                //Displays the default directory if the directory does not exist
                //Adds the directory to the history
                addToHistory(directory);
            }, enoent => {
                alert("This folder does not exist! Showing the default directory");
                getDirectory().then(exists => {
                    //Checks if the directory exists and then displays / adds it to history
                    console.log("hello");
                    addToHistory(folderName.value);
                }, enoent2 => {
                    console.log("testing");
                });
            });
        }else {
            //Checks if there is a previously viewed folder in local storage
            let dir = localStorage.getItem("directory");
            if(dir !== "undefined" && dir !== null) {
                //Tries to load the directory in storage and alerts the user if it doesn't exist
                console.log("hello");
                getDirectory(dir, true).then(exists => {
                }, enoent => {
                    alert("This folder does not exist! Showing the default directory");
                    getDirectory().then(exists => {
                        console.log("hello");
                        addToHistory(dir);
                    });
                });
            }else {
                //If all else fails, show default directory
                getDirectory().then(exists => {
                    addToHistory(folderName.value);
                });
            }
        }

        backButton.addEventListener("click", () => {
            console.log(historyPos, History.length-2);
            //Check that the user is not at the start of the history
            if(historyPos > 0) {
                //Displays the previous directory in history
                getDirectory(History[historyPos-2]);
                //Sets the position of the history variable
                setHistoryPos(historyPos-1);
            }
        });
        forwardsButton.addEventListener("click", () => {
            console.log(historyPos, History.length-1);
            //Checks if the user is not at the end the history
            if(historyPos < History.length) {
                //Displays the next directory in the history
                getDirectory(History[historyPos]);
                //Sets the position of the history variable
                setHistoryPos(historyPos+1);
            }
        });

        //Request and display the parent directory of the current folder
        document.getElementById("goUp")
        .addEventListener("click",function() {
            //Unselects all selected files
            setSelectedFiles([]);
            downloadSelected.classList.remove("bg-green-500");
            downloadSelected.classList.add("bg-green-800");
            downloadSelected.disabled = true;

            window.dispatchEvent(new Event("resetLastFile"));
            //Removes everything after the last backslash
            getDirectory(folderName.value.substr(0, folderName.value.lastIndexOf("\\"))).then(exits => {
                addToHistory(folderName.value);
                console.log(History);
            });
        });

        //Goes to the directory in the search bar if it exists
        document.getElementById("goToDirectory").addEventListener("click", function() {
            folderName.value = folderName.value.replace("/", "\\");
            getDirectory(document.getElementById("folderName").value).then(exists => {
                addToHistory(folderName.value);
            }, enoent => {
                alert("This folder does not exist!!!");
            });
        });
        //Checks if the user presses enter in the searchbar and goes to the directory if it exists
        folderName.addEventListener("keyup", function(e) {
            if(e.code === "Enter") {
                //Replaces forwardslashes with backslashes
                folderName.value = folderName.value.replace("/", "\\");
                getDirectory(document.getElementById("folderName").value).then(exists => {
                    addToHistory(folderName.value);
                }, enoent => {
                    //When the folder does nto exist
                    alert("This folder does not exist!!!");
                });
            }
        });

        searchBar.addEventListener("keyup", function(e) {
            //Filters the files and folders based on the search value
            showItems(false, searchBar.value);
        });

        clearSearch.addEventListener("click", () => {
            //Clears the search bar and shows all files and folders
            searchBar.value = "";
            showItems(false);
        })

        //Downloads all selected files
        downloadSelected.addEventListener("click",function() {
            window.open("/download?file="+selectedFiles);
        });

        //Detects if the user tries to shift click files
        document.addEventListener("keydown",function(e) {
            if(e.keyCode === 16) {
                setIsShifting(true);
            }
        });
        //Cancels shift clicking
        document.addEventListener("keyup",function(e) {
            //window.open("/hello");
            setIsShifting(false);
        });

        sortButton.addEventListener("click", () => {
            //Reverses the order fo the files and folders
            //and reverses the order of the text in the sorting button
            ascending = !ascending;

            if(ascending) {
                sortAscending.classList.remove("hidden");
                sortDescending.classList.add("hidden");
                sortButton.setAttribute("title", "Sort files and folders descending");
            }else {
                sortAscending.classList.add("hidden");
                sortDescending.classList.remove("hidden");
                sortButton.setAttribute("title", "Sort files and folders asscending");
            }

            files.reverse();
            folders.reverse();

            showItems(false);
        });

        changeLayoutButton.addEventListener("click", () => {
            setIsListView(!isListView);
            //Changes the layout of the folder from list view to grid view
            //and vice versa
            if(isListView) {
                listViewIcon.classList.remove("hidden");
                gridViewIcon.classList.add("hidden");
                listView.classList.remove("hidden");
                gridView.classList.add("hidden");
                changeLayoutButton.setAttribute("title", "Toggle grid view");
            }else {
                listViewIcon.classList.add("hidden");
                gridViewIcon.classList.remove("hidden");
                listView.classList.add("hidden");
                gridView.classList.remove("hidden");
                changeLayoutButton.setAttribute("title", "Toggle list view");
            }
            showItems(false);
        });

        //Downloads files
        socket.on("filesToDownload",function(data) {
            setSelectedFiles(data.files);
            //simulateClick();
        });
        //Shows a file error if there is one
        socket.on("fileError",function(error) {
            alert(error);
        });

        // function simulateClick() {
        //     const event = new MouseEvent('click', {
        //         view: window,
        //         bubbles: true,
        //         cancelable: true
        //     });
        //     downloadSelected.dispatchEvent(event);
        // }
    }
}
