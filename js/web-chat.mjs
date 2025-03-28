import { createChat } from 'https://cdn.jsdelivr.net/npm/@n8n/chat/dist/chat.bundle.es.js';

console.log(`%cValueSpace.ai\n%cAI-powered hotel chatbot, \u00A9 ${(new Date).getFullYear()} ValueSpace.ai\n visit https://valuespace.ai`, "color:#c93656;font-weight:bolder;font-family:Montserrat,sans-serif;font-size:40px;text-shadow:-1px 0 #1b2f5d,0 1px #1b2f5d,1px 0 #1b2f5d,0 -1px #1b2f5d;", "font-weight:bolder;");

// Function to dynamically inject the modalImageViewer widget
function injectModalViewer() {
	if (document.getElementById('modalImageViewer')) return; // Prevent duplicate injection
	const modalHTML = `
		<div class="modal" style="display: none;">
			<div class="modal-image-viewer" id="modalImageViewer">
				<div class="swiper">
					<div class="swiper-wrapper" id="swiperWrapper"></div>
					<div class="swiper-button-next"></div>
					<div class="swiper-button-prev"></div>
					<button class="diapo-close-button" onclick="closeModalImageViewer()">×</button>
				</div>
			</div>
		</div>
	`;

	document.body.insertAdjacentHTML('beforeend', modalHTML);
}


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
}


// Add this function to handle wheel events
function handleWheel(event) {
	if (!isGalleryOpen || !swiper) return;

	event.preventDefault();

	const now = Date.now();
	if (now - lastWheelTimestamp < 50) return; // Debounce wheel events
	lastWheelTimestamp = now;

	if (event.deltaY > 0) {
		swiper.slideNext();
	} else if (event.deltaY < 0) {
		swiper.slidePrev();
	}
}

let currentImageIndex = 0;
let images = [];
let swiper;


// Add these variables at the top of your file
let isGalleryOpen = false;
let lastWheelTimestamp = 0;

document.addEventListener('click', function (event) {
	if (event.target.tagName === 'IMG' && event.target.closest('.chat-message')) {
		images = Array.from(document.querySelectorAll('.chat-message img'));
		const clickedImageIndex = images.indexOf(event.target);
		parent.openModalImageViewer(clickedImageIndex);
	} else if (event.target.closest('.more-images')) {
		images = Array.from(document.querySelectorAll('.chat-message img'));
		parent.openModalImageViewer(3);
	}
});

injectModalViewer();


window.openModalImageViewer = function (index) {
	currentImageIndex = index;
	const swiperWrapper = document.getElementById('swiperWrapper');
	swiperWrapper.innerHTML = ''; // Clear existing slides

	const modalImageViewer = document.getElementById('modalImageViewer');
	modalImageViewer.style.display = 'flex';
	const modalContainer = document.querySelector('.modal');
	modalContainer.style.display = 'flex';

	images.forEach((img, i) => {
		const slide = document.createElement('div');
		slide.className = 'swiper-slide';
		const expoContainer = document.createElement('div');
		expoContainer.className = 'expo-container';
		const imageElement = document.createElement('img');
		imageElement.className = 'expo-image';
		imageElement.src = img.src;
		expoContainer.appendChild(imageElement);
		if (img.alt) {
			const expoContent = document.createElement('div');
			expoContent.className = 'expo-content';
			expoContent.textContent = img.alt;
			expoContainer.appendChild(expoContent);
		}
		slide.appendChild(expoContainer);
		swiperWrapper.appendChild(slide);
	});

	isGalleryOpen = true;
	document.body.style.overflow = 'hidden'; // Prevent body scrolling
	window.addEventListener('wheel', handleWheel, { passive: false });

	if (swiper) {
		swiper.update();
		swiper.slideTo(currentImageIndex, 0, false);
	}

	const chatWindowToggle = document.querySelector('.chat-window-toggle');
	if (chatWindowToggle) chatWindowToggle.click();
}


window.closeModalImageViewer = function () {
	const chatWindowToggle = document.querySelector('.chat-window-toggle');

	const swiperWrapper = document.getElementById('swiperWrapper');
	if (swiperWrapper) {
		swiperWrapper.innerHTML = ''; // Clear existing slides
	}

	isGalleryOpen = false;
	document.body.style.overflow = ''; // Restore body scrolling
	window.removeEventListener('wheel', handleWheel);

	const modalImageViewer = document.getElementById('modalImageViewer');
	modalImageViewer.style.display = 'none';
	const modalContainer = document.querySelector('.modal');
	modalContainer.style.display = 'none';

	if (chatWindowToggle) chatWindowToggle.click();
}

// Initialize Swiper only if it's not already initialized
if (!swiper) {
	swiper = new Swiper('.swiper', {
		direction: 'horizontal',
		// pass EffectExpo module to modules
		modules: [EffectExpo],
		// specify "expo" effect
		effect: 'expo',
		// "expo" effect mainly design to work with slidesPerView: 1.5
		slidesPerView: 1,
		// "expo" effect parameters
		expoEffect: {
			// image scale multiplier, 1.125 is minimum
			imageScale: 1.125,
			// image offset multiplier, recommended to increase for slidesPerView > 2 for better parallax effect
			imageOffset: 1,
			// side slides scale multiplier, 1.25 is the minimum
			scale: 1.25,
			// side slides rotate angle (in degrees)
			rotate: 30,
			// side slides grayscale effect
			grayscale: true,
		},
		navigation: {
			nextEl: '.swiper-button-next',
			prevEl: '.swiper-button-prev',
		},
		grabCursor: true,
		spaceBetween: 0,
		breakpoints: 
			{
			// When screen width is ≤ 1024px (tablet)
			2048: {
				slidesPerView: 1.5,
				spaceBetween: 16,
				rotate: 30,
			},
			768: {
				slidesPerView: 1,
				spaceBetween: 8,
				rotate: 0,
			},
			480: {
				slidesPerView: 1,
				spaceBetween: 0,
				rotate: 0,
			}
		},
	});

	// light theme
	//document.body.classList.toggle('light')
	// dark theme
	document.body.classList.toggle('content-visible')


	SwitchToHorizontalView();


	// Ensure buttons are hidden on small screens
	const mediaQuery = window.matchMedia('(max-width: 768px)');
	function handleMediaChange(e) {
		const navButtons = document.querySelectorAll('.swiper-button-next, .swiper-button-prev');
		if (e.matches) {
			SwitchToVerticalView();
		} else {
			SwitchToHorizontalView();
		}
	}
	mediaQuery.addListener(handleMediaChange);
	handleMediaChange(mediaQuery);


	function SwitchToVerticalView() {
		if (swiper.params.direction === 'horizontal') {
			swiper.originalParams.direction = 'vertical';
			swiper.changeDirection();
			swiper.update();
		}
	}

	function SwitchToHorizontalView() {
		if (swiper.params.direction === 'vertical') {
			swiper.originalParams.direction = 'horizontal'
			swiper.changeDirection();
			swiper.update();
		}
	}

	document.addEventListener('mousedown', function (event) {
		const modalContainer = document.querySelector('.modal');
		const clickedInsideSlide = event.target.closest('.swiper-expo');
		const swiperButtonNext = event.target.closest('.swiper-button-next');
		const swiperButtonNPrev = event.target.closest('.swiper-button-prev');
		if (modalContainer && ((clickedInsideSlide && !swiperButtonNext && !swiperButtonNPrev) || event.target === modalContainer)) {
			closeModalImageViewer();
		}
	});

};


function groupImages() {
	const imageContainers = document.querySelectorAll('.chat-message-markdown ol');
	imageContainers.forEach(container => {
		const imageElements = container.querySelectorAll('li img');
		if (imageElements.length >= 4) {
			const imageGrid = document.createElement('div');
			imageGrid.className = 'image-grid';

			for (let i = 0; i < 4; i++) {
				const imgWrapper = document.createElement('div');
				if (i === 3 && imageElements.length > 4) {
					imgWrapper.className = 'more-images';
					imgWrapper.setAttribute('data-count', `+${imageElements.length - 3}`);
				}
				imgWrapper.appendChild(imageElements[i].cloneNode(true));
				imageGrid.appendChild(imgWrapper);
			}

			container.innerHTML = '';
			container.appendChild(imageGrid);

			const hiddenImages = document.createElement('div');
			hiddenImages.className = 'hidden-images';
			for (let i = 4; i < imageElements.length; i++) {
				hiddenImages.appendChild(imageElements[i].cloneNode(true));
			}
			container.appendChild(hiddenImages);
		} else {
			imageElements.forEach(img => {
				if (!img.closest('.image-grid')) {
					const altText = img.alt;
					if (altText) {
						const caption = document.createElement('div');
						caption.className = 'image-caption';
						caption.textContent = altText;
						img.insertAdjacentElement('afterend', caption);
					}
				}
			});
		}
	});
}

const chatMessagesContainer = document.querySelector('.chat-messages-list');
const observer = new MutationObserver(() => {
	images = Array.from(document.querySelectorAll('.chat-message img'));
	groupImages();
});

observer.observe(chatMessagesContainer, { childList: true, subtree: true });

const chatWindow = document.querySelector('.chat-window');

if (chatWindow) {
  const observer = new MutationObserver(() => {
    const isVisible = getComputedStyle(chatWindow).display !== 'none';

    if (isVisible) {
      const modal = document.querySelector('.modal');
      if (isGalleryOpen) {
        console.log('[Chat] Opened → Closing diaporama...');
        closeModalImageViewer();
		const chatWindowToggle = document.querySelector('.chat-window-toggle');
		if (chatWindowToggle) chatWindowToggle.click();
      }
    }
  });

  observer.observe(chatWindow, {
    attributes: true,
    attributeFilter: ['style'],
  });
}
