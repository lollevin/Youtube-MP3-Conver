// Function to extract YouTube Video ID
function extractVideoId(url) {
    try {
        const urlObj = new URL(url);
        if (urlObj.hostname.includes("youtube.com")) {
            return urlObj.searchParams.get("v");
        } else if (urlObj.hostname.includes("youtu.be")) {
            return urlObj.pathname.substring(1);
        }
    } catch {
        return null;
    }
}

document.getElementById("downloadBtn").addEventListener("click", async function () {
    const videoUrl = document.getElementById("videoId").value.trim();
    const status = document.getElementById("status");
    const loader = document.getElementById("loader");
    const progressBarContainer = document.getElementById("progressBarContainer");
    const progressBar = document.getElementById("progressBar");

    if (!videoUrl) {
        status.textContent = "❌ Please enter a valid YouTube URL.";
        return;
    }

    loader.style.display = "block";
    progressBarContainer.style.display = "block";
    status.textContent = "🔄 Connecting to YouTube...";

    const videoId = extractVideoId(videoUrl);
    if (!videoId) {
        status.textContent = "❌ Invalid YouTube URL.";
        loader.style.display = "none";
        progressBarContainer.style.display = "none";
        return;
    }

    const apiUrl = `https://youtube-mp3-audio-video-downloader.p.rapidapi.com/download-mp3/${videoId}?quality=high`;
    const startTime = Date.now();

    let width = 0;
    const interval = setInterval(() => {
        if (width < 90) {
            width += 0.5;
            progressBar.style.width = width + "%";
        }
    }, 100);

    try {
        const response = await fetch(apiUrl, {
            method: "GET",
            headers: {
                "x-rapidapi-host": "youtube-mp3-audio-video-downloader.p.rapidapi.com",
                "x-rapidapi-key": "af04bdf1d7mshc9dda69ae5365f2p146731jsn2458b96f620c"
            }
        });

        clearInterval(interval);
        loader.style.display = "none";
        progressBar.style.width = "100%";

        if (!response.ok) {
            throw new Error("❌ MP3 conversion failed. Please try again later.");
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${videoId}.mp3`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        status.textContent = "✅ MP3 ready! Downloading now...";
    } catch (error) {
        clearInterval(interval);
        loader.style.display = "none";
        progressBarContainer.style.display = "none";
        status.textContent = "⚠️ Something went wrong. Please try again.";
    }
});