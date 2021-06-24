let socket = io.connect("https://video-chat-app-sunidhi.herokuapp.com/");
let uservid = document.getElementById("user-video");
let peervid = document.getElementById("peer-video");
let joinBtn = document.getElementById("join");
let roomInput = document.getElementById("roomName");
let rtcPeerConnection;
let roomName;
let roomowner = false;
let userStream;

navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;


let iceServers = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
  ],
};

joinBtn.addEventListener("click", function () {
  if (roomInput.value == "") {
    alert("Please enter a room name");
  } else {
    roomName = roomInput.value;
    socket.emit("join", roomName);
  }
});


socket.on("created", () => {
  roomowner = true;

  if (navigator.getUserMedia) {
    navigator.getUserMedia({ audio: true, video: { width: 360, height: 400 } },
       function(stream) {
          userStream= stream; 
          uservid.srcObject = stream;
          uservid.onloadedmetadata = function(e) {
            uservid.play();
          };
       },
       function(err) {
          console.log("The following error occurred: " + err.name);
       }
    );
 } else {
    console.log("getUserMedia not supported");
 }
});



socket.on("joined", ()=> {
  roomowner = false;

    if (navigator.getUserMedia) {
        navigator.getUserMedia({ audio: true, video: { width: 360, height: 400 } },
        function(stream) {
            userStream=stream;
            uservid.srcObject = stream;
            uservid.onloadedmetadata = function(e) {
                uservid.play();
            };
            socket.emit("ready", roomName);
        },
        function(err) {
            console.log("The following error occurred: " + err.name);
        }
        );
    } else {
        console.log("getUserMedia not supported");
    }
      
});

socket.on("full", () => {
  alert("Unable to join, Room is full");
});

socket.on("ready", () => {
  if (roomowner) {
    rtcPeerConnection = new RTCPeerConnection(iceServers);
    rtcPeerConnection.onicecandidate = IceCandidateFn;
    rtcPeerConnection.ontrack = TrackFn;
    rtcPeerConnection.addTrack(userStream.getTracks()[0], userStream);
    rtcPeerConnection.addTrack(userStream.getTracks()[1], userStream);
    rtcPeerConnection
      .createOffer()
      .then((offer) => {
        rtcPeerConnection.setLocalDescription(offer);
        socket.emit("offer", offer, roomName);
      })

      .catch((error) => {
        console.log(error);
      });
  }
});

function IceCandidateFn(event) {
    console.log("Candidate");
    if (event.candidate) {
      socket.emit("candidate", event.candidate, roomName);
    }
}


socket.on("candidate", (candidate) => {
  rtcPeerConnection.addIceCandidate(new RTCIceCandidate(candidate));
});


socket.on("offer", (offer) => {
  if (!roomowner) {
    rtcPeerConnection = new RTCPeerConnection(iceServers);
    rtcPeerConnection.onicecandidate = IceCandidateFn;
    rtcPeerConnection.ontrack = TrackFn;
    rtcPeerConnection.addTrack(userStream.getTracks()[0], userStream);
    rtcPeerConnection.addTrack(userStream.getTracks()[1], userStream);
    rtcPeerConnection.setRemoteDescription(offer);
    rtcPeerConnection
      .createAnswer()
      .then((answer) => {
        rtcPeerConnection.setLocalDescription(answer);
        socket.emit("answer", answer, roomName);
      })
      .catch((error) => {
        console.log(error);
      });
  }
});

function TrackFn(event) {
    peervid.srcObject = event.streams[0];
    peervid.onloadedmetadata = function (e) {
      peervid.play();
    };
}

socket.on("answer", (answer) => {
  rtcPeerConnection.setRemoteDescription(answer);
});
