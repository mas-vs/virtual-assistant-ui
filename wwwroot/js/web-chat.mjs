import { createChat } from 'https://cdn.jsdelivr.net/npm/@n8n/chat/dist/chat.bundle.es.js';


// Function to dynamically inject the modalImageViewer widget
function injectModalViewer() {
	console.log('injectModalViewer');
	if (document.getElementById('modalImageViewer')) return; // Prevent duplicate injection
	console.log('modalImageViewer found');
	const modalHTML = `
		<div class="modal" style="display: none;">
			<div class="modal-image-viewer" id="modalImageViewer">
				<div class="demo-nav">
					<button class="demo-nav-rotate active">
						<span>Rotate</span>
					</button>
					<button class="demo-nav-theme">
						<svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="currentColor">
							<path d="M480-280q-83 0-141.5-58.5T280-480q0-83 58.5-141.5T480-680q83 0 141.5 58.5T680-480q0 83-58.5 141.5T480-280ZM200-440H40v-80h160v80Zm720 0H760v-80h160v80ZM440-760v-160h80v160h-80Zm0 720v-160h80v160h-80ZM256-650l-101-97 57-59 96 100-52 56Zm492 496-97-101 53-55 101 97-57 59Zm-98-550 97-101 59 57-100 96-56-52ZM154-212l101-97 55 53-97 101-59-57Z" />
						</svg>
					</button>
					<button class="demo-nav-content">
						<svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="currentColor">
							<path d="M120-240v-80h480v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z" />
						</svg>
					</button>
					<button class="toggle-nav-buttons active"><></button>
				</div>
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


let mouseDownInsideModal = false;
let mouseDownOutsideModal = false;

const modalImageViewer = document.querySelector('.modal-image-viewer');
if (modalImageViewer) {
	// Removed event listener
}

const modalContainer = document.querySelector('.modal');
if (modalContainer) {
	modalContainer.addEventListener('mousedown', () => {
		mouseDownOutsideModal = true;
	});

	modalContainer.addEventListener('mouseup', () => {
		if (mouseDownOutsideModal) {
			closeModalImageViewer();
			mouseDownOutsideModal = false;
		}
	});
}

document.addEventListener('mouseup', () => {
	mouseDownInsideModal = false;
});

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

console.log(`%cValueSpace.ai\n%cAI-powered hotel chatbot, \u00A9 ${(new Date).getFullYear()} ValueSpace.ai\n visit https://valuespace.ai`, "color:#c93656;font-weight:bolder;font-family:Montserrat,sans-serif;font-size:40px;text-shadow:-1px 0 #1b2f5d,0 1px #1b2f5d,1px 0 #1b2f5d,0 -1px #1b2f5d;", "font-weight:bolder;");

createChat({
	webhookUrl: 'https://valuespace.app.n8n.cloud/webhook/b0cd5e28-a448-47de-b150-9d244d37e270/chat',
	mode: 'window',
	metadata: { project: 'vesperworld' },
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

let currentImageIndex = 0;
let images = [];
let swiper;

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


	if (swiper) {
		swiper.update();
		swiper.slideTo(currentImageIndex, 0, false);
	}

	const chatWindowToggle = document.querySelector('.chat-window-toggle');

	const buttonSwitchArrows = document.querySelector('.toggle-nav-buttons');
	if (!buttonSwitchArrows.classList.contains('active')) {
		buttonSwitchArrows.click();
	}

	if (chatWindowToggle) chatWindowToggle.click();
}

window.closeModalImageViewer = function () {
	const chatWindowToggle = document.querySelector('.chat-window-toggle');

	const buttonSwitchArrows = document.querySelector('.toggle-nav-buttons');
	if (buttonSwitchArrows.classList.contains('active')) {
		buttonSwitchArrows.click();
	}

	const swiperWrapper = document.getElementById('swiperWrapper');
	if (swiperWrapper) {
		swiperWrapper.innerHTML = ''; // Clear existing slides
	}

	const modalImageViewer = document.getElementById('modalImageViewer');
	modalImageViewer.style.display = 'none';
	const modalContainer = document.querySelector('.modal');
	modalContainer.style.display = 'none';

	if (chatWindowToggle) chatWindowToggle.click();
}

document.addEventListener('click', function (event) {
	if (event.target.tagName === 'IMG' && event.target.closest('.chat-message')) {
		images = Array.from(document.querySelectorAll('.chat-message img'));
		const clickedImageIndex = images.indexOf(event.target);
		openModalImageViewer(clickedImageIndex);
	} else if (event.target.closest('.more-images')) {
		images = Array.from(document.querySelectorAll('.chat-message img'));
		openModalImageViewer(3);
	}
});

injectModalViewer();

document.addEventListener('click', function (event) {
	const modalContainer = document.querySelector('.modal');
	if (modalContainer && event.target === modalContainer && mouseDownTarget === modalContainer) {
		closeModalImageViewer();
		mouseDownTarget = null; // Reset mouseDownTarget to null
	}
});

const chatMessagesContainer = document.querySelector('.chat-messages-list');
const observer = new MutationObserver(() => {
	images = Array.from(document.querySelectorAll('.chat-message img'));
	groupImages();
});

observer.observe(chatMessagesContainer, { childList: true, subtree: true });

let mouseDownTarget = null;

document.addEventListener('mousedown', function (event) {
	mouseDownTarget = event.target;
});

// Initialize Swiper only if it's not already initialized
if (!swiper) {
	swiper = new Swiper('.swiper', {
		direction: 'horizontal',
		// pass EffectExpo module to modules
		modules: [EffectExpo],
		// specify "expo" effect
		effect: 'expo',
		// "expo" effect mainly design to work with slidesPerView: 1.5
		slidesPerView: 1.5,
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
		spaceBetween: 16,
		breakpoints: {
			768: {
				spaceBetween: 32,
			},
		},
	});

	SwitchToHorizontalView();

	document.querySelector('.demo-nav-theme').addEventListener('click', (e) => {
		document.body.classList.toggle('light')
		e.target.closest('button').classList.toggle('active')
	})
	document.querySelector('.demo-nav-content').addEventListener('click', (e) => {
		document.body.classList.toggle('content-visible')
		e.target.closest('button').classList.toggle('active')
	})

	const buttonSwitchArrows = document.querySelector('.toggle-nav-buttons');
	buttonSwitchArrows.addEventListener('click', () => {
		if (buttonSwitchArrows.classList.contains('active')) {
			buttonSwitchArrows.classList.remove('active');
		}
		else {
			buttonSwitchArrows.classList.add('active');
		}

		const navButtons = document.querySelectorAll('.swiper-button-next, .swiper-button-prev');
		navButtons.forEach(button => {
			button.style.display = button.style.display === 'none' ? 'flex' : 'none';
		});
	});

	// Ensure buttons are hidden on small screens
	const mediaQuery = window.matchMedia('(max-width: 768px)');
	function handleMediaChange(e) {
		const navButtons = document.querySelectorAll('.swiper-button-next, .swiper-button-prev');
		if (e.matches) {
			navButtons.forEach(button => {
				button.style.display = 'none';
			});
			SwitchToVerticalView();
		} else {
			navButtons.forEach(button => {
				button.style.display = 'flex';
				if (buttonSwitchArrows.classList.contains('active')) {
					button.style.display = 'flex';
				}
			});
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
};	
