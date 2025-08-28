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

  document.body.appendChild(container);
  document.body.appendChild(launcher);

  // State vars
  let isOpen = false;
  let iframeEl = null;
  let isConnected = false;

  function setOpen(open) {
    isOpen = !!open;
    if (isOpen) {
      container.style.display = 'flex';
      // Raise the chat container above the launcher vertically
      container.style.bottom = '100px'; // launcher: 60px height + 20px bottom + 20px gap
      log('Chat opened');
      const chatIcon = launcher.querySelector('.vs-chat-icon');
      const closeIcon = launcher.querySelector('.vs-close-icon');
      if (chatIcon) chatIcon.style.display = 'none';
      if (closeIcon) closeIcon.style.display = 'inline-block';
    } else {
      container.style.display = 'none';
      container.style.bottom = '20px';
      log('Chat closed');
      const chatIcon = launcher.querySelector('.vs-chat-icon');
      const closeIcon = launcher.querySelector('.vs-close-icon');
      if (chatIcon) chatIcon.style.display = 'inline-block';
      if (closeIcon) closeIcon.style.display = 'none';
      launcher.setAttribute('aria-label', 'Open chat');
      launcher.focus();
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
    iframe.sandbox = 'allow-same-origin allow-scripts allow-forms allow-popups allow-modals';
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
    log('Message received', { origin: event.origin, data });
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
