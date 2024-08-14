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
                addVideoToDOM(videoData);
                closeUploadModal();
                notifyNewVideo();
            } else {
                alert('Upload failed. Please try again.');
            }
        } catch (error) {
            console.error('Error uploading video:', error);
            alert('An error occurred. Please try again.');
        }
    } else {
        alert("Please provide both a video file and a title.");
    }
}

function loadVideos() {
    fetch('/videos')
        .then(response => response.json())
        .then(videos => {
            videos.forEach(videoData => addVideoToDOM(videoData));
        })
        .catch(error => console.error('Error loading videos:', error));
}

function addVideoToDOM(videoData) {
    const videoGrid = document.getElementById("videoGrid");

    const videoCard = document.createElement("div");
    videoCard.className = "video-card";

    const videoElement = document.createElement("video");
    videoElement.src = videoData.url;
    videoElement.controls = true;

    const videoTitleElement = document.createElement("h3");
    videoTitleElement.textContent = videoData.title;

    const likeDislikeContainer = document.createElement("div");
    likeDislikeContainer.className = "likes-dislikes";

    const likeButton = document.createElement("button");
    likeButton.textContent = `Like (${videoData.likes || 0})`;
    likeButton.onclick = () => updateLikesDislikes(videoData, 'like');

    const dislikeButton = document.createElement("button");
    dislikeButton.textContent = `Dislike (${videoData.dislikes || 0})`;
    dislikeButton.onclick = () => updateLikesDislikes(videoData, 'dislike');

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
    commentButton.onclick = () => postComment(videoData, commentTextInput.value);

    commentInput.appendChild(commentTextInput);
    commentInput.appendChild(commentButton);

    const commentList = document.createElement("div");
    commentList.className = "comment-list";
    videoData.comments.forEach(comment => {
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
}

function updateLikesDislikes(videoData, type) {
    fetch(`/update/${type}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ videoId: videoData.id })
    })
    .then(response => response.json())
    .then(({ likes, dislikes }) => {
        const videoCard = document.querySelector(`.video-card video[src="${videoData.url}"]`).parentElement;
        videoCard.querySelector('.likes-dislikes button').textContent = `Like (${likes || 0})`;
        videoCard.querySelector('.likes-dislikes button:nth-of-type(2)').textContent = `Dislike (${dislikes || 0})`;
    })
    .catch(error => console.error('Error updating likes/dislikes:', error));
}

function postComment(videoData, comment) {
    if (comment) {
        const videoCard = document.querySelector(`.video-card video[src="${videoData.url}"]`).parentElement;
        const commentList = videoCard.querySelector('.comment-list');
        const commentElement = document.createElement("div");
        commentElement.className = "comment";
        commentElement.innerHTML = `<p>${comment}</p>`;
        commentList.appendChild(commentElement);

        // Optionally send the comment to the server here
        videoData.comments.push(comment);
    }
}

function searchVideos() {
    const searchInput = document.getElementById("searchInput").value.toLowerCase();
    const videoCards = document.querySelectorAll(".video-card");

    videoCards.forEach(video => {
        const title = video.getElementsByTagName("h3")[0].textContent.toLowerCase();
        if (title.includes(searchInput)) {
            video.style.display = "block";
        } else {
            video.style.display = "none";
        }
    });
}

function notifyNewVideo() {
    localStorage.setItem("newVideo", "true");
}

window.addEventListener("storage", (event) => {
    if (event.key === "newVideo" && event.newValue === "true") {
        loadVideos();
        localStorage.setItem("newVideo", "false");
    }
});
