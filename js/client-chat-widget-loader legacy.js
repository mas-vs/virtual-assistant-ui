// client-chat-widget-loader.js
(function () {
  if (document.getElementById('chat-widget-root')) return; // prevent duplicates

  // Inject styles
  const styles = [
    //  'https://localhost:7057/_content/ValueSpace.VirtualAssistant.Blazor.Components/css/components.css',
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
  const currentScript = document.currentScript;
  const clientId = currentScript.getAttribute('data-client-id');
  const project = currentScript.getAttribute('data-project');
  const webhookurl = currentScript.getAttribute('data-webhookurl'); // ✅ double check lowercase

  window.ChatWidgetConfig = { clientId, project, webhookurl };

  // Inject scripts (synchronously or as module)

  // 1. Load Swiper JS
  const swiperScript = document.createElement('script');
  swiperScript.src = 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js';

  // 2. After Swiper loads, load Effect JS
  swiperScript.onload = () => {
    const effectScript = document.createElement('script');
    effectScript.src = '/js/effect-expo.min.js';

    effectScript.onload = () => {
      // 3. After Effect loads, load Swiper-to-Chat (as a module)
      const swiperToChat = document.createElement('script');
      swiperToChat.type = 'module';
      swiperToChat.src = '/js/swiper-to-chat.mjs';
      document.body.appendChild(swiperToChat);

      swiperToChat.onload = () => {
        const script = document.createElement('script');
        script.type = 'module';
        script.src = '/js/client-web-chat.mjs';
        document.body.appendChild(script);
      }
    };

    document.body.appendChild(effectScript);
  };

  document.body.appendChild(swiperScript);


})();
