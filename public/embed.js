/**
 * LeftClick CLM - Embed Script
 * Ermöglicht das Einbetten von Lead Magnets auf externen Websites
 */

(function () {
  "use strict";

  // Configuration
  var BASE_URL = "{{BASE_URL}}"; // Will be replaced at build time or configured
  var LeftClickCLM = (window.LeftClickCLM = window.LeftClickCLM || {});

  // Default configuration
  var defaultConfig = {
    type: "popup", // popup, slide_in, inline
    position: "bottom-right",
    trigger: "click",
    triggerValue: 5,
    width: "500px",
    height: "600px",
    zIndex: 999999,
    overlayOpacity: 0.5,
    animation: true,
  };

  // State
  var state = {
    isOpen: false,
    hasTriggered: false,
    config: null,
    iframe: null,
    overlay: null,
    container: null,
  };

  // Styles
  var styles = {
    overlay: {
      position: "fixed",
      top: "0",
      left: "0",
      right: "0",
      bottom: "0",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      zIndex: "999998",
      opacity: "0",
      transition: "opacity 0.3s ease",
      cursor: "pointer",
    },
    container: {
      position: "fixed",
      zIndex: "999999",
      backgroundColor: "#FFFFFF",
      borderRadius: "12px",
      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
      overflow: "hidden",
      transform: "scale(0.95)",
      opacity: "0",
      transition: "all 0.3s ease",
    },
    iframe: {
      width: "100%",
      height: "100%",
      border: "none",
    },
    closeButton: {
      position: "absolute",
      top: "10px",
      right: "10px",
      width: "32px",
      height: "32px",
      borderRadius: "50%",
      backgroundColor: "#F3F4F6",
      border: "none",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "18px",
      color: "#6B7280",
      transition: "all 0.2s ease",
      zIndex: "10",
    },
  };

  // Initialize
  LeftClickCLM.init = function (config) {
    state.config = Object.assign({}, defaultConfig, config);

    // Determine base URL
    if (!BASE_URL || BASE_URL === "{{BASE_URL}}") {
      var scripts = document.getElementsByTagName("script");
      for (var i = 0; i < scripts.length; i++) {
        if (scripts[i].src && scripts[i].src.indexOf("embed.js") > -1) {
          BASE_URL = scripts[i].src.replace(/\/embed\.js.*$/, "");
          break;
        }
      }
    }

    // Setup trigger
    setupTrigger();

    // Setup inline if applicable
    if (state.config.type === "inline") {
      setupInline();
    }
  };

  // Setup trigger mechanism
  function setupTrigger() {
    var config = state.config;

    switch (config.trigger) {
      case "click":
        setupClickTrigger();
        break;
      case "delay":
        setTimeout(function () {
          if (!state.hasTriggered) {
            open();
          }
        }, (config.triggerValue || 5) * 1000);
        break;
      case "scroll":
        setupScrollTrigger();
        break;
      case "exit":
        setupExitIntentTrigger();
        break;
    }
  }

  // Click trigger setup
  function setupClickTrigger() {
    document.addEventListener("click", function (e) {
      var target = e.target;
      while (target) {
        if (target.hasAttribute && target.hasAttribute("data-leftclick-trigger")) {
          var triggerSlug = target.getAttribute("data-leftclick-trigger");
          if (triggerSlug === state.config.slug) {
            e.preventDefault();
            open();
            break;
          }
        }
        target = target.parentElement;
      }
    });
  }

  // Scroll trigger setup
  function setupScrollTrigger() {
    var triggered = false;
    var scrollPercent = state.config.triggerValue || 50;

    window.addEventListener("scroll", function () {
      if (triggered) return;

      var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      var docHeight =
        document.documentElement.scrollHeight - document.documentElement.clientHeight;
      var currentPercent = (scrollTop / docHeight) * 100;

      if (currentPercent >= scrollPercent) {
        triggered = true;
        open();
      }
    });
  }

  // Exit intent trigger setup
  function setupExitIntentTrigger() {
    document.addEventListener("mouseleave", function (e) {
      if (e.clientY <= 0 && !state.hasTriggered) {
        open();
      }
    });
  }

  // Setup inline widget
  function setupInline() {
    var container = document.getElementById("leftclick-clm-widget");
    if (!container) {
      container = document.querySelector('[data-slug="' + state.config.slug + '"]');
    }
    if (!container) return;

    var iframe = createIframe();
    iframe.style.width = "100%";
    iframe.style.height = state.config.height || "600px";
    iframe.style.borderRadius = "12px";
    container.appendChild(iframe);
  }

  // Create iframe
  function createIframe() {
    var iframe = document.createElement("iframe");
    iframe.src = BASE_URL + "/widget/" + state.config.slug;
    iframe.setAttribute("frameborder", "0");
    iframe.setAttribute("allow", "clipboard-write");
    iframe.setAttribute("loading", "lazy");
    applyStyles(iframe, styles.iframe);
    return iframe;
  }

  // Open widget
  function open() {
    if (state.isOpen) return;
    state.isOpen = true;
    state.hasTriggered = true;

    var config = state.config;

    // Create overlay
    state.overlay = document.createElement("div");
    applyStyles(state.overlay, styles.overlay);
    state.overlay.style.opacity = config.overlayOpacity || "0.5";
    state.overlay.addEventListener("click", close);

    // Create container
    state.container = document.createElement("div");
    applyStyles(state.container, styles.container);
    state.container.style.width = config.width || "500px";
    state.container.style.height = config.height || "600px";

    // Position
    var pos = getPosition(config.position, config.type);
    Object.assign(state.container.style, pos);

    // Create close button
    var closeBtn = document.createElement("button");
    applyStyles(closeBtn, styles.closeButton);
    closeBtn.innerHTML = "×";
    closeBtn.setAttribute("aria-label", "Schließen");
    closeBtn.addEventListener("click", close);
    closeBtn.addEventListener("mouseenter", function () {
      closeBtn.style.backgroundColor = "#E5E7EB";
    });
    closeBtn.addEventListener("mouseleave", function () {
      closeBtn.style.backgroundColor = "#F3F4F6";
    });

    // Create iframe
    state.iframe = createIframe();

    // Assemble
    state.container.appendChild(closeBtn);
    state.container.appendChild(state.iframe);

    // Add to DOM
    document.body.appendChild(state.overlay);
    document.body.appendChild(state.container);

    // Animate in
    requestAnimationFrame(function () {
      state.overlay.style.opacity = String(config.overlayOpacity);
      state.container.style.transform = "scale(1)";
      state.container.style.opacity = "1";
    });

    // Prevent body scroll
    document.body.style.overflow = "hidden";
  }

  // Close widget
  function close() {
    if (!state.isOpen) return;
    state.isOpen = false;

    // Animate out
    state.overlay.style.opacity = "0";
    state.container.style.transform = "scale(0.95)";
    state.container.style.opacity = "0";

    setTimeout(function () {
      if (state.overlay && state.overlay.parentNode) {
        state.overlay.parentNode.removeChild(state.overlay);
      }
      if (state.container && state.container.parentNode) {
        state.container.parentNode.removeChild(state.container);
      }
      state.overlay = null;
      state.container = null;
      state.iframe = null;
      document.body.style.overflow = "";
    }, 300);
  }

  // Get position styles
  function getPosition(position, type) {
    var pos = {};

    if (type === "popup") {
      pos.top = "50%";
      pos.left = "50%";
      pos.transform = "translate(-50%, -50%) scale(0.95)";
      return pos;
    }

    // Slide-in positions
    switch (position) {
      case "bottom-right":
        pos.bottom = "20px";
        pos.right = "20px";
        break;
      case "bottom-left":
        pos.bottom = "20px";
        pos.left = "20px";
        break;
      case "center":
        pos.top = "50%";
        pos.left = "50%";
        pos.transform = "translate(-50%, -50%) scale(0.95)";
        break;
      default:
        pos.bottom = "20px";
        pos.right = "20px";
    }

    return pos;
  }

  // Apply styles helper
  function applyStyles(element, styleObj) {
    for (var key in styleObj) {
      if (styleObj.hasOwnProperty(key)) {
        element.style[key] = styleObj[key];
      }
    }
  }

  // Public methods
  LeftClickCLM.open = open;
  LeftClickCLM.close = close;

  // Auto-init for inline embeds
  document.addEventListener("DOMContentLoaded", function () {
    var inlineWidgets = document.querySelectorAll("[data-leftclick-slug]");
    inlineWidgets.forEach(function (el) {
      var slug = el.getAttribute("data-leftclick-slug");
      if (slug) {
        LeftClickCLM.init({
          slug: slug,
          type: "inline",
        });
      }
    });
  });
})();

