// js/menu.js
document.addEventListener("DOMContentLoaded", () => {
  const PLUS_SRC = "images/nc_plus.png";   // or plus.png
  const MINUS_SRC = "images/nc_minus.png"; // or minus.png

  /** If you want only one item open at a time, set to true */
  const ONE_OPEN = true;

  const items = document.querySelectorAll(".menu .menu-item");

  items.forEach((item, index) => {
    const button = item.querySelector(".menu-toggle");
    const panelInner = item.querySelector(".panel-inner");

    if (!button || !panelInner) return;

    // Link button ↔ panel for accessibility
    const panelId = panelInner.id || `menu-panel-${index + 1}`;
    panelInner.id = panelId;
    button.setAttribute("aria-controls", panelId);
    button.setAttribute("aria-expanded", item.classList.contains("open") ? "true" : "false");

    // Ensure we have a plus/minus indicator <img>
    let indicator = button.querySelector(".indicator");
    if (!indicator) {
      indicator = document.createElement("img");
      indicator.className = "indicator";
      indicator.alt = "";                // decorative
      indicator.setAttribute("aria-hidden", "true");
      indicator.decoding = "async";
      indicator.loading = "lazy";
      // Insert at the start of the button
      button.insertBefore(indicator, button.firstChild);
    }

    // Set initial icon
    indicator.src = item.classList.contains("open") ? MINUS_SRC : PLUS_SRC;

    // Toggle behavior
    button.addEventListener("click", () => {
      const willOpen = !item.classList.contains("open");

      if (ONE_OPEN && willOpen) {
        // Close others
        document.querySelectorAll(".menu .menu-item.open").forEach(openItem => {
          if (openItem === item) return;
          openItem.classList.remove("open");
          const openBtn = openItem.querySelector(".menu-toggle");
          const openInd = openItem.querySelector(".indicator");
          if (openBtn) openBtn.setAttribute("aria-expanded", "false");
          if (openInd) openInd.src = PLUS_SRC;
        });
      }

      item.classList.toggle("open", willOpen);
      button.setAttribute("aria-expanded", willOpen ? "true" : "false");
      indicator.src = willOpen ? MINUS_SRC : PLUS_SRC;
    });
  });
});
