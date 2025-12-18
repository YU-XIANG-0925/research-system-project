export function renderHome(container, onNavigate) {
  const html = `
    <div class="max-w-6xl mx-auto">
        <div class="text-center mb-12 animate-fade-in-up">
            <h1 class="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
                歡迎使用 <span class="text-blue-600">人機協同展演系統</span>
            </h1>
            <p class="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                結合體態分析、語音識別與機器人控制的先進展演訓練平台。
            </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
            <!-- Card 1: Gesture Coach -->
            <div
                data-target="coach"
                class="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all cursor-pointer group border border-gray-100 hover:-translate-y-2"
            >
                <div class="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                    <i class="fa-solid fa-person-chalkboard text-3xl"></i>
                </div>
                <h2 class="text-2xl font-bold mb-3 text-gray-800 group-hover:text-blue-600 transition-colors">展演教練</h2>
                <p class="text-gray-500 leading-relaxed">
                    上傳影片進行體態分析，生成機器人控制代碼，並獲得即時回饋。
                </p>
            </div>

            <!-- Card 2: Settings -->
            <div
                data-target="settings"
                class="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all cursor-pointer group border border-gray-100 hover:-translate-y-2"
            >
                <div class="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 mb-6 group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300">
                    <i class="fa-solid fa-gear text-3xl"></i>
                </div>
                <h2 class="text-2xl font-bold mb-3 text-gray-800 group-hover:text-purple-600 transition-colors">系統設定</h2>
                <p class="text-gray-500 leading-relaxed">
                    設定 MQTT Broker 連線、機器人參數與系統偏好。
                </p>
            </div>

            <!-- Card 3: API Tester -->
            <div
                data-target="api_tester"
                class="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all cursor-pointer group border border-gray-100 hover:-translate-y-2"
            >
                <div class="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 mb-6 group-hover:bg-green-600 group-hover:text-white transition-colors duration-300">
                    <i class="fa-solid fa-network-wired text-3xl"></i>
                </div>
                <h2 class="text-2xl font-bold mb-3 text-gray-800 group-hover:text-green-600 transition-colors">API 測試</h2>
                <p class="text-gray-500 leading-relaxed">
                    內建類似 Postman 的工具，可直接從瀏覽器測試後端 API 端點。
                </p>
            </div>
        </div>
    </div>
    `;

  container.innerHTML = html;

  // Attach event listeners
  container.querySelectorAll("div[data-target]").forEach((card) => {
    card.addEventListener("click", () => {
      const target = card.getAttribute("data-target");
      onNavigate(target);
    });
  });
}
