export function renderNavbar(container, activeTab, onNavigate) {
  const tabs = [
    { id: "home", label: "首頁", icon: "fa-house" },
    { id: "coach", label: "展演教練", icon: "fa-person-chalkboard" },
    { id: "settings", label: "系統設定", icon: "fa-gear" },
    { id: "api_tester", label: "API 測試", icon: "fa-network-wired" },
  ];

  const html = `
    <nav class="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div class="flex items-center space-x-3">
            <div class="bg-blue-600 text-white p-2 rounded-lg shadow-lg shadow-blue-200">
                <i class="fa-solid fa-hands-asl-interpreting text-xl"></i>
            </div>
            <h1 class="text-xl font-bold text-gray-800 tracking-tight">
                人機協同展演系統 <span class="text-xs text-blue-500 bg-blue-50 px-2 py-1 rounded ml-1 font-medium">Research Preview</span>
            </h1>
        </div>
        <div class="flex space-x-1">
            ${tabs
              .map(
                (tab) => `
                <button
                    data-tab="${tab.id}"
                    class="px-4 py-2 rounded-md transition-all flex items-center space-x-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? "bg-blue-50 text-blue-600 ring-1 ring-blue-200"
                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                    }"
                >
                    <i class="fa-solid ${tab.icon}"></i>
                    <span>${tab.label}</span>
                </button>
            `
              )
              .join("")}
        </div>
    </nav>
    `;

  container.innerHTML = html;

  // Attach event listeners
  container.querySelectorAll("button[data-tab]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const tabId = btn.getAttribute("data-tab");
      onNavigate(tabId);
    });
  });
}
