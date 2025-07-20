/**
 * Модуль для обработки событий - ОПТИМИЗИРОВАННАЯ ВЕРСИЯ
 * Отвечает за все пользовательские взаимодействия и обработчики событий
 */

// Текущий фильтр категорий
let currentFilter = 'all';

// Кэш для обработчиков событий с улучшенной логикой
const eventHandlers = new Map();

// Кэш для валидации с ограничением размера
const formValidationCache = new Map();
const VALIDATION_CACHE_MAX_SIZE = 100;

// Кэш для DOM элементов
const domCache = new Map();

// Флаг инициализации
let isInitialized = false;

/**
 * Безопасная функция логирования, которая работает до загрузки Utils
 * @param {string} level - Уровень логирования (Info, Warn, Error, Debug)
 * @param {string} message - Сообщение
 * @param {*} data - Данные
 */
function safeLog(level, message, data = null) {
    if (window.Utils && window.Utils[`log${level}`]) {
        window.Utils[`log${level}`](message, data);
    } else {
        const timestamp = new Date().toLocaleTimeString('ru-RU');
        const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
        if (data !== null && data !== undefined) {
            console.log(`${prefix} ${message}`, data);
        } else {
            console.log(`${prefix} ${message}`);
        }
    }
}

/**
 * Ограничивает размер кэша валидации
 */
function limitValidationCacheSize() {
    if (formValidationCache.size > VALIDATION_CACHE_MAX_SIZE) {
        const firstKey = formValidationCache.keys().next().value;
        formValidationCache.delete(firstKey);
    }
}

/**
 * Получает DOM элемент с кэшированием
 * @param {string} selector - CSS селектор
 * @returns {HTMLElement|null} DOM элемент
 */
function getCachedElement(selector) {
    if (domCache.has(selector)) {
        return domCache.get(selector);
    }
    
    const element = document.querySelector(selector);
    domCache.set(selector, element);
    return element;
}

/**
 * Инициализирует все обработчики событий с оптимизацией
 */
function initializeEventListeners() {
    if (isInitialized) {
        safeLog('Info', 'Обработчики событий уже инициализированы');
        return;
    }
    
    try {
        setupCategoryFiltering();
        setupModalEvents();
        setupNavigationEvents();
        setupContactForm();
        setupScrollEvents();
        handleOrderButton();
        
        // Устанавливаем активную категорию "Все" по умолчанию
        const ui = window.UI || window.App?.modules?.UI;
        if (ui && ui.updateActiveCategory) {
            ui.updateActiveCategory('all');
        }
        
        isInitialized = true;
        safeLog('Info', 'Все обработчики событий успешно инициализированы');
        
    } catch (error) {
        safeLog('Error', 'Ошибка при инициализации обработчиков событий', error);
    }
}

/**
 * Настраивает фильтрацию по категориям с улучшенным делегированием событий
 */
function setupCategoryFiltering() {
    // Используем делегирование событий для лучшей производительности
    const categoryContainer = getCachedElement('.categories-container') || document.body;
    
    const handleCategoryClick = (event) => {
        const categoryCard = event.target.closest('.category-card');
        if (categoryCard) {
            const category = categoryCard.dataset.category;
            if (category && category !== currentFilter) {
                filterProducts(category);
                
                // Обновляем активную категорию в интерфейсе
                const ui = window.UI || window.App?.modules?.UI;
                if (ui && ui.updateActiveCategory) {
                    ui.updateActiveCategory(category);
                }
            }
        }
    };
    
    // Используем throttle для оптимизации частых кликов
    const throttledHandler = window.Utils ? window.Utils.throttle(handleCategoryClick, 100) : handleCategoryClick;
    
    categoryContainer.addEventListener('click', throttledHandler);
    eventHandlers.set('categoryFiltering', { element: categoryContainer, handler: throttledHandler });
    
    safeLog('Info', 'Фильтрация по категориям настроена');
}

/**
 * Фильтрует товары по выбранной категории с оптимизацией
 * @param {string} category - Категория для фильтрации
 */
function filterProducts(category) {
    safeLog('Info', `Фильтрация товаров по категории: ${category}`);
    currentFilter = category;
    
    // Получаем отфильтрованные товары
    let filteredProducts = [];
    
    // Пробуем разные способы получения данных с приоритетом
    if (window.ProductData && window.ProductData.filterProductsByCategory) {
        safeLog('Debug', 'Используем window.ProductData');
        filteredProducts = window.ProductData.filterProductsByCategory(category);
    } else if (window.App && window.App.modules && window.App.modules.ProductData && window.App.modules.ProductData.filterProductsByCategory) {
        safeLog('Debug', 'Используем window.App.modules.ProductData');
        filteredProducts = window.App.modules.ProductData.filterProductsByCategory(category);
    } else if (window.LoadAllProducts && window.LoadAllProducts.getProductsByCategory) {
        safeLog('Debug', 'Используем window.LoadAllProducts');
        filteredProducts = window.LoadAllProducts.getProductsByCategory(category);
    } else {
        safeLog('Debug', 'Используем fallback фильтрацию');
        // Fallback: фильтруем из глобального массива товаров
        const allProducts = window.App?.products || [];
        safeLog('Debug', `Всего товаров для фильтрации: ${allProducts.length}`);
        if (category === 'all') {
            filteredProducts = allProducts;
        } else {
            filteredProducts = allProducts.filter(product => 
                product.tags && product.tags.includes(category)
            );
        }
    }
    
    safeLog('Info', `Отфильтровано товаров: ${filteredProducts.length}`);
    
    // Отображаем товары
    const ui = window.UI || window.App?.modules?.UI;
    if (ui && ui.displayProducts) {
        safeLog('Debug', 'Используем UI.displayProducts');
        ui.displayProducts(filteredProducts);
    } else {
        safeLog('Debug', 'Используем fallback отрисовку');
        // Fallback: прямая отрисовка
        displayProductsDirectly(filteredProducts);
    }
}

/**
 * Прямая отрисовка товаров (fallback) с оптимизацией
 * @param {Array} products - Массив товаров
 */
function displayProductsDirectly(products) {
    const productsGrid = getCachedElement('#productsGrid');
    if (!productsGrid) return;
    
    // Очищаем сетку
    productsGrid.innerHTML = '';
    
    if (products.length === 0) {
        productsGrid.innerHTML = `
            <div class="no-products">
                <h3>Товары не найдены</h3>
                <p>Попробуйте выбрать другую категорию</p>
            </div>
        `;
        return;
    }
    
    // Используем DocumentFragment для оптимизации
    const fragment = document.createDocumentFragment();
    
    // Создаем карточки товаров
    products.forEach((product, index) => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.style.animationDelay = `${0.1 + index * 0.1}s`;
        
        card.innerHTML = `
            <div class="product-image-container">
                <img src="${product.images[0]}" alt="${product.name}" class="product-image">
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <div class="product-description">${product.description || 'Описание товара отсутствует'}</div>
                <div class="product-footer">
                    <span class="product-country">${product.country}</span>
                    <div class="product-price">${product.price}</div>
                </div>
            </div>
        `;
        
        // Добавляем обработчик клика
        card.addEventListener('click', () => {
            showSimpleModal(product);
        });
        
        fragment.appendChild(card);
    });
    
    productsGrid.appendChild(fragment);
}

/**
 * Простое модальное окно (fallback) с оптимизацией
 * @param {Object} product - Товар
 */
function showSimpleModal(product) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <div class="modal-body">
                <img src="${product.images[0]}" alt="${product.name}" style="max-width: 100%; height: auto;">
                <h2>${product.name}</h2>
                <p>${product.description || 'Описание отсутствует'}</p>
                <p><strong>Цена:</strong> ${product.price}</p>
                <p><strong>Страна:</strong> ${product.country}</p>
            </div>
        </div>
    `;
    
    // Закрытие модального окна
    const closeModal = () => {
        if (modal.parentNode) {
            modal.parentNode.removeChild(modal);
        }
    };
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal || e.target.classList.contains('close')) {
            closeModal();
        }
    });
    
    // Закрытие по Escape
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            closeModal();
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);
    
    document.body.appendChild(modal);
}

/**
 * Настраивает события для модального окна с оптимизацией
 */
function setupModalEvents() {
    const modal = getCachedElement('#productModal');
    const closeModal = getCachedElement('.close');
    
    if (!modal || !closeModal) {
        safeLog('Warn', 'Модальное окно или кнопка закрытия не найдены');
        return;
    }
    
    const ui = window.UI || window.App?.modules?.UI;
    
    // Закрытие по клику на крестик
    const handleCloseClick = () => {
        if (ui && ui.closeProductModal) {
            ui.closeProductModal();
        }
    };
    
    closeModal.addEventListener('click', handleCloseClick);
    eventHandlers.set('modalClose', { element: closeModal, handler: handleCloseClick });
    
    // Закрытие по клику вне модального окна
    const handleModalClick = function(e) {
        if (e.target === modal) {
            if (ui && ui.closeProductModal) {
                ui.closeProductModal();
            }
        }
    };
    
    modal.addEventListener('click', handleModalClick);
    eventHandlers.set('modalOverlay', { element: modal, handler: handleModalClick });
    
    // Закрытие по нажатию клавиши Escape
    const handleEscape = function(e) {
        if (e.key === 'Escape' && modal.style.display === 'block') {
            if (ui && ui.closeProductModal) {
                ui.closeProductModal();
            }
        }
    };
    
    document.addEventListener('keydown', handleEscape);
    eventHandlers.set('modalEscape', { element: document, handler: handleEscape });
    
    safeLog('Info', 'События модального окна настроены');
}

/**
 * Настраивает события навигации с оптимизацией
 */
function setupNavigationEvents() {
    // Используем делегирование событий
    const navContainer = getCachedElement('nav') || document.body;
    
    const handleNavClick = (event) => {
        const navLink = event.target.closest('.nav-link');
        if (navLink) {
            event.preventDefault();
            
            // Получаем ID секции из href атрибута
            const href = navLink.getAttribute('href');
            const section = href ? href.substring(1) : null; // Убираем # из начала
            
            if (section) {
                // Плавная прокрутка к секции
                const targetSection = document.getElementById(section);
                if (targetSection) {
                    const utils = window.Utils;
                    if (utils && utils.smoothScrollTo) {
                        utils.smoothScrollTo(targetSection, { block: 'start' });
                    } else {
                        targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }
                
                // Обновляем активную навигацию
                const ui = window.UI || window.App?.modules?.UI;
                if (ui && ui.updateActiveNavigation) {
                    ui.updateActiveNavigation(section);
                }
                
                // Обновляем активный класс в навигации
                document.querySelectorAll('.nav-link').forEach(link => {
                    link.classList.remove('active');
                });
                navLink.classList.add('active');
            }
        }
    };
    
    // Используем throttle для оптимизации
    const throttledHandler = window.Utils ? window.Utils.throttle(handleNavClick, 100) : handleNavClick;
    
    navContainer.addEventListener('click', throttledHandler);
    eventHandlers.set('navigation', { element: navContainer, handler: throttledHandler });
    
    safeLog('Info', 'События навигации настроены');
}

/**
 * Настраивает форму контактов с оптимизацией
 */
function setupContactForm() {
    const contactForm = getCachedElement('#contactForm');
    if (!contactForm) {
        safeLog('Warn', 'Форма контактов не найдена');
        return;
    }
    
    // Обработчик отправки формы
    const handleSubmit = (e) => {
        e.preventDefault();
        handleContactForm(e);
    };
    
    contactForm.addEventListener('submit', handleSubmit);
    eventHandlers.set('contactForm', { element: contactForm, handler: handleSubmit });
    
    // Валидация полей в реальном времени
    const formFields = contactForm.querySelectorAll('input, textarea');
    formFields.forEach(field => {
        const handleValidation = (e) => {
            validateField(e);
        };
        
        field.addEventListener('blur', handleValidation);
        field.addEventListener('input', (e) => clearFieldError(e));
        
        eventHandlers.set(`field_${field.name}`, { element: field, handler: handleValidation });
    });
    
    safeLog('Info', 'Форма контактов настроена');
}

/**
 * Обрабатывает отправку формы контактов с оптимизацией
 * @param {Event} e - Событие отправки формы
 */
function handleContactForm(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    
    const name = formData.get('name')?.trim();
    const email = formData.get('email')?.trim();
    const message = formData.get('message')?.trim();
    
    // Валидация данных
    const validation = validateFormData(name, email, message);
    if (!validation.isValid) {
        safeLog('Warn', 'Ошибка валидации формы', validation.errors);
        return;
    }
    
    // Показываем индикатор загрузки
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Отправка...';
    submitButton.disabled = true;
    
    // Имитация отправки (в реальном проекте здесь будет AJAX запрос)
    setTimeout(() => {
        // Восстанавливаем кнопку
        submitButton.textContent = originalText;
        submitButton.disabled = false;
        
        // Показываем сообщение об успехе
        showSuccessMessage('Сообщение успешно отправлено!');
        
        // Очищаем форму
        form.reset();
        
        safeLog('Info', 'Форма контактов отправлена');
    }, 1500);
}

/**
 * Валидирует данные формы с кэшированием
 * @param {string} name - Имя
 * @param {string} email - Email
 * @param {string} message - Сообщение
 * @returns {Object} Результат валидации
 */
function validateFormData(name, email, message) {
    const cacheKey = `${name}-${email}-${message}`;
    if (formValidationCache.has(cacheKey)) {
        return formValidationCache.get(cacheKey);
    }
    
    const errors = [];
    
    if (!name || name.length < 2) {
        errors.push('Имя должно содержать минимум 2 символа');
    }
    
    if (!email || !isValidEmail(email)) {
        errors.push('Введите корректный email адрес');
    }
    
    if (!message || message.length < 10) {
        errors.push('Сообщение должно содержать минимум 10 символов');
    }
    
    const result = {
        isValid: errors.length === 0,
        errors: errors
    };
    
    // Кэшируем результат
    formValidationCache.set(cacheKey, result);
    limitValidationCacheSize();
    
    return result;
}

/**
 * Проверяет корректность email с кэшированием
 * @param {string} email - Email для проверки
 * @returns {boolean} true если email корректный
 */
function isValidEmail(email) {
    if (formValidationCache.has(`email_${email}`)) {
        return formValidationCache.get(`email_${email}`);
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(email);
    
    formValidationCache.set(`email_${email}`, isValid);
    limitValidationCacheSize();
    
    return isValid;
}

/**
 * Показывает ошибку поля
 * @param {string} fieldName - Имя поля
 * @param {string} message - Сообщение об ошибке
 */
function showFieldError(fieldName, message) {
    const field = document.querySelector(`[name="${fieldName}"]`);
    if (!field) return;
    
    // Удаляем существующую ошибку
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
    
    // Создаем элемент ошибки
    const errorElement = document.createElement('div');
    errorElement.className = 'field-error';
    errorElement.textContent = message;
    errorElement.style.cssText = `
        color: #f44336;
        font-size: 12px;
        margin-top: 5px;
        animation: slideIn 0.3s ease;
    `;
    
    field.parentNode.appendChild(errorElement);
    field.style.borderColor = '#f44336';
}

/**
 * Очищает ошибку поля
 * @param {Event} e - Событие
 */
function clearFieldError(e) {
    const field = e.target;
    const errorElement = field.parentNode.querySelector('.field-error');
    
    if (errorElement) {
        errorElement.remove();
    }
    
    field.style.borderColor = '';
}

/**
 * Валидирует отдельное поле
 * @param {Event} e - Событие
 */
function validateField(e) {
    const field = e.target;
    const fieldName = field.name;
    const value = field.value.trim();
    
    let isValid = true;
    let errorMessage = '';
    
    switch (fieldName) {
        case 'name':
            if (!value || value.length < 2) {
                isValid = false;
                errorMessage = 'Имя должно содержать минимум 2 символа';
            }
            break;
        case 'email':
            if (!value || !isValidEmail(value)) {
                isValid = false;
                errorMessage = 'Введите корректный email адрес';
            }
            break;
        case 'message':
            if (!value || value.length < 10) {
                isValid = false;
                errorMessage = 'Сообщение должно содержать минимум 10 символов';
            }
            break;
    }
    
    if (!isValid) {
        showFieldError(fieldName, errorMessage);
    } else {
        clearFieldError(e);
    }
}

/**
 * Показывает сообщение об успехе
 * @param {string} message - Сообщение
 */
function showSuccessMessage(message) {
    const utils = window.Utils;
    if (utils && utils.showNotification) {
        utils.showNotification(message, 'success');
    } else {
        // Fallback уведомление
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4caf50;
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }
}

/**
 * Настраивает события прокрутки с оптимизацией
 */
function setupScrollEvents() {
    let ticking = false;
    
    function updateScroll() {
        // Обновляем активную секцию навигации
        const sections = document.querySelectorAll('section[id]');
        const scrollPosition = window.scrollY + 100;
        
        let currentSection = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                currentSection = section.id;
            }
        });
        
        if (currentSection) {
            const ui = window.UI || window.App?.modules?.UI;
            if (ui && ui.updateActiveNavigation) {
                ui.updateActiveNavigation(currentSection);
            }
            
            // Обновляем активный класс в навигации
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
            });
            const activeNavLink = document.querySelector(`.nav-link[href="#${currentSection}"]`);
            if (activeNavLink) {
                activeNavLink.classList.add('active');
            }
        }
        
        // Обновляем видимость кнопки "Наверх"
        toggleScrollToTopButton();
        
        ticking = false;
    }
    
    function requestTick() {
        if (!ticking) {
            requestAnimationFrame(updateScroll);
            ticking = true;
        }
    }
    
    // Используем throttle для оптимизации
    const throttledHandler = window.Utils ? window.Utils.throttle(requestTick, 16) : requestTick;
    
    window.addEventListener('scroll', throttledHandler);
    eventHandlers.set('scroll', { element: window, handler: throttledHandler });
    
    safeLog('Info', 'События прокрутки настроены');
}

/**
 * Настраивает кнопку "Наверх" с оптимизацией
 */
function setupScrollToTopButton() {
    const scrollToTopBtn = getCachedElement('#scrollToTop');
    if (!scrollToTopBtn) {
        safeLog('Warn', 'Кнопка "Наверх" не найдена');
        return;
    }
    
    const handleClick = () => {
        const utils = window.Utils;
        if (utils && utils.smoothScrollTo) {
            utils.smoothScrollTo('body', { block: 'start' });
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };
    
    scrollToTopBtn.addEventListener('click', handleClick);
    eventHandlers.set('scrollToTop', { element: scrollToTopBtn, handler: handleClick });
    
    safeLog('Info', 'Кнопка "Наверх" настроена');
}

/**
 * Переключает видимость кнопки "Наверх" с оптимизацией
 */
function toggleScrollToTopButton() {
    const scrollToTopBtn = getCachedElement('#scrollToTop');
    if (!scrollToTopBtn) return;
    
    const scrollPosition = window.scrollY;
    const windowHeight = window.innerHeight;
    
    if (scrollPosition > windowHeight * 0.5) {
        scrollToTopBtn.classList.add('show');
    } else {
        scrollToTopBtn.classList.remove('show');
    }
}

/**
 * Очищает все кэши
 */
function clearCaches() {
    eventHandlers.clear();
    formValidationCache.clear();
    domCache.clear();
    safeLog('Info', 'Кэши обработчиков событий очищены');
}

/**
 * Получает статистику использования кэшей
 * @returns {Object} Статистика кэшей
 */
function getCacheStats() {
    return {
        eventHandlers: eventHandlers.size,
        formValidationCache: formValidationCache.size,
        domCache: domCache.size,
        isInitialized: isInitialized
    };
}

/**
 * Обрабатывает нажатие кнопки "Заказать товар"
 */
function handleOrderButton() {
    const orderButton = getCachedElement('#orderButton');
    if (!orderButton) return;
    
    const handleClick = () => {
        // Закрываем модальное окно
        const modal = getCachedElement('#productModal');
        if (modal) {
            modal.style.display = 'none';
        }
        
        // Плавно прокручиваем к контактной секции
        const contactSection = document.querySelector('#contact');
        if (contactSection) {
            contactSection.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
            
            // Показываем уведомление
            setTimeout(() => {
                showSuccessMessage('Для заказа товара свяжитесь с нами по указанным контактам');
            }, 1000);
        }
    };
    
    orderButton.addEventListener('click', handleClick);
    eventHandlers.set('orderButton', { element: orderButton, handler: handleClick });
    
    safeLog('Info', 'Кнопка заказа настроена');
}

// Экспорт функций
window.Events = {
    initializeEventListeners,
    setupCategoryFiltering,
    filterProducts,
    setupModalEvents,
    setupNavigationEvents,
    setupContactForm,
    handleContactForm,
    validateFormData,
    isValidEmail,
    showFieldError,
    clearFieldError,
    validateField,
    showSuccessMessage,
    setupScrollEvents,
    setupScrollToTopButton,
    toggleScrollToTopButton,
    handleOrderButton,
    clearCaches,
    getCacheStats
}; 