// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
var os = require('os')
//express part
const express = require('express')
const socketIO = require('socket.io');
const path = require('path');
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 3000;
const app = express()

// log version numbers
console.log("Node Version: " + process.versions.node)
console.log("Chrome Version: " + process.versions.chrome)
console.log("Electron Version: " + process.versions.electron)


//Get Local Current IP Adress | Windows & Mac Version
var ifaces = os.networkInterfaces();
var ipAddress;
for (var element in ifaces) {
    ifaces[element].forEach(nEl =>{
        if(nEl.family == "IPv4") {
            ipAddress = nEl.address;
        }
    });
}
// if(ifaces.en0) {
//     ifaces.en0.forEach(element => {
//         if(element.family == "IPv4") {
//             ipAddress = element.address;
//         }
//     });
// } else {
//     ipAddress == "Error"
// }


// Start Server

var server = app.listen(PORT, () => console.log('Example app listening on port ' + PORT +'!'))
app.use(bodyParser.urlencoded({ extended: true }));
// Static Content Delivery
var publicPath = path.resolve(__dirname, 'static');
console.log(publicPath);
// app.use( express.static(publicPath) ); 
app.use( express.static(publicPath) ); 

// start Socket Server
const io = socketIO(server);
io.on('connection', function(socket){ 
    // console.log(socket)
    socket.on('signal', function(msg){
        console.log("io.on output");
        if (msg.signal) { 
    
          if (msg.message) { var message = msg.message; }
          else { var message = null; }
    
          io.emit('signal', msg); 
          console.log(" signal \x1b[36m" + msg.signal + " (WEBSOCKET: " + socket.id + ")\x1b[0m"+" received with message: \x1b[36m" + message + "\x1b[0m");
        }
        else {
          console.log("\x1b[35m WEBSOCKET - Missing 'signal' parameter (json)\x1b[0m");
        }
    
        // socket.broadcast.emit('signal', msg);
      });
});

io.on('message', function(data) {
    console.log("TEST");
    console.log(data);
});

// Express Server for direct http requests - we actually dont need that right?
app.get('/', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.sendFile(path.join(__dirname + '/index.html'));
});
// do we need those really?
app.post("/", (req,res,next) => {
    res.header('Access-Control-Allow-Origin', '*');

    if (req.body.message) { var message = req.body.message; }
    else { var message = null; }
    console.log(req.body);

    if (req.body.signal) {
        var change = {"signal": req.body.signal, "message": message};
        io.emit('signal', change);
        console.log(" Signal \x1b[36m" + req.body.signal +" (HTTP POST)\x1b[0m received with message: \x1b[36m" + message + "\x1b[0m");
        res.json(change);
    }
    else {
      console.log("\x1b[35m HTTP POST - Missing 'signal' parameter (x-www-form-urlencoded)");
      res.status(404).json({"error":"Missing 'signal' parameter (x-www-form-urlencoded)"});
    }

});

// Write IP Address in Window
var devBtn = document.createElement('div')
var t = document.createTextNode("Ip Adress is: " + ipAddress + ":" + PORT)
devBtn.appendChild(t)
document.body.appendChild(devBtn)