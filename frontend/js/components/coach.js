import { api } from "../api.js";

export function renderCoach(container) {
  const html = `
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-140px)]">
        
        <!-- Left Column: Video Analysis -->
        <div class="bg-white rounded-2xl shadow-lg border border-gray-100 flex flex-col overflow-hidden">
            <div class="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <h2 class="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <i class="fa-solid fa-video text-blue-500"></i>
                    Gesture Analysis
                </h2>
                <span id="video-status" class="text-xs font-medium px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600">
                    Ready
                </span>
            </div>
            
            <div class="p-6 flex-1 overflow-y-auto space-y-6">
                <!-- Upload Area -->
                <div class="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer" id="video-dropzone">
                    <input type="file" id="video-input" accept="video/*" class="hidden">
                    <div class="space-y-4">
                        <div class="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto">
                            <i class="fa-solid fa-cloud-arrow-up text-2xl"></i>
                        </div>
                        <div>
                            <p class="text-gray-700 font-medium">Click to upload video</p>
                            <p class="text-gray-400 text-sm">MP4, WebM, AVI (Max 50MB)</p>
                        </div>
                    </div>
                </div>

                <!-- Analysis Result -->
                <div id="analysis-result" class="hidden space-y-4">
                    <div class="bg-green-50 border border-green-100 rounded-xl p-4 flex items-start gap-3">
                        <i class="fa-solid fa-check-circle text-green-500 mt-1"></i>
                        <div>
                            <h3 class="font-bold text-green-800">Analysis Complete</h3>
                            <p class="text-green-600 text-sm mt-1">Video processed successfully. Robot motor angles generated.</p>
                        </div>
                    </div>
                    
                    <div class="bg-slate-900 rounded-xl p-4 overflow-hidden relative group">
                        <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button class="text-xs bg-slate-700 text-white px-2 py-1 rounded hover:bg-slate-600">Copy</button>
                        </div>
                        <pre class="text-blue-400 font-mono text-xs overflow-x-auto" id="analysis-json">
{
  "status": "success",
  "data_url": "/data/angles_uuid.json"
}
                        </pre>
                    </div>
                    
                    <a href="#" target="_blank" id="download-link" class="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors">
                        <i class="fa-solid fa-download mr-2"></i> Download JSON
                    </a>
                </div>
            </div>
        </div>

        <!-- Right Column: Script & Rehearsal -->
        <div class="bg-white rounded-2xl shadow-lg border border-gray-100 flex flex-col overflow-hidden">
            <div class="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <h2 class="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <i class="fa-solid fa-microphone-lines text-purple-500"></i>
                    Script Rehearsal
                </h2>
                <button id="rehearsal-btn" class="text-sm bg-purple-600 hover:bg-purple-700 text-white px-4 py-1.5 rounded-lg shadow-sm transition-all flex items-center gap-2">
                    <i class="fa-solid fa-play"></i> Start Rehearsal
                </button>
            </div>

            <div class="p-6 flex-1 flex flex-col overflow-hidden">
                <!-- Script Upload -->
                <div id="script-upload-area" class="mb-6">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Upload Script for Auto-Tagging</label>
                    <div class="flex gap-2">
                        <input type="file" id="script-input" accept=".txt" class="block w-full text-sm text-gray-500
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-full file:border-0
                            file:text-sm file:font-semibold
                            file:bg-purple-50 file:text-purple-700
                            hover:file:bg-purple-100
                        "/>
                        <button id="tag-script-btn" class="bg-gray-800 text-white px-4 rounded-lg hover:bg-gray-700 transition-colors">
                            <i class="fa-solid fa-wand-magic-sparkles"></i>
                        </button>
                    </div>
                </div>

                <!-- Script Display -->
                <div class="flex-1 bg-gray-50 rounded-xl border border-gray-200 p-6 overflow-y-auto relative">
                    <div id="script-content" class="prose max-w-none text-gray-600 leading-relaxed space-y-4">
                        <p class="text-gray-400 italic text-center mt-10">
                            Upload a script to see AI-tagged emotions and gestures here...
                        </p>
                    </div>
                    
                    <!-- STT Overlay -->
                    <div id="stt-overlay" class="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur shadow-lg rounded-xl p-4 border border-purple-100 hidden">
                        <p class="text-xs text-purple-500 font-bold mb-1 uppercase tracking-wider">Real-time STT</p>
                        <p id="stt-text" class="text-gray-800 font-medium">Listening...</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;

  container.innerHTML = html;

  // --- Video Logic ---
  const videoDropzone = container.querySelector("#video-dropzone");
  const videoInput = container.querySelector("#video-input");
  const analysisResult = container.querySelector("#analysis-result");
  const analysisJson = container.querySelector("#analysis-json");
  const downloadLink = container.querySelector("#download-link");
  const videoStatus = container.querySelector("#video-status");

  videoDropzone.addEventListener("click", () => videoInput.click());

  videoInput.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    videoStatus.textContent = "Uploading...";
    videoStatus.className =
      "text-xs font-medium px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-600 animate-pulse";

    try {
      const result = await api.uploadVideo(file);

      videoStatus.textContent = "Analyzed";
      videoStatus.className =
        "text-xs font-medium px-2.5 py-0.5 rounded-full bg-green-100 text-green-600";

      analysisResult.classList.remove("hidden");
      analysisJson.textContent = JSON.stringify(result, null, 2);
      downloadLink.href = result.data_url;
    } catch (error) {
      videoStatus.textContent = "Error";
      videoStatus.className =
        "text-xs font-medium px-2.5 py-0.5 rounded-full bg-red-100 text-red-600";
      alert("Video upload failed: " + error.message);
    }
  });

  // --- Script Logic ---
  const scriptInput = container.querySelector("#script-input");
  const tagScriptBtn = container.querySelector("#tag-script-btn");
  const scriptContent = container.querySelector("#script-content");

  tagScriptBtn.addEventListener("click", async () => {
    const file = scriptInput.files[0];
    if (!file) {
      alert("Please select a .txt file first.");
      return;
    }

    scriptContent.innerHTML =
      '<div class="flex justify-center mt-10"><i class="fa-solid fa-circle-notch fa-spin text-3xl text-purple-500"></i></div>';

    try {
      const result = await api.autoTagScript(file);

      // Render tagged script
      const htmlContent = result.tagged_script
        .map((p) => {
          // Highlight tags
          let text = p.text
            .replace(
              /\[E:(.*?)\]/g,
              '<span class="inline-block bg-pink-100 text-pink-700 px-1.5 py-0.5 rounded text-xs font-bold mx-1 border border-pink-200">$1</span>'
            )
            .replace(
              /\[G:(.*?)\]/g,
              '<span class="inline-block bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-xs font-bold mx-1 border border-blue-200">$1</span>'
            );
          return `<p>${text}</p>`;
        })
        .join("");

      scriptContent.innerHTML = htmlContent;
    } catch (error) {
      scriptContent.innerHTML = `<p class="text-red-500 text-center">Error: ${error.message}</p>`;
    }
  });

  // --- STT Logic ---
  const rehearsalBtn = container.querySelector("#rehearsal-btn");
  const sttOverlay = container.querySelector("#stt-overlay");
  const sttText = container.querySelector("#stt-text");
  let ws = null;
  let isRehearsing = false;

  rehearsalBtn.addEventListener("click", () => {
    if (isRehearsing) {
      // Stop
      if (ws) ws.close();
      isRehearsing = false;
      rehearsalBtn.innerHTML =
        '<i class="fa-solid fa-play"></i> Start Rehearsal';
      rehearsalBtn.classList.replace("bg-red-600", "bg-purple-600");
      rehearsalBtn.classList.replace("hover:bg-red-700", "hover:bg-purple-700");
      sttOverlay.classList.add("hidden");
    } else {
      // Start
      isRehearsing = true;
      rehearsalBtn.innerHTML = '<i class="fa-solid fa-stop"></i> Stop';
      rehearsalBtn.classList.replace("bg-purple-600", "bg-red-600");
      rehearsalBtn.classList.replace("hover:bg-purple-700", "hover:bg-red-700");
      sttOverlay.classList.remove("hidden");
      sttText.textContent = "Connecting...";

      ws = api.createSTTWebSocket(
        (text) => {
          sttText.textContent = text;
          // Simple auto-scroll or highlight logic could go here
        },
        () => {
          sttText.textContent = "Listening...";
          console.log("STT Connected");
        },
        () => {
          if (isRehearsing) {
            // Unexpected close
            sttText.textContent = "Connection closed.";
            // Auto-reconnect logic could go here
          }
        },
        (error) => {
          console.error("STT Error:", error);
          sttText.textContent = "Error connecting to STT service.";
        }
      );

      // Mock audio streaming (In a real app, we'd capture microphone here)
      // Since the backend expects bytes, we need to send audio data.
      // For this demo, we'll assume the backend handles the microphone or we need to implement MediaRecorder.
      // Wait, the backend expects `websocket.receive_bytes()`.
      // We need to capture audio from the browser microphone and send it.

      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          const mediaRecorder = new MediaRecorder(stream);
          mediaRecorder.ondataavailable = (e) => {
            if (ws && ws.readyState === WebSocket.OPEN && e.data.size > 0) {
              ws.send(e.data);
            }
          };
          mediaRecorder.start(100); // Send chunks every 100ms

          // Store recorder to stop it later
          ws.mediaRecorder = mediaRecorder;
        })
        .catch((err) => {
          console.error("Microphone error:", err);
          sttText.textContent = "Microphone access denied.";
        });
    }
  });
}
