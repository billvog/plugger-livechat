// Init clipboard.js
new ClipboardJS('.clipboard-btn');

// Init socket.io
const socket = io('/', {
    reconnection: false
});

// Socket.io
socket.emit('join-room', ROOM_ID, USERNAME);

// User count changed
socket.on('user-count-changed', (newClientsCount) => {
    $('.room-info .connected-users-count').html(newClientsCount);
});

// On alert
socket.on('alert-message', (message) => {
    $('.chat-container .messages').append(
        `<div class="message-wraper">
            <div class="message alert">
                <div class="top-wraper">
                    <span class="from">${message.user}</span>
                    <span class="time">${message.time}</span>
                </div>
                <span class="content">${message.text}</span>
            </div>
        </div>`
    );
    
    $(".messages").scrollTop($(".messages")[0].scrollHeight);
});

// New message event
socket.on('new-message', (message) => {
    const isMine = message.user.id == socket.id ? 'mine' : '';
    $('.chat-container .messages').append(
        `<div class="message-wraper ${isMine}">
            <div class="message">
                <div class="top-wraper">
                    <span class="from">${message.user.user}</span>
                    <span class="time">${message.time}</span>
                </div>
                <span class="content">${replaceURLs(message.text)}</span>
            </div>
        </div>`
    );
    
    $(".messages").scrollTop($(".messages")[0].scrollHeight);
});

// Submit message form
$('form#send-message-form').on('submit', (e) => {
    e.preventDefault();

    if (!socket.connected) {
        $('.chat-container .messages').append(
            `<div class="message-wraper">
                <div class="message alert">
                    <div class="top-wraper">
                        <span class="from">Pluggy Chatbot</span>
                    </div>
                    <span class="content">
                        <i class="fas fa-exclamation-triangle"></i> Message could't sent. Try restarting the app.
                    </span>
                </div>
            </div>`
        );

        $(".messages").scrollTop($(".messages")[0].scrollHeight);
        return;
    }

    socket.emit('new-message', {
        text: $('#message-input').val().trim()
    });

    $('#message-input').val('');
    $('#message-input').focus();
});

// Leave room
$('#leave-room-btn').on('click', () => {
    if (confirm('Sure you want to leave this room?')) {
        window.location = '/';
    }
});

// Replace urls with a tags
function replaceURLs(message) {
    if (!message) return;

    var urlRegex = /(((https?:\/\/)|(www\.))[^\s]+)/g;
    return message.replace(urlRegex, (url) => {
        var hyperlink = url;
        if (!hyperlink.match('^https?:\/\/')) {
            hyperlink = 'http://' + hyperlink;
        }

        return `<a href="${hyperlink}" target="_blank" rel="noopener noreferrer">${url}</a>`
    });
}