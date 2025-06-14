document.addEventListener("DOMContentLoaded", function () {
    const downloadBtn = document.getElementById("downloadBtn");
    const videoInput = document.getElementById("videoUrl");
    const qualitySelect = document.getElementById("qualitySelect");
    const statusDiv = document.getElementById("status");
    const progressBar = document.getElementById("progressBar");
    const spinner = document.getElementById("loadingSpinner");
    const historyList = document.getElementById("historyList");
    const clearHistoryBtn = document.getElementById("clearHistoryBtn");
    const previewContainer = document.getElementById("previewContainer");
    const videoPreview = document.getElementById("videoPreview");

    // 🔹 Load history on page load
    loadHistory();

    // 🔹 Update preview when user inputs a video URL
    videoInput.addEventListener("input", function () {
        const videoUrl = videoInput.value.trim();
        const videoId = extractVideoId(videoUrl);

        if (videoId) {
            previewContainer.style.display = "block";
            videoPreview.src = `https://www.youtube.com/embed/${videoId}`;
        } else {
            previewContainer.style.display = "none";
            videoPreview.src = "";
        }
    });

    downloadBtn.addEventListener("click", async function () {
        const videoUrl = videoInput.value.trim();
        const selectedQuality = qualitySelect.value;

        if (!videoUrl.includes("youtube.com") && !videoUrl.includes("youtu.be")) {
            statusDiv.innerText = "⚠️ Please enter a valid YouTube URL!";
            return;
        }

        try {
            spinner.style.display = "block";
            statusDiv.innerText = "🔍 Fetching video details...";
            progressBar.style.width = "20%";

            const apiUrl = "https://youtube-to-mp337.p.rapidapi.com/api/converttomp3";
            const options = {
                method: "POST",
                headers: {
                    "x-rapidapi-key": "af04bdf1d7mshc9dda69ae5365f2p146731jsn2458b96f620c",
                    "x-rapidapi-host": "youtube-to-mp337.p.rapidapi.com",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ url: videoUrl, quality: selectedQuality })
            };

            const response = await fetch(apiUrl, options);

            if (!response.ok) {
                statusDiv.innerText = "🚨 Error: MP3 not available!";
                progressBar.style.width = "0%";
                spinner.style.display = "none";
                return;
            }

            const result = await response.json();
            const downloadUrl = result.url;
            const videoTitle = result.title || "Unknown Title";

            progressBar.style.width = "80%";
            statusDiv.innerText = "⬇️ Downloading MP3...";

            // 🔹 Save download to history with title
            saveToHistory(videoTitle, videoUrl, downloadUrl);

            // 🔹 Trigger download
            const a = document.createElement("a");
            a.href = downloadUrl;
            a.download = `${videoTitle}.mp3`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            statusDiv.innerText = `✅ MP3 Download Complete!`;
            progressBar.style.width = "100%";

        } catch (error) {
            console.error(error);
            statusDiv.innerText = "❌ Download failed!";
            progressBar.style.width = "0%";
        } finally {
            spinner.style.display = "none";
        }
    });

    // 🔹 Save download to history
    function saveToHistory(title, videoUrl, downloadUrl) {
        let history = JSON.parse(localStorage.getItem("downloadHistory")) || [];
        history.push({ title, videoUrl, downloadUrl });
        localStorage.setItem("downloadHistory", JSON.stringify(history));
        loadHistory();
    }

    // 🔹 Load history into the list
    function loadHistory() {
        historyList.innerHTML = "";
        const history = JSON.parse(localStorage.getItem("downloadHistory")) || [];

        history.forEach((entry) => {
            const listItem = document.createElement("li");
            listItem.innerHTML = `<a href="${entry.downloadUrl}" target="_blank">🔊 ${entry.title}</a>`;
            historyList.appendChild(listItem);
        });
    }

    // 🔹 Clear history
    clearHistoryBtn.addEventListener("click", function () {
        localStorage.removeItem("downloadHistory");
        loadHistory();
    });

    // 🔹 Extract Video ID from YouTube URL
    function extractVideoId(url) {
        const match = url.match(/(?:youtube\.com.*[?&]v=|youtu\.be\/)([^"&?\/\s]{11})/);
        return match ? match[1] : null;
    }
});