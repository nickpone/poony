const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const app = express();
const port = 3000;

// Multer setup
const upload = multer({ dest: 'uploads/' });

// Middleware
app.use(express.static('public'));
app.use(express.json());
app.use(cors());

let videos = [];

// Upload video
app.post('/upload', upload.single('video'), (req, res) => {
    const { originalname, filename } = req.file;
    const title = req.body.title;
    const newFilename = `${Date.now()}_${originalname}`;
    const oldPath = path.join(__dirname, 'uploads', filename);
    const newPath = path.join(__dirname, 'uploads', newFilename);

    fs.renameSync(oldPath, newPath);

    const videoData = {
        id: Date.now(),
        title,
        url: `/uploads/${newFilename}`,
        comments: [],
        likes: 0,
        dislikes: 0
    };

    videos.push(videoData);
    res.json(videoData);
});

// Get videos
app.get('/videos', (req, res) => {
    res.json(videos);
});

// Update likes or dislikes
app.post('/update/:type', (req, res) => {
    const { videoId } = req.body;
    const video = videos.find(v => v.id == videoId);

    if (video) {
        if (req.params.type === 'like') {
            video.likes++;
        } else if (req.params.type === 'dislike') {
            video.dislikes++;
        }
        res.json({ likes: video.likes, dislikes: video.dislikes });
    } else {
        res.status(404).send('Video not found');
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

