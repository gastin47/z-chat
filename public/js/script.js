// public/js/script.js
const socket = io('/');
const videoGrid = document.getElementById('video-grid');
const nameEntry = document.getElementById('name-entry');
const joinBtn = document.getElementById('join-btn');
const userNameInput = document.getElementById('user-name');

let myPeer;
let myVideoStream;
let myVideo = document.createElement('video');
myVideo.muted = true;
const peers = {};

joinBtn.onclick = () => {
    const userName = userNameInput.value.trim();
    if (userName) {
        nameEntry.style.display = 'none';
        startCall(userName);
    } else {
        alert('Пожалуйста, введите ваше имя.');
    }
};

function startCall(userName) {
    myPeer = new Peer(undefined, {
        host: '/',
        port: '3001'
    });

    navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
    }).then(stream => {
        myVideoStream = stream;
        addVideoStream(myVideo, stream, userName);

        myPeer.on('call', call => {
            call.answer(stream);
            const video = document.createElement('video');
            call.on('stream', userVideoStream => {
                addVideoStream(video, userVideoStream, call.metadata.userName);
            });
        });

        socket.on('user-connected', (userId, remoteUserName) => {
            connectToNewUser(userId, stream, userName);
        });
    });

    socket.on('user-disconnected', (userId, userName) => {
        if (peers[userId]) peers[userId].close();
        socket.on('user-disconnected', (userId, userName) => {
            if (peers[userId]) peers[userId].close();
            // Удаление видео из DOM
            const videoContainers = document.querySelectorAll('#video-grid > div');
            videoContainers.forEach(container => {
                if (container.querySelector('div').innerText === userName) {
                    container.remove();
                }
            });
        });
        
    });

    myPeer.on('open', id => {
        socket.emit('join-room', ROOM_ID, id, userName);
    });
}

function connectToNewUser(userId, stream, userName) {
    const call = myPeer.call(userId, stream, { metadata: { userName } });
    const video = document.createElement('video');
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream, call.metadata.userName);
    });
    call.on('close', () => {
        video.remove();
    });

    peers[userId] = call;
}

function addVideoStream(video, stream, userName) {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
    });
    const videoContainer = document.createElement('div');
    const nameLabel = document.createElement('div');
    nameLabel.innerText = userName;
    nameLabel.style.textAlign = 'center';
    nameLabel.style.color = 'white';
    videoContainer.appendChild(video);
    videoContainer.appendChild(nameLabel);
    videoGrid.appendChild(videoContainer);
}
const shareButton = document.getElementById('share-btn');
shareButton.addEventListener('click', () => {
    const roomURL = window.location.href;
    navigator.clipboard.writeText(roomURL).then(() => {
        alert('Ссылка на комнату скопирована!');
    }).catch(err => {
        console.error('Ошибка при копировании ссылки: ', err);
    });
});
