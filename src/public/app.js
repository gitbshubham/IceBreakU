const socket = io();

const findMatchButton = document.getElementById('find-match');
const interestsInput = document.getElementById('interests-input');
const videoContainer = document.getElementById('video-container');
const chatContainer = document.getElementById('chat-container');
const messagesDiv = document.getElementById('messages');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const localVideo = document.getElementById('local-video');
const remoteVideo = document.getElementById('remote-video');

const leaveChatButton = document.getElementById('leave-chat');
const newMatchButton = document.getElementById('new-match');
const chatControls = document.getElementById('chat-controls');

let partnerId = null;
let localStream = null;
let peerConnection = null;

const configuration = {
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
};

async function setupMediaStream() {
    try {
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localVideo.srcObject = localStream;
    } catch (error) {
        console.error('Error accessing media devices:', error);
    }
}

setupMediaStream();

findMatchButton.addEventListener('click', () => {
    const interests = interestsInput.value.split(',').map(interest => interest.trim().toLowerCase());
    if (interests.length === 0 || (interests.length === 1 && interests[0] === '')) {
        alert('Please enter at least one interest');
        return;
    }
    socket.emit('findMatch', interests);
    findMatchButton.disabled = true;
    findMatchButton.textContent = 'Searching...';
});

sendButton.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

function sendMessage() {
    const message = messageInput.value.trim();
    if (message && partnerId) {
        socket.emit('sendMessage', message);
        addMessage('You', message);
        messageInput.value = '';
    }
}

function addMessage(sender, message) {
    const messageElement = document.createElement('div');
    messageElement.textContent = message;
    messageElement.classList.add('message');
    
    if (sender === 'You') {
        messageElement.classList.add('you');
    } else if (sender === 'Stranger') {
        messageElement.classList.add('stranger');
    } else {
        messageElement.classList.add('system');
    }
    
    messagesDiv.appendChild(messageElement);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

async function createPeerConnection() {
    peerConnection = new RTCPeerConnection(configuration);

    localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
    });

    peerConnection.ontrack = (event) => {
        remoteVideo.srcObject = event.streams[0];
    };

    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            socket.emit('iceCandidate', event.candidate);
        }
    };
}

async function createOffer() {
    await createPeerConnection();
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    socket.emit('offer', offer);
}

socket.on('waiting', () => {
    findMatchButton.textContent = 'Waiting for a match...';
});

socket.on('matchFound', async (data) => {
    partnerId = data.partnerId;
    findMatchButton.style.display = 'none';
    interestsInput.disabled = true;
    videoContainer.style.display = 'flex';
    chatContainer.style.display = 'block';
    chatControls.style.display = 'flex';
    addMessage('System', `Ice broken! You're now chatting with a new friend! Common interests: ${data.commonInterests.join(', ')}`);
    await createOffer();
});

socket.on('offer', async (offer) => {
    await createPeerConnection();
    await peerConnection.setRemoteDescription(offer);
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    socket.emit('answer', answer);
});

socket.on('answer', async (answer) => {
    await peerConnection.setRemoteDescription(answer);
});

socket.on('iceCandidate', async (candidate) => {
    if (peerConnection) {
        await peerConnection.addIceCandidate(candidate);
    }
});

socket.on('receiveMessage', (message) => {
    addMessage('Stranger', message);
});

socket.on('partnerDisconnected', () => {
    addMessage('System', 'Your new friend has disconnected. The ice has reformed!');
    resetChat();
});

function resetChat() {
    partnerId = null;
    videoContainer.style.display = 'none';
    chatContainer.style.display = 'none';
    chatControls.style.display = 'none';
    findMatchButton.style.display = 'block';
    findMatchButton.disabled = false;
    findMatchButton.textContent = 'Break the Ice';
    interestsInput.disabled = false;
    messagesDiv.innerHTML = '';
    if (peerConnection) {
        peerConnection.close();
        peerConnection = null;
    }
    remoteVideo.srcObject = null;
}

leaveChatButton.addEventListener('click', () => {
    socket.emit('leaveChat');
    resetChat();
    addMessage('System', 'You have left the chat. The ice has reformed!');
});

newMatchButton.addEventListener('click', () => {
    socket.emit('leaveChat');
    resetChat();
    const interests = interestsInput.value.split(',').map(interest => interest.trim().toLowerCase());
    if (interests.length === 0 || (interests.length === 1 && interests[0] === '')) {
        alert('Please enter at least one interest');
        return;
    }
    socket.emit('findMatch', interests);
    findMatchButton.disabled = true;
    findMatchButton.textContent = 'Searching...';
});