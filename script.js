// Countdown Timer Functionality
function updateCountdown() {
    const minutesElement = document.getElementById('minutes');
    const secondsElement = document.getElementById('seconds');
    
    if (!minutesElement || !secondsElement) return;
    
    let minutes = parseInt(minutesElement.textContent);
    let seconds = parseInt(secondsElement.textContent);
    
    if (seconds === 0) {
        if (minutes === 0) {
            // Reset timer when it reaches 0
            minutes = 6;
            seconds = 41;
        } else {
            minutes--;
            seconds = 59;
        }
    } else {
        seconds--;
    }
    
    minutesElement.textContent = minutes.toString().padStart(2, '0');
    secondsElement.textContent = seconds.toString().padStart(2, '0');
}

// Initialize countdown timer
if (document.getElementById('minutes')) {
    setInterval(updateCountdown, 1000);
}

// Testimonial Carousel
document.addEventListener('DOMContentLoaded', function() {
    const carouselTrack = document.querySelector('.carousel-track');
    if (!carouselTrack) return;
    
    // Clone testimonials for seamless looping
    const testimonials = carouselTrack.querySelectorAll('.testimonial');
    testimonials.forEach(testimonial => {
        const clone = testimonial.cloneNode(true);
        carouselTrack.appendChild(clone);
    });
    
    // Pause animation on hover
    carouselTrack.addEventListener('mouseenter', () => {
        carouselTrack.style.animationPlayState = 'paused';
    });
    
    carouselTrack.addEventListener('mouseleave', () => {
        carouselTrack.style.animationPlayState = 'running';
    });
});

// Checkout Page Payment Flow
document.addEventListener('DOMContentLoaded', function() {
    const continueButton = document.getElementById('continue-payment');
    const paymentForm = document.getElementById('payment-form');
    const verificationStep = document.getElementById('verification-step');
    
    if (!continueButton || !verificationStep) return;
    
    continueButton.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Simple form validation
        const email = document.getElementById('email');
        const name = document.getElementById('name');
        
        if (!email.value || !name.value) {
            alert('Please fill in all required fields');
            return;
        }
        
        if (!isValidEmail(email.value)) {
            alert('Please enter a valid email address');
            email.focus();
            return;
        }
        
        // Show loading state
        continueButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        continueButton.disabled = true;
        
        // Simulate API call delay
        setTimeout(() => {
            paymentForm.style.display = 'none';
            verificationStep.classList.remove('hidden');
            
            // Start hold timer
            startHoldTimer();
            
            // Scroll to verification
            verificationStep.scrollIntoView({ behavior: 'smooth' });
        }, 1500);
    });
    
    // Bank transfer button
    const bankTransferBtn = document.querySelector('.bank-transfer-button');
    if (bankTransferBtn) {
        bankTransferBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Simulate payment processing
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing Payment...';
            this.disabled = true;
            
            setTimeout(() => {
                // Show success message
                const verificationMessage = document.querySelector('.verification-message');
                if (verificationMessage) {
                    verificationMessage.innerHTML = `
                        <div class="verification-icon">
                            <i class="fas fa-check-circle" style="color: #10B981;"></i>
                        </div>
                        <h3>Payment Successful!</h3>
                        <div class="verification-text">
                            <p>Your tickets have been secured and will be delivered to your email within 15 minutes.</p>
                            <p class="highlight">
                                <i class="fas fa-check"></i> Order confirmed: #EPG${Date.now().toString().slice(-8)}
                            </p>
                        </div>
                    `;
                    
                    // Update payment options
                    const paymentOptions = document.querySelector('.payment-options');
                    if (paymentOptions) {
                        paymentOptions.innerHTML = `
                            <div class="payment-option" style="border-color: #10B981; background: rgba(16, 185, 129, 0.05);">
                                <div class="option-header">
                                    <i class="fas fa-check-circle" style="color: #10B981;"></i>
                                    <div>
                                        <h4>Payment Completed</h4>
                                        <p>You will receive your tickets shortly</p>
                                    </div>
                                </div>
                                <a href="#" class="manual-transfer-link" onclick="window.print()">
                                    <i class="fas fa-print"></i> Print Receipt
                                </a>
                            </div>
                        `;
                    }
                }
            }, 2000);
        });
    }
});

// Email validation
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Hold timer for checkout
function startHoldTimer() {
    const timerElement = document.querySelector('.highlight');
    if (!timerElement) return;
    
    let timeLeft = 15 * 60; // 15 minutes in seconds
    
    const timerInterval = setInterval(() => {
        timeLeft--;
        
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        
        timerElement.innerHTML = `
            <i class="fas fa-clock"></i> Your tickets are on hold for 
            <strong>${minutes}:${seconds.toString().padStart(2, '0')}</strong>
        `;
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            timerElement.innerHTML = `
                <i class="fas fa-exclamation-triangle"></i> 
                <strong>Hold expired. Please restart your purchase.</strong>
            `;
            timerElement.style.color = '#EF4444';
        }
    }, 1000);
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Ticket selection animation
document.querySelectorAll('.select-button').forEach(button => {
    button.addEventListener('click', function(e) {
        // Add click animation
        this.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.style.transform = '';
        }, 150);
        
        // Store selected ticket in session storage
        const ticketCard = this.closest('.ticket-card');
        if (ticketCard) {
            const ticketData = {
                section: ticketCard.querySelector('.seat-section').textContent,
                row: ticketCard.querySelector('.seat-row strong').textContent,
                seats: ticketCard.querySelector('.seat-numbers strong').textContent,
                price: ticketCard.querySelector('.price').textContent.split(' ')[0]
            };
            
            sessionStorage.setItem('selectedTicket', JSON.stringify(ticketData));
        }
    });
});

// Initialize ticket data on checkout page
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('checkout.html')) {
        const storedTicket = sessionStorage.getItem('selectedTicket');
        if (storedTicket) {
            const ticketData = JSON.parse(storedTicket);
            
            // Update ticket summary if elements exist
            const ticketInfo = document.querySelector('.ticket-info h4');
            if (ticketInfo) {
                ticketInfo.textContent = `${ticketData.section} Tickets (x2)`;
            }
            
            const seatInfo = document.querySelector('.ticket-info p');
            if (seatInfo) {
                seatInfo.textContent = `Section: ${ticketData.section} • Row: ${ticketData.row} • Seats: ${ticketData.seats}`;
            }
            
            const ticketPrice = document.querySelector('.ticket-price');
            if (ticketPrice && ticketData.price) {
                const price = parseFloat(ticketData.price.replace('$', '')) * 2;
                ticketPrice.textContent = `$${price.toFixed(2)}`;
                
                // Update total
                const subtotal = document.querySelectorAll('.price-row')[0];
                if (subtotal) {
                    subtotal.children[1].textContent = `$${price.toFixed(2)}`;
                }
                
                const total = document.querySelector('.price-row.total span:last-child');
                if (total) {
                    const totalAmount = price + 49.99 + 9.99;
                    total.textContent = `$${totalAmount.toFixed(2)}`;
                }
            }
        }
    }
});

// Mobile menu toggle (for future mobile optimization)
function initMobileMenu() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
    
    // Create mobile menu button
    const mobileMenuBtn = document.createElement('button');
    mobileMenuBtn.className = 'mobile-menu-btn';
    mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
    
    const navMenu = document.querySelector('.nav-menu');
    if (navMenu) {
        navbar.insertBefore(mobileMenuBtn, navMenu);
        
        mobileMenuBtn.addEventListener('click', function() {
            navMenu.classList.toggle('show');
        });
    }
}

// Initialize on load
window.addEventListener('load', function() {
    initMobileMenu();
    
    // Add active class to current page in navigation
    const currentPage = window.location.pathname.split('/').pop();
    document.querySelectorAll('.nav-link').forEach(link => {
        const linkPage = link.getAttribute('href');
        if (linkPage === currentPage || 
            (currentPage === '' && linkPage === 'index.html') ||
            (currentPage === 'index.html' && linkPage === '#')) {
            link.classList.add('active');
        }
    });
});
