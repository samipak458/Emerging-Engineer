// Form validation and interaction handling
document.addEventListener('DOMContentLoaded', function() {
    const quoteForm = document.getElementById('quote-form');
    
    if (quoteForm) {
        initializeQuoteForm();
    }
    
    // Smooth scrolling for navigation links
    initializeSmoothScrolling();
});

function initializeQuoteForm() {
    const form = document.getElementById('quote-form');
    const submitButton = form.querySelector('.submit-btn');
    
    // Form validation rules
    const validationRules = {
        firstName: {
            required: true,
            minLength: 2,
            pattern: /^[a-zA-Z\s'-]+$/,
            message: 'Please enter a valid first name (letters only, min 2 characters)'
        },
        lastName: {
            required: true,
            minLength: 2,
            pattern: /^[a-zA-Z\s'-]+$/,
            message: 'Please enter a valid last name (letters only, min 2 characters)'
        },
        email: {
            required: true,
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: 'Please enter a valid email address'
        },
        phone: {
            required: true,
            pattern: /^[\+]?[(]?[\d\s\-\(\)]{10,}$/,
            message: 'Please enter a valid phone number (min 10 digits)'
        },
        projectType: {
            required: true,
            message: 'Please select a project type'
        },
        projectDescription: {
            required: true,
            minLength: 20,
            message: 'Please provide a detailed project description (min 20 characters)'
        }
    };
    
    // Real-time validation on input
    Object.keys(validationRules).forEach(fieldName => {
        const field = form.querySelector(`[name="${fieldName}"]`);
        if (field) {
            field.addEventListener('blur', () => validateField(field, validationRules[fieldName]));
            field.addEventListener('input', () => clearFieldError(field));
        }
    });
    
    // Form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (validateForm(form, validationRules)) {
            submitForm(form, submitButton);
        }
    });
    
    // Form reset
    const resetButton = form.querySelector('.reset-btn');
    if (resetButton) {
        resetButton.addEventListener('click', function() {
            clearAllErrors(form);
            form.reset();
        });
    }
}

function validateField(field, rule) {
    const value = field.value.trim();
    const formGroup = field.closest('.form-group');
    const errorElement = formGroup.querySelector('.error-message');
    
    // Clear previous error state
    formGroup.classList.remove('error', 'success');
    errorElement.textContent = '';
    
    // Required field validation
    if (rule.required && !value) {
        showFieldError(formGroup, errorElement, 'This field is required');
        return false;
    }
    
    // Skip other validations if field is empty and not required
    if (!value && !rule.required) {
        return true;
    }
    
    // Minimum length validation
    if (rule.minLength && value.length < rule.minLength) {
        showFieldError(formGroup, errorElement, rule.message);
        return false;
    }
    
    // Pattern validation
    if (rule.pattern && !rule.pattern.test(value)) {
        showFieldError(formGroup, errorElement, rule.message);
        return false;
    }
    
    // Field is valid
    formGroup.classList.add('success');
    return true;
}

function showFieldError(formGroup, errorElement, message) {
    formGroup.classList.add('error');
    errorElement.textContent = message;
}

function clearFieldError(field) {
    const formGroup = field.closest('.form-group');
    const errorElement = formGroup.querySelector('.error-message');
    
    formGroup.classList.remove('error');
    errorElement.textContent = '';
}

function validateForm(form, rules) {
    let isValid = true;
    
    // Validate all required fields
    Object.keys(rules).forEach(fieldName => {
        const field = form.querySelector(`[name="${fieldName}"]`);
        if (field && !validateField(field, rules[fieldName])) {
            isValid = false;
        }
    });
    
    return isValid;
}

function clearAllErrors(form) {
    const formGroups = form.querySelectorAll('.form-group');
    formGroups.forEach(group => {
        group.classList.remove('error', 'success');
        const errorElement = group.querySelector('.error-message');
        if (errorElement) {
            errorElement.textContent = '';
        }
    });
}

function submitForm(form, submitButton) {
    // Show loading state
    submitButton.classList.add('loading');
    submitButton.disabled = true;
    
    // Collect form data
    const formData = new FormData(form);
    const data = {};
    
    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }
    
    // Simulate form submission (replace with actual API call)
    setTimeout(() => {
        console.log('Quote request submitted:', data);
        
        // Show success message
        showSuccessMessage();
        
        // Reset form
        form.reset();
        clearAllErrors(form);
        
        // Reset button state
        submitButton.classList.remove('loading');
        submitButton.disabled = false;
        
    }, 2000);
}

function showSuccessMessage() {
    // Create success message
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.innerHTML = `
        <div style="
            background: #d4edda;
            color: #155724;
            padding: 1rem;
            border: 1px solid #c3e6cb;
            border-radius: 5px;
            margin: 1rem 0;
            text-align: center;
        ">
            <strong>Success!</strong> Your quote request has been submitted. We'll get back to you within 24 hours.
        </div>
    `;
    
    // Insert before the form
    const form = document.getElementById('quote-form');
    form.parentNode.insertBefore(successDiv, form);
    
    // Scroll to success message
    successDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Remove success message after 5 seconds
    setTimeout(() => {
        successDiv.remove();
    }, 5000);
}

function initializeSmoothScrolling() {
    // Smooth scrolling for anchor links
    const anchors = document.querySelectorAll('a[href^="#"]');
    
    anchors.forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Skip if it's just '#' or empty
            if (href === '#' || href === '') {
                return;
            }
            
            const target = document.querySelector(href);
            
            if (target) {
                e.preventDefault();
                
                // Calculate offset for fixed header
                const headerHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Mobile menu toggle (if needed in future)
function initializeMobileMenu() {
    const mobileToggle = document.querySelector('.mobile-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }
}

// Form field enhancements
function enhanceFormFields() {
    // Auto-format phone number
    const phoneField = document.getElementById('phone');
    if (phoneField) {
        phoneField.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 6) {
                value = value.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
            } else if (value.length >= 3) {
                value = value.replace(/(\d{3})(\d{0,3})/, '($1) $2');
            }
            e.target.value = value;
        });
    }
    
    // Character counter for text areas
    const textAreas = document.querySelectorAll('textarea');
    textAreas.forEach(textArea => {
        if (textArea.hasAttribute('maxlength')) {
            addCharacterCounter(textArea);
        }
    });
}

function addCharacterCounter(textArea) {
    const maxLength = textArea.getAttribute('maxlength');
    const counter = document.createElement('div');
    counter.className = 'character-counter';
    counter.style.cssText = `
        font-size: 0.875rem;
        color: #666;
        text-align: right;
        margin-top: 0.25rem;
    `;
    
    textArea.parentNode.appendChild(counter);
    
    function updateCounter() {
        const remaining = maxLength - textArea.value.length;
        counter.textContent = `${textArea.value.length}/${maxLength}`;
        counter.style.color = remaining < 50 ? '#dc3545' : '#666';
    }
    
    textArea.addEventListener('input', updateCounter);
    updateCounter();
}

// Initialize enhanced features when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    enhanceFormFields();
});