window.addEventListener('DOMContentLoaded', () => {
  const iframe = document.createElement('iframe');
  iframe.id = 'chat-widget-frame';
  iframe.src = 'chat-widget.html';
  iframe.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 65px;
    height: 65px;
    border-radius: 50%;
    border: none;
    z-index: 2147483647;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
    transition: all 0.3s ease-in-out;
  `;
  document.body.appendChild(iframe);

  window.addEventListener('message', (event) => {
    if (event.data?.type === 'chat-set-size') {
      iframe.style.height = event.data.height;
      iframe.style.width = event.data.width;
      iframe.style.borderRadius = '12px';
    }
  });
});
