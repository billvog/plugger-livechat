// Init socket
const socket = io('/');

$(document).ready(() => {
    new ClipboardJS('.clipboard-btn');

    $('.room-info .connected-username').html(USERNAME);

    socket.emit('join-room', ROOM_ID, USERNAME);

    socket.on('user-count-changed', (newClientsCount) => {
        $('.room-info .connected-users-count').html(newClientsCount);
    })

    socket.on('user-connected', (username) => {
        $('.chat-container .messages').append(
            `<div class="message-wraper">
                <div class="message alert">
                    <b>${username}</b> connected
                </div>
                <div class="time">
                    ${new Date().toLocaleTimeString()}
                </div>
            </div>`
        );
        
        $(".messages").scrollTop($(".messages")[0].scrollHeight);
    });

    socket.on('user-disconnected', (username) => {
        $('.chat-container .messages').append(
            `<div class="message-wraper">
                <div class="message alert">
                    <b>${username}</b> disconnected
                </div>
                <div class="time">
                    ${new Date().toLocaleTimeString()}
                </div>
            </div>`
        );
        
        $(".messages").scrollTop($(".messages")[0].scrollHeight);
    });

    // New message event
    socket.on('new-message', (message) => {
        $('.chat-container .messages').append(
            `<div class="message-wraper">
                <div class="message">
                    <span class="from">${message.sender}</span>
                    ${replaceURLs(message.message)}
                </div>
                <div class="time">
                    ${new Date(message.timestamp).toLocaleTimeString()}
                </div>
            </div>`
        );
        
        $(".messages").scrollTop($(".messages")[0].scrollHeight);
    });

    $('form#send-message-form').on('submit', (e) => {
        e.preventDefault();

        const message = {
            sender: USERNAME,
            message: $('#message-input').val().trim(),
            timestamp: Date.parse(new Date())
        };

        if (message.message.trim() == '' || message.message.trim().length > 512)
            return;

        $('.chat-container .messages').append(
            `<div class="message-wraper mine">
                <div class="message">
                    <span class="from">${message.sender}</span>
                    ${replaceURLs(message.message)}
                </div>
                <div class="time">
                    ${new Date(message.timestamp).toLocaleTimeString()}
                </div>
            </div>`
        );

        $('#message-input').val('');
        $(".messages").scrollTop($(".messages")[0].scrollHeight);

        socket.emit('new-message', ROOM_ID, message);
    });

    $('#leave-room-btn').on('click', () => {
        if (confirm('Sure you want to leave this room?')) {
            window.location = '/';
        }
    });
});

// Replace urls with a tags
function replaceURLs(message) {
    if(!message) return;
   
    var urlRegex = /(((https?:\/\/)|(www\.))[^\s]+)/g;
    return message.replace(urlRegex, function (url) {
      var hyperlink = url;
      if (!hyperlink.match('^https?:\/\/')) {
        hyperlink = 'http://' + hyperlink;
      }
      return '<a href="' + hyperlink + '" target="_blank" rel="noopener noreferrer">' + url + '</a>'
    });
  }