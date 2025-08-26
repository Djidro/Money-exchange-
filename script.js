// script.js
// Mobile Navigation Toggle
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');

if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        hamburger.classList.toggle('active');
    });
}

// Close mobile menu when clicking on a nav link
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        if (navMenu) navMenu.classList.remove('active');
        if (hamburger) hamburger.classList.remove('active');
    });
});

// FAQ Accordion Functionality (for FAQ page)
function initFAQAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    if (faqItems.length > 0) {
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            
            question.addEventListener('click', () => {
                // Toggle active class on clicked item
                item.classList.toggle('active');
                
                // Close other open items
                faqItems.forEach(otherItem => {
                    if (otherItem !== item && otherItem.classList.contains('active')) {
                        otherItem.classList.remove('active');
                    }
                });
            });
        });
    }
}

// Newsletter Form Submission
function handleNewsletterForm() {
    const newsletterForm = document.querySelector('.newsletter-form');
    
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const emailInput = newsletterForm.querySelector('input[type="email"]');
            const email = emailInput.value;
            
            if (email) {
                // In a real implementation, you would send this to a server
                alert(`Thank you for subscribing with: ${email}`);
                emailInput.value = '';
            }
        });
    }
}

// Contact Form Submission
function handleContactForm() {
    const contactForm = document.querySelector('.contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Thank you for your message! We will get back to you soon.');
            contactForm.reset();
        });
    }
}

// Initialize all functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initFAQAccordion();
    handleNewsletterForm();
    handleContactForm();
    
    // Language selector placeholder
    const languageSelect = document.getElementById('language-select');
    if (languageSelect) {
        languageSelect.addEventListener('change', (e) => {
            // This would be implemented with a proper i18n solution
            alert(`Language changed to ${e.target.value}. Full implementation would require additional setup.`);
        });
    }
});