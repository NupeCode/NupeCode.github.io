// js/floaters.js
document.addEventListener("DOMContentLoaded", () => {
    const layer = document.querySelector(".bg-floaters");
    if (!layer) return;
  
    // ------------------ CONFIG ------------------
    const IMAGES = [
      "images/n_black.png"

      // Add more tiny assets if you like (e.g., icons): "images/floaters/icon1.svg"
    ];
  
    const MAX_FLOATERS = 12;         // cap on-screen at once
    const SPAWN_EVERY_MS = 1200;     // how often to attempt a spawn
    const SIZE_PX = [24, 48];        // min/max size
    const LIFETIME_MS = [6000, 12000]; // min/max total animation time
    const DRIFT_PX = [120, 320];     // how far they drift overall
    const WAYPOINTS = [2, 4];        // number of midpoints (random path complexity)
    // --------------------------------------------
  
    let alive = 0;
    let spawnTimer = null;
  
    function rand(min, max) { return Math.random() * (max - min) + min; }
    function randInt(min, max) { return Math.floor(rand(min, max + 1)); }
    function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  
    function spawnFloater() {
        if (alive >= MAX_FLOATERS) return;
        const imgSrc = pick(IMAGES);
        const el = document.createElement("img");
        el.className = "bg-floater";
        el.src = imgSrc;
        el.alt = "";
        const size = randInt(SIZE_PX[0], SIZE_PX[1]);
        el.style.width = `${size}px`;

        // Keep floaters within the centered layer (aligned with main content)
        const bounds = layer.getBoundingClientRect();
        const xMax = Math.max(bounds.width - 24, 24);
        const yMax = Math.max(bounds.height - 24, 24);
        el.style.left = `${rand(24, xMax)}px`;
        el.style.top = `${rand(24, yMax)}px`;
        layer.appendChild(el);
        alive++;

        const totalDrift = rand(DRIFT_PX[0], DRIFT_PX[1]);
        const angle = rand(0, Math.PI * 2);
        const dx = Math.cos(angle) * totalDrift;
        const dy = Math.sin(angle) * totalDrift;
        const nWaypoints = randInt(WAYPOINTS[0], WAYPOINTS[1]);

        const keyframes = [{ transform: "translate(0, 0)", opacity: 0 }];
        for (let i = 1; i <= nWaypoints; i++) {
            const t = i / (nWaypoints + 1);
            keyframes.push({
                offset: Math.min(0.85, t),
                transform: `translate(${dx * t + rand(-30, 30)}px, ${dy * t + rand(-30, 30)}px)`,
                opacity: 1
            });
        }
        keyframes.push({ transform: `translate(${dx}px, ${dy}px)`, opacity: 0 });

        const duration = randInt(LIFETIME_MS[0], LIFETIME_MS[1]);
        const anim = el.animate(keyframes, { duration, easing: "linear", fill: "forwards" });
        anim.onfinish = () => { el.remove(); alive--; };
    }

    function start() {
        if (spawnTimer) return;
        spawnTimer = setInterval(spawnFloater, SPAWN_EVERY_MS);
    }
    
    function stop() {
        clearInterval(spawnTimer);
        spawnTimer = null;
        // remove all existing
        layer.querySelectorAll(".bg-floater").forEach(n => n.remove());
        alive = 0;
    }

    // start by default
    start();

    // Expose for other scripts
    window.Floaters = { start, stop };
  
    // Optional: pause when the tab is hidden to save CPU
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        stop();
      } else {
        // Only resume if we're NOT in focus mode
        if (!document.body.classList.contains("focused")) {
          start();
        }
      }
    });    
  
    // Optional: throttle spawns on super small screens
    const mq = window.matchMedia("(max-width: 480px)");
    mq.addEventListener?.("change", () => {
      if (mq.matches) {
        // smaller devices → fewer floaters
        stop();
        alive = 0;
        // remove existing
        layer.querySelectorAll(".bg-floater").forEach(n => n.remove());
      } else {
        start();
      }
    });
  });
  
