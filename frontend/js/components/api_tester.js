import { api } from "../api.js";

export function renderApiTester(container) {
  const html = `
    <div class="max-w-4xl mx-auto space-y-6">
        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 class="text-xl font-bold text-gray-800 mb-4">API Endpoint Tester</h2>
            
            <div class="flex gap-4 mb-6">
                <select id="api-method" class="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 font-mono">
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                </select>
                <input type="text" id="api-url" class="flex-1 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 font-mono" placeholder="/settings/mqtt/status">
                <button id="api-send-btn" class="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-colors">
                    Send Request
                </button>
            </div>

            <div class="mb-4">
                <label class="block mb-2 text-sm font-medium text-gray-900">Request Body (JSON)</label>
                <textarea id="api-body" rows="4" class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 font-mono" placeholder="{}"></textarea>
            </div>

            <div>
                <label class="block mb-2 text-sm font-medium text-gray-900">Response</label>
                <pre id="api-response" class="bg-slate-900 text-green-400 p-4 rounded-lg overflow-x-auto font-mono text-sm min-h-[100px]">Waiting for request...</pre>
            </div>
        </div>
    </div>
    `;

  container.innerHTML = html;

  const sendBtn = container.querySelector("#api-send-btn");
  const methodSelect = container.querySelector("#api-method");
  const urlInput = container.querySelector("#api-url");
  const bodyInput = container.querySelector("#api-body");
  const responsePre = container.querySelector("#api-response");

  sendBtn.addEventListener("click", async () => {
    const method = methodSelect.value;
    const url = urlInput.value;
    const bodyStr = bodyInput.value;

    responsePre.textContent = "Sending...";

    try {
      const options = {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
      };

      if (method === "POST" && bodyStr) {
        try {
          JSON.parse(bodyStr); // Validate JSON
          options.body = bodyStr;
        } catch (e) {
          responsePre.textContent = "Error: Invalid JSON in body";
          return;
        }
      }

      const response = await fetch(url, options);
      const data = await response.json();

      responsePre.textContent = JSON.stringify(data, null, 2);
    } catch (error) {
      responsePre.textContent = "Error: " + error.message;
    }
  });
}
