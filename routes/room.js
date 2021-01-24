const express = require('express');
const router = express.Router();
const { v4: uuidV4 } = require('uuid');

router.get('/', (req, res) => {
    // res.redirect(`/room/${uuidV4()}`);
    return res.render('index', {
        errors: [{ message: 'Please fill a valid Room ID' }]
    });
});

router.get('/:room', (req, res) => {
    let errors = [];
    
    var username = req.cookies.username;
    var roomId = req.params.room;
    
    // Clear username cookie
    res.cookie('username', '', { expires: new Date(0) });

    // Check for empty fields
    if (!username || !roomId) {
        errors.push({ message: 'Please fill all required fields' });
    }

    // Validate username
    if (username !== undefined) {
        username = username.trim();

        if (username.length > 24) {
            errors.push({ message: 'Username exceeds the given limit' });
            username = username.slice(0, 24);
        }

        if (username !== '' && !username.match('^[a-zA-Z]+([_ -.]?[a-zA-Z0-9])*$')) {
            errors.push({ message: 'Please enter a valid username' });
        }
    }

    // Validate room id
    if (roomId !== null) {
        roomId = roomId.trim();

        if (roomId.length > 64) {
            errors.push({ message: 'Room ID exceeds the given limit' });
            roomId = roomId.slice(0, 64);
        }

        if (roomId !== '' && !roomId.match('^[a-z0-9]+([_ -]?[a-z0-9])*$')) {
            errors.push({ message: 'Please enter a valid Room ID' });
        }
    }

    // Return errors
    if (errors.length > 0) {
        return res.render('index', {
            errors,
            username,
            roomId
        });
    }

    // Redirect to room
    res.render('room', {
        username,
        roomId: roomId
    }); 
});

module.exports = router;