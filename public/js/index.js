document.onreadystatechange = function() {
    if (document.readyState == "complete") {
        let selectFiles = document.getElementById("selectFiles");
        selectFiles.addEventListener("change",function(e) {
            console.log(selectFiles.files);
        });
    }
}

function readURL(input,callback) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function (e) {
            return callback(e.target.result);
        };
        reader.readAsDataURL(input.files[0]);
    }
}
