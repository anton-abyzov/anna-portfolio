// Sidebar Navigation
const sidebar = document.querySelector('.sidebar');
const sidebarToggle = document.querySelector('.sidebar-toggle');
const sidebarLinks = document.querySelectorAll('.sidebar-link');
const body = document.body;

// Toggle sidebar expansion
sidebarToggle.addEventListener('click', () => {
    sidebar.classList.toggle('expanded');
    body.classList.toggle('sidebar-expanded');
});

// Close sidebar when clicking a link (on mobile)
sidebarLinks.forEach(link => {
    link.addEventListener('click', () => {
        if (window.innerWidth < 768) {
            sidebar.classList.remove('expanded');
            body.classList.remove('sidebar-expanded');
        }
    });
});

// Update active link based on scroll position
window.addEventListener('scroll', () => {
    let current = '';
    const sections = document.querySelectorAll('section');

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (window.pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });

    sidebarLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').slice(1) === current) {
            link.classList.add('active');
        }
    });
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});


// Video Modal Functionality
const videoModal = document.getElementById('videoModal');
const videoFrame = document.getElementById('videoFrame');
const modalTitle = document.getElementById('modalTitle');
const modalClose = document.querySelector('.modal-close');
const modalOverlay = document.querySelector('.modal-overlay');

// Performance and dance cards with video functionality
const videoCards = document.querySelectorAll('[data-video]');

videoCards.forEach(card => {
    card.addEventListener('click', () => {
        const videoId = card.getAttribute('data-video');
        const title = card.querySelector('h3')?.textContent || 'Anna\'s Performance';
        if (videoId) {
            openVideoModal(videoId, title);
        }
    });
});

function openVideoModal(videoId, title = 'Anna\'s Performance') {
    const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
    videoFrame.src = embedUrl;
    modalTitle.textContent = `🎵 ${title}`;
    videoModal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Add celebration effect
    createConfetti();
}

function closeVideoModal() {
    videoFrame.src = '';
    videoModal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

modalClose.addEventListener('click', closeVideoModal);
modalOverlay.addEventListener('click', closeVideoModal);

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && videoModal.classList.contains('active')) {
        closeVideoModal();
    }
});

// Testimonials Carousel
let currentTestimonial = 0;
const testimonials = document.querySelectorAll('.testimonial');
const navDots = document.querySelectorAll('.nav-dot');

function showTestimonial(index) {
    // Hide all testimonials
    testimonials.forEach(testimonial => {
        testimonial.classList.remove('active');
    });

    // Remove active class from all dots
    navDots.forEach(dot => {
        dot.classList.remove('active');
    });

    // Show selected testimonial
    testimonials[index].classList.add('active');
    navDots[index].classList.add('active');
    currentTestimonial = index;
}

// Auto-rotate testimonials
setInterval(() => {
    currentTestimonial = (currentTestimonial + 1) % testimonials.length;
    showTestimonial(currentTestimonial);
}, 5000);

// Form handling with fun validation
const contactForm = document.querySelector('.fun-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Get form elements
        const nameInput = contactForm.querySelector('#name');
        const emailInput = contactForm.querySelector('#email');
        const serviceSelect = contactForm.querySelector('#service');
        const messageTextarea = contactForm.querySelector('#message');

        // Get form values
        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const service = serviceSelect.value;
        const message = messageTextarea.value.trim();

        // Fun validation with emojis
        if (!name) {
            showFunNotification('Oops! 😅 I need to know your name first!', 'warning');
            nameInput.focus();
            shakeElement(nameInput);
            return;
        }

        if (!email || !isValidEmail(email)) {
            showFunNotification('Hmm... 🤔 That email looks funky! Let\'s fix it!', 'warning');
            emailInput.focus();
            shakeElement(emailInput);
            return;
        }

        if (!service) {
            showFunNotification('Pick your adventure! 🎯 What sounds fun to you?', 'warning');
            serviceSelect.focus();
            shakeElement(serviceSelect);
            return;
        }

        if (!message) {
            showFunNotification('Don\'t be shy! 😊 Tell me what you\'re thinking!', 'warning');
            messageTextarea.focus();
            shakeElement(messageTextarea);
            return;
        }

        // Create fun email
        const serviceNames = {
            'math': '🧮 Math Tutoring Magic',
            'science': '🔬 Science Adventures',
            'language': '🌍 Language Learning Fun',
            'piano': '🎹 Piano Lessons',
            'other': '✨ Something Else Cool'
        };

        const serviceName = serviceNames[service] || '✨ General Inquiry';
        const subject = encodeURIComponent(`${serviceName} - Message from ${name} 🌟`);
        const body = encodeURIComponent(`Hi Anna! 👋

I hope you're having an amazing day! ✨

My name is ${name} and I'm super interested in: ${serviceName}

Here's my message:
${message}

I can't wait to hear from you! 🎉

Best wishes,
${name}

P.S. Your website is absolutely amazing! 🌈`);

        const mailtoLink = `mailto:abyzovann@gmail.com?subject=${subject}&body=${body}`;

        // Open email client
        window.location.href = mailtoLink;

        // Show success message with confetti
        showFunNotification('🎉 Woohoo! Email opened! Don\'t forget to hit send! ✨', 'success');
        createConfetti();

        // Reset form with animation
        resetFormWithAnimation();
    });
}

// Email validation function
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Fun notification system
function showFunNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.fun-notification');
    existingNotifications.forEach(notification => notification.remove());

    const notification = document.createElement('div');
    notification.className = `fun-notification fun-notification-${type}`;

    // Create notification content
    const content = document.createElement('div');
    content.className = 'notification-content';
    content.textContent = message;

    const closeBtn = document.createElement('button');
    closeBtn.className = 'notification-close';
    closeBtn.innerHTML = '❌';
    closeBtn.onclick = () => removeNotification(notification);

    notification.appendChild(content);
    notification.appendChild(closeBtn);

    // Styles for notification
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        minWidth: '320px',
        maxWidth: '400px',
        padding: '1.5rem 2rem',
        background: getNotificationBackground(type),
        color: 'white',
        borderRadius: '20px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
        zIndex: '10001',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        animation: 'bounceInRight 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        fontFamily: 'Poppins, sans-serif',
        fontSize: '16px',
        lineHeight: '1.4',
        fontWeight: '500'
    });

    // Style close button
    Object.assign(closeBtn.style, {
        background: 'none',
        border: 'none',
        color: 'white',
        fontSize: '16px',
        cursor: 'pointer',
        marginLeft: '15px',
        padding: '5px',
        borderRadius: '50%',
        transition: 'all 0.2s ease',
        opacity: '0.8'
    });

    closeBtn.addEventListener('mouseenter', () => {
        closeBtn.style.opacity = '1';
        closeBtn.style.transform = 'scale(1.2) rotate(90deg)';
        closeBtn.style.background = 'rgba(255,255,255,0.2)';
    });

    closeBtn.addEventListener('mouseleave', () => {
        closeBtn.style.opacity = '0.8';
        closeBtn.style.transform = 'scale(1) rotate(0deg)';
        closeBtn.style.background = 'none';
    });

    document.body.appendChild(notification);

    // Auto remove after 6 seconds
    setTimeout(() => {
        removeNotification(notification);
    }, 6000);
}

function getNotificationBackground(type) {
    switch(type) {
        case 'warning': return 'linear-gradient(135deg, #fdcb6e, #e17055)';
        case 'success': return 'linear-gradient(135deg, #00cec9, #55a3ff)';
        case 'error': return 'linear-gradient(135deg, #ff6b6b, #ff8e8e)';
        default: return 'linear-gradient(135deg, #74b9ff, #0984e3)';
    }
}

function removeNotification(notification) {
    if (notification && notification.parentNode) {
        notification.style.animation = 'bounceOutRight 0.3s ease-in';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }
}

// Shake animation for form elements
function shakeElement(element) {
    element.style.animation = 'shake 0.5s ease-in-out';
    setTimeout(() => {
        element.style.animation = '';
    }, 500);
}

// Reset form with fun animation
function resetFormWithAnimation() {
    const formElements = contactForm.querySelectorAll('input, select, textarea');
    formElements.forEach((element, index) => {
        setTimeout(() => {
            element.style.transform = 'scale(0.95)';
            element.style.opacity = '0.7';
            setTimeout(() => {
                element.value = '';
                element.style.transform = 'scale(1)';
                element.style.opacity = '1';
            }, 200);
        }, index * 100);
    });
}

// Confetti system
function createConfetti() {
    const confettiContainer = document.createElement('div');
    confettiContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 10000;
    `;
    document.body.appendChild(confettiContainer);

    const colors = ['#ff6b6b', '#4ecdc4', '#ffe66d', '#a8e6cf', '#ff8a80', '#82b1ff', '#b39ddb', '#f8bbd9'];
    const emojis = ['🎉', '🌟', '✨', '🎊', '🎈', '🌈', '💫', '⭐'];

    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        const isEmoji = Math.random() > 0.5;

        if (isEmoji) {
            confetti.textContent = emojis[Math.floor(Math.random() * emojis.length)];
            confetti.style.fontSize = '20px';
        } else {
            confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.width = '10px';
            confetti.style.height = '10px';
        }

        confetti.style.cssText += `
            position: absolute;
            top: -10px;
            left: ${Math.random() * 100}%;
            border-radius: 50%;
            animation: confettiFall ${2 + Math.random() * 3}s linear forwards;
            transform: rotate(${Math.random() * 360}deg);
        `;

        confettiContainer.appendChild(confetti);
    }

    // Remove confetti after animation
    setTimeout(() => {
        if (confettiContainer.parentNode) {
            confettiContainer.parentNode.removeChild(confettiContainer);
        }
    }, 5000);
}

// Add CSS animations for fun effects
const funStyle = document.createElement('style');
funStyle.textContent = `
    @keyframes bounceInRight {
        0% {
            transform: translateX(100%) scale(0.5);
            opacity: 0;
        }
        60% {
            transform: translateX(-10px) scale(1.1);
            opacity: 1;
        }
        100% {
            transform: translateX(0) scale(1);
        }
    }

    @keyframes bounceOutRight {
        0% {
            transform: translateX(0) scale(1);
            opacity: 1;
        }
        100% {
            transform: translateX(100%) scale(0.5);
            opacity: 0;
        }
    }

    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
    }

    @keyframes confettiFall {
        0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 1;
        }
        100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
        }
    }

    @keyframes wiggleMore {
        0%, 7% { transform: rotateZ(0); }
        15% { transform: rotateZ(-20deg); }
        20% { transform: rotateZ(15deg); }
        25% { transform: rotateZ(-15deg); }
        30% { transform: rotateZ(10deg); }
        35% { transform: rotateZ(-5deg); }
        40%, 100% { transform: rotateZ(0); }
    }
`;
document.head.appendChild(funStyle);

// Fun scroll effects
let lastScrollY = window.scrollY;

window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    const scrollDirection = currentScrollY > lastScrollY ? 'down' : 'up';

    // Add floating elements on scroll
    if (Math.random() > 0.98) { // Rare floating emojis
        createFloatingEmoji();
    }

    lastScrollY = currentScrollY;
});

function createFloatingEmoji() {
    const emojis = ['✨', '🌟', '💫', '⭐', '🎉', '🌈'];
    const emoji = document.createElement('div');
    emoji.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    emoji.style.cssText = `
        position: fixed;
        font-size: 24px;
        pointer-events: none;
        z-index: 100;
        left: ${Math.random() * 100}%;
        top: 100%;
        animation: floatUp 3s linear forwards;
    `;

    const floatUpAnimation = `
        @keyframes floatUp {
            0% {
                transform: translateY(0) rotate(0deg);
                opacity: 1;
            }
            100% {
                transform: translateY(-100vh) rotate(360deg);
                opacity: 0;
            }
        }
    `;

    if (!document.querySelector('#floatUpStyle')) {
        const style = document.createElement('style');
        style.id = 'floatUpStyle';
        style.textContent = floatUpAnimation;
        document.head.appendChild(style);
    }

    document.body.appendChild(emoji);

    setTimeout(() => {
        if (emoji.parentNode) {
            emoji.parentNode.removeChild(emoji);
        }
    }, 3000);
}

// Enhanced hover effects for achievements
const achievementItems = document.querySelectorAll('.achievement-item');
achievementItems.forEach(item => {
    item.addEventListener('mouseenter', () => {
        // Add sparkle effect
        createSparkles(item);
    });
});

function createSparkles(element) {
    const sparkles = ['✨', '⭐', '🌟', '💫'];
    for (let i = 0; i < 3; i++) {
        setTimeout(() => {
            const sparkle = document.createElement('div');
            sparkle.textContent = sparkles[Math.floor(Math.random() * sparkles.length)];
            sparkle.style.cssText = `
                position: absolute;
                font-size: 16px;
                pointer-events: none;
                z-index: 10;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation: sparkleFloat 1s ease-out forwards;
            `;

            element.style.position = 'relative';
            element.appendChild(sparkle);

            setTimeout(() => {
                if (sparkle.parentNode) {
                    sparkle.parentNode.removeChild(sparkle);
                }
            }, 1000);
        }, i * 200);
    }
}

const sparkleStyle = `
    @keyframes sparkleFloat {
        0% {
            transform: scale(0) rotate(0deg);
            opacity: 1;
        }
        50% {
            transform: scale(1) rotate(180deg);
            opacity: 1;
        }
        100% {
            transform: scale(0) rotate(360deg);
            opacity: 0;
        }
    }
`;

const sparkleStyleElement = document.createElement('style');
sparkleStyleElement.textContent = sparkleStyle;
document.head.appendChild(sparkleStyleElement);

// Fun loading animation
window.addEventListener('load', () => {
    document.body.classList.add('loaded');

    // Trigger celebration after load
    setTimeout(() => {
        createConfetti();
    }, 500);
});

// Interactive elements with fun sounds (visual feedback)
const interactiveElements = document.querySelectorAll([
    '.btn',
    '.achievement-item',
    '.performance-card',
    '.dance-card',
    '.subject-card'
].join(','));

interactiveElements.forEach(element => {
    element.addEventListener('click', () => {
        // Visual "click" effect
        element.style.transform = 'scale(0.95)';
        setTimeout(() => {
            element.style.transform = '';
        }, 150);
    });
});

// Fun achievement filter (future enhancement placeholder)
const achievementCategories = document.querySelectorAll('[data-category]');

// Add fun tooltips to elements
const tooltipElements = document.querySelectorAll('.nav-link, .btn, .contact-method');
tooltipElements.forEach(element => {
    element.addEventListener('mouseenter', (e) => {
        // Could add fun tooltips here
    });
});

// Preload critical images with fun loading
const criticalImages = [
    'images/hero/anna_hero.jpeg',
    'images/achievements/anna_achieve.jpeg',
    'images/performances/anna_piano7.jpeg'
];

criticalImages.forEach(url => {
    const img = new Image();
    img.onload = () => {
        // Could add fun loading completion effects
    };
    img.src = url;
});

// Fun scroll progress with emojis
const scrollProgress = document.createElement('div');
scrollProgress.style.cssText = `
    position: fixed;
    top: 70px;
    left: 0;
    width: 0%;
    height: 4px;
    background: linear-gradient(90deg, #ff6b6b, #4ecdc4, #ffe66d, #ff6b6b);
    background-size: 300% 100%;
    animation: progressRainbow 3s linear infinite;
    z-index: 1001;
    transition: width 0.1s ease-out;
`;

const progressStyle = `
    @keyframes progressRainbow {
        0% { background-position: 0% 50%; }
        100% { background-position: 100% 50%; }
    }
`;

const progressStyleElement = document.createElement('style');
progressStyleElement.textContent = progressStyle;
document.head.appendChild(progressStyleElement);
document.body.appendChild(scrollProgress);

window.addEventListener('scroll', () => {
    const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (window.scrollY / windowHeight) * 100;
    scrollProgress.style.width = scrolled + '%';
});

// Add fun easter eggs
let konamiCode = [];
const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];

document.addEventListener('keydown', (e) => {
    konamiCode.push(e.code);
    konamiCode = konamiCode.slice(-10);

    if (konamiCode.join(',') === konamiSequence.join(',')) {
        // Easter egg activated!
        showFunNotification('🎉 KONAMI CODE ACTIVATED! You found the secret! 🌟', 'success');
        createConfetti();
        // Could add more fun effects here
    }
});

console.log('🎉 Anna Abyzova - Creative Portfolio Loaded! ✨');
console.log('💡 Tip: Try the Konami Code for a surprise! ⬆️⬆️⬇️⬇️⬅️➡️⬅️➡️BA');