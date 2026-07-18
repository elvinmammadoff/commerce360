/**
 * Orbittify embed widget — drop-in 360° viewer.
 *
 *   <script src="https://orbittify.com/widget.js"
 *           data-key="orb_live_..." data-sku="ARA-042-IVY" defer></script>
 *
 * One tag per store. It reads data-sku (or the page's Schema.org Product SKU),
 * fetches the published orbit video, and renders a scrub-to-spin viewer inline
 * where the script sits. Vanilla JS + Shadow DOM — no framework, no style bleed.
 */
(function () {
  "use strict";

  var script = document.currentScript;
  if (!script) {
    var all = document.querySelectorAll('script[src*="widget.js"]');
    script = all[all.length - 1];
  }
  if (!script) return;

  var origin = new URL(script.src).origin;
  var key = script.getAttribute("data-key");
  var sku = script.getAttribute("data-sku") || findSchemaSku();

  if (!key) return warn("missing data-key");
  if (!sku) return warn("no data-sku and no Schema.org Product SKU found");

  // Mount inline, right where the script tag sits. Each tag renders its own
  // viewer, so multiple products on one page never collide.
  var mount = document.createElement("div");
  script.parentNode.insertBefore(mount, script.nextSibling);

  fetch(origin + "/api/v1/embed?key=" + enc(key) + "&sku=" + enc(sku))
    .then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    })
    .then(function (data) {
      render(mount, data, origin);
    })
    .catch(function (err) {
      warn("could not load viewer: " + err.message);
    });

  // --- Schema.org SKU auto-detect -----------------------------------------
  function findSchemaSku() {
    var nodes = document.querySelectorAll(
      'script[type="application/ld+json"]',
    );
    for (var i = 0; i < nodes.length; i++) {
      try {
        var found = scanJsonLd(JSON.parse(nodes[i].textContent));
        if (found) return found;
      } catch (e) {
        /* malformed JSON-LD — skip */
      }
    }
    return null;
  }

  function scanJsonLd(node) {
    if (!node || typeof node !== "object") return null;
    if (Array.isArray(node)) {
      for (var i = 0; i < node.length; i++) {
        var f = scanJsonLd(node[i]);
        if (f) return f;
      }
      return null;
    }
    var type = node["@type"];
    var isProduct =
      type === "Product" || (Array.isArray(type) && type.indexOf("Product") > -1);
    if (isProduct && node.sku) return String(node.sku);
    if (node["@graph"]) return scanJsonLd(node["@graph"]);
    return null;
  }

  // --- Viewer render (Shadow DOM) -----------------------------------------
  function render(host, data, origin) {
    var root = host.attachShadow ? host.attachShadow({ mode: "open" }) : host;

    var style = document.createElement("style");
    style.textContent = [
      ":host,*{box-sizing:border-box}",
      ".orb{position:relative;width:100%;aspect-ratio:4/3;background:#000;",
      "border-radius:14px;overflow:hidden;touch-action:pan-y;cursor:grab;",
      "user-select:none;font-family:system-ui,-apple-system,sans-serif}",
      ".orb.drag{cursor:grabbing}",
      ".orb video{width:100%;height:100%;object-fit:contain;display:block;pointer-events:none}",
      ".hint{position:absolute;left:50%;bottom:12px;transform:translateX(-50%);",
      "padding:5px 11px;border-radius:999px;background:rgba(0,0,0,.55);",
      "color:#fff;font-size:12px;letter-spacing:.01em;backdrop-filter:blur(4px);",
      "transition:opacity .3s;pointer-events:none}",
      ".orb.touched .hint{opacity:0}",
      ".mark{position:absolute;right:8px;bottom:8px;padding:3px 7px;border-radius:6px;",
      "background:rgba(0,0,0,.5);color:rgba(255,255,255,.7);font-size:10px;",
      "text-decoration:none;font-family:ui-monospace,monospace;backdrop-filter:blur(4px)}",
      ".mark:hover{color:#fff}",
      ".spin{position:absolute;inset:0;display:flex;align-items:center;",
      "justify-content:center;color:rgba(255,255,255,.6);font-size:13px}",
      ".hs{position:absolute;transform:translate(-50%,-50%);display:none;",
      "align-items:center;gap:6px;padding:4px 9px 4px 5px;border-radius:999px;",
      "border:1px solid rgba(255,255,255,.2);background:rgba(0,0,0,.7);color:#fff;",
      "font-size:12px;text-decoration:none;backdrop-filter:blur(4px);",
      "white-space:nowrap;pointer-events:auto;z-index:5}",
      ".hs b{width:9px;height:9px;border-radius:50%;background:#5b8cff;",
      "box-shadow:0 0 0 4px rgba(91,140,255,.35);flex:0 0 auto}",
    ].join("");
    root.appendChild(style);

    var wrap = document.createElement("div");
    wrap.className = "orb";
    wrap.setAttribute("role", "img");
    wrap.setAttribute("aria-label", data.name + " — 360 degree view");

    var loading = document.createElement("div");
    loading.className = "spin";
    loading.textContent = "Loading 360° view…";
    wrap.appendChild(loading);

    var video = document.createElement("video");
    video.src = data.orbit_video_url;
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.setAttribute("webkit-playsinline", "");
    wrap.appendChild(video);

    var hint = document.createElement("div");
    hint.className = "hint";
    hint.textContent = "Drag to spin";
    wrap.appendChild(hint);

    var mark = document.createElement("a");
    mark.className = "mark";
    mark.href = data.share_url || origin;
    mark.target = "_blank";
    mark.rel = "noopener";
    mark.textContent = "Orbittify";
    wrap.appendChild(mark);

    // Hotspot markers — hidden until the orbit angle reaches each one.
    var markers = [];
    var list = data.hotspots || [];
    for (var i = 0; i < list.length; i++) {
      var h = list[i];
      var el = document.createElement(h.href ? "a" : "div");
      el.className = "hs";
      el.style.left = h.x + "%";
      el.style.top = h.y + "%";
      if (h.href) {
        el.href = h.href;
        el.target = "_blank";
        el.rel = "noopener";
      }
      var dot = document.createElement("b");
      var text = document.createElement("span");
      text.textContent = h.label;
      el.appendChild(dot);
      el.appendChild(text);
      wrap.appendChild(el);
      markers.push({ el: el, angle: h.angle });
    }

    root.appendChild(wrap);

    wireViewer(wrap, video, loading, markers);
  }

  // --- Scrub-to-spin interaction ------------------------------------------
  function wireViewer(wrap, video, loading, markers) {
    var duration = 0;
    var dragging = false;
    var lastX = 0;
    var autoRaf = null;
    var touched = false;
    var WINDOW = 32;

    // Sync hotspot visibility with the current orbit angle. Driven by rAF
    // during motion, and by seek/time events so scrubbing updates even when
    // rAF is throttled (background tab).
    function updateMarkers() {
      if (!markers.length || duration <= 0) return;
      var angle = ((video.currentTime / duration) * 360) % 360;
      for (var i = 0; i < markers.length; i++) {
        var delta = ((markers[i].angle - angle + 540) % 360) - 180;
        var near = Math.abs(delta) <= WINDOW;
        var el = markers[i].el;
        el.style.display = near ? "flex" : "none";
        if (near) el.style.opacity = String(1 - Math.abs(delta) / WINDOW);
      }
    }
    function syncLoop() {
      updateMarkers();
      requestAnimationFrame(syncLoop);
    }
    video.addEventListener("timeupdate", updateMarkers);
    video.addEventListener("seeked", updateMarkers);

    video.addEventListener("loadedmetadata", function () {
      duration = video.duration || 0;
      loading.remove();
      startAuto();
      if (markers.length) requestAnimationFrame(syncLoop);
    });
    video.addEventListener("error", function () {
      loading.textContent = "Viewer unavailable";
    });

    // Auto-rotate until the first interaction.
    function startAuto() {
      if (touched || duration === 0) return;
      var prev = performance.now();
      var step = function (now) {
        if (touched) return;
        var dt = (now - prev) / 1000;
        prev = now;
        video.currentTime = (video.currentTime + dt * 0.12 * duration) % duration;
        autoRaf = requestAnimationFrame(step);
      };
      autoRaf = requestAnimationFrame(step);
    }

    function stopAuto() {
      if (autoRaf) cancelAnimationFrame(autoRaf);
      autoRaf = null;
    }

    function markTouched() {
      if (touched) return;
      touched = true;
      wrap.classList.add("touched");
      stopAuto();
    }

    function seekBy(dx) {
      if (duration === 0) return;
      // Full drag across the width ≈ one full revolution.
      var perPx = duration / wrap.clientWidth;
      var t = (video.currentTime - dx * perPx) % duration;
      if (t < 0) t += duration;
      video.currentTime = t;
    }

    wrap.addEventListener("pointerdown", function (e) {
      markTouched();
      dragging = true;
      lastX = e.clientX;
      wrap.classList.add("drag");
      wrap.setPointerCapture && wrap.setPointerCapture(e.pointerId);
    });
    wrap.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      seekBy(e.clientX - lastX);
      lastX = e.clientX;
    });
    var end = function () {
      dragging = false;
      wrap.classList.remove("drag");
    };
    wrap.addEventListener("pointerup", end);
    wrap.addEventListener("pointercancel", end);
    wrap.addEventListener("pointerleave", end);
  }

  // --- utils ---------------------------------------------------------------
  function enc(v) {
    return encodeURIComponent(v);
  }
  function warn(msg) {
    if (window.console) console.warn("[Orbittify] " + msg);
  }
})();
