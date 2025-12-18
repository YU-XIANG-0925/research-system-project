const API_BASE_URL = ""; // Relative path since frontend is served by FastAPI

export const api = {
  // --- Scripts ---
  async autoTagScript(file) {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${API_BASE_URL}/scripts/auto-tag`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to tag script");
      }

      return await response.json();
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },

  // --- MQTT ---
  async connectMqtt(settings) {
    const response = await fetch(`${API_BASE_URL}/settings/mqtt/connect`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    return response.json();
  },

  async disconnectMqtt() {
    const response = await fetch(`${API_BASE_URL}/settings/mqtt/disconnect`, {
      method: "POST",
    });
    return response.json();
  },

  async getMqttStatus() {
    const response = await fetch(`${API_BASE_URL}/settings/mqtt/status`);
    return response.json();
  },

  // --- Gestures ---
  async uploadVideo(file) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_BASE_URL}/gestures/upload-video`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Upload failed");
    }
    return response.json();
  },

  // --- WebSocket ---
  createSTTWebSocket(onMessage, onOpen, onClose, onError) {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws/stt`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = onOpen;
    ws.onmessage = (event) => onMessage(event.data);
    ws.onclose = onClose;
    ws.onerror = onError;

    return ws;
  },
};
