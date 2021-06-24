const express = require("express");
const app = express();
const socket = require("socket.io");


const PORT = process.env.PORT || 3000;
const INDEX = '/index.html';

const server = express()
  .use((req, res) => res.sendFile(INDEX, { root: __dirname }))
  .listen(PORT, () => console.log(`Listening on ${PORT}`));



app.use(express.static("public"));

let io = socketIO(server);

io.on("connection", function (socket) {
  console.log("User Connected :" + socket.id);

  socket.on("join", function (roomName) {
    let ClientInRooms = io.sockets.adapter.rooms;
    let n = ClientInRooms.get(roomName);

    if (n == undefined) {
      socket.join(roomName);
      socket.emit("created");
    }   

    else if (n.size == 1){
      socket.join(roomName);
      socket.emit("joined");
    } 

    else{
      socket.emit("full");
    }
    console.log(ClientInRooms);
  });

  socket.on("ready", function (roomName) {
    socket.broadcast.to(roomName).emit("ready"); 
  });

  socket.on("candidate", function (candidate, roomName) {
    console.log(candidate);
    socket.broadcast.to(roomName).emit("candidate", candidate); 
  });

  socket.on("offer", function (offer, roomName) {
    socket.broadcast.to(roomName).emit("offer", offer); 
  });

  socket.on("answer", function (answer, roomName) {
    socket.broadcast.to(roomName).emit("answer", answer); 
  });

});