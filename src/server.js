const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const waitingUsers = [];

function findMatch(socket, interests) {
  for (let i = 0; i < waitingUsers.length; i++) {
    const potentialPartner = waitingUsers[i];
    const commonInterests = interests.filter(interest => 
      potentialPartner.interests.includes(interest)
    );
    if (commonInterests.length > 0) {
      waitingUsers.splice(i, 1);
      return { partner: potentialPartner, commonInterests };
    }
  }
  return null;
}

// Socket.io connection
io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('findMatch', (interests) => {
    socket.interests = interests;
    const match = findMatch(socket, interests);
    if (match) {
      const { partner, commonInterests } = match;
      socket.partner = partner;
      partner.partner = socket;

      socket.emit('matchFound', { partnerId: partner.id, commonInterests });
      partner.emit('matchFound', { partnerId: socket.id, commonInterests });
    } else {
      waitingUsers.push(socket);
      socket.emit('waiting');
    }
  });

  socket.on('sendMessage', (message) => {
    if (socket.partner) {
      socket.partner.emit('receiveMessage', message);
    }
  });

  // WebRTC signaling
  socket.on('offer', (offer) => {
    if (socket.partner) {
      socket.partner.emit('offer', offer);
    }
  });

  socket.on('answer', (answer) => {
    if (socket.partner) {
      socket.partner.emit('answer', answer);
    }
  });

  socket.on('iceCandidate', (candidate) => {
    if (socket.partner) {
      socket.partner.emit('iceCandidate', candidate);
    }
  });

  socket.on('leaveChat', () => {
    if (socket.partner) {
      socket.partner.emit('partnerDisconnected');
      socket.partner.partner = null;
      socket.partner = null;
    }
    const index = waitingUsers.indexOf(socket);
    if (index !== -1) {
      waitingUsers.splice(index, 1);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
    if (socket.partner) {
      socket.partner.emit('partnerDisconnected');
      socket.partner.partner = null;
    }
    const index = waitingUsers.indexOf(socket);
    if (index !== -1) {
      waitingUsers.splice(index, 1);
    }
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});