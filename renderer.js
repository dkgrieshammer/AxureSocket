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
// app.set('view engine', 'handlebars') //handlebar templates - oldschool ftw

// Start Server
var server = app.listen(PORT, () => console.log('AxureSocket running on ' + PORT +'!'))
app.use(bodyParser.urlencoded({ extended: true }));
// Static Content Delivery
var publicPath = path.resolve(__dirname, 'static');
console.log(publicPath);
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

// GET DOM ELEMENTS
var eventList = document.getElementById("dkgEventList");
var messageCounter = document.getElementById("message-counter");
var triggerList = document.getElementById("dkgTriggerList");
var addTriggerBtn = document.getElementById('addTrigger');
var deleteTriggerBtns = document.getElementsByClassName("delete-btn");
var fireTriggerBtns = document.getElementsByClassName("fire-btn");
var triggerElements = triggerList.getElementsByClassName("form-row");
let eventTemplate = document.querySelector('#eventTemplate')
let templateContent = eventTemplate.content.querySelector('div')
let clearEventsBtn = document.querySelector('#clearListBtn')


addTriggerBtn.addEventListener('click', function(e){
    let _newEventName = document.getElementById('triggerName').value
    templateContent.getElementsByClassName('triggerName')[0].value = _newEventName
    
    let _eventTemplate = document.getElementById('eventTemplate').cloneNode(true)
    let _templateContent = _eventTemplate.content.querySelector('div')
    addDeleteEvent(_templateContent.getElementsByClassName("delete-btn")[0], _templateContent)
    addFireEvent(_templateContent.getElementsByClassName("fire-btn")[0], _templateContent)
    triggerList.prepend(_templateContent);
});

clearEventsBtn.addEventListener('click', function(e) {
    let listElements = document.querySelectorAll('#dkgEventList li')
    listElements.forEach(function(el) {
        el.remove()
    })
    console.log(listElements);
    
})

for(let i = 0; i < triggerElements.length; i ++) {
    let element = triggerElements[i];
    let delBtn = element.getElementsByClassName("delete-btn")[0];
    let fireBtn = element.getElementsByClassName("fire-btn")[0];
    let inField = element.getElementsByClassName("triggerName")[0];
    addDeleteEvent(delBtn, element)
    addFireEvent(fireBtn, element)
}

function addDeleteEvent(deleteBtn, el) {
    deleteBtn.addEventListener('click', function(e) {
        let tmp = e.target.parentElement.parentElement
        triggerList.removeChild(tmp)
    })
}

function addFireEvent(el, block) {
    el.addEventListener('click', function(e) {
        let value = e.target.parentElement.parentElement.getElementsByClassName("triggerName")[0].value;
        io.emit(value, {"test":"RemoteControl", "message":value});
        addEventTolist("RemoteControl", value);
    })
}



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

    if (req.body.signal) {
        var change = {"signal ": req.body.signal, "message ": message};
        addEventTolist(req.body.signal, message);
        // io.emit('signal', change);
        io.emit(req.body.signal, {"message":message});
        console.log(" Signal \x1b[36m" + req.body.signal +" (HTTP POST)\x1b[0m received with message: \x1b[36m" + message + "\x1b[0m");
        res.json(change);
    }
    else {
      console.log("\x1b[35m HTTP POST - Missing 'signal' parameter (x-www-form-urlencoded)");
      res.status(404).json({"error":"Missing 'signal' parameter (x-www-form-urlencoded)"});
    }

});

function addEventTolist(e, m) {
    var eventText = "signal: " + e + " message: " + m;
    var tl = document.createElement('li');
    tl.setAttribute('class', 'list-group-item');
    tl.textContent = eventText;
    eventList.appendChild(tl);
    var tmpCounter = messageCounter.innerText;
    tmpCounter ++;
    messageCounter.innerText = tmpCounter;
}

// Write IP Address in Window
var devBtn = document.getElementById('footer')
var t = document.createTextNode("Ip Adress is: " + ipAddress + ":" + PORT)
devBtn.appendChild(t)
