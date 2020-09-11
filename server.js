var express = require("express"),
    app = express();
app.use(express.static(__dirname));
app.get("/", function(req,res) {
    
});

app.listen(process.env.PORT|| 8081,function() {
    console.log("Server is running");
});
