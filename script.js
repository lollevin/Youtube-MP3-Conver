document.addEventListener("DOMContentLoaded", function () {
  const downloadBtn = document.getElementById("downloadBtn");
  const videoInput = document.getElementById("videoUrl");
  const statusDiv = document.getElementById("status");
  const progressBar = document.getElementById("progressBar");
  const spinner = document.getElementById("loadingSpinner");

  downloadBtn.addEventListener("click", async function () {
    const videoUrl = videoInput.value;

    if (!videoUrl.includes("youtube.com") && !videoUrl.includes("youtu.be")) {
      statusDiv.innerText = "Please enter a valid YouTube URL.";
      return;
    }

    const videoId = extractVideoId(videoUrl);
    if (!videoId) {
      statusDiv.innerText = "Failed to extract video ID.";
      return;
    }

    try {
      spinner.style.display = "block";
      statusDiv.innerText = "Fetching video details...";
      progressBar.style.width = "20%";

      const titleResponse = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
      const metadata = await titleResponse.json();
      const videoTitle = metadata.title || "DownloadedAudio";

      statusDiv.innerText = "Preparing MP3...";
      progressBar.style.width = "50%";

      const apiKey = "af04bdf1d7mshc9dda69ae5365f2p146731jsn2458b96f620c"; // Replace this
      const mp3Response = await fetch(`https://youtube-mp3-audio-video-downloader.p.rapidapi.com/download-mp3/${videoId}`, {
        method: "GET",
        headers: {
          "X-RapidAPI-Key": apiKey,
          "X-RapidAPI-Host": "youtube-mp3-audio-video-downloader.p.rapidapi.com"
        }
      });

      if (!mp3Response.ok) {
        statusDiv.innerText = "MP3 not available or API error.";
        progressBar.style.width = "0%";
        spinner.style.display = "none";
        return;
      }

      progressBar.style.width = "80%";
      statusDiv.innerText = "Downloading MP3...";

      const blob = await mp3Response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${videoTitle}.mp3`;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);

      statusDiv.innerText = `✅ ${videoTitle} downloaded!`;
      progressBar.style.width = "100%";
    } catch (error) {
      statusDiv.innerText = "Something went wrong.";
      progressBar.style.width = "0%";
    } finally {
      spinner.style.display = "none";
    }
  });

  function extractVideoId(url) {
    const match = url.match(/(?:youtube\.com.*[?&]v=|youtu\.be\/)([^"&?\/\s]{11})/);
    return match ? match[1] : null;
  }
});