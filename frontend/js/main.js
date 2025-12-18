import { renderNavbar } from "./components/navbar.js";
import { renderHome } from "./components/home.js";
import { renderCoach } from "./components/coach.js";
import { renderSettings } from "./components/settings.js";
import { renderApiTester } from "./components/api_tester.js";

// Global State
const state = {
  activeTab: "home",
};

// Router Logic
function navigateTo(tabId) {
  state.activeTab = tabId;

  // Update Navbar
  renderNavbar(
    document.getElementById("navbar-container"),
    state.activeTab,
    navigateTo
  );

  // Hide all pages
  document
    .querySelectorAll(".page-content")
    .forEach((el) => el.classList.add("hidden"));

  // Show active page and render content if needed
  const activePage = document.getElementById(`page-${tabId}`);
  if (activePage) {
    activePage.classList.remove("hidden");

    // Lazy load/render content
    switch (tabId) {
      case "home":
        renderHome(activePage, navigateTo);
        break;
      case "coach":
        renderCoach(activePage);
        break;
      case "settings":
        renderSettings(activePage);
        break;
      case "api_tester":
        renderApiTester(activePage);
        break;
    }
  }
}

// Initialization
document.addEventListener("DOMContentLoaded", () => {
  navigateTo("home");
});
