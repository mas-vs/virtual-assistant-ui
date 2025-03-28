import { createChat } from 'https://cdn.jsdelivr.net/npm/@n8n/chat/dist/chat.bundle.es.js';

console.log(
	`%cWelcome to ValueSpace.ai 🚀\n%cAI-Powered Hospitality Assistant\n© ${(new Date).getFullYear()} ValueSpace.ai · https://valuespace.ai`,
	"color:#c93656;font-weight:bolder;font-family:Montserrat,sans-serif;font-size:40px;text-shadow:-1px 0 #1b2f5d,0 1px #1b2f5d,1px 0 #1b2f5d,0 -1px #1b2f5d;",
	"font-weight:bolder;"
  );
  
const config = window.ChatWidgetConfig || {};
const { clientId, project, webhookurl } = config;

if (!clientId || !project || !webhookurl) {
	console.warn('[Chat Widget] Required parameters are missing. Aborting initialization.', {
		clientId,
		project,
		webhookurl
	});
}
else {
	createChat({
		webhookUrl: webhookurl,
		mode: 'window',
		metadata: { 
			client_id: clientId,
			project: project,
		},
		showWelcomeScreen: false,
		initialMessages: [
			'Hi there! \uD83D\uDC4B',
			'My name is Lujo. How can I assist you today?',
		],
		i18n: {
			en: {
				title: 'Hi there! \uD83D\uDC4B',
				subtitle: "Start a chat. We're here to help you 24/7.",
				footer: 'Checking bot compliance rules <link here...>',
				getStarted: 'New Conversation',
				inputPlaceholder: 'Type your question..',
			},
		},
		allowFileUploads: true,
		allowedFilesMimeTypes: '.pdf;.doc;.docs;.txt;.png;.jpg;.jpeg',
	});

	// After chat widget is initialized
	document.dispatchEvent(new CustomEvent('chatWidgetReady'));
}

