// ============================================
// GLOBAL CONSTANTS AND CONFIGURATION
// ============================================

const CONFIG = {
    countdown: {
        minutes: 6,
        seconds: 41
    },
    holdTimer: {
        duration: 15 * 60 // 15 minutes in seconds
    },
    tickets: {
        premium: {
            section: "Floor",
            row: "B",
            seats: "102, 103",
            price: 489.99,
            type: "Premium Floor Tickets"
        },
        standard: {
            section: "Lower Bowl",
            row: "M",
            seats: "45, 46",
            price: 349.99,
            type: "Lower Bowl Tickets"
        }
    }
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
    }).format(amount);
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${type === 'success' ? '✓' : type === 'error' ? '✗' : 'ℹ'}</span>
            <span>${message}</span>
        </div>
        <button class="notification-close">&times;</button>
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
    
    // Close button
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.remove();
    });
}

// ============================================
// COUNTDOWN TIMER
// ============================================

class CountdownTimer {
    constructor(elementId, initialMinutes = 6, initialSeconds = 41) {
        this.element = document.getElementById(elementId);
        this.minutesElement = document.getElementById('minutes');
        this.secondsElement = document.getElementById('seconds');
        this.minutes = initialMinutes;
        this.seconds = initialSeconds;
        this.interval = null;
        
        if (this.element) {
            this.initialize();
        }
    }
    
    initialize() {
        this.updateDisplay();
        this.start();
        
        // Add subtle animation to colon
        const colon = this.element.querySelector('.colon');
        if (colon) {
            setInterval(() => {
                colon.style.opacity = colon.style.opacity === '0.5' ? '1' : '0.5';
            }, 500);
        }
    }
    
    start() {
        this.interval = setInterval(() => {
            this.tick();
        }, 1000);
    }
    
    tick() {
        if (this.seconds === 0) {
            if (this.minutes === 0) {
                this.reset();
                return;
            }
            this.minutes--;
            this.seconds = 59;
        } else {
            this.seconds--;
        }
        this.updateDisplay();
    }
    
    updateDisplay() {
        if (this.minutesElement && this.secondsElement) {
            this.minutesElement.textContent = this.minutes.toString().padStart(2, '0');
            this.secondsElement.textContent = this.seconds.toString().padStart(2, '0');
        }
    }
    
    reset() {
        this.minutes = CONFIG.countdown.minutes;
        this.seconds = CONFIG.countdown.seconds;
        this.updateDisplay();
        showNotification('Timer reset - tickets still available!', 'info');
    }
    
    stop() {
        if (this.interval) {
            clearInterval(this.interval);
        }
    }
}

// ============================================
// TESTIMONIAL CAROUSEL
// ============================================

class TestimonialCarousel {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.track = this.container ? this.container.querySelector('.carousel-track') : null;
        this.testimonials = this.track ? Array.from(this.track.children) : [];
        this.speed = 40; // seconds for full scroll
        this.isPaused = false;
        
        if (this.track && this.testimonials.length > 0) {
            this.initialize();
        }
    }
    
    initialize() {
        // Duplicate testimonials for seamless looping
        const duplicates = this.testimonials.map(testimonial => testimonial.cloneNode(true));
        duplicates.forEach(duplicate => this.track.appendChild(duplicate));
        
        // Pause on hover
        this.container.addEventListener('mouseenter', () => this.pause());
        this.container.addEventListener('mouseleave', () => this.resume());
        
        // Touch events for mobile
        let startX = 0;
        let scrollLeft = 0;
        
        this.track.addEventListener('touchstart', (e) => {
            startX = e.touches[0].pageX;
            scrollLeft = this.track.scrollLeft;
            this.pause();
        });
        
        this.track.addEventListener('touchend', () => {
            setTimeout(() => this.resume(), 2000);
        });
    }
    
    pause() {
        this.track.style.animationPlayState = 'paused';
        this.isPaused = true;
    }
    
    resume() {
        this.track.style.animationPlayState = 'running';
        this.isPaused = false;
    }
}

// ============================================
// TICKET SELECTION
// ============================================

class TicketSelection {
    constructor() {
        this.modal = document.getElementById('ticketModal');
        this.selectedTicket = null;
        this.initialize();
    }
    
    initialize() {
        // Select ticket buttons
        document.querySelectorAll('.select-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const ticketType = button.getAttribute('data-ticket');
                this.selectTicket(ticketType);
            });
        });
        
        // Modal close buttons
        if (this.modal) {
            this.modal.querySelectorAll('.modal-close, .modal-cancel').forEach(button => {
                button.addEventListener('click', () => this.closeModal());
            });
            
            // Close on overlay click
            this.modal.addEventListener('click', (e) => {
                if (e.target === this.modal) {
                    this.closeModal();
                }
            });
            
            // Escape key to close
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.modal.style.display === 'block') {
                    this.closeModal();
                }
            });
        }
    }
    
    selectTicket(ticketType) {
        const ticket = CONFIG.tickets[ticketType];
        if (!ticket) return;
        
        this.selectedTicket = ticket;
        
        // Store in session storage for checkout
        sessionStorage.setItem('selectedTicket', JSON.stringify({
            type: ticketType,
            ...ticket
        }));
        
        // Show modal
        if (this.modal) {
            const modalMessage = this.modal.querySelector('#modalMessage');
            if (modalMessage) {
                modalMessage.innerHTML = `
                    You have selected <strong>${ticket.section} - Row ${ticket.row} - Seats ${ticket.seats}</strong> 
                    for <strong>${formatCurrency(ticket.price)} each</strong>.
                `;
            }
            
            // Update checkout link
            const checkoutLink = this.modal.querySelector('a[href="checkout.html"]');
            if (checkoutLink) {
                checkoutLink.href = `checkout.html?ticket=${ticketType}`;
            }
            
            this.showModal();
        } else {
            // If no modal, go directly to checkout
            window.location.href = `checkout.html?ticket=${ticketType}`;
        }
    }
    
    showModal() {
        if (this.modal) {
            this.modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }
    
    closeModal() {
        if (this.modal) {
            this.modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }
}

// ============================================
// CHECKOUT PAYMENT FLOW
// ============================================

class CheckoutPayment {
    constructor() {
        this.paymentForm = document.getElementById('paymentForm');
        this.verificationStep = document.getElementById('verificationStep');
        this.successStep = document.getElementById('successStep');
        this.holdTimer = document.getElementById('holdTimer');
        this.holdTimeDisplay = document.getElementById('holdTime');
        this.transferModal = document.getElementById('transferModal');
        this.holdTimerInterval = null;
        this.timeLeft = CONFIG.holdTimer.duration;
        this.initialize();
    }
    
    initialize() {
        // Continue to payment button
        const continueBtn = document.getElementById('continueBtn');
        if (continueBtn) {
            continueBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.validateAndProceed();
            });
        }
        
        // Instant bank transfer button
        const instantTransferBtn = document.getElementById('instantTransferBtn');
        if (instantTransferBtn) {
            instantTransferBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.processBankTransfer();
            });
        }
        
        // Manual transfer link
        const manualTransferLink = document.getElementById('manualTransferLink');
        if (manualTransferLink) {
            manualTransferLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showTransferInstructions();
            });
        }
        
        // Copy bank details button
        const copyDetailsBtn = document.getElementById('copyDetailsBtn');
        if (copyDetailsBtn) {
            copyDetailsBtn.addEventListener('click', () => this.copyBankDetails());
        }
        
        // Print receipt button
        const printReceiptBtn = document.querySelector('.print-receipt-btn');
        if (printReceiptBtn) {
            printReceiptBtn.addEventListener('click', () => window.print());
        }
        
        // Transfer modal close
        if (this.transferModal) {
            this.transferModal.querySelectorAll('.modal-close, .modal-cancel').forEach(button => {
                button.addEventListener('click', () => this.closeTransferModal());
            });
            
            this.transferModal.addEventListener('click', (e) => {
                if (e.target === this.transferModal) {
                    this.closeTransferModal();
                }
            });
        }
        
        // Load selected ticket from session storage
        this.loadSelectedTicket();
    }
    
    validateAndProceed() {
        const email = document.getElementById('email');
        const name = document.getElementById('name');
        
        // Basic validation
        if (!email.value || !name.value) {
            showNotification('Please fill in all required fields', 'error');
            return;
        }
        
        if (!this.isValidEmail(email.value)) {
            showNotification('Please enter a valid email address', 'error');
            email.focus();
            return;
        }
        
        // Show loading state
        const continueBtn = document.getElementById('continueBtn');
        if (continueBtn) {
            const originalText = continueBtn.innerHTML;
            continueBtn.innerHTML = `
                <span class="btn-spinner"></span>
                Processing...
            `;
            continueBtn.disabled = true;
            
            // Simulate API call delay
            setTimeout(() => {
                this.showVerificationStep();
                continueBtn.innerHTML = originalText;
                continueBtn.disabled = false;
            }, 1500);
        }
    }
    
    isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    showVerificationStep() {
        if (this.paymentForm && this.verificationStep) {
            this.paymentForm.style.display = 'none';
            this.verificationStep.style.display = 'block';
            
            // Start hold timer
            this.startHoldTimer();
            
            // Scroll to verification
            this.verificationStep.scrollIntoView({ behavior: 'smooth', block: 'start' });
            
            showNotification('Tickets placed on hold for 15 minutes', 'info');
        }
    }
    
    startHoldTimer() {
        if (this.holdTimer && this.holdTimeDisplay) {
            this.holdTimer.style.display = 'block';
            this.timeLeft = CONFIG.holdTimer.duration;
            
            this.holdTimerInterval = setInterval(() => {
                this.timeLeft--;
                this.holdTimeDisplay.textContent = formatTime(this.timeLeft);
                
                // Update timer color based on time left
                if (this.timeLeft <= 60) { // 1 minute left
                    this.holdTimer.style.background = 'linear-gradient(135deg, #F59E0B, #D97706)';
                }
                
                if (this.timeLeft <= 0) {
                    this.clearHoldTimer();
                    showNotification('Hold expired. Please restart your purchase.', 'error');
                    // Reset to payment form
                    if (this.paymentForm && this.verificationStep) {
                        this.verificationStep.style.display = 'none';
                        this.paymentForm.style.display = 'block';
                    }
                }
            }, 1000);
        }
    }
    
    clearHoldTimer() {
        if (this.holdTimerInterval) {
            clearInterval(this.holdTimerInterval);
            this.holdTimerInterval = null;
        }
        if (this.holdTimer) {
            this.holdTimer.style.display = 'none';
        }
    }
    
    processBankTransfer() {
        const instantTransferBtn = document.getElementById('instantTransferBtn');
        if (instantTransferBtn) {
            const originalText = instantTransferBtn.innerHTML;
            instantTransferBtn.innerHTML = `
                <span class="btn-spinner"></span>
                Processing Payment...
            `;
            instantTransferBtn.disabled = true;
            
            // Simulate payment processing
            setTimeout(() => {
                this.showSuccessStep();
                this.clearHoldTimer();
                instantTransferBtn.innerHTML = originalText;
                instantTransferBtn.disabled = false;
                
                // Generate confirmation number
                const confirmationNumber = `EPG-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`;
                const confirmationElement = document.querySelector('.confirmation-number');
                if (confirmationElement) {
                    confirmationElement.textContent = confirmationNumber;
                }
            }, 3000);
        }
    }
    
    showSuccessStep() {
        if (this.verificationStep && this.successStep) {
            this.verificationStep.style.display = 'none';
            this.successStep.style.display = 'block';
            
            // Send confirmation email (simulated)
            setTimeout(() => {
                showNotification('Confirmation email sent to your inbox', 'success');
            }, 1000);
        }
    }
    
    showTransferInstructions() {
        if (this.transferModal) {
            this.transferModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }
    
    closeTransferModal() {
        if (this.transferModal) {
            this.transferModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }
    
    copyBankDetails() {
        const bankDetails = `
Bank Name: Barclays Bank PLC
Account Name: EventPass Global Ltd.
Sort Code: 20-00-00
Account Number: 12345678
Reference: EPG-2024-8472
Amount: $1,039.96
        `.trim();
        
        navigator.clipboard.writeText(bankDetails).then(() => {
            showNotification('Bank details copied to clipboard', 'success');
        }).catch(() => {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = bankDetails;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            showNotification('Bank details copied to clipboard', 'success');
        });
    }
    
    loadSelectedTicket() {
        const storedTicket = sessionStorage.getItem('selectedTicket');
        if (storedTicket) {
            try {
                const ticket = JSON.parse(storedTicket);
                
                // Update ticket summary if elements exist
                const ticketInfo = document.querySelector('.ticket-info h4');
                const seatDetails = document.querySelector('.seat-details');
                const ticketPrice = document.querySelector('.ticket-price');
                
                if (ticketInfo) {
                    ticketInfo.innerHTML = `${ticket.type} <span class="ticket-quantity">(x2)</span>`;
                }
                
                if (seatDetails) {
                    seatDetails.innerHTML = `
                        <span class="seat-item">Section: ${ticket.section}</span>
                        <span class="seat-item">Row: ${ticket.row}</span>
                        <span class="seat-item">Seats: ${ticket.seats}</span>
                    `;
                }
                
                if (ticketPrice && ticket.price) {
                    const totalPrice = ticket.price * 2;
                    ticketPrice.textContent = formatCurrency(totalPrice);
                    
                    // Update price breakdown
                    this.updatePriceBreakdown(totalPrice);
                }
            } catch (e) {
                console.error('Error loading ticket:', e);
            }
        }
    }
    
    updatePriceBreakdown(subtotal) {
        const serviceFee = 49.99;
        const processingFee = 9.99;
        const total = subtotal + serviceFee + processingFee;
        
        // Update subtotal
        const subtotalElement = document.querySelector('.price-row:nth-child(1) .price-value');
        if (subtotalElement) {
            subtotalElement.textContent = formatCurrency(subtotal);
        }
        
        // Update total
        const totalElement = document.querySelector('.price-row.total .price-value');
        if (totalElement) {
            totalElement.textContent = formatCurrency(total);
        }
    }
}

// ============================================
// NAVIGATION
// ============================================

class Navigation {
    constructor() {
        this.initialize();
    }
    
    initialize() {
        // Smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const href = anchor.getAttribute('href');
                if (href === '#') return;
                
                const targetElement = document.querySelector(href);
                if (targetElement) {
                    e.preventDefault();
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                    
                    // Update URL without page jump
                    history.pushState(null, null, href);
                }
            });
        });
        
        // Set active navigation item based on scroll position
        window.addEventListener('scroll', () => {
            const sections = document.querySelectorAll('section[id]');
            const scrollPos = window.scrollY + 100;
            
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.clientHeight;
                const sectionId = section.getAttribute('id');
                
                if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                    this.setActiveNavItem(sectionId);
                }
            });
        });
        
        // Mobile menu toggle (for future enhancement)
        this.initMobileMenu();
    }
    
    setActiveNavItem(sectionId) {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${sectionId}`) {
                link.classList.add('active');
            }
        });
    }
    
    initMobileMenu() {
        const navbar = document.querySelector('.navbar');
        if (!navbar || window.innerWidth > 768) return;
        
        // Create mobile menu button
        const menuButton = document.createElement('button');
        menuButton.className = 'mobile-menu-button';
        menuButton.innerHTML = '☰';
        menuButton.setAttribute('aria-label', 'Toggle menu');
        
        const navMenu = document.querySelector('.nav-menu');
        if (navMenu) {
            navbar.insertBefore(menuButton, navMenu);
            
            menuButton.addEventListener('click', () => {
                navMenu.classList.toggle('show');
                menuButton.textContent = navMenu.classList.contains('show') ? '✕' : '☰';
            });
            
            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!navMenu.contains(e.target) && !menuButton.contains(e.target)) {
                    navMenu.classList.remove('show');
                    menuButton.textContent = '☰';
                }
            });
        }
    }
}

// ============================================
// ANALYTICS AND TRACKING (Simulated)
// ============================================

class Analytics {
    static trackEvent(eventName, data = {}) {
        // In a real implementation, this would send to Google Analytics, etc.
        console.log(`[Analytics] ${eventName}:`, data);
        
        // Simulate tracking
        const events = JSON.parse(localStorage.getItem('eventpass_events') || '[]');
        events.push({
            event: eventName,
            data: data,
            timestamp: new Date().toISOString(),
            page: window.location.pathname
        });
        localStorage.setItem('eventpass_events', JSON.stringify(events.slice(-100))); // Keep last 100 events
    }
    
    static trackPageView() {
        this.trackEvent('page_view', {
            url: window.location.href,
            referrer: document.referrer,
            title: document.title
        });
    }
}

// ============================================
// PERFORMANCE OPTIMIZATION
// ============================================

class PerformanceOptimizer {
    constructor() {
        this.initialize();
    }
    
    initialize() {
        // Lazy load images
        this.lazyLoadImages();
        
        // Debounce scroll events
        this.optimizeScrollEvents();
        
        // Preload critical resources
        this.preloadResources();
    }
    
    lazyLoadImages() {
        const images = document.querySelectorAll('img[data-src]');
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        imageObserver.unobserve(img);
                    }
                });
            });
            
            images.forEach(img => imageObserver.observe(img));
        } else {
            // Fallback for older browsers
            images.forEach(img => {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
            });
        }
    }
    
    optimizeScrollEvents() {
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                // Handle scroll-based operations here
            }, 100);
        });
    }
    
    preloadResources() {
        // Preload critical resources
        const links = [
            { rel: 'preload', href: 'style.css', as: 'style' },
            { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
            { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: true }
        ];
        
        links.forEach(link => {
            const el = document.createElement('link');
            Object.assign(el, link);
            document.head.appendChild(el);
        });
    }
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('EventPass Global - Initializing...');
    
    // Initialize analytics
    Analytics.trackPageView();
    
    // Initialize performance optimizer
    new PerformanceOptimizer();
    
    // Initialize navigation
    new Navigation();
    
    // Initialize countdown timer (home page only)
    if (document.getElementById('countdownTimer')) {
        window.countdownTimer = new CountdownTimer('countdownTimer');
        Analytics.trackEvent('timer_initialized');
    }
    
    // Initialize testimonial carousel (home page only)
    if (document.getElementById('testimonialCarousel')) {
        window.testimonialCarousel = new TestimonialCarousel('testimonialCarousel');
        Analytics.trackEvent('carousel_initialized');
    }
    
    // Initialize ticket selection (home page only)
    if (document.querySelector('.select-btn')) {
        window.ticketSelection = new TicketSelection();
        Analytics.trackEvent('ticket_selection_initialized');
    }
    
    // Initialize checkout payment flow (checkout page only)
    if (document.getElementById('paymentForm')) {
        window.checkoutPayment = new CheckoutPayment();
        Analytics.trackEvent('checkout_initialized');
    }
    
    // Add CSS for notifications
    const notificationStyles = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--primary-color);
            color: var(--secondary-color);
            padding: 1rem 1.5rem;
            border-radius: var(--radius-md);
            box-shadow: var(--shadow-lg);
            z-index: 3000;
            display: flex;
            align-items: center;
            gap: 1rem;
            transform: translateX(0);
            transition: all 0.3s ease;
            max-width: 400px;
        }
        
        .notification.notification-success {
            background: var(--accent-teal);
        }
        
        .notification.notification-error {
            background: #EF4444;
        }
        
        .notification-content {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            flex: 1;
        }
        
        .notification-icon {
            font-size: 1.25rem;
            font-weight: bold;
        }
        
        .notification-close {
            background: none;
            border: none;
            color: inherit;
            font-size: 1.5rem;
            cursor: pointer;
            padding: 0;
            line-height: 1;
            opacity: 0.7;
            transition: opacity 0.2s;
        }
        
        .notification-close:hover {
            opacity: 1;
        }
        
        .btn-spinner {
            display: inline-block;
            width: 16px;
            height: 16px;
            border: 2px solid rgba(255,255,255,0.3);
            border-radius: 50%;
            border-top-color: var(--secondary-color);
            animation: spin 1s ease-in-out infinite;
        }
        
        .mobile-menu-button {
            display: none;
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            padding: 0.5rem;
            color: var(--primary-color);
        }
        
        @media (max-width: 768px) {
            .mobile-menu-button {
                display: block;
            }
            
            .nav-menu {
                display: none;
                position: absolute;
                top: 100%;
                left: 0;
                right: 0;
                background: var(--secondary-color);
                flex-direction: column;
                padding: 1rem;
                box-shadow: var(--shadow-lg);
                z-index: 1000;
            }
            
            .nav-menu.show {
                display: flex;
            }
        }
    `;
    
    const styleSheet = document.createElement('style');
    styleSheet.textContent = notificationStyles;
    document.head.appendChild(styleSheet);
    
    console.log('EventPass Global - Initialization complete');
});

// ============================================
// GLOBAL ERROR HANDLING
// ============================================

window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    Analytics.trackEvent('error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
    });
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    Analytics.trackEvent('promise_rejection', {
        reason: event.reason?.toString()
    });
});

// ============================================
// SERVICE WORKER (PWA SUPPORT - OPTIONAL)
// ============================================

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(error => {
            console.log('ServiceWorker registration failed:', error);
        });
    });
}

// ============================================
// EXPORTS FOR TESTING (if needed)
// ============================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        CountdownTimer,
        TestimonialCarousel,
        TicketSelection,
        CheckoutPayment,
        Navigation,
        Analytics,
        formatTime,
        formatCurrency
    };
}
