import { api } from "../api.js";

export function renderSettings(container) {
  const html = `
    <div class="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div class="bg-gray-50 px-8 py-6 border-b border-gray-100">
            <h2 class="text-2xl font-bold text-gray-800 flex items-center gap-3">
                <i class="fa-solid fa-sliders text-blue-500"></i>
                MQTT Configuration
            </h2>
            <p class="text-gray-500 mt-1">Configure the connection to your robot's MQTT broker.</p>
        </div>
        
        <div class="p-8 space-y-6">
            <!-- Status Indicator -->
            <div id="mqtt-status-indicator" class="flex items-center justify-between bg-red-50 p-4 rounded-xl border border-red-100">
                <div class="flex items-center gap-3">
                    <div class="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                    <span class="font-medium text-red-700">Disconnected</span>
                </div>
                <span class="text-sm text-red-600 bg-white px-3 py-1 rounded-lg border border-red-100 shadow-sm">Not Connected</span>
            </div>

            <form id="mqtt-form" class="space-y-5">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Broker Address</label>
                    <div class="relative">
                        <i class="fa-solid fa-server absolute left-4 top-3.5 text-gray-400"></i>
                        <input type="text" name="broker_address" value="mqttgo.io" 
                            class="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all outline-none" 
                            placeholder="e.g., mqttgo.io">
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-6">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Port</label>
                        <div class="relative">
                            <i class="fa-solid fa-door-open absolute left-4 top-3.5 text-gray-400"></i>
                            <input type="number" name="port" value="1883" 
                                class="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all outline-none">
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Username (Optional)</label>
                        <div class="relative">
                            <i class="fa-solid fa-user absolute left-4 top-3.5 text-gray-400"></i>
                            <input type="text" name="username" 
                                class="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all outline-none">
                        </div>
                    </div>
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Password (Optional)</label>
                    <div class="relative">
                        <i class="fa-solid fa-lock absolute left-4 top-3.5 text-gray-400"></i>
                        <input type="password" name="password" 
                            class="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all outline-none">
                    </div>
                </div>

                <div class="pt-4 flex gap-4">
                    <button type="submit" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-200 flex items-center justify-center gap-2">
                        <i class="fa-solid fa-plug"></i> Connect
                    </button>
                    <button type="button" id="mqtt-disconnect-btn" class="flex-1 bg-white hover:bg-red-50 text-red-600 border border-red-200 font-bold py-3 px-6 rounded-xl transition-all hidden">
                        Disconnect
                    </button>
                </div>
            </form>
        </div>
    </div>
    `;

  container.innerHTML = html;

  const form = container.querySelector("#mqtt-form");
  const disconnectBtn = container.querySelector("#mqtt-disconnect-btn");
  const statusIndicator = container.querySelector("#mqtt-status-indicator");

  // Helper to update UI based on connection status
  const updateStatusUI = (isConnected, broker = "") => {
    if (isConnected) {
      statusIndicator.className =
        "flex items-center justify-between bg-green-50 p-4 rounded-xl border border-green-100";
      statusIndicator.innerHTML = `
                <div class="flex items-center gap-3">
                    <div class="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                    <span class="font-medium text-green-700">Connected to ${broker}</span>
                </div>
                <span class="text-sm text-green-600 bg-white px-3 py-1 rounded-lg border border-green-100 shadow-sm">Active</span>
            `;
      form.querySelector('button[type="submit"]').classList.add("hidden");
      disconnectBtn.classList.remove("hidden");
    } else {
      statusIndicator.className =
        "flex items-center justify-between bg-red-50 p-4 rounded-xl border border-red-100";
      statusIndicator.innerHTML = `
                <div class="flex items-center gap-3">
                    <div class="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                    <span class="font-medium text-red-700">Disconnected</span>
                </div>
                <span class="text-sm text-red-600 bg-white px-3 py-1 rounded-lg border border-red-100 shadow-sm">Not Connected</span>
            `;
      form.querySelector('button[type="submit"]').classList.remove("hidden");
      disconnectBtn.classList.add("hidden");
    }
  };

  // Initial Status Check
  api.getMqttStatus().then((status) => {
    updateStatusUI(status.is_connected, status.broker);
  });

  // Connect Handler
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const settings = Object.fromEntries(formData.entries());
    settings.port = parseInt(settings.port);

    try {
      await api.connectMqtt(settings);
      // Poll for status update (since connection is async on backend)
      setTimeout(async () => {
        const status = await api.getMqttStatus();
        updateStatusUI(status.is_connected, status.broker);
      }, 1000);
    } catch (error) {
      alert("Connection failed: " + error.message);
    }
  });

  // Disconnect Handler
  disconnectBtn.addEventListener("click", async () => {
    try {
      await api.disconnectMqtt();
      updateStatusUI(false);
    } catch (error) {
      alert("Disconnect failed: " + error.message);
    }
  });
}
