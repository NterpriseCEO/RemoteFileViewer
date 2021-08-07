//When clicked toggles the sidebar
document.getElementById("hideSidebar").addEventListener("click", () => {
    const sidebar = document.getElementById("sidebar");
    //If the sidebar is visible, hides it and vice versa
    if(!sidebar.classList.contains("hidden")) {
        sidebar.classList.add("hidden");
    }else {
        sidebar.classList.remove("hidden");
    }
})
