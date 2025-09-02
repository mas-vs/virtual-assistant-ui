// client-chat-widget-loader.js
(function () {
  // Guard: prevent duplicates
  if (document.getElementById('chat-widget-root')) return;

  // Resolve loader script element (supports async/deferred execution)
  const scriptEl = document.currentScript || (function () {
    const scripts = document.querySelectorAll('script[src*="client-chat-widget-loader.js"]');
    return scripts[scripts.length - 1] || null;
  })();

  // Read config via data-attributes
  const clientId = scriptEl && scriptEl.getAttribute('data-client-id');
  const project = scriptEl && scriptEl.getAttribute('data-project');
  const webhookurl = scriptEl && scriptEl.getAttribute('data-webhookurl');

  // Expose config for compatibility
  window.ChatWidgetConfig = window.ChatWidgetConfig || { clientId, project, webhookurl };

  // Debug logger
  const DEBUG = true;
  const log = (...args) => { if (DEBUG && window.console) { try { console.log('[Chat Widget]', ...args); } catch { } } };

  // Basic validation
  if (!clientId || !project || !webhookurl) {
    console.warn('[Chat Widget] Missing required attributes (data-client-id, data-project, data-webhookurl).', { clientId, project, webhookurl });
    return;
  }

  console.log(
    `%cWelcome to ValueSpace.ai 🚀\n%cAI-Powered Hospitality Assistant\n© ${(new Date).getFullYear()} ValueSpace.ai · https://valuespace.ai`,
    "color:#c93656;font-weight:bolder;font-family:Montserrat,sans-serif;font-size:40px;text-shadow:-1px 0 #1b2f5d,0 1px #1b2f5d,1px 0 #1b2f5d,0 -1px #1b2f5d;",
    "font-weight:bolder;"
  );

  // Helper: get origin for preconnect
  let widgetOrigin;
  try { widgetOrigin = new URL(webhookurl).origin; } catch { widgetOrigin = null; }

  // Inject preconnect to chat host (optional as requested)
  if (widgetOrigin) {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = widgetOrigin;
    link.crossOrigin = '';
    document.head.appendChild(link);
    log('Preconnect added for', widgetOrigin);
  }

  // Ensure CSS is present
  const cssHrefs = ['/css/web-chat.css'];
  cssHrefs.forEach(href => {
    if (!document.querySelector(`link[rel="stylesheet"][href="${href}"]`)) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      document.head.appendChild(link);
    }
  });

  // Root container wrapper removed; we will inject directly into body
  log('Root container wrapper skipped');

  // Create launcher button (hidden until connected)
  const launcher = document.createElement('button');
  launcher.id = 'vs-chat-button';
  launcher.type = 'button';
  launcher.setAttribute('aria-label', 'Open chat');
  launcher.style.display = 'none';
  launcher.innerHTML = '<span class="vs-chat-icon" aria-hidden="true">💬</span><span class="vs-close-icon" style="display:none" aria-hidden="true">✕</span>';
  log('Launcher injected (hidden awaiting connected)');

  // Create chat container (initially hidden)
  const container = document.createElement('div');
  container.id = 'vs-chat-container';
  container.style.display = 'none';
  log('Container injected (hidden)');

  // Inner content wrapper removed; iframe will attach directly to container

  // Mobile-only close button inside the container
  const closeBtn = document.createElement('button');
  closeBtn.id = 'vs-chat-close';
  closeBtn.type = 'button';
  closeBtn.setAttribute('aria-label', 'Close chat');
  closeBtn.innerHTML = '✕';
  container.appendChild(closeBtn);

  // Full-screen button (shown only in container mode)
  const fullscreenBtn = document.createElement('button');
  fullscreenBtn.id = 'vs-chat-fullscreen';
  fullscreenBtn.type = 'button';
  fullscreenBtn.setAttribute('aria-label', 'Enter full screen');
  fullscreenBtn.innerHTML = '⛶'; // maximize corners icon
  container.appendChild(fullscreenBtn);

  document.body.appendChild(container);
  document.body.appendChild(launcher);

  // State vars
  let isOpen = false;
  let iframeEl = null;
  let isConnected = false;
  // Explicit view mode state: 'full-screen-view' | 'container-view'
  let viewMode = 'container-view';
  // User override: force full-screen regardless of viewport until closed
  let userForcedFullScreen = false;

  // Media query to decide default mode (width-only to avoid touch-enabled desktops matching incorrectly)
  const modeMQ = window.matchMedia('(max-width: 1024px)');

  function isFullScreenMode() { return viewMode === 'full-screen-view'; }
  function isContainerMode() { return viewMode === 'container-view'; }
  function isOpenInFullScreen() { return isOpen && isFullScreenMode(); }
  function isOpenInContainerView() { return isOpen && isContainerMode(); }

  function applyModeClasses() {
    container.classList.toggle('full-screen-view', isFullScreenMode());
    container.classList.toggle('container-view', isContainerMode());
  }

  function updateViewMode() {
    if (userForcedFullScreen) {
      viewMode = 'full-screen-view';
    } else {
      viewMode = modeMQ.matches ? 'full-screen-view' : 'container-view';
    }
    applyModeClasses();
    // Re-apply current open state so UI matches mode rules when resizing
    setOpen(isOpen);
  }

  // Initialize mode and listen for changes
  updateViewMode();
  if (typeof modeMQ.addEventListener === 'function') {
    modeMQ.addEventListener('change', updateViewMode);
  } else if (typeof modeMQ.addListener === 'function') {
    // Safari/older
    modeMQ.addEventListener(updateViewMode);
  }

  // matchMedia drives viewMode; setOpen() applies the correct UI per current mode.

  function setOpen(open) {
    isOpen = !!open;
    // Branch by mode first
    if (isFullScreenMode()) {
      if (isOpen) {
        // Full-screen open
        container.style.display = 'flex';
        container.classList.add('is-open');
        launcher.style.display = 'none';
        log('Chat opened (full-screen-view)');
      } else {
        // Full-screen closed
        container.style.display = 'none';
        container.classList.remove('is-open');
        launcher.style.display = 'flex';
        log('Chat closed (full-screen-view)');
        // Clear manual override on close
        userForcedFullScreen = false;
        // Recompute view mode from media query immediately so next open uses container on large screens
        viewMode = modeMQ.matches ? 'full-screen-view' : 'container-view';
        applyModeClasses();
      }
    } else {
      if (isOpen) {
        // Container open
        container.style.display = 'flex';
        container.classList.add('is-open');
        launcher.style.display = 'flex';
        log('Chat opened (container-view)');
      } else {
        // Container closed
        container.style.display = 'none';
        container.classList.remove('is-open');
        launcher.style.display = 'flex';
        log('Chat closed (container-view)');
      }
    }

    // Toggle launcher icons consistently
    const chatIcon = launcher.querySelector('.vs-chat-icon');
    const closeIcon = launcher.querySelector('.vs-close-icon');
    if (isOpen && isContainerMode()) {
      // In container mode when open, show the close glyph in launcher
      if (chatIcon) chatIcon.style.display = 'none';
      if (closeIcon) closeIcon.style.display = 'inline-block';
      launcher.setAttribute('aria-label', 'Close chat');
    } else {
      if (chatIcon) chatIcon.style.display = 'inline-block';
      if (closeIcon) closeIcon.style.display = 'none';
      launcher.setAttribute('aria-label', 'Open chat');
    }

    // Focus the launcher only when closing
    if (!isOpen) {
      try { launcher.focus(); } catch (_) { }
    }
  }

  function buildIframe() {
    if (iframeEl) return iframeEl;
    const url = new URL(webhookurl);
    url.searchParams.set('tenant', project);
    url.searchParams.set('_cb', String(Math.floor(Math.random() * 1e6)));

    const iframe = document.createElement('iframe');
    iframe.id = 'vs-widget-iframe';
    iframe.title = 'ValueSpace Chat';
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    iframe.referrerPolicy = 'no-referrer-when-downgrade';
    iframe.style.overflow = 'auto';
    iframe.sandbox = 'allow-same-origin allow-scripts allow-forms allow-popups allow-modals allow-downloads';
    iframe.setAttribute('allow', 'microphone; camera; autoplay; clipboard-read; clipboard-write');
    iframe.src = url.toString();
    container.appendChild(iframe);
    iframeEl = iframe;
    iframe.addEventListener('load', () => log('Iframe loaded', iframe.src));
    iframe.addEventListener('error', (e) => log('Iframe error', e));
    log('Iframe built', { src: iframe.src });
    return iframeEl;
  }

  // Immediately build the iframe after injecting DOM to ensure connected messages can be sent right away
  buildIframe();

  // Toggle behavior and lazy-build iframe (already built above, but keep as safeguard)
  function toggle() {
    if (!iframeEl) buildIframe();
    setOpen(!isOpen);
  }

  // Click handlers
  launcher.addEventListener('click', function (e) {
    e.preventDefault();
    log('Launcher clicked');
    toggle();
  });

  closeBtn.addEventListener('click', function (e) {
    e.preventDefault();
    log('Close button clicked');
    setOpen(false);
  });

  fullscreenBtn.addEventListener('click', function (e) {
    e.preventDefault();
    log('Fullscreen button clicked');
    userForcedFullScreen = true;
    viewMode = 'full-screen-view';
    applyModeClasses();
    setOpen(true);
  });

  // Close on outside click
  document.addEventListener('click', function (event) {
    if (!isOpen) return;
    if (!container.contains(event.target) && event.target !== launcher && !launcher.contains(event.target)) {
      setOpen(false);
    }
  });

  // ESC to close
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && isOpen) setOpen(false);
  });

  // Message channel: show launcher only after iframe reports connected
  window.addEventListener('message', function (event) {
    // As requested, no parent-origin restriction; still validate shape
    const data = event && event.data;
    if (!data || typeof data !== 'object') return;

    const isConnectedMsg = (data.type === 'chat.connected' || data.type === 'connected') && (data.source ? data.source === 'vs-chat' : true);
    if (isConnectedMsg) {
      isConnected = true;
      launcher.style.display = 'flex';
      log('Connected event received -> launcher shown');
    }
    if (data.type === 'chat.resize' && typeof data.height === 'number') {
      container.style.height = data.height + 'px';
      log('Resize event', data.height);
    }
    if (data.type === 'chat.unread' && typeof data.count === 'number') {
      launcher.dataset.unread = String(data.count);
      log('Unread event', data.count);
    }
  });

  // Public API
  window.ChatWidget = window.ChatWidget || {
    open: () => { if (!iframeEl) buildIframe(); setOpen(true); },
    close: () => setOpen(false),
    toggle: () => toggle(),
    send: (eventName, payload) => {
      if (!iframeEl) return false;
      const msg = { type: eventName, payload };
      log('Sending to iframe', msg);
      iframeEl.contentWindow && iframeEl.contentWindow.postMessage(msg, '*');
      return true;
    },
    updateConfig: (partial) => { Object.assign(window.ChatWidgetConfig, (partial || {})); }
  };
})();
