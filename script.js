document.addEventListener("DOMContentLoaded", function () {
  // Elements
  const downloadBtn = document.getElementById("downloadBtn");
  const videoInput = document.getElementById("videoUrl");
  const pasteBtn = document.getElementById("pasteBtn");
  const qualitySelect = document.getElementById("qualitySelect");
  const statusDiv = document.getElementById("status");
  const progressBar = document.getElementById("progressBar");
  const spinner = document.getElementById("loadingSpinner");
  const historyList = document.getElementById("historyList");
  const clearHistoryBtn = document.getElementById("clearHistoryBtn");
  const previewContainer = document.getElementById("previewContainer");
  const videoPreview = document.getElementById("videoPreview");

  // State variables
  let isProcessing = false;
  const API_ENDPOINT = "https://youtube-to-mp337.p.rapidapi.com/api/converttomp3";
  const API_KEY = "af04bdf1d7mshc9dda69ae5365f2p146731jsn2458b96f620c"; // 替换为你的API密钥

  // Load history on page load
  loadHistory();

  // Paste from clipboard
  pasteBtn.addEventListener("click", async function() {
    try {
      const text = await navigator.clipboard.readText();
      videoInput.value = text;
      videoInput.dispatchEvent(new Event('input', { bubbles: true }));
      showStatus("URL pasted from clipboard", "status-info");
    } catch (err) {
      showStatus("⚠️ Failed to paste from clipboard", "status-error");
      console.error('Paste failed:', err);
    }
  });

  // Update preview when URL changes
  videoInput.addEventListener("input", function() {
    const videoUrl = videoInput.value.trim();
    const videoId = extractVideoId(videoUrl);
    
    if (videoId) {
      previewContainer.style.display = "block";
      videoPreview.src = `https://www.youtube.com/embed/${videoId}?modestbranding=1&rel=0`;
    } else {
      previewContainer.style.display = "none";
      videoPreview.src = "";
    }
  });

  // Download button handler
  downloadBtn.addEventListener("click", async function() {
    if (isProcessing) return;
    
    const videoUrl = videoInput.value.trim();
    const selectedQuality = qualitySelect.value;
    
    if (!isValidYouTubeUrl(videoUrl)) {
      showStatus("⚠️ Please enter a valid YouTube URL", "status-error");
      shakeElement(videoInput);
      return;
    }
    
    try {
      // Set processing state
      isProcessing = true;
      downloadBtn.disabled = true;
      spinner.style.display = "block";
      updateProgress(10, "🔍 Fetching video details...");
      
      // Fetch MP3 download link
      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: {
          "x-rapidapi-key": API_KEY,
          "x-rapidapi-host": "youtube-to-mp337.p.rapidapi.com",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ url: videoUrl, quality: selectedQuality })
      });

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }

      const result = await response.json();
      const downloadUrl = result.url;
      const videoTitle = result.title || "Unknown Title";
      
      updateProgress(70, "⬇️ Downloading MP3...");
      
      // Save to history
      saveToHistory(videoTitle, videoUrl, downloadUrl);
      
      // Trigger download
      triggerDownload(downloadUrl, videoTitle);
      
      updateProgress(100, `✅ Download complete: ${truncateText(videoTitle, 30)}`);
      
      // Reset after delay
      setTimeout(() => {
        isProcessing = false;
        downloadBtn.disabled = false;
      }, 3000);
      
    } catch (error) {
      console.error("Download error:", error);
      showStatus("❌ Download failed: " + error.message, "status-error");
      updateProgress(0, "");
    } finally {
      spinner.style.display = "none";
    }
  });

  // Clear history
  clearHistoryBtn.addEventListener("click", function() {
    if (confirm("Are you sure you want to clear all download history?")) {
      localStorage.removeItem("downloadHistory");
      loadHistory();
      showStatus("History cleared", "status-info");
    }
  });

  // ======== Helper Functions ======== 
  
  // Show status message
  function showStatus(message, className = "") {
    statusDiv.textContent = message;
    statusDiv.className = className;
  }
  
  // Update progress bar
  function updateProgress(percent, message = "") {
    progressBar.style.width = `${percent}%`;
    if (message) showStatus(message);
  }
  
  // Validate YouTube URL
  function isValidYouTubeUrl(url) {
    return /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/.test(url);
  }
  
  // Shake element for error feedback
  function shakeElement(element) {
    element.style.transform = "translateX(5px)";
    setTimeout(() => {
      element.style.transform = "translateX(-5px)";
      setTimeout(() => {
        element.style.transform = "translateX(0)";
      }, 100);
    }, 100);
  }
  
  // Trigger file download
  function triggerDownload(url, filename) {
    const a = document.createElement("a");
    a.href = url;
    a.download = `${cleanFilename(filename)}.mp3`;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
    }, 100);
  }
  
  // Clean filename for download
  function cleanFilename(name) {
    return name.replace(/[^\w\s.-]/gi, '').substring(0, 60);
  }
  
  // Truncate text with ellipsis
  function truncateText(text, maxLength) {
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  }
  
  // Save to history
  function saveToHistory(title, videoUrl, downloadUrl) {
    try {
      let history = JSON.parse(localStorage.getItem("downloadHistory")) || [];
      
      // Prevent duplicates
      if (!history.some(item => item.videoUrl === videoUrl)) {
        history.unshift({ 
          title: truncateText(title, 60), 
          videoUrl, 
          downloadUrl,
          date: new Date().toISOString()
        });
        
        // Keep only last 20 items
        if (history.length > 20) history.pop();
        
        localStorage.setItem("downloadHistory", JSON.stringify(history));
        loadHistory();
      }
    } catch (e) {
      console.error("Error saving history:", e);
    }
  }
  
  // Load history
  function loadHistory() {
    historyList.innerHTML = "";
    
    try {
      const history = JSON.parse(localStorage.getItem("downloadHistory")) || [];
      
      if (history.length === 0) {
        historyList.innerHTML = `<li class="empty-history">No download history yet</li>`;
        return;
      }
      
      history.forEach((entry) => {
        const listItem = document.createElement("li");
        listItem.innerHTML = `
          <a href="${entry.downloadUrl}" target="_blank">
            <i class="fas fa-music"></i>
            <span class="history-title">${entry.title}</span>
          </a>
        `;
        historyList.appendChild(listItem);
      });
    } catch (e) {
      console.error("Error loading history:", e);
    }
  }
  
  // Extract YouTube video ID
  function extractVideoId(url) {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
  }
});