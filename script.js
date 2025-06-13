document.addEventListener("DOMContentLoaded", function () {
    const downloadBtn = document.getElementById("downloadBtn");
    const videoInput = document.getElementById("videoUrl");
    const qualitySelect = document.getElementById("qualitySelect");
    const statusDiv = document.getElementById("status");
    const progressBar = document.getElementById("progressBar");
    const spinner = document.getElementById("loadingSpinner");

    downloadBtn.addEventListener("click", async function () {
        const videoUrl = videoInput.value.trim();
        const selectedQuality = qualitySelect.value; // Get selected quality

        if (!videoUrl.includes("youtube.com") && !videoUrl.includes("youtu.be")) {
            statusDiv.innerText = "⚠️ Please enter a valid YouTube URL!";
            return;
        }

        try {
            spinner.style.display = "block";
            statusDiv.innerText = "🔍 Fetching video details...";
            progressBar.style.width = "20%";

            // 🔹 Send POST request to EzMP3 API with selected quality
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

            progressBar.style.width = "80%";
            statusDiv.innerText = "⬇️ Downloading MP3...";

            // 🔹 Trigger download
            const a = document.createElement("a");
            a.href = downloadUrl;
            a.download = "ConvertedAudio.mp3";
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
});