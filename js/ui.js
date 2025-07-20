/**
 * Модуль для работы с пользовательским интерфейсом
 * Отвечает за отображение товаров, карточек и модальных окон
 */

// Кэш DOM элементов для оптимизации
const DOMCache = {
    productsGrid: null,
    modal: null,
    closeModal: null,
    mainImage: null,
    imageGallery: null,
    progressContainer: null,
    progressBar: null
};

// Инициализация кэша DOM элементов
function initDOMCache() {
    DOMCache.productsGrid = document.getElementById('productsGrid');
    DOMCache.modal = document.getElementById('productModal');
    DOMCache.closeModal = document.querySelector('.close');
    DOMCache.mainImage = document.getElementById('modalMainImage');
    DOMCache.imageGallery = document.getElementById('thumbnailImages');
    DOMCache.progressContainer = document.getElementById('imageRotationProgress');
    DOMCache.progressBar = document.getElementById('progressBar');
}

// Настройки автоматической смены изображений
const IMAGE_ROTATION_CONFIG = {
    enabled: true,           // Включить/выключить автоматическую смену
    interval: 3000,          // Интервал смены в миллисекундах
    onlyInModal: true        // Смена только в модальном окне
};

// Кэш для карточек товаров
const productCardsCache = new Map();

// Текущие интервалы для смены изображений
let currentRotationIntervals = {
    modal: null,
    progress: null
};

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

// Флаг для предотвращения множественных вызовов
let isDisplayingProducts = false;
let currentDisplayRequest = null;

/**
 * Отображает товары в сетке
 * @param {Array} productsToShow - Массив товаров для отображения
 */
function displayProducts(productsToShow) {
    if (!DOMCache.productsGrid) {
        initDOMCache();
    }
    
    // Проверяем, что productsToShow является массивом
    if (!Array.isArray(productsToShow)) {
        console.error('displayProducts: productsToShow должен быть массивом', productsToShow);
        productsToShow = [];
    }
    
    // Создаем уникальный идентификатор для этого запроса
    const requestId = Date.now() + Math.random();
    
    // Если уже выполняется отображение, отменяем предыдущий запрос
    if (isDisplayingProducts && currentDisplayRequest) {
        console.log('displayProducts: отменяем предыдущий запрос и начинаем новый');
        clearTimeout(currentDisplayRequest);
        isDisplayingProducts = false;
    }
    
    isDisplayingProducts = true;
    currentDisplayRequest = requestId;
    
    // Очищаем кэш карточек при смене товаров
    productCardsCache.clear();
    
    // Скрываем сетку для плавного перехода
    DOMCache.productsGrid.style.opacity = '0';
    DOMCache.productsGrid.style.transform = 'scale(0.98)';
    
    // Очищаем сетку
    setTimeout(() => {
        DOMCache.productsGrid.innerHTML = '';
        
        if (productsToShow.length === 0) {
            showNoProductsMessage();
            // Показываем сетку обратно
            DOMCache.productsGrid.style.opacity = '1';
            DOMCache.productsGrid.style.transform = 'scale(1)';
            if (currentDisplayRequest === requestId) {
                isDisplayingProducts = false;
                currentDisplayRequest = null;
            }
            return;
        }
        
        // Используем DocumentFragment для оптимизации
        const fragment = document.createDocumentFragment();
        
        productsToShow.forEach((product, index) => {
            const productCard = createProductCard(product);
            
            // Устанавливаем начальное состояние для анимации
            productCard.style.opacity = '0';
            productCard.style.transform = 'translateY(20px)';
            productCard.style.transition = 'none';
            
            fragment.appendChild(productCard);
        });
        
        DOMCache.productsGrid.appendChild(fragment);
        
        // Показываем сетку обратно
        DOMCache.productsGrid.style.opacity = '1';
        DOMCache.productsGrid.style.transform = 'scale(1)';
        DOMCache.productsGrid.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        
        // Запускаем анимацию появления карточек
        requestAnimationFrame(() => {
            const cards = Array.from(DOMCache.productsGrid.children);
            cards.forEach((productCard, index) => {
                if (productCard && productCard.classList.contains('product-card')) {
                    productCard.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                    productCard.style.transitionDelay = `${0.1 + index * 0.05}s`;
                    
                    // Запускаем анимацию
                    requestAnimationFrame(() => {
                        if (productCard.parentNode) { // Проверяем, что карточка все еще в DOM
                            productCard.style.opacity = '1';
                            productCard.style.transform = 'translateY(0)';
                        }
                    });
                }
            });
            
            // Сбрасываем флаг после завершения всех анимаций
            const totalAnimationTime = 0.5 + (cards.length * 0.05);
            setTimeout(() => {
                // Проверяем, что это все еще актуальный запрос
                if (currentDisplayRequest === requestId) {
                    isDisplayingProducts = false;
                    currentDisplayRequest = null;
                    // Убираем inline стили
                    cards.forEach((productCard) => {
                        if (productCard && productCard.classList.contains('product-card')) {
                            productCard.style.transition = '';
                            productCard.style.transitionDelay = '';
                        }
                    });
                }
            }, totalAnimationTime * 1000);
        });
    }, 150);
    
    // Дополнительная защита: сброс флага через 2 секунды
    setTimeout(() => {
        if (currentDisplayRequest === requestId) {
            isDisplayingProducts = false;
            currentDisplayRequest = null;
        }
    }, 2000);
}

/**
 * Показывает сообщение об отсутствии товаров
 */
function showNoProductsMessage() {
    if (!DOMCache.productsGrid) {
        initDOMCache();
    }
    
    DOMCache.productsGrid.innerHTML = `
        <div class="no-products">
            <h3>Товары не найдены</h3>
            <p>Попробуйте выбрать другую категорию</p>
        </div>
    `;
}

/**
 * Создает карточку товара с кэшированием
 * @param {Object} product - Объект товара
 * @returns {HTMLElement} DOM элемент карточки
 */
function createProductCard(product) {
    // Проверяем кэш
    const cacheKey = `${product.id}-${product.images[0]}`;
    if (productCardsCache.has(cacheKey)) {
        const cachedCard = productCardsCache.get(cacheKey).cloneNode(true);
        // Добавляем обработчики событий к клонированной карточке
        cachedCard.addEventListener('click', () => openProductModal(product));
        
        // Запускаем автоматическую смену изображений в карточке, если включено
        if (IMAGE_ROTATION_CONFIG.enabled && !IMAGE_ROTATION_CONFIG.onlyInModal && product.images.length > 1) {
            const imageElement = cachedCard.querySelector('.product-image');
            if (imageElement) {
                startCardImageRotation(cachedCard, product.images, imageElement);
            }
        }
        
        return cachedCard;
    }
    
    const card = document.createElement('div');
    card.className = 'product-card';
    
    // Создаем контейнер для изображения
    const imageContainer = document.createElement('div');
    imageContainer.className = 'product-image-container';
    
    // Создаем изображение (только основная фотография)
    const image = document.createElement('img');
    image.src = product.images[0];
    image.alt = product.name;
    image.className = 'product-image';
    
    // Предзагружаем изображение
    preloadImage(product.images[0]);
    
    imageContainer.appendChild(image);
    
    card.innerHTML = `
        <div class="product-info">
            <h3 class="product-name">${product.name}</h3>
            <div class="product-description">${product.description || 'Описание товара отсутствует'}</div>
            <div class="product-footer">
                <span class="product-country">${product.country}</span>
                <div class="product-price">${product.price}</div>
            </div>
        </div>
    `;
    
    // Вставляем контейнер с изображением в начало карточки
    card.insertBefore(imageContainer, card.firstChild);
    
    // Добавляем обработчик клика для открытия модального окна
    card.addEventListener('click', () => openProductModal(product));
    
    // Запускаем автоматическую смену изображений в карточке, если включено
    if (IMAGE_ROTATION_CONFIG.enabled && !IMAGE_ROTATION_CONFIG.onlyInModal && product.images.length > 1) {
        startCardImageRotation(card, product.images, image);
    }
    
    // Кэшируем карточку (без обработчиков событий)
    productCardsCache.set(cacheKey, card.cloneNode(true));
    
    return card;
}

/**
 * Предзагружает изображение
 * @param {string} src - URL изображения
 */
function preloadImage(src) {
    const img = new Image();
    img.src = src;
}

/**
 * Открывает модальное окно с информацией о товаре
 * @param {Object} product - Объект товара
 */
function openProductModal(product) {
    if (!product) {
        console.error('Попытка открыть модальное окно без товара');
        return;
    }
    
    if (!DOMCache.modal) {
        initDOMCache();
    }
    
    if (!DOMCache.modal) {
        safeLog('Error', 'Не удалось найти модальное окно');
        return;
    }
    
    safeLog('Info', 'Открытие модального окна для товара:', product.name);
    
    // Заполняем информацию о товаре
    fillModalContent(product);
    
    // Создаем галерею изображений
    createImageGallery(product);
    
    // Показываем модальное окно
    showModal();
    
    // Запускаем автоматическую смену изображений в модальном окне
    safeLog('Debug', 'Проверка условий для автоматической смены:');
    safeLog('Debug', `  enabled: ${IMAGE_ROTATION_CONFIG.enabled}`);
    safeLog('Debug', `  images.length: ${product.images.length}`);
    safeLog('Debug', `  onlyInModal: ${IMAGE_ROTATION_CONFIG.onlyInModal}`);
    
    if (IMAGE_ROTATION_CONFIG.enabled && product.images.length > 1) {
        // Показываем прогресс-бар сразу при открытии
        if (DOMCache.progressContainer && DOMCache.progressBar) {
            DOMCache.progressContainer.classList.add('show');
            DOMCache.progressBar.classList.add('animate');
            DOMCache.progressBar.style.width = '0%';
        }
        
        // Добавляем небольшую задержку для стабилизации модального окна
        setTimeout(() => {
            // Проверяем, что модальное окно все еще открыто
            if (DOMCache.modal.style.display !== 'block') {
                safeLog('Warn', 'Модальное окно закрыто, отменяем запуск автоматической смены');
                return;
            }
            
            // Запускаем автоматическую смену
            let { intervalId, progressInterval } = startModalImageRotation(product.images);
            
            // Останавливаем смену при наведении мыши
            const pauseOnHover = () => {
                if (intervalId) {
                    clearInterval(intervalId);
                    clearInterval(progressInterval);
                    if (DOMCache.progressBar) {
                        DOMCache.progressBar.classList.remove('animate');
                    }
                    safeLog('Debug', 'Смена изображений приостановлена');
                }
            };
            
            // Возобновляем смену при уходе мыши
            const resumeOnLeave = () => {
                if (IMAGE_ROTATION_CONFIG.enabled) {
                    safeLog('Debug', 'Смена изображений возобновлена');
                    const result = startModalImageRotation(product.images);
                    // Обновляем переменные для новых обработчиков
                    intervalId = result.intervalId;
                    progressInterval = result.progressInterval;
                }
            };
            
            // Удаляем старые обработчики, если они есть
            DOMCache.modal.removeEventListener('mouseenter', pauseOnHover);
            DOMCache.modal.removeEventListener('mouseleave', resumeOnLeave);
            
            // Добавляем новые обработчики
            DOMCache.modal.addEventListener('mouseenter', pauseOnHover);
            DOMCache.modal.addEventListener('mouseleave', resumeOnLeave);
            
            safeLog('Info', 'Автоматическая смена изображений запущена');
        }, 100); // Небольшая задержка для стабилизации
        
        safeLog('Debug', 'Подготовка к запуску автоматической смены изображений');
    }
}

/**
 * Запускает автоматическую смену изображений в карточке товара
 * @param {HTMLElement} card - Карточка товара
 * @param {Array} images - Массив изображений
 * @param {HTMLElement} imageElement - Элемент изображения
 */
function startCardImageRotation(card, images, imageElement) {
    let currentImageIndex = 0;
    
    const rotateImages = () => {
        currentImageIndex = (currentImageIndex + 1) % images.length;
        imageElement.src = images[currentImageIndex];
        
        // Добавляем плавный переход
        imageElement.style.transition = 'opacity 0.3s ease';
        imageElement.style.opacity = '0.8';
        
        setTimeout(() => {
            imageElement.style.opacity = '1';
        }, 150);
    };
    
    // Запускаем интервал смены изображений
    const intervalId = setInterval(rotateImages, IMAGE_ROTATION_CONFIG.interval);
    
    // Останавливаем смену при наведении мыши
    card.addEventListener('mouseenter', () => {
        clearInterval(intervalId);
    });
    
    // Возобновляем смену при уходе мыши
    card.addEventListener('mouseleave', () => {
        if (IMAGE_ROTATION_CONFIG.enabled && !IMAGE_ROTATION_CONFIG.onlyInModal) {
            startCardImageRotation(card, images, imageElement);
        }
    });
}

/**
 * Запускает автоматическую смену изображений в модальном окне
 * @param {Array} images - Массив изображений
 * @returns {Object} Объект с интервалами
 */
function startModalImageRotation(images) {
    return startModalImageRotationWithIndex(images, 0);
}

/**
 * Запускает автоматическую смену изображений в модальном окне с определенного индекса
 * @param {Array} images - Массив изображений
 * @param {number} startIndex - Начальный индекс изображения
 * @returns {Object} Объект с интервалами
 */
function startModalImageRotationWithIndex(images, startIndex = 0) {
    if (!DOMCache.mainImage || !DOMCache.progressBar) {
        initDOMCache();
    }
    
    let currentImageIndex = startIndex;
    let progress = 0;
    
    // Очищаем предыдущие интервалы
    if (currentRotationIntervals.modal) {
        clearInterval(currentRotationIntervals.modal);
    }
    if (currentRotationIntervals.progress) {
        clearInterval(currentRotationIntervals.progress);
    }
    
    // Сбрасываем прогресс-бар в начало (плавный метод)
    forceResetProgressBar();
    
    const rotateImages = () => {
        currentImageIndex = (currentImageIndex + 1) % images.length;
        if (DOMCache.mainImage) {
            DOMCache.mainImage.src = images[currentImageIndex];
        }
        
        // Обновляем активный thumbnail
        updateActiveThumbnail(currentImageIndex);
        
        // Сбрасываем прогресс плавно
        progress = 0;
        if (DOMCache.progressBar) {
            DOMCache.progressBar.style.transition = 'width 0.1s ease-out';
            DOMCache.progressBar.style.width = '0%';
            // Восстанавливаем оригинальный transition
            setTimeout(() => {
                if (DOMCache.progressBar) {
                    DOMCache.progressBar.style.transition = '';
                }
            }, 150);
        }
    };
    
    const updateProgress = () => {
        progress += (100 / (IMAGE_ROTATION_CONFIG.interval / 50)); // Обновляем каждые 50мс
        if (DOMCache.progressBar && progress <= 100) {
            // Используем плавный transition для заполнения
            DOMCache.progressBar.style.transition = 'width 0.05s linear';
            DOMCache.progressBar.style.width = `${progress}%`;
        }
    };
    
    // Запускаем интервалы
    const intervalId = setInterval(rotateImages, IMAGE_ROTATION_CONFIG.interval);
    const progressInterval = setInterval(updateProgress, 50);
    
    // Сохраняем интервалы
    currentRotationIntervals.modal = intervalId;
    currentRotationIntervals.progress = progressInterval;
    
    return { intervalId, progressInterval };
}

/**
 * Обновляет активный thumbnail
 * @param {number} activeIndex - Индекс активного изображения
 */
function updateActiveThumbnail(activeIndex) {
    const thumbnails = document.querySelectorAll('.thumbnail');
    thumbnails.forEach((thumb, index) => {
        thumb.classList.toggle('active', index === activeIndex);
    });
}

/**
 * Заполняет содержимое модального окна
 * @param {Object} product - Объект товара
 */
function fillModalContent(product) {
    // Заполняем основную информацию о товаре
    const productName = document.getElementById('modalProductName');
    const productPrice = document.getElementById('modalProductPrice');
    const productDescription = document.getElementById('modalProductDescription');
    const productCountry = document.getElementById('modalProductCountry');
    const productCategory = document.getElementById('modalProductCategory');
    
    if (productName) productName.textContent = product.name;
    if (productPrice) productPrice.textContent = product.price;
    if (productDescription) productDescription.textContent = product.description;
    if (productCountry) productCountry.textContent = product.country;
    if (productCategory) productCategory.textContent = product.category;
    
    // Устанавливаем основное изображение
    if (DOMCache.mainImage) {
        DOMCache.mainImage.src = product.images[0];
        DOMCache.mainImage.alt = product.name;
    }
}

/**
 * Создает галерею изображений
 * @param {Object} product - Объект товара
 */
function createImageGallery(product) {
    if (!DOMCache.imageGallery) {
        initDOMCache();
    }
    
    if (!DOMCache.imageGallery) {
        console.error('Не удалось найти элемент галереи изображений');
        return;
    }
    
    if (!product.images || !Array.isArray(product.images) || product.images.length === 0) {
        console.error('У товара нет изображений:', product);
        return;
    }
    
    DOMCache.imageGallery.innerHTML = '';
    
    // Основное изображение
    if (DOMCache.mainImage) {
        DOMCache.mainImage.src = product.images[0];
        DOMCache.mainImage.alt = product.name;
    }
    
    // Thumbnails
    product.images.forEach((image, index) => {
        const thumbnail = document.createElement('img');
        thumbnail.src = image;
        thumbnail.alt = `${product.name} - изображение ${index + 1}`;
        thumbnail.className = `thumbnail ${index === 0 ? 'active' : ''}`;
        thumbnail.addEventListener('click', () => switchMainImage(image, thumbnail));
        DOMCache.imageGallery.appendChild(thumbnail);
    });
    
    safeLog('Info', `Галерея создана для товара "${product.name}" с ${product.images.length} изображениями`);
}

/**
 * Переключает основное изображение
 * @param {string} imageSrc - URL изображения
 * @param {HTMLElement} clickedThumbnail - Кликнутый thumbnail
 */
function switchMainImage(imageSrc, clickedThumbnail) {
    if (DOMCache.mainImage) {
        DOMCache.mainImage.src = imageSrc;
    }
    
    // Обновляем активный thumbnail
    const thumbnails = document.querySelectorAll('.thumbnail');
    thumbnails.forEach(thumb => thumb.classList.remove('active'));
    clickedThumbnail.classList.add('active');
    
    // Перезапускаем автоматическую смену
    if (IMAGE_ROTATION_CONFIG.enabled) {
        // Очищаем текущие интервалы
        if (currentRotationIntervals.modal) {
            clearInterval(currentRotationIntervals.modal);
        }
        if (currentRotationIntervals.progress) {
            clearInterval(currentRotationIntervals.progress);
        }
        
        // Плавно сбрасываем прогресс-бар
        forceResetProgressBar();
        
        // Получаем текущий продукт из модального окна
        const productName = document.getElementById('modalProductName');
        let currentProduct = null;
        
        // Ищем продукт по имени (можно улучшить, добавив data-атрибут)
        if (productName && App.products) {
            currentProduct = App.products.find(p => p.name === productName.textContent);
        }
        
        if (currentProduct && currentProduct.images && currentProduct.images.length > 1) {
            // Получаем индекс текущего изображения
            const currentImageIndex = currentProduct.images.indexOf(imageSrc);
            
            // Запускаем смену изображений с правильного индекса после сброса
            setTimeout(() => {
                const result = startModalImageRotationWithIndex(currentProduct.images, currentImageIndex);
                currentRotationIntervals.modal = result.intervalId;
                currentRotationIntervals.progress = result.progressInterval;
            }, 150); // Ждем завершения плавного сброса
        }
    }
}

/**
 * Показывает модальное окно
 */
function showModal() {
    if (!DOMCache.modal) {
        initDOMCache();
    }
    
    if (DOMCache.modal) {
        DOMCache.modal.style.display = 'block';
    }
}

/**
 * Закрывает модальное окно
 */
function closeProductModal() {
    if (!DOMCache.modal) {
        initDOMCache();
    }
    
    if (DOMCache.modal) {
        DOMCache.modal.style.display = 'none';
    }
    
    // Останавливаем все интервалы смены изображений
    stopAllImageRotation();
    
    // Скрываем прогресс-бар
    if (DOMCache.progressContainer) {
        DOMCache.progressContainer.classList.remove('show');
    }
    if (DOMCache.progressBar) {
        DOMCache.progressBar.classList.remove('animate');
        DOMCache.progressBar.style.width = '0%';
    }
}

/**
 * Показывает индикатор загрузки
 */
function showLoading() {
    if (!DOMCache.productsGrid) {
        initDOMCache();
    }
    
    if (DOMCache.productsGrid) {
        DOMCache.productsGrid.innerHTML = `
            <div class="loading">
                <div class="spinner"></div>
                <p>Загрузка товаров...</p>
            </div>
        `;
    }
}

/**
 * Обновляет активную категорию
 * @param {string} activeCategory - Активная категория
 */
function updateActiveCategory(activeCategory) {
    const categoryCards = document.querySelectorAll('.category-card');
    categoryCards.forEach(card => {
        card.classList.toggle('active', card.dataset.category === activeCategory);
    });
}

/**
 * Обновляет активную навигацию
 * @param {string} activeSection - Активная секция
 */
function updateActiveNavigation(activeSection) {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        const href = link.getAttribute('href').substring(1);
        link.classList.toggle('active', href === activeSection);
    });
}

/**
 * Включает/выключает автоматическую смену изображений
 * @param {boolean} enabled - Включить или выключить
 */
function toggleImageRotation(enabled) {
    IMAGE_ROTATION_CONFIG.enabled = enabled;
    
    if (enabled) {
        safeLog('Info', 'Автоматическая смена изображений включена');
        restartImageRotation();
    } else {
        safeLog('Info', 'Автоматическая смена изображений выключена');
        stopAllImageRotation();
    }
}

/**
 * Останавливает все интервалы смены изображений
 */
function stopAllImageRotation() {
    if (currentRotationIntervals.modal) {
        clearInterval(currentRotationIntervals.modal);
        currentRotationIntervals.modal = null;
    }
    if (currentRotationIntervals.progress) {
        clearInterval(currentRotationIntervals.progress);
        currentRotationIntervals.progress = null;
    }
    
    // Останавливаем смену в карточках
    const cards = document.querySelectorAll('.product-card');
    cards.forEach(card => {
        // Удаляем все интервалы, связанные с карточкой
        const intervals = card.dataset.rotationIntervals;
        if (intervals) {
            intervals.split(',').forEach(id => clearInterval(parseInt(id)));
            delete card.dataset.rotationIntervals;
        }
    });
    
    safeLog('Info', 'Все интервалы смены изображений остановлены');
}

/**
 * Перезапускает автоматическую смену изображений
 */
function restartImageRotation() {
    if (!IMAGE_ROTATION_CONFIG.enabled) return;
    
    // Если модальное окно открыто, перезапускаем смену
    if (DOMCache.modal && DOMCache.modal.style.display === 'block') {
        const mainImage = DOMCache.mainImage;
        if (mainImage && mainImage.src) {
            // Находим текущее изображение в галерее
            const thumbnails = document.querySelectorAll('.thumbnail');
            const currentSrc = mainImage.src;
            const currentIndex = Array.from(thumbnails).findIndex(thumb => thumb.src === currentSrc);
            
            if (currentIndex !== -1) {
                const images = Array.from(thumbnails).map(thumb => thumb.src);
                startModalImageRotation(images);
            }
        }
    }
}

/**
 * Устанавливает интервал смены изображений
 * @param {number} interval - Интервал в миллисекундах
 */
function setImageRotationInterval(interval) {
    IMAGE_ROTATION_CONFIG.interval = interval;
    safeLog('Info', `Интервал смены изображений установлен: ${interval}мс`);
    
    // Перезапускаем смену с новым интервалом
    if (IMAGE_ROTATION_CONFIG.enabled) {
        restartImageRotation();
    }
}

/**
 * Устанавливает режим смены изображений
 * @param {boolean} onlyInModal - Только в модальном окне
 */
function setImageRotationMode(onlyInModal) {
    IMAGE_ROTATION_CONFIG.onlyInModal = onlyInModal;
    safeLog('Info', `Режим смены изображений: ${onlyInModal ? 'только в модальном окне' : 'везде'}`);
}

/**
 * Тестирует автоматическую смену изображений
 */
function testImageRotation() {
    safeLog('Info', 'Тестирование автоматической смены изображений');
    safeLog('Debug', 'Текущие настройки:', IMAGE_ROTATION_CONFIG);
    
    // Проверяем, есть ли изображения для смены
    const mainImage = DOMCache.mainImage;
    const thumbnails = document.querySelectorAll('.thumbnail');
    
    if (mainImage && thumbnails.length > 1) {
        safeLog('Info', 'Есть изображения для смены');
        safeLog('Info', `Количество изображений: ${thumbnails.length}`);
        
        // Запускаем тестовую смену
        const images = Array.from(thumbnails).map(thumb => thumb.src);
        const result = startModalImageRotation(images);
        
        safeLog('Info', 'Тестовая смена запущена');
        
        // Останавливаем через 5 секунд
        setTimeout(() => {
            if (result.intervalId) {
                clearInterval(result.intervalId);
            }
            if (result.progressInterval) {
                clearInterval(result.progressInterval);
            }
            safeLog('Info', 'Тестовая смена остановлена');
        }, 5000);
        
    } else {
        safeLog('Warn', 'Нет изображений для смены');
    }
}

/**
 * Принудительно запускает автоматическую смену изображений
 */
function forceStartImageRotation() {
    safeLog('Info', 'Принудительный запуск автоматической смены изображений');
    
    // Включаем смену, если выключена
    if (!IMAGE_ROTATION_CONFIG.enabled) {
        IMAGE_ROTATION_CONFIG.enabled = true;
        safeLog('Info', 'Автоматическая смена включена');
    }
    
    // Перезапускаем смену
    restartImageRotation();
    
    safeLog('Info', 'Автоматическая смена принудительно запущена');
}

/**
 * Запускает смену изображений без обработчиков мыши
 */
function startImageRotationWithoutMouseHandlers() {
    safeLog('Info', 'Запуск смены изображений без обработчиков мыши');
    
    // Удаляем обработчики мыши из модального окна
    if (DOMCache.modal) {
        const newModal = DOMCache.modal.cloneNode(true);
        DOMCache.modal.parentNode.replaceChild(newModal, DOMCache.modal);
        DOMCache.modal = newModal;
    }
    
    // Запускаем смену
    forceStartImageRotation();
    
    safeLog('Info', 'Смена изображений запущена без обработчиков мыши');
}

/**
 * Сбрасывает прогресс-бар
 */
function resetProgressBar() {
    if (!DOMCache.progressBar) {
        initDOMCache();
    }
    
    if (DOMCache.progressBar) {
        // Временно отключаем CSS transition для мгновенного сброса
        const originalTransition = DOMCache.progressBar.style.transition;
        DOMCache.progressBar.style.transition = 'none';
        
        // Принудительно сбрасываем прогресс-бар
        DOMCache.progressBar.style.width = '0%';
        DOMCache.progressBar.classList.remove('animate');
        
        // Принудительно перерисовываем элемент
        DOMCache.progressBar.offsetHeight;
        
        // Восстанавливаем transition через небольшую задержку
        setTimeout(() => {
            if (DOMCache.progressBar) {
                DOMCache.progressBar.style.transition = originalTransition;
                // Дополнительная проверка сброса
                DOMCache.progressBar.style.width = '0%';
            }
        }, 50);
        
        safeLog('Debug', 'Прогресс-бар полностью сброшен (с отключением transition)');
    }
}

/**
 * Принудительно сбрасывает прогресс-бар (плавный метод)
 */
function forceResetProgressBar() {
    if (!DOMCache.progressBar) {
        initDOMCache();
    }
    
    if (DOMCache.progressBar) {
        // Сохраняем оригинальные стили
        const originalTransition = DOMCache.progressBar.style.transition;
        
        // Устанавливаем быстрый transition для плавного сброса
        DOMCache.progressBar.style.transition = 'width 0.1s ease-out';
        
        // Сбрасываем прогресс-бар
        DOMCache.progressBar.style.width = '0%';
        DOMCache.progressBar.classList.remove('animate');
        
        // Восстанавливаем оригинальный transition после сброса
        setTimeout(() => {
            if (DOMCache.progressBar) {
                DOMCache.progressBar.style.transition = originalTransition;
            }
        }, 150);
        
        safeLog('Debug', 'Прогресс-бар плавно сброшен');
    }
}

// Инициализируем кэш DOM при загрузке модуля
if (typeof document !== 'undefined') {
    // Ждем готовности DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initDOMCache);
    } else {
        initDOMCache();
    }
}

/**
 * Добавляет анимацию фильтрации к сетке товаров
 */
function addFilteringAnimation() {
    // Эта функция больше не используется, так как мы используем CSS transitions
    // Оставляем для совместимости
    console.log('addFilteringAnimation: функция устарела, используется CSS transitions');
}

/**
 * Добавляет анимацию загрузки к сетке товаров
 */
function addLoadingAnimation() {
    if (!DOMCache.productsGrid) {
        initDOMCache();
    }
    
    DOMCache.productsGrid.classList.add('loading');
}

/**
 * Убирает анимацию загрузки с сетки товаров
 */
function removeLoadingAnimation() {
    if (!DOMCache.productsGrid) {
        initDOMCache();
    }
    
    DOMCache.productsGrid.classList.remove('loading');
}

/**
 * Добавляет плавную анимацию появления для новых карточек
 */
function addCardAppearanceAnimation(card) {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px) scale(0.9)';
    
    // Запускаем анимацию появления
    requestAnimationFrame(() => {
        card.style.transition = 'all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0) scale(1)';
    });
}

/**
 * Принудительно сбрасывает флаг отображения товаров
 */
function resetDisplayFlag() {
    isDisplayingProducts = false;
    currentDisplayRequest = null;
    console.log('displayProducts: флаг принудительно сброшен');
}

// Экспортируем функции для использования в других модулях
window.UI = {
    displayProducts,
    showNoProductsMessage,
    createProductCard,
    openProductModal,
    closeProductModal,
    showLoading,
    updateActiveCategory,
    updateActiveNavigation,
    toggleImageRotation,
    stopAllImageRotation,
    restartImageRotation,
    setImageRotationInterval,
    setImageRotationMode,
    testImageRotation,
    forceStartImageRotation,
    startImageRotationWithoutMouseHandlers,
    resetProgressBar,
    forceResetProgressBar,
    addFilteringAnimation,
    addLoadingAnimation,
    removeLoadingAnimation,
    addCardAppearanceAnimation,
    resetDisplayFlag,
    IMAGE_ROTATION_CONFIG
};

// Глобальные функции для отладки
window.resetDisplayFlag = resetDisplayFlag;
window.debugDisplayState = function() {
    console.log('Состояние отображения:');
    console.log('isDisplayingProducts:', isDisplayingProducts);
    console.log('currentDisplayRequest:', currentDisplayRequest);
    console.log('productsGrid exists:', !!DOMCache.productsGrid);
}; 