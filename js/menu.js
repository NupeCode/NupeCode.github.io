// js/menu.js
document.addEventListener("DOMContentLoaded", () => {
  const PLUS_SRC = "images/nc_plus.png";   // or plus.png
  const MINUS_SRC = "images/nc_minus.png"; // or minus.png
  const ONE_OPEN = true;

  const items = document.querySelectorAll(".menu .menu-item");
  const backBtn = document.querySelector(".back-button");
  const focusStage = document.querySelector(".focus-stage");
  const focusImage = document.querySelector(".focus-image");
  const focusContent = document.querySelector(".focus-content");
  const tocList = document.querySelector(".toc-list");

  // --- Expand/collapse with plus/minus ---
  items.forEach((item, index) => {
    const button = item.querySelector(".menu-toggle");
    const panelInner = item.querySelector(".panel-inner");
    if (!button || !panelInner) return;

    const panelId = panelInner.id || `menu-panel-${index + 1}`;
    panelInner.id = panelId;
    button.setAttribute("aria-controls", panelId);
    button.setAttribute("aria-expanded", item.classList.contains("open") ? "true" : "false");

    // Ensure indicator exists
    let indicator = button.querySelector(".indicator");
    if (!indicator) {
      indicator = document.createElement("img");
      indicator.className = "indicator";
      indicator.alt = "";
      indicator.setAttribute("aria-hidden", "true");
      indicator.decoding = "async";
      indicator.loading = "lazy";
      button.insertBefore(indicator, button.firstChild);
    }
    indicator.src = item.classList.contains("open") ? MINUS_SRC : PLUS_SRC;

    // Toggle open/close
    button.addEventListener("click", () => {
      const willOpen = !item.classList.contains("open");
      if (ONE_OPEN && willOpen) {
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

  // --- Focused view ---
  function slugify(text) {
    return text
      .toLowerCase()
      .trim()
      .replace(/[\s\.\,/\\]+/g, "-")
      .replace(/[^a-z0-9\-]/g, "")
      .replace(/\-+/g, "-");
  }

  async function loadContentIntoFocus(url) {
    // Same-origin local files are fine. If you load across origins, you’ll need CORS headers.
    const res = await fetch(url, { credentials: "same-origin" });
    if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status}`);
    const html = await res.text();
    focusContent.innerHTML = html;

    // Build TOC from h2/h3 in the loaded content
    tocList.innerHTML = "";
    const headings = focusContent.querySelectorAll("h2, h3");
    headings.forEach(h => {
      if (!h.id) h.id = slugify(h.textContent || "section");
      const li = document.createElement("li");
      li.className = h.tagName.toLowerCase() === "h3" ? "toc-sub" : "toc-top";
      const a = document.createElement("a");
      a.href = `#${h.id}`;
      a.textContent = h.textContent || "Section";
      a.addEventListener("click", (e) => {
        e.preventDefault();
        const target = focusContent.querySelector(`#${h.id}`);
        if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      li.appendChild(a);
      tocList.appendChild(li);
    });
  }

  function enterFocusWithItem(item) {
    // Prefer big focus image sources from data attributes:
    const focusSrc    = item.getAttribute("data-focus-src");
    const focusSrcset = item.getAttribute("data-focus-srcset");
    const focusSizes  = item.getAttribute("data-focus-sizes");
  
    // Fallbacks if data attrs are missing:
    const largeInPanel = item.querySelector(".panel-content > img");
    const thumbImg     = item.querySelector(".thumb img");
  
    const src = focusSrc
      || (largeInPanel && largeInPanel.getAttribute("src"))
      || (thumbImg && thumbImg.getAttribute("src"));
  
    const alt = (largeInPanel && largeInPanel.getAttribute("alt"))
      || (thumbImg && thumbImg.getAttribute("alt"))
      || "";
  
    if (!src) return;
  
    // Populate focus image (supports responsive if provided)
    focusImage.removeAttribute("srcset");
    focusImage.removeAttribute("sizes");
    focusImage.src = src;
    if (focusSrcset) focusImage.setAttribute("srcset", focusSrcset);
    if (focusSizes)  focusImage.setAttribute("sizes", focusSizes);
    focusImage.alt = alt;
  
    // Enter focused mode
    document.body.classList.add("focused");
    focusStage.setAttribute("aria-hidden", "false");
    backBtn.hidden = false;
  
    // Stop floaters while focused
    if (window.Floaters) window.Floaters.stop();
  
    // Load external HTML on right
    const contentUrl = item.getAttribute("data-content-url");
    if (contentUrl) {
      focusContent.innerHTML = "<p>Loading…</p>";
      loadContentIntoFocus(contentUrl).catch(err => {
        focusContent.innerHTML = `<p style="color:#ff6b6b">Could not load content.<br>${err.message}</p>`;
        tocList.innerHTML = "";
      });
    } else {
      focusContent.innerHTML = "<p>No content URL provided for this item.</p>";
      tocList.innerHTML = "";
    }
  
    window.scrollTo({ top: 0, behavior: "smooth" });
  }  

  function exitFocus() {
    document.body.classList.remove("focused");
    focusStage.setAttribute("aria-hidden", "true");
    backBtn.hidden = true;
    focusImage.src = "";
    focusImage.alt = "";
    focusContent.innerHTML = "";
    tocList.innerHTML = "";

    // Restart floaters when leaving focus mode
    if (window.Floaters) window.Floaters.start();
  }

  // Wire up “Open focused view” buttons
  document.querySelectorAll(".menu .focus-button").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const item = e.currentTarget.closest(".menu-item");
      if (item) enterFocusWithItem(item);
    });
  });

  // Back button
  if (backBtn) {
    backBtn.addEventListener("click", exitFocus);
    window.addEventListener("scroll", () => {
      if (window.scrollY > 30) {
        backBtn.classList.add("scrolled");
      } else {
        backBtn.classList.remove("scrolled");
      }
    });
  }

});
