document.addEventListener("DOMContentLoaded", () => {
    loadVideos();
});

function openUploadModal() {
    document.getElementById("uploadModal").style.display = "flex";
}

function closeUploadModal() {
    document.getElementById("uploadModal").style.display = "none";
}

async function uploadVideo() {
    const videoFile = document.getElementById("videoFile").files[0];
    const videoTitle = document.getElementById("videoTitle").value;

    if (videoFile && videoTitle) {
        const formData = new FormData();
        formData.append('video', videoFile);
        formData.append('title', videoTitle);

        try {
            const response = await fetch('/upload', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const videoData = await response.json();
                closeUploadModal();
                loadVideos(); // Reload videos to display the new upload
            } else {
                console.error('Upload failed:', response.statusText);
                alert('Failed to upload video');
            }
        } catch (error) {
            console.error('Error uploading video:', error);
        }
    } else {
        alert('Please select a video file and enter a title');
    }
}

async function loadVideos() {
    try {
        const response = await fetch('/videos');
        const videos = await response.json();
        const videoGrid = document.getElementById("videoGrid");
        videoGrid.innerHTML = '';

        videos.forEach(video => {
            const videoElement = document.createElement("video");
            videoElement.src = video.url;
            videoElement.controls = true;
            videoElement.width = 320;

            const videoCard = document.createElement("div");
            videoCard.className = "video-card";

            const videoTitleElement = document.createElement("h3");
            videoTitleElement.textContent = video.title;

            const likeButton = document.createElement("button");
            likeButton.textContent = `Like (${video.likes || 0})`;
            likeButton.onclick = () => updateLikesDislikes(video, 'like');

            const dislikeButton = document.createElement("button");
            dislikeButton.textContent = `Dislike (${video.dislikes || 0})`;
            dislikeButton.onclick = () => updateLikesDislikes(video, 'dislike');

            const likeDislikeContainer = document.createElement("div");
            likeDislikeContainer.className = "likes-dislikes";
            likeDislikeContainer.appendChild(likeButton);
            likeDislikeContainer.appendChild(dislikeButton);

            const commentSection = document.createElement("div");
            commentSection.className = "comment-section";

            const commentTitle = document.createElement("h4");
            commentTitle.textContent = "Comments";

            const commentInput = document.createElement("div");
            commentInput.className = "comment-input";

            const commentTextInput = document.createElement("input");
            commentTextInput.type = "text";
            commentTextInput.placeholder = "Add a comment...";

            const commentButton = document.createElement("button");
            commentButton.textContent = "Post";
            commentButton.onclick = () => postComment(video, commentTextInput.value);

            commentInput.appendChild(commentTextInput);
            commentInput.appendChild(commentButton);

            const commentList = document.createElement("div");
            commentList.className = "comment-list";
            video.comments.forEach(comment => {
                const commentElement = document.createElement("div");
                commentElement.className = "comment";
                commentElement.innerHTML = `<p>${comment}</p>`;
                commentList.appendChild(commentElement);
            });

            commentSection.appendChild(commentTitle);
            commentSection.appendChild(commentInput);
            commentSection.appendChild(commentList);

            videoCard.appendChild(videoElement);
            videoCard.appendChild(videoTitleElement);
            videoCard.appendChild(likeDislikeContainer);
            videoCard.appendChild(commentSection);

            videoGrid.appendChild(videoCard);
        });
    } catch (error) {
        console.error('Error loading videos:', error);
    }
}

async function updateLikesDislikes(video, type) {
    try {
        const response = await fetch(`/update/${type}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ videoId: video.id })
        });

        if (response.ok) {
            const { likes, dislikes } = await response.json();
            loadVideos(); // Reload videos to update the like/dislike counts
        } else {
            console.error('Failed to update like/dislike:', response.statusText);
        }
    } catch (error) {
        console.error('Error updating like/dislike:', error);
    }
}

async function postComment(video, commentText) {
    if (commentText.trim()) {
        video.comments.push(commentText);
        await loadVideos(); // Reload videos to display the new comment
    }
}

function searchVideos() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    const videoCards = document.querySelectorAll('.video-card');
    videoCards.forEach(card => {
        const title = card.querySelector('h3').textContent.toLowerCase();
        card.style.display = title.includes(query) ? 'block' : 'none';
    });
}

