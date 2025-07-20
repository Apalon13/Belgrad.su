// Nature Animations using anime.js
document.addEventListener('DOMContentLoaded', function() {
    // Check if anime.js is available
    if (typeof anime !== 'undefined') {
        // Initialize nature animations
        initNatureAnimations();
        
        // Add scroll-triggered animations
        initScrollAnimations();
    } else {
        // Fallback: wait for anime.js to load
        console.log('Anime.js not loaded yet, waiting...');
        const checkAnime = setInterval(function() {
            if (typeof anime !== 'undefined') {
                clearInterval(checkAnime);
                initNatureAnimations();
                initScrollAnimations();
            }
        }, 100);
    }
});

function initNatureAnimations() {
    // Enhanced river flow with anime.js
    const riverStreams = document.querySelectorAll('.river-stream');
    
    riverStreams.forEach((stream, index) => {
        anime({
            targets: stream,
            translateX: ['-100%', '100%'],
            duration: 8000 + (index * 2000),
            easing: 'linear',
            loop: true,
            delay: index * 1000
        });
    });

    // Floating leaves with more natural movement
    const leaves = document.querySelectorAll('.leaf');
    
    leaves.forEach((leaf, index) => {
        // Random starting position
        const startX = Math.random() * 80 + 10; // 10% to 90%
        const startY = Math.random() * 60 + 20; // 20% to 80%
        
        leaf.style.left = startX + '%';
        leaf.style.top = startY + '%';
        
        // Create smooth continuous animation for leaves - start immediately
        const leafAnimation = anime({
            targets: leaf,
            translateY: [
                { value: 0, duration: 0 },
                { value: -30, duration: 3000, easing: 'easeInOutSine' },
                { value: -10, duration: 2000, easing: 'easeInOutSine' },
                { value: -40, duration: 3000, easing: 'easeInOutSine' },
                { value: 0, duration: 2000, easing: 'easeInOutSine' }
            ],
            translateX: [
                { value: 0, duration: 0 },
                { value: Math.random() * 20 - 10, duration: 4000, easing: 'easeInOutSine' },
                { value: Math.random() * 20 - 10, duration: 4000, easing: 'easeInOutSine' },
                { value: Math.random() * 20 - 10, duration: 4000, easing: 'easeInOutSine' },
                { value: 0, duration: 4000, easing: 'easeInOutSine' }
            ],
            rotate: [
                { value: 0, duration: 0 },
                { value: 360, duration: 4000, easing: 'easeInOutSine' },
                { value: 720, duration: 4000, easing: 'easeInOutSine' },
                { value: 1080, duration: 4000, easing: 'easeInOutSine' },
                { value: 1440, duration: 4000, easing: 'easeInOutSine' }
            ],
            opacity: [
                { value: 0.7, duration: 0 },
                { value: 1, duration: 2000, easing: 'easeInOutSine' },
                { value: 0.8, duration: 2000, easing: 'easeInOutSine' },
                { value: 0.9, duration: 2000, easing: 'easeInOutSine' },
                { value: 0.7, duration: 2000, easing: 'easeInOutSine' }
            ],
            loop: true,
            delay: 0, // Start immediately
            direction: 'alternate',
            autoplay: true
        });
    });

    // Bubbles with realistic physics - smooth restart, start immediately
    const bubbles = document.querySelectorAll('.bubble');
    
    bubbles.forEach((bubble, index) => {
        const startX = Math.random() * 80 + 10;
        bubble.style.left = startX + '%';
        
        // Create smooth bubble animation that restarts seamlessly
        const bubbleAnimation = anime({
            targets: bubble,
            translateY: [
                { value: 0, duration: 0 },
                { value: -20, duration: 1000, easing: 'easeOutQuad' },
                { value: -100, duration: 2000, easing: 'easeInQuad' },
                { value: -200, duration: 2000, easing: 'easeInQuad' },
                { value: -300, duration: 1000, easing: 'easeInQuad' }
            ],
            scale: [
                { value: 0, duration: 0 },
                { value: 1, duration: 500, easing: 'easeOutQuad' },
                { value: 1.2, duration: 2000, easing: 'easeInQuad' },
                { value: 1.5, duration: 2000, easing: 'easeInQuad' },
                { value: 0, duration: 1000, easing: 'easeInQuad' }
            ],
            opacity: [
                { value: 0, duration: 0 },
                { value: 1, duration: 500, easing: 'easeOutQuad' },
                { value: 0.8, duration: 2000, easing: 'easeInQuad' },
                { value: 0.6, duration: 2000, easing: 'easeInQuad' },
                { value: 0, duration: 1000, easing: 'easeInQuad' }
            ],
            loop: true,
            delay: 0, // Start immediately
            autoplay: true
        });
    });

    // Grass swaying animation - smooth back and forth, start immediately
    const grassElements = document.querySelectorAll('.grass');
    
    grassElements.forEach((grass, index) => {
        anime({
            targets: grass,
            rotate: [
                { value: 0, duration: 0 },
                { value: 5, duration: 2000, easing: 'easeInOutSine' },
                { value: -3, duration: 2000, easing: 'easeInOutSine' },
                { value: 3, duration: 2000, easing: 'easeInOutSine' },
                { value: 0, duration: 2000, easing: 'easeInOutSine' }
            ],
            loop: true,
            delay: 0, // Start immediately
            direction: 'alternate',
            autoplay: true
        });
    });

    // Add some floating particles
    createFloatingParticles();
    
    // Animate sun rays
    animateSunRays();
    
    // Animate bottom river
    animateBottomRiver();
}

function animateSunRays() {
    const sunRays = document.querySelectorAll('.sun-ray');
    
    sunRays.forEach((ray, index) => {
        const rotation = index * 45; // 0, 45, 90, 135, 180 degrees
        ray.style.setProperty('--rotation', rotation + 'deg');
        
        anime({
            targets: ray,
            opacity: [
                { value: 0.3, duration: 0 },
                { value: 0.8, duration: 2000, easing: 'easeInOutSine' },
                { value: 0.3, duration: 2000, easing: 'easeInOutSine' }
            ],
            scaleY: [
                { value: 1, duration: 0 },
                { value: 1.2, duration: 2000, easing: 'easeInOutSine' },
                { value: 1, duration: 2000, easing: 'easeInOutSine' }
            ],
            loop: true,
            delay: 0, // Start immediately
            direction: 'alternate',
            autoplay: true
        });
    });
}

function animateBottomRiver() {
    const bottomRiverStreams = document.querySelectorAll('.bottom-river-stream');
    const riverWaves = document.querySelectorAll('.river-wave');
    const riverRipples = document.querySelectorAll('.river-ripple');
    const riverReflections = document.querySelectorAll('.river-reflection');
    const riverFoam = document.querySelectorAll('.river-foam');
    const riverSparkles = document.querySelectorAll('.river-sparkle');
    const riverBubbles = document.querySelectorAll('.river-bubble');
    const sinusoidalWaves = document.querySelectorAll('.sinusoidal-wave');
    
    // Animate main river streams
    bottomRiverStreams.forEach((stream, index) => {
        if (typeof anime !== 'undefined') {
            stream.style.transform = 'translateX(-100%)';
            
            anime({
                targets: stream,
                translateX: ['-100%', '100%'],
                duration: 15000 + (index * 3000),
                easing: 'linear',
                loop: true,
                delay: 0,
                autoplay: true
            });
        }
    });
    
    // Animate river waves
    riverWaves.forEach((wave, index) => {
        if (typeof anime !== 'undefined') {
            anime({
                targets: wave,
                translateX: ['-100%', '100%'],
                opacity: [0.3, 0.8, 0.3],
                duration: 8000 + (index * 2000),
                easing: 'easeInOutSine',
                loop: true,
                delay: index * 1000,
                autoplay: true
            });
        }
    });
    
    // Animate river ripples
    riverRipples.forEach((ripple, index) => {
        if (typeof anime !== 'undefined') {
            anime({
                targets: ripple,
                scale: [0.3, 1.8],
                opacity: [0, 0.9, 0],
                duration: 3000,
                easing: 'easeOutQuad',
                loop: true,
                delay: index * 500,
                autoplay: true
            });
        }
    });
    
    // Animate river reflections
    riverReflections.forEach((reflection, index) => {
        if (typeof anime !== 'undefined') {
            anime({
                targets: reflection,
                translateY: [0, -3],
                scaleY: [1, 1.1],
                opacity: [0.2, 0.6, 0.2],
                duration: 12000 + (index * 3000),
                easing: 'easeInOutSine',
                loop: true,
                delay: index * 2000,
                autoplay: true
            });
        }
    });
    
    // Animate river foam
    riverFoam.forEach((foam, index) => {
        if (typeof anime !== 'undefined') {
            anime({
                targets: foam,
                translateX: [-50, 0],
                opacity: [0.1, 0.4, 0.1],
                duration: 8000 + (index * 2000),
                easing: 'easeInOutSine',
                loop: true,
                delay: index * 1500,
                autoplay: true
            });
        }
    });
    
    // Animate river sparkles
    riverSparkles.forEach((sparkle, index) => {
        if (typeof anime !== 'undefined') {
            anime({
                targets: sparkle,
                scale: [0.5, 1.2, 1, 1.1, 0.5],
                rotate: [0, 90, 180, 270, 0],
                opacity: [0, 1, 0.8, 1, 0],
                duration: 4000,
                easing: 'easeInOutSine',
                loop: true,
                delay: index * 800,
                autoplay: true
            });
        }
    });
    
    // Animate river bubbles
    riverBubbles.forEach((bubble, index) => {
        if (typeof anime !== 'undefined') {
            anime({
                targets: bubble,
                translateY: [0, -20, -40],
                scale: [0.5, 1, 0.3],
                opacity: [0, 0.8, 0],
                duration: 5000,
                easing: 'easeOutQuad',
                loop: true,
                delay: index * 1200,
                autoplay: true
            });
        }
    });
    
    // Animate sinusoidal waves
    sinusoidalWaves.forEach((wave, index) => {
        if (typeof anime !== 'undefined') {
            anime({
                targets: wave,
                translateX: ['-100%', '0%'],
                opacity: [0.3, 1, 0.3],
                duration: 12000 + (index * 3000),
                easing: 'linear',
                loop: true,
                delay: index * 2000,
                autoplay: true
            });
        }
    });
    
    // Синусоидные волны анимированы успешно
}

function createFloatingParticles() {
    const hero = document.querySelector('.hero');
    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'floating-particles';
    particlesContainer.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 1;
    `;
    
    hero.appendChild(particlesContainer);

    // Create 15 floating particles
    for (let i = 0; i < 15; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.cssText = `
            position: absolute;
            width: 4px;
            height: 4px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
        `;
        
        particlesContainer.appendChild(particle);
        
        // Animate each particle with smooth restart - start immediately
        anime({
            targets: particle,
            translateY: [
                { value: 0, duration: 0 },
                { value: -50, duration: 4000, easing: 'easeInOutSine' },
                { value: -100, duration: 4000, easing: 'easeInOutSine' },
                { value: -150, duration: 4000, easing: 'easeInOutSine' }
            ],
            translateX: [
                { value: 0, duration: 0 },
                { value: Math.random() * 20 - 10, duration: 4000, easing: 'easeInOutSine' },
                { value: Math.random() * 20 - 10, duration: 4000, easing: 'easeInOutSine' },
                { value: 0, duration: 4000, easing: 'easeInOutSine' }
            ],
            opacity: [
                { value: 0, duration: 0 },
                { value: 0.3, duration: 2000, easing: 'easeOutQuad' },
                { value: 0.3, duration: 4000, easing: 'easeInOutSine' },
                { value: 0, duration: 2000, easing: 'easeInQuad' }
            ],
            loop: true,
            delay: 0, // Start immediately
            autoplay: true
        });
    }
}

function initScrollAnimations() {
    // Check if anime.js is available
    if (typeof anime === 'undefined') {
        console.warn('Anime.js not available for scroll animations');
        return;
    }
    
    // Animate elements on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                
                // Animate category cards
                if (element.classList.contains('category-card')) {
                    if (typeof anime !== 'undefined') {
                        anime({
                            targets: element,
                            translateY: [50, 0],
                            opacity: [0, 1],
                            duration: 800,
                            easing: 'easeOutQuad',
                            delay: anime.stagger(100)
                        });
                    }
                }
                
                // Animate product cards
                if (element.classList.contains('product-card')) {
                    if (typeof anime !== 'undefined') {
                        anime({
                            targets: element,
                            translateY: [30, 0],
                            opacity: [0, 1],
                            duration: 600,
                            easing: 'easeOutQuad',
                            delay: anime.stagger(50)
                        });
                    }
                }
                
                // Animate features
                if (element.classList.contains('feature')) {
                    if (typeof anime !== 'undefined') {
                        anime({
                            targets: element,
                            translateY: [30, 0],
                            opacity: [0, 1],
                            duration: 800,
                            easing: 'easeOutQuad',
                            delay: anime.stagger(200)
                        });
                    }
                }
                
                // Animate contact items
                if (element.classList.contains('contact-item')) {
                    if (typeof anime !== 'undefined') {
                        anime({
                            targets: element,
                            translateX: [-30, 0],
                            opacity: [0, 1],
                            duration: 600,
                            easing: 'easeOutQuad',
                            delay: anime.stagger(150)
                        });
                    }
                }
            }
        });
    }, observerOptions);

    // Observe elements
    document.querySelectorAll('.category-card, .product-card, .feature, .contact-item').forEach(el => {
        observer.observe(el);
    });
}

// Add hover effects for interactive elements
document.addEventListener('DOMContentLoaded', function() {
    // Check if anime.js is available
    if (typeof anime === 'undefined') {
        return;
    }
    
    // Enhanced hover effects for category cards
    const categoryCards = document.querySelectorAll('.category-card');
    
    categoryCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            if (typeof anime !== 'undefined') {
                anime({
                    targets: this.querySelector('.category-icon'),
                    scale: [1, 1.1],
                    rotate: [0, 5],
                    duration: 300,
                    easing: 'easeOutQuad'
                });
            }
        });
        
        card.addEventListener('mouseleave', function() {
            if (typeof anime !== 'undefined') {
                anime({
                    targets: this.querySelector('.category-icon'),
                    scale: [1.1, 1],
                    rotate: [5, 0],
                    duration: 300,
                    easing: 'easeOutQuad'
                });
            }
        });
    });

    // Enhanced hover effects for product cards
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            if (typeof anime !== 'undefined') {
                anime({
                    targets: this,
                    translateY: [-5, 0],
                    scale: [1, 1.02],
                    duration: 300,
                    easing: 'easeOutQuad'
                });
            }
        });
        
        card.addEventListener('mouseleave', function() {
            if (typeof anime !== 'undefined') {
                anime({
                    targets: this,
                    translateY: [0, 0],
                    scale: [1.02, 1],
                    duration: 300,
                    easing: 'easeOutQuad'
                });
            }
        });
    });
});

// Add parallax effect to nature elements with smooth performance
let ticking = false;

window.addEventListener('scroll', function() {
    if (!ticking) {
        requestAnimationFrame(function() {
            const scrolled = window.pageYOffset;
            const parallaxElements = document.querySelectorAll('.leaf, .bubble, .grass');
            
            parallaxElements.forEach((element, index) => {
                const speed = 0.3 + (index * 0.05);
                const yPos = -(scrolled * speed);
                element.style.transform = element.style.transform.replace(/translateY\([^)]*\)/, '') + ` translateY(${yPos}px)`;
            });
            ticking = false;
        });
        ticking = true;
    }
});

// Add water ripple effect on click with smooth animation
let rippleCooldown = false;

document.addEventListener('click', function(e) {
    // Prevent multiple ripples from rapid clicking
    if (rippleCooldown) {
        return;
    }
    
    rippleCooldown = true;
    
    const ripple = document.createElement('div');
    ripple.className = 'water-ripple';
    ripple.style.cssText = `
        position: fixed;
        width: 20px;
        height: 20px;
        border: 2px solid rgba(255, 255, 255, 0.6);
        border-radius: 50%;
        pointer-events: none;
        z-index: 1000;
        left: ${e.clientX - 10}px;
        top: ${e.clientY - 10}px;
        transform: scale(0);
        opacity: 1;
        will-change: transform, opacity;
        backface-visibility: hidden;
    `;
    
    document.body.appendChild(ripple);
    
    // Use CSS animation for smoother performance
    ripple.style.animation = 'rippleExpand 0.8s ease-out forwards';
    
    // Remove element after animation completes
    setTimeout(() => {
        if (ripple.parentNode) {
            ripple.remove();
        }
        // Reset cooldown after animation
        setTimeout(() => {
            rippleCooldown = false;
        }, 200);
    }, 800);
    
    // Fallback to anime.js if CSS animation is not supported
    if (typeof anime !== 'undefined' && !CSS.supports('animation', 'rippleExpand 0.8s ease-out')) {
        anime({
            targets: ripple,
            scale: [0, 4],
            opacity: [1, 0],
            duration: 800,
            easing: 'easeOutCubic',
            complete: function() {
                ripple.remove();
                // Reset cooldown after animation
                setTimeout(() => {
                    rippleCooldown = false;
                }, 200);
            }
        });
    }
});

// Add smooth performance optimizations
function optimizeAnimations() {
    // Add will-change property to animated elements
    const animatedElements = document.querySelectorAll('.leaf, .bubble, .grass, .sun-ray, .river-stream, .bottom-river-stream, .river-wave, .river-ripple, .river-reflection, .river-foam, .river-sparkle, .river-bubble, .river-depth, .sinusoidal-wave');
    animatedElements.forEach(element => {
        element.style.willChange = 'transform, opacity';
    });
    
    // Reduce motion for users who prefer it
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const reducedMotionElements = document.querySelectorAll('.leaf, .bubble, .grass, .sun-ray, .particle, .bottom-river-stream, .river-wave, .river-ripple, .river-reflection, .river-foam, .river-sparkle, .river-bubble, .river-depth, .sinusoidal-wave');
        reducedMotionElements.forEach(element => {
            element.style.animationDuration = '0.01ms';
            element.style.animationIterationCount = '1';
        });
    }
}

// Initialize optimizations
document.addEventListener('DOMContentLoaded', function() {
    optimizeAnimations();
    
    // Add smooth easing for better animation quality
    addSmoothEasing();
});

// Alternative initialization for when anime.js loads after DOM
window.addEventListener('load', function() {
    // Try to add easing functions again in case anime.js loaded after DOM
    if (typeof anime !== 'undefined' && anime.easings) {
        addSmoothEasing();
    }
});

// Add smooth easing functions for more natural animations
function addSmoothEasing() {
    // Check if anime.js is loaded and easings object exists
    if (typeof anime !== 'undefined' && anime.easings) {
        // Custom easing function for more natural movement
        anime.easings['natural'] = function(t) {
            return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        };
        
        // Custom easing for floating elements
        anime.easings['float'] = function(t) {
            return Math.sin(t * Math.PI * 2) * 0.5 + 0.5;
        };
        
        // Custom easing for breathing effect
        anime.easings['breathe'] = function(t) {
            return Math.sin(t * Math.PI) * 0.5 + 0.5;
        };
    } else {
        // Fallback: use built-in easing functions if anime.js is not ready
        console.log('Anime.js easings not available, using built-in easing functions');
    }
}

// Add smooth restart function for animations
function createSmoothLoopAnimation(element, properties, duration, delay = 0) {
    // Check if anime.js is available
    if (typeof anime === 'undefined') {
        console.warn('Anime.js not available for smooth loop animation');
        return null;
    }
    
    const animation = anime({
        targets: element,
        ...properties,
        duration: duration,
        delay: delay,
        loop: true,
        direction: 'alternate',
        easing: 'easeInOutSine',
        autoplay: true
    });
    
    // Ensure smooth restart
    animation.complete = function() {
        // Reset to initial state smoothly
        if (typeof anime !== 'undefined') {
            anime({
                targets: element,
                ...properties,
                duration: 0,
                delay: 0
            });
        }
    };
    
    return animation;
} 