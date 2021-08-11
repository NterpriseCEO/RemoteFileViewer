//When clicked toggles the sidebar
document.getElementById("hideSidebar").addEventListener("click", () => {
    const sidebar = document.getElementById("sidebar");
    //If the sidebar is visible, hides it and vice versa
    if(!sidebar.classList.contains("w-1/12")) {
        sidebar.classList.add("w-1/12");
    }else {
        sidebar.classList.remove("w-1/12");
    }
})
