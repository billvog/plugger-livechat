$(document).ready(() => {
    $('#find-create-room-form').on('submit', (e) => {
        e.preventDefault();

        const roomId = $('#room-id').val();
        const username = $('#username').val();

        setCookie('username', username, 1);

        window.location = `/room/${roomId}`;
    });
});