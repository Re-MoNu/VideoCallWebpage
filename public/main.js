const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');


let localStream;
let remoteStream;
let peerConnection;

const socket = io.connect(window.location.origin);

socket.on('message', message => {
    console.log('Message received:', message);
    // Handle signaling messages received from the server
});

async function start() {
    try {
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localVideo.srcObject = localStream;
        createPeerConnection(); // Initialize peer connection
    } catch (error) {
        console.error('Error accessing media devices.', error);
    }
}

async function call() {
    console.log("Connecting");
    createPeerConnection();
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    socket.emit('message', {'description': offer});
}
async function stopCall() {
    peerConnection.close();
    peerConnection = null;
    remoteVideo.srcObject = null;
    socket.emit('message', { type: 'disconnectCall' });
}

const configuration = {'iceServers': [{'urls': 'stun:stun.l.google.com:19302'}]}; // STUN server

// Initialize peer connection
function createPeerConnection() {
    peerConnection = new RTCPeerConnection(configuration);

    // Handle ICE candidates
    peerConnection.onicecandidate = event => {
        if (event.candidate) {
            console.log('Sending ICE candidate', event.candidate);
            socket.emit('message', {'candidate': event.candidate});
        }
    };

    // When remote stream is added
    peerConnection.ontrack = event => {
        remoteVideo.srcObject = event.streams[0];
        console.log('Remote stream added.');
    };

    // Add local stream tracks to peer connection
    localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
        console.log('Adding local stream tracks to the peer connection');
    });
    peerConnection.oniceconnectionstatechange = event => {
        if (peerConnection.iceConnectionState === 'disconnected' || 
            peerConnection.iceConnectionState === 'failed' || 
            peerConnection.iceConnectionState === 'closed') {
            console.log('Peer disconnected. Clearing remote video.');
            remoteVideo.srcObject = null;
        }
    };
    
}

// Listen for signaling messages from server
socket.on('message', async message => {
    if(message.type === 'disconnectCall'){
        stopCall();
    }
    if (message.description) {
        console.log('Received description', message.description);
        await peerConnection.setRemoteDescription(new RTCSessionDescription(message.description));

        // If received an offer, then create an answer
        if (peerConnection.remoteDescription.type === 'offer') {
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);
            socket.emit('message', {'description': peerConnection.localDescription});
        }
    } else if (message.candidate) {
        console.log('Received ICE candidate', message.candidate);
        await peerConnection.addIceCandidate(new RTCIceCandidate(message.candidate));
    }
});




start();
