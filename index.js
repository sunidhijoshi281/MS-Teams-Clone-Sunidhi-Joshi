const express = require("express");
const app = express();
const socketIO = require("socket.io");

let server = app.listen( process.env.PORT || 2000, function () {
  console.log("Server is running");
});

app.use(express.static("public"));

let io = socketIO(server);

io.on("connection",function(socket){
  socket.on("sendMsg",function(data){
      io.emit("broadcastMsg",data);
  });
  console.log("Websocket connected",socket.id)
});

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