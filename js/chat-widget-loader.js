// chat-widget-loader.js
(function () {
    if (document.getElementById('chat-widget-root')) return; // prevent duplicates
  
    // Inject styles
    const styles = [
      'https://cdn.jsdelivr.net/npm/@n8n/chat/dist/style.css',
      'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css',
      '/css/effect-expo.min.css',
      '/css/web-chat.css'
    ];
  
    styles.forEach(href => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      document.head.appendChild(link);
    });
  
    // Inject container
    const container = document.createElement('div');
    container.id = 'chat-widget-root';
    document.body.appendChild(container);
  
    // Inject scripts (synchronously or as module)
    const script = document.createElement('script');
    script.type = 'module';
    script.src = '/js/web-chat.mjs';
    document.body.appendChild(script);
  
    // Add Swiper and any other non-module scripts
    const swiperScript = document.createElement('script');
    swiperScript.src = 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js';
    document.body.appendChild(swiperScript);
  
    const effectScript = document.createElement('script');
    effectScript.src = '/js/effect-expo.min.js';
    document.body.appendChild(effectScript);
  })();
  