console.log(
	`%cWelcome to ValueSpace.ai 🚀\n%cAI-Powered Hospitality Assistant\n© ${(new Date).getFullYear()} ValueSpace.ai · https://valuespace.ai`,
	"color:#c93656;font-weight:bolder;font-family:Montserrat,sans-serif;font-size:40px;text-shadow:-1px 0 #1b2f5d,0 1px #1b2f5d,1px 0 #1b2f5d,0 -1px #1b2f5d;",
	"font-weight:bolder;"
);

const config = window.ChatWidgetConfig || {};
const { clientId, project, webhookurl } = config;

let isChatOpen = false;

/**
 * Toggle chat visibility
 */
function toggleChat() {
	const chatContainer = document.getElementById('vs-chat-container');
	const chatButton = document.getElementById('vs-chat-button');
	const chatIcon = document.querySelector('.vs-chat-icon');
	const closeIcon = document.querySelector('.vs-close-icon');

	if (!chatContainer || !chatButton || !chatIcon || !closeIcon) return;

	if (chatContainer.style.display === 'none' || !chatContainer.style.display) {
		// Show chat
		chatContainer.style.display = 'flex';
		chatIcon.style.display = 'none';
		closeIcon.style.display = 'block';
		chatButton.setAttribute('aria-label', 'Close chat');
		isChatOpen = true;

		// Focus iframe after a short delay
		setTimeout(() => {
			const iframe = document.getElementById('vs-widget-iframe');
			if (iframe) iframe.focus();
		}, 100);
	} else {
		// Hide chat
		chatContainer.style.display = 'none';
		chatIcon.style.display = 'block';
		closeIcon.style.display = 'none';
		chatButton.setAttribute('aria-label', 'Open chat');
		chatButton.focus();
		isChatOpen = false;
	}
}

/**
 * Initialize the widget by creating and appending the iframe
 */
function initWidget() {
	console.log('ValueSpace Widget: Initializing widget');

	const chatContainer = document.getElementById('vs-chat-container');
	const chatButton = document.getElementById('vs-chat-button');
	const chatContent = document.getElementById('vs-chat-content');

	if (!chatContainer || !chatButton || !chatContent) {
		console.error('ValueSpace Widget: Required elements not found');
		return;
	}

	// Create iframe
	const iframe = document.createElement('iframe');
	iframe.id = 'vs-widget-iframe';
	iframe.style.width = '100%';
	iframe.style.height = '100%';
	iframe.style.border = 'none';
	iframe.title = 'ValueSpace Chat';
	iframe.referrerPolicy = 'no-referrer-when-downgrade';
	iframe.style.overflow = 'auto';
	iframe.style.webkitOverflowScrolling = 'touch';
	iframe.style.overscrollBehavior = 'contain';
	iframe.sandbox = 'allow-same-origin allow-scripts allow-forms allow-popups allow-modals';
	iframe.setAttribute('allow', 'microphone; camera; autoplay');

	// Add cache buster to prevent caching
	const cacheBuster = Math.floor(Math.random() * 1000000);
	iframe.src = ChatWidgetConfig.webhookurl.includes('?')
		? `${ChatWidgetConfig.webhookurl}&_cb=${cacheBuster}`
		: `${ChatWidgetConfig.webhookurl}?&tenant=${ChatWidgetConfig.project}&_cb=${cacheBuster}`;

	// Add iframe to content area
	chatContent.appendChild(iframe);

	// Set up close button
	const closeBtn = document.getElementById('vs-close-chat');
	if (closeBtn) {
		closeBtn.addEventListener('click', function (e) {
			e.stopPropagation();
			toggleChat();
		});
	}

	// Close when clicking outside
	document.addEventListener('click', function (event) {
		if (isChatOpen &&
			chatContainer &&
			!chatContainer.contains(event.target) &&
			event.target !== chatButton &&
			!chatButton.contains(event.target)) {
			toggleChat();
		}
	});

	console.log('ValueSpace Widget: Widget initialized');
}

// This legacy module no longer auto-initializes DOM. The new loader handles injection.
if (typeof ChatWidgetConfig === 'undefined' || !ChatWidgetConfig.clientId) {
	console.log('ValueSpace widget is not enabled as valuespace.ai was not connected to the wordpress website.');
} else {
	console.log('ValueSpace Widget: Loader-managed initialization with client ID:', ChatWidgetConfig.clientId);
}

// Lightweight bridge: when iframe signals connected, emit chatWidgetReady for host pages
window.addEventListener('message', (event) => {
	const data = event && event.data;
	console.log("event received: " + event);
	if (!data || typeof data !== 'object') return;
	if (data.type === 'chat.connected' || data.type === 'connected') {
		document.dispatchEvent(new CustomEvent('chatWidgetReady'));
	}
});
