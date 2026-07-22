// ============================================
// GLOBAL CONSTANTS AND CONFIGURATION
// ============================================

const CONFIG = {
    countdown: {
        minutes: 6,
        seconds: 41
    },
    holdTimer: {
        duration: 15 * 60
    },
    tickets: {
        premium: {
            section: "Floor",
            row: "B",
            seats: "102, 103",
            price: 589.99,
            type: "Premium Floor Tickets"
        },
        standard: {
            section: "Lower Bowl",
            row: "M",
            seats: "45, 46",
            price: 449.99,
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
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
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
        if (this.element) this.initialize();
    }
    initialize() {
        this.updateDisplay();
        this.start();
        const colon = this.element.querySelector('.colon');
        if (colon) {
            setInterval(() => {
                colon.style.opacity = colon.style.opacity === '0.5' ? '1' : '0.5';
            }, 500);
        }
    }
    start() {
        this.interval = setInterval(() => this.tick(), 1000);
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
        if (this.interval) clearInterval(this.interval);
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
        this.speed = 40;
        this.isPaused = false;
        if (this.track && this.testimonials.length > 0) this.initialize();
    }
    initialize() {
        const totalCards = this.testimonials.length;
        const duplicates = this.testimonials.map(card => card.cloneNode(true));
        duplicates.forEach(duplicate => this.track.appendChild(duplicate));
        this.container.addEventListener('mouseenter', () => this.pause());
        this.container.addEventListener('mouseleave', () => this.resume());
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
// TICKET SELECTION (with ticket preview update)
// ============================================

class TicketSelection {
    constructor() {
        this.modal = document.getElementById('ticketModal');
        this.selectedTicket = null;
        this.initialize();
    }
    initialize() {
        document.querySelectorAll('.select-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const ticketType = button.getAttribute('data-ticket');
                this.selectTicket(ticketType);
            });
        });
        if (this.modal) {
            this.modal.querySelectorAll('.modal-close, .modal-cancel').forEach(button => {
                button.addEventListener('click', () => this.closeModal());
            });
            this.modal.addEventListener('click', (e) => {
                if (e.target === this.modal) this.closeModal();
            });
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.modal.style.display === 'flex') {
                    this.closeModal();
                }
            });
        }
    }
    selectTicket(ticketType) {
        const ticket = CONFIG.tickets[ticketType];
        if (!ticket) return;
        this.selectedTicket = ticket;
        sessionStorage.setItem('selectedTicket', JSON.stringify({
            type: ticketType,
            ...ticket
        }));
        if (this.modal) {
            const modalMessage = this.modal.querySelector('#modalMessage');
            if (modalMessage) {
                modalMessage.innerHTML = `
                    You have selected <strong>${ticket.section} - Row ${ticket.row} - Seats ${ticket.seats}</strong> 
                    for <strong>${formatCurrency(ticket.price)} each</strong>.
                `;
            }
            const sectionEl = document.getElementById('ticketSection');
            const rowEl = document.getElementById('ticketRow');
            const seatsEl = document.getElementById('ticketSeats');
            const priceEl = document.getElementById('ticketPrice');
            if (sectionEl) sectionEl.textContent = ticket.section;
            if (rowEl) rowEl.textContent = ticket.row;
            if (seatsEl) seatsEl.textContent = ticket.seats;
            if (priceEl) priceEl.textContent = formatCurrency(ticket.price);
            const checkoutLink = this.modal.querySelector('a[href="checkout.html"]');
            if (checkoutLink) checkoutLink.href = `checkout.html?ticket=${ticketType}`;
            this.showModal();
        } else {
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
        const continueBtn = document.getElementById('continueBtn');
        if (continueBtn) {
            continueBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.validateAndProceed();
            });
        }
        const instantTransferBtn = document.getElementById('instantTransferBtn');
        if (instantTransferBtn) {
            instantTransferBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.processBankTransfer();
            });
        }
        const manualTransferLink = document.getElementById('manualTransferLink');
        if (manualTransferLink) {
            manualTransferLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showTransferInstructions();
            });
        }
        const copyDetailsBtn = document.getElementById('copyDetailsBtn');
        if (copyDetailsBtn) {
            copyDetailsBtn.addEventListener('click', () => this.copyBankDetails());
        }
        const printReceiptBtn = document.querySelector('.print-receipt-btn');
        if (printReceiptBtn) printReceiptBtn.addEventListener('click', () => window.print());
        if (this.transferModal) {
            this.transferModal.querySelectorAll('.modal-close, .modal-cancel').forEach(button => {
                button.addEventListener('click', () => this.closeTransferModal());
            });
            this.transferModal.addEventListener('click', (e) => {
                if (e.target === this.transferModal) this.closeTransferModal();
            });
        }
        this.loadSelectedTicket();
    }
    validateAndProceed() {
        const email = document.getElementById('email');
        const name = document.getElementById('name');
        if (!email.value || !name.value) {
            showNotification('Please fill in all required fields', 'error');
            return;
        }
        if (!this.isValidEmail(email.value)) {
            showNotification('Please enter a valid email address', 'error');
            email.focus();
            return;
        }
        const continueBtn = document.getElementById('continueBtn');
        if (continueBtn) {
            const originalText = continueBtn.innerHTML;
            continueBtn.innerHTML = `<span class="btn-spinner"></span> Processing...`;
            continueBtn.disabled = true;
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
            this.startHoldTimer();
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
                if (this.timeLeft <= 60) {
                    this.holdTimer.style.background = 'linear-gradient(135deg, #F59E0B, #D97706)';
                }
                if (this.timeLeft <= 0) {
                    this.clearHoldTimer();
                    showNotification('Hold expired. Please restart your purchase.', 'error');
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
        if (this.holdTimer) this.holdTimer.style.display = 'none';
    }
    processBankTransfer() {
        const instantTransferBtn = document.getElementById('instantTransferBtn');
        if (instantTransferBtn) {
            const originalText = instantTransferBtn.innerHTML;
            instantTransferBtn.innerHTML = `<span class="btn-spinner"></span> Processing Payment...`;
            instantTransferBtn.disabled = true;
            setTimeout(() => {
                this.showSuccessStep();
                this.clearHoldTimer();
                instantTransferBtn.innerHTML = originalText;
                instantTransferBtn.disabled = false;
                const confirmationNumber = `EPG-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`;
                const confirmationElement = document.querySelector('.confirmation-number');
                if (confirmationElement) confirmationElement.textContent = confirmationNumber;
            }, 3000);
        }
    }
    showSuccessStep() {
        if (this.verificationStep && this.successStep) {
            this.verificationStep.style.display = 'none';
            this.successStep.style.display = 'block';
            setTimeout(() => showNotification('Confirmation email sent to your inbox', 'success'), 1000);
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
        const bankDetails = `Bank Name: Barclays Bank PLC\nAccount Name: EventPass Global Ltd.\nSort Code: 20-00-00\nAccount Number: 12345678\nReference: EPG-2024-8472\nAmount: $1,239.96`;
        navigator.clipboard.writeText(bankDetails).then(() => {
            showNotification('Bank details copied to clipboard', 'success');
        }).catch(() => {
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
                const ticketInfo = document.querySelector('.ticket-info h4');
                const seatDetails = document.querySelector('.seat-details');
                const ticketPrice = document.querySelector('.ticket-price');
                if (ticketInfo) ticketInfo.innerHTML = `${ticket.type} <span class="ticket-quantity">(x2)</span>`;
                if (seatDetails) seatDetails.innerHTML = `
                    <span class="seat-item">Section: ${ticket.section}</span>
                    <span class="seat-item">Row: ${ticket.row}</span>
                    <span class="seat-item">Seats: ${ticket.seats}</span>
                `;
                if (ticketPrice && ticket.price) {
                    const totalPrice = ticket.price * 2;
                    ticketPrice.textContent = formatCurrency(totalPrice);
                    this.updatePriceBreakdown(totalPrice);
                }
            } catch (e) {}
        }
    }
    updatePriceBreakdown(subtotal) {
        const serviceFee = 49.99;
        const processingFee = 9.99;
        const total = subtotal + serviceFee + processingFee;
        const subtotalElement = document.querySelector('.price-row:nth-child(1) .price-value');
        if (subtotalElement) subtotalElement.textContent = formatCurrency(subtotal);
        const totalElement = document.querySelector('.price-row.total .price-value');
        if (totalElement) totalElement.textContent = formatCurrency(total);
    }
}

// ============================================
// NAVIGATION
// ============================================

class Navigation {
    constructor() { this.initialize(); }
    initialize() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const href = anchor.getAttribute('href');
                if (href === '#') return;
                const targetElement = document.querySelector(href);
                if (targetElement) {
                    e.preventDefault();
                    targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    history.pushState(null, null, href);
                }
            });
        });
        window.addEventListener('scroll', () => {
            const sections = document.querySelectorAll('section[id]');
            const scrollPos = window.scrollY + 100;
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.clientHeight;
                const sectionId = section.getAttribute('id');
                if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                    document.querySelectorAll('.nav-link').forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === `#${sectionId}`) link.classList.add('active');
                    });
                }
            });
        });
    }
}

// ============================================
// SCARCITY TRIGGERS: Live Visitor Counter
// ============================================
class VisitorCounter {
    constructor() {
        this.counterElement = document.getElementById('visitorCount');
        if (this.counterElement) this.simulate();
    }
    simulate() {
        const update = () => {
            const count = Math.floor(Math.random() * 36) + 35;
            this.counterElement.textContent = count;
            setTimeout(update, 5000 + Math.random() * 5000);
        };
        update();
    }
}

// ============================================
// SOCIAL PROOF TOASTS
// ============================================
class SocialProofToasts {
    constructor() {
        this.names = [
            'James M.', 'Sophie B.', 'William D.', 'Emma S.', 'Benjamin W.',
            'Olivia S.', 'Liam T.', 'Noah F.', 'Isabella M.', 'Ethan J.',
            'Mia B.', 'Lucas W.', 'Charlotte G.', 'Alexander H.', 'Amelia M.',
            'Henry W.', 'Emily S.', 'Jack T.', 'Ava R.', 'Oliver R.',
            'Sophia J.', 'Elias K.', 'Harper T.', 'Finn A.', 'Ella M.',
            'Sebastian K.', 'Grace H.', 'Leo C.', 'Lily V.', 'Max W.',
            'Chloe D.', 'Logan P.', 'Zoe A.', 'Connor M.', 'Penny L.'
        ];
        this.locations = [
            'London', 'Manchester', 'Birmingham', 'Liverpool', 'Glasgow',
            'Dublin', 'Cardiff', 'Bristol', 'Leeds', 'Sheffield',
            'New York', 'Los Angeles', 'Toronto', 'Sydney', 'Melbourne',
            'Berlin', 'Paris', 'Madrid', 'Amsterdam', 'Stockholm'
        ];
        this.interval = null;
        this.start();
    }
    start() {
        this.showRandomToast();
        this.interval = setInterval(() => this.showRandomToast(), 7000 + Math.random() * 6000);
    }
    showRandomToast() {
        const name = this.names[Math.floor(Math.random() * this.names.length)];
        const location = this.locations[Math.floor(Math.random() * this.locations.length)];
        const ticketType = Math.random() > 0.5 ? '2 Premium Floor' : '2 Lower Bowl';
        const toast = document.createElement('div');
        toast.className = 'notification-toast';
        toast.innerHTML = `
            <span class="toast-icon">🎫</span>
            <span class="toast-text"><strong>${name}</strong> from ${location} just purchased ${ticketType} seats</span>
            <button class="toast-close">&times;</button>
        `;
        document.body.appendChild(toast);
        toast.querySelector('.toast-close').addEventListener('click', () => toast.remove());
        setTimeout(() => { if (toast.parentNode) toast.remove(); }, 4000);
    }
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('EventPass Global - Initializing...');
    
    new Navigation();
    if (document.getElementById('countdownTimer')) {
        window.countdownTimer = new CountdownTimer('countdownTimer');
    }
    if (document.getElementById('testimonialCarousel')) {
        window.testimonialCarousel = new TestimonialCarousel('testimonialCarousel');
    }
    if (document.querySelector('.select-btn')) {
        window.ticketSelection = new TicketSelection();
    }
    if (document.getElementById('paymentForm')) {
        window.checkoutPayment = new CheckoutPayment();
    }
    if (document.getElementById('visitorCount')) {
        window.visitorCounter = new VisitorCounter();
    }
    if (document.querySelector('.ticket-card')) {
        window.socialProof = new SocialProofToasts();
    }
    
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
            transition: all 0.3s ease;
            max-width: 400px;
        }
        .notification-success { background: var(--accent-teal); }
        .notification-error { background: #EF4444; }
        .notification-content { display: flex; align-items: center; gap: 0.75rem; flex: 1; }
        .notification-icon { font-size: 1.25rem; font-weight: bold; }
        .notification-close { background: none; border: none; color: inherit; font-size: 1.5rem; cursor: pointer; padding: 0; line-height: 1; opacity: 0.7; }
        .btn-spinner { display: inline-block; width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-radius: 50%; border-top-color: var(--secondary-color); animation: spin 1s ease-in-out infinite; }
    `;
    const styleSheet = document.createElement('style');
    styleSheet.textContent = notificationStyles;
    document.head.appendChild(styleSheet);
    
    console.log('EventPass Global - Initialization complete');
});

window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
});
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
});
