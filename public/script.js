const socket = io('/'); // Create our socket
const videoGrid = document.getElementById('video-grid');
const myVideo = document.createElement('video');
const showChat = document.querySelector('#showChat');
const backBtn = document.querySelector('.header__back');
myVideo.muted = true;

backBtn.addEventListener('click', () => {
    document.querySelector('.main__left').style.display = 'flex';
    document.querySelector('.main__left').style.flex = '1';
    document.querySelector('.main__right').style.display = 'none';
    document.querySelector('.header__back').style.display = 'none';
});

showChat.addEventListener('click', () => {
    document.querySelector('.main__right').style.display = 'flex';
    document.querySelector('.main__right').style.flex = '1';
    document.querySelector('.main__left').style.display = 'none';
    document.querySelector('.header__back').style.display = 'block';
});

const user = prompt('Enter your name');

const myPeer = new Peer(); // Creating a peer element which represents the current user
let myVideoStream;

// Access the user's video and audio
navigator.mediaDevices
    .getUserMedia({
        video: true,
        audio: true
    })
    .then((stream) => {
        myVideoStream = stream;
        addVideoStream(myVideo, stream); // Display our video to ourselves

        myPeer.on('call', (call) => {
            // When we join someone's room we will receive a call from them
            call.answer(stream); // Stream them our video/audio
            const video = document.createElement('video'); // Create a video tag for them
            call.on('stream', (userVideoStream) => {
                // When we recieve their stream
                addVideoStream(video, userVideoStream); // Display their video to ourselves
            });
        });

        socket.on('user-connected', (userId) => {
            // If a new user connect
            connectToNewUser(userId, stream);
        });
    });

myPeer.on('open', (id) => {
    // When we first open the app, have us join a room
    socket.emit('join-room', ROOM_ID, id);
});

function connectToNewUser(userId, stream) {
    // This runs when someone joins our room
    const call = myPeer.call(userId, stream); // Call the user who just joined
    // Add their video
    const video = document.createElement('video');
    call.on('stream', (userVideoStream) => {
        addVideoStream(video, userVideoStream);
    });
    // If they leave, remove their video
    call.on('close', () => {
        video.remove();
    });
}

function addVideoStream(video, stream) {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        // Play the video as it loads
        video.play();
    });
    videoGrid.append(video); // Append video element to videoGrid
}

let text = document.querySelector('#chat_message');
let send = document.getElementById('send');
let messages = document.querySelector('.messages');

send.addEventListener('click', (e) => {
    if (text.value.length !== 0) {
        socket.emit('message', text.value);
        text.value = '';
    }
});

text.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && text.value.length !== 0) {
        socket.emit('message', text.value);
        text.value = '';
    }
});

const inviteButton = document.querySelector('#inviteButton');
const muteButton = document.querySelector('#muteButton');
const stopVideo = document.querySelector('#stopVideo');
muteButton.addEventListener('click', () => {
    console.log('here');
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getAudioTracks()[0].enabled = false;
        html = `<i class="fas fa-microphone-slash"></i>`;
        muteButton.classList.toggle('background__red');
        muteButton.innerHTML = html;
    } else {
        myVideoStream.getAudioTracks()[0].enabled = true;
        html = `<i class="fas fa-microphone"></i>`;
        muteButton.classList.toggle('background__red');
        muteButton.innerHTML = html;
    }
});

stopVideo.addEventListener('click', () => {
    const enabled = myVideoStream.getVideoTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getVideoTracks()[0].enabled = false;
        html = `<i class="fas fa-video-slash"></i>`;
        stopVideo.classList.toggle('background__red');
        stopVideo.innerHTML = html;
    } else {
        myVideoStream.getVideoTracks()[0].enabled = true;
        html = `<i class="fas fa-video"></i>`;
        stopVideo.classList.toggle('background__red');
        stopVideo.innerHTML = html;
    }
});

inviteButton.addEventListener('click', (e) => {
    prompt(
        'Copy this link and send it to people you want to meet with',
        window.location.href
    );
});

socket.on('createMessage', (message, userName) => {
    console.log(userName);
    messages.innerHTML =
        messages.innerHTML +
        `<div class="message">
        <b><i class="far fa-user-circle"></i> <span> ${
            userName === user ? 'me' : userName
        }</span> </b>
        <span>${message}</span>
    </div>`;
});

// const socket = io('/');
// const videoGrid = document.getElementById('video-grid');
// const myVideo = document.createElement('video');
// const showChat = document.querySelector('#showChat');
// const backBtn = document.querySelector('.header__back');
// myVideo.muted = true;

// backBtn.addEventListener('click', () => {
//     document.querySelector('.main__left').style.display = 'flex';
//     document.querySelector('.main__left').style.flex = '1';
//     document.querySelector('.main__right').style.display = 'none';
//     document.querySelector('.header__back').style.display = 'none';
// });

// showChat.addEventListener('click', () => {
//     document.querySelector('.main__right').style.display = 'flex';
//     document.querySelector('.main__right').style.flex = '1';
//     document.querySelector('.main__left').style.display = 'none';
//     document.querySelector('.header__back').style.display = 'block';
// });

// const user = prompt('Enter your name');

// var peer = new Peer({
//     host: 'peerjs-server.herokuapp.com',
//     secure: true,
//     port: 443
// });

// let myVideoStream;
// navigator.mediaDevices
//     .getUserMedia({
//         audio: true,
//         video: true
//     })
//     .then((stream) => {
//         myVideoStream = stream;
//         addVideoStream(myVideo, stream);

//         peer.on('call', (call) => {
//             call.answer(stream);
//             const video = document.createElement('video');
//             call.on('stream', (userVideoStream) => {
//                 addVideoStream(video, userVideoStream);
//             });
//             call.on('close', () => {
//                 video.remove();
//             });
//         });

//         socket.on('user-connected', (userId) => {
//             connectToNewUser(userId, stream);
//         });
//     });

// const connectToNewUser = (userId, stream) => {
//     const call = peer.call(userId, stream);
//     const video = document.createElement('video');
//     call.on('stream', (userVideoStream) => {
//         addVideoStream(video, userVideoStream);
//     });
//     call.on('close', () => {
//         video.remove();
//     });
// };

// peer.on('open', (id) => {
//     socket.emit('join-room', ROOM_ID, id, user);
// });

// const addVideoStream = (video, stream) => {
//     video.srcObject = stream;
//     video.addEventListener('loadedmetadata', () => {
//         video.play();
//         videoGrid.append(video);
//     });
// };

// let text = document.querySelector('#chat_message');
// let send = document.getElementById('send');
// let messages = document.querySelector('.messages');

// send.addEventListener('click', (e) => {
//     if (text.value.length !== 0) {
//         socket.emit('message', text.value);
//         text.value = '';
//     }
// });

// text.addEventListener('keydown', (e) => {
//     if (e.key === 'Enter' && text.value.length !== 0) {
//         socket.emit('message', text.value);
//         text.value = '';
//     }
// });

// const inviteButton = document.querySelector('#inviteButton');
// const muteButton = document.querySelector('#muteButton');
// const stopVideo = document.querySelector('#stopVideo');
// muteButton.addEventListener('click', () => {
//     const enabled = myVideoStream.getAudioTracks()[0].enabled;
//     if (enabled) {
//         myVideoStream.getAudioTracks()[0].enabled = false;
//         html = `<i class="fas fa-microphone-slash"></i>`;
//         muteButton.classList.toggle('background__red');
//         muteButton.innerHTML = html;
//     } else {
//         myVideoStream.getAudioTracks()[0].enabled = true;
//         html = `<i class="fas fa-microphone"></i>`;
//         muteButton.classList.toggle('background__red');
//         muteButton.innerHTML = html;
//     }
// });

// stopVideo.addEventListener('click', () => {
//     const enabled = myVideoStream.getVideoTracks()[0].enabled;
//     if (enabled) {
//         myVideoStream.getVideoTracks()[0].enabled = false;
//         html = `<i class="fas fa-video-slash"></i>`;
//         stopVideo.classList.toggle('background__red');
//         stopVideo.innerHTML = html;
//     } else {
//         myVideoStream.getVideoTracks()[0].enabled = true;
//         html = `<i class="fas fa-video"></i>`;
//         stopVideo.classList.toggle('background__red');
//         stopVideo.innerHTML = html;
//     }
// });

// inviteButton.addEventListener('click', (e) => {
//     prompt(
//         'Copy this link and send it to people you want to meet with',
//         window.location.href
//     );
// });

// socket.on('createMessage', (message, userName) => {
//     console.log('test');
//     messages.innerHTML =
//         messages.innerHTML +
//         `<div class="message">
//         <b><i class="far fa-user-circle"></i> <span> ${
//             userName === user ? 'me' : userName
//         }</span> </b>
//         <span>${message}</span>
//     </div>`;
// });
