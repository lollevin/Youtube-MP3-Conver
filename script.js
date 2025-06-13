document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("downloadBtn").addEventListener("click", async function () {
        console.log("Download button clicked!");

        let videoInput = document.getElementById("videoUrl");
        let statusDiv = document.getElementById("status");
        let progressBar = document.getElementById("progressBar");

        if (!videoInput) {
            console.error("Error: Input field not found!");
            return;
        }

        let videoUrl = videoInput.value;
        if (!videoUrl.includes("youtube.com") && !videoUrl.includes("youtu.be")) {
            statusDiv.innerText = "Invalid YouTube URL!";
            return;
        }

        let videoId = extractVideoId(videoUrl);
        if (!videoId) {
            statusDiv.innerText = "Could not extract video ID.";
            return;
        }

        try {
            // Step 1: Show progress before fetching the title
            statusDiv.innerText = "Fetching video title...";
            progressBar.style.width = "20%"; 

            let response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
            let data = await response.json();
            let videoTitle = data.title || "DownloadedAudio";

            console.log("Video title fetched:", videoTitle);
            statusDiv.innerText = "Preparing MP3...";
            progressBar.style.width = "50%";

            // Step 2: Call the MP3 conversion API
            let apiKey = "af04bdf1d7mshc9dda69ae5365f2p146731jsn2458b96f620c"; // Replace with your actual API key
            let mp3Response = await fetch(`https://youtube-mp3-audio-video-downloader.p.rapidapi.com/download-mp3/${videoId}`, {
                method: "GET",
                headers: {
                    "X-RapidAPI-Key": apiKey,
                    "X-RapidAPI-Host": "youtube-mp3-audio-video-downloader.p.rapidapi.com"
                }
            });

            if (!mp3Response.ok) {
                console.error("API Error:", await mp3Response.text());
                statusDiv.innerText = "Error: MP3 file not found!";
                progressBar.style.width = "0%";
                return;
            }

            statusDiv.innerText = "Downloading MP3...";
            progressBar.style.width = "80%";

            // Step 3: Convert response to Blob and trigger real download
            let blob = await mp3Response.blob();
            let url = window.URL.createObjectURL(blob);
            let a = document.createElement("a");
            a.href = url;
            a.download = `${videoTitle}.mp3`; // Uses video title as filename
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);

            statusDiv.innerText = `Download complete: ${videoTitle}.mp3`;
            progressBar.style.width = "100%";
        } catch (error) {
            statusDiv.innerText = "Error downloading MP3 file.";
            progressBar.style.width = "0%";
            console.error("Download error:", error);
        }
    });
});

function extractVideoId(url) {
    let match = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match ? match[1] : null;
}