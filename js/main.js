/**
 * Главный скрипт приложения
 * Загружает все модули динамически и инициализирует функциональность сайта
 */

// Глобальные переменные приложения
const App = {
    isInitialized: false,
    currentFilter: 'all',
    products: [],
    modules: {},
    cache: new Map(), // Кэш для оптимизации
    config: {
        animationDuration: 300,
        loadingDelay: 500,
        notificationDuration: 3000
    }
};

// Кэш для проверок модулей
const moduleCache = new Map();

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
 * Безопасное получение модуля с кэшированием
 * @param {string} moduleName - Имя модуля
 * @returns {Object|null} Модуль или null
 */
function getModule(moduleName) {
    if (moduleCache.has(moduleName)) {
        return moduleCache.get(moduleName);
    }
    
    const module = App.modules[moduleName] || window[moduleName] || null;
    moduleCache.set(moduleName, module);
    return module;
}

/**
 * Безопасный вызов функции модуля
 * @param {string} moduleName - Имя модуля
 * @param {string} methodName - Имя метода
 * @param {...any} args - Аргументы
 * @returns {any} Результат выполнения
 */
function callModuleMethod(moduleName, methodName, ...args) {
    const module = getModule(moduleName);
    return module && typeof module[methodName] === 'function' 
        ? module[methodName](...args) 
        : null;
}

/**
 * Инициализирует приложение
 * Загружает все модули и настраивает функциональность
 */
async function initializeApp() {
    try {
        safeLog('Info', 'Начало инициализации приложения');
        
        // Загружаем все модули
        await loadAllModules();
        
        // Показываем индикатор загрузки
        callModuleMethod('UI', 'showLoading');
        
        // Загружаем данные товаров
        await loadProductsData();
        
        // Настраиваем обработчики событий
        callModuleMethod('Events', 'initializeEventListeners');
        
        // Отображаем все товары
        callModuleMethod('UI', 'displayProducts', App.products);
        
        // Добавляем дополнительные стили для анимаций
        addAnimationStyles();
        
        // Дополнительная инициализация кнопки "Наверх"
        setTimeout(() => {
            callModuleMethod('Events', 'setupScrollToTopButton');
            callModuleMethod('Events', 'toggleScrollToTopButton');
        }, 100);
        
        // Инициализация завершена
        App.isInitialized = true;
        
        safeLog('Info', 'Приложение успешно инициализировано');
        
        // Показываем статистику
        showAppStats();
        
    } catch (error) {
        safeLog('Error', 'Ошибка при инициализации приложения', error);
        callModuleMethod('Utils', 'showNotification', 'Ошибка при загрузке данных', 'error');
    }
}

/**
 * Загружает все модули приложения
 */
async function loadAllModules() {
    const modules = [
        { name: 'Utils', path: 'js/utils.js' },
        { name: 'ProductLoader', path: 'js/load-all-products.js' },
        { name: 'ProductData', path: 'js/data.js' },
        { name: 'UI', path: 'js/ui.js' },
        { name: 'Events', path: 'js/events.js' }
    ];
    
    // Загружаем модули последовательно для обеспечения зависимостей
    for (const module of modules) {
        try {
            await loadModule(module.name, module.path);
            safeLog('Info', `Модуль ${module.name} загружен`);
        } catch (error) {
            safeLog('Error', `Ошибка при загрузке модуля ${module.name}`, error);
        }
    }
}

/**
 * Загружает отдельный модуль
 * @param {string} moduleName - Имя модуля
 * @param {string} modulePath - Путь к файлу модуля
 */
async function loadModule(moduleName, modulePath) {
    return new Promise((resolve, reject) => {
        // Проверяем, не загружен ли уже модуль
        if (window[moduleName]) {
            App.modules[moduleName] = window[moduleName];
            resolve();
            return;
        }
        
        const script = document.createElement('script');
        script.src = modulePath;
        
        let attempts = 0;
        const maxAttempts = 3;
        
        const checkModule = () => {
            attempts++;
            if (window[moduleName]) {
                App.modules[moduleName] = window[moduleName];
                safeLog('Info', `Модуль ${moduleName} успешно загружен (попытка ${attempts})`);
                resolve();
            } else if (attempts < maxAttempts) {
                safeLog('Debug', `Ожидание модуля ${moduleName} (попытка ${attempts}/${maxAttempts})`);
                setTimeout(checkModule, 100);
            } else {
                reject(new Error(`Модуль ${moduleName} не найден в window после ${maxAttempts} попыток`));
            }
        };
        
        script.onload = () => {
            // Ждем немного, чтобы модуль инициализировался
            setTimeout(checkModule, 50);
        };
        
        script.onerror = () => reject(new Error(`Не удалось загрузить ${modulePath}`));
        document.head.appendChild(script);
    });
}

/**
 * Загружает данные товаров из JSON файла
 */
async function loadProductsData() {
    callModuleMethod('Utils', 'log', 'Загрузка данных товаров...');
    
    try {
        const products = await callModuleMethod('ProductData', 'loadProducts');
        
        // Проверяем, что получили массив
        if (!products || !Array.isArray(products)) {
            console.error('Ошибка: loadProducts вернул не массив:', products);
            App.products = [];
            return;
        }
        
        // Проверяем, что в массиве есть товары с изображениями
        const validProducts = products.filter(product => 
            product && product.images && Array.isArray(product.images) && product.images.length > 0
        );
        
        if (validProducts.length === 0) {
            console.warn('Предупреждение: не найдено товаров с изображениями');
        }
        
        App.products = validProducts;
        
        callModuleMethod('Utils', 'log', `Загружено товаров: ${validProducts.length}`);
        // Небольшая задержка для плавности
        await callModuleMethod('Utils', 'delay', App.config.loadingDelay);
        
    } catch (error) {
        console.error('Ошибка при загрузке товаров:', error);
        App.products = [];
        throw error;
    }
}

/**
 * Добавляет дополнительные CSS стили для анимаций
 */
function addAnimationStyles() {
    // Проверяем, не добавлены ли уже стили
    if (document.getElementById('app-animation-styles')) {
        return;
    }
    
    const style = document.createElement('style');
    style.id = 'app-animation-styles';
    style.textContent = `
        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateX(100%);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
        
        @keyframes slideOut {
            from {
                opacity: 1;
                transform: translateX(0);
            }
            to {
                opacity: 0;
                transform: translateX(100%);
            }
        }
        
        .error {
            border-color: #f44336 !important;
        }
        
        .error-message {
            color: #f44336;
            font-size: 0.8rem;
            margin-top: 0.25rem;
        }
        
        .success-message {
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 1rem 2rem;
            border-radius: 5px;
            z-index: 10000;
            animation: slideIn 0.3s ease;
        }
    `;
    document.head.appendChild(style);
}

/**
 * Показывает статистику приложения в консоли
 */
function showAppStats() {
    const stats = callModuleMethod('ProductData', 'getProductsStats');
    if (!stats) return;
    
    safeLog('Info', 'Статистика приложения:');
    safeLog('Info', `Всего товаров: ${stats.total}`);
    safeLog('Info', 'По странам:');
    Object.entries(stats.byCountry).forEach(([country, count]) => {
        safeLog('Info', `  ${country}: ${count} товаров`);
    });
    safeLog('Info', 'По категориям:');
    Object.entries(stats.byCategory).forEach(([category, count]) => {
        safeLog('Info', `  ${category}: ${count} товаров`);
    });
}

/**
 * Обрабатывает изменения размера окна
 */
function handleResize() {
    // Дебаунсированная функция для оптимизации производительности
    const debouncedResize = callModuleMethod('Utils', 'debounce', () => {
        callModuleMethod('Utils', 'log', 'Изменение размера окна');
        // Здесь можно добавить дополнительную логику при изменении размера
    }, 250);
    
    window.addEventListener('resize', debouncedResize);
}

/**
 * Настраивает глобальные обработчики событий
 */
function setupGlobalEvents() {
    // Обработка ошибок
    window.addEventListener('error', (event) => {
        callModuleMethod('Utils', 'logError', 'Глобальная ошибка', event.error);
        callModuleMethod('Utils', 'showNotification', 'Произошла ошибка в приложении', 'error');
    });
    
    // Обработка необработанных Promise rejections
    window.addEventListener('unhandledrejection', (event) => {
        callModuleMethod('Utils', 'logError', 'Необработанная ошибка Promise', event.reason);
        callModuleMethod('Utils', 'showNotification', 'Ошибка при загрузке данных', 'error');
    });
    
    // Обработка изменения размера окна
    handleResize();
}

/**
 * Проверяет готовность DOM
 */
function checkDOMReady() {
    return new Promise((resolve) => {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', resolve);
        } else {
            resolve();
        }
    });
}

/**
 * Основная функция запуска приложения
 */
async function startApp() {
    try {
        // Ждем готовности DOM
        await checkDOMReady();
        
        // Настраиваем глобальные события
        setupGlobalEvents();
        
        // Инициализируем приложение
        await initializeApp();
        
        // Показываем приветственное сообщение
        callModuleMethod('Utils', 'showNotification', 'Добро пожаловать на Belgrad.su!', 'success');
        
        // Показываем информацию об управлении автоматической сменой изображений
        callModuleMethod('Utils', 'logInfo', 'Управление автоматической сменой изображений:');
        callModuleMethod('Utils', 'logInfo', '  App.enableImageRotation() - включить смену');
        callModuleMethod('Utils', 'logInfo', '  App.disableImageRotation() - выключить смену');
        callModuleMethod('Utils', 'logInfo', '  App.setImageRotationSpeed(5000) - установить интервал (в мс)');
        callModuleMethod('Utils', 'logInfo', '  App.setImageRotationMode(true) - только в модальном окне');
        callModuleMethod('Utils', 'logInfo', '  App.setImageRotationMode(false) - везде');
        callModuleMethod('Utils', 'logInfo', '  App.getImageRotationStatus() - показать текущие настройки');
        callModuleMethod('Utils', 'logInfo', '  App.testImageRotation() - протестировать смену изображений');
        callModuleMethod('Utils', 'logInfo', '  App.forceStartImageRotation() - принудительно запустить смену');
        callModuleMethod('Utils', 'logInfo', '  App.startImageRotationWithoutMouseHandlers() - запустить без обработчиков мыши');
        callModuleMethod('Utils', 'logInfo', '  App.resetProgressBar() - принудительно сбросить прогресс-бар');
        
        const uiModule = getModule('UI');
        callModuleMethod('Utils', 'logInfo', 'Текущие настройки:', uiModule?.IMAGE_ROTATION_CONFIG);
        
    } catch (error) {
        callModuleMethod('Utils', 'logError', 'Критическая ошибка при запуске приложения', error);
        callModuleMethod('Utils', 'showNotification', 'Ошибка при запуске приложения', 'error');
    }
}

/**
 * Функция для обновления данных товаров
 */
async function refreshProducts() {
    try {
        callModuleMethod('Utils', 'log', 'Обновление данных товаров...');
        await loadProductsData();
        
        // Обновляем отображение с текущим фильтром
        const filteredProducts = callModuleMethod('ProductData', 'filterProductsByCategory', App.currentFilter);
        callModuleMethod('UI', 'displayProducts', filteredProducts);
        
        callModuleMethod('Utils', 'showNotification', 'Данные обновлены', 'success');
        
    } catch (error) {
        callModuleMethod('Utils', 'logError', 'Ошибка при обновлении товаров', error);
        callModuleMethod('Utils', 'showNotification', 'Ошибка при обновлении данных', 'error');
    }
}

/**
 * Функция для поиска товаров
 * @param {string} query - Поисковый запрос
 */
function searchProducts(query) {
    if (!query.trim()) {
        // Если запрос пустой, показываем все товары с текущим фильтром
        const filteredProducts = callModuleMethod('ProductData', 'filterProductsByCategory', App.currentFilter);
        callModuleMethod('UI', 'displayProducts', filteredProducts);
        return;
    }
    
    const searchResults = App.products.filter(product => 
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.description.toLowerCase().includes(query.toLowerCase()) ||
        product.country.toLowerCase().includes(query.toLowerCase()) ||
        product.category.toLowerCase().includes(query.toLowerCase())
    );
    
    callModuleMethod('UI', 'displayProducts', searchResults);
    callModuleMethod('Utils', 'log', `Найдено товаров по запросу "${query}": ${searchResults.length}`);
}

// Оптимизированные функции управления автоматической сменой изображений
function enableImageRotation() {
    callModuleMethod('UI', 'toggleImageRotation', true);
}

function disableImageRotation() {
    callModuleMethod('UI', 'toggleImageRotation', false);
}

function setImageRotationSpeed(interval) {
    callModuleMethod('UI', 'setImageRotationInterval', interval);
}

function getImageRotationStatus() {
    const uiModule = getModule('UI');
    if (uiModule) {
        callModuleMethod('Utils', 'logInfo', 'Статус автоматической смены изображений:', uiModule.IMAGE_ROTATION_CONFIG);
        return uiModule.IMAGE_ROTATION_CONFIG;
    }
    callModuleMethod('Utils', 'logError', 'Модуль UI не загружен');
    return null;
}

function setImageRotationMode(onlyInModal) {
    callModuleMethod('UI', 'setImageRotationMode', onlyInModal);
}

function testImageRotation() {
    callModuleMethod('UI', 'testImageRotation');
}

function forceStartImageRotation() {
    callModuleMethod('UI', 'forceStartImageRotation');
}

function startImageRotationWithoutMouseHandlers() {
    callModuleMethod('UI', 'startImageRotationWithoutMouseHandlers');
}

function resetProgressBar() {
    callModuleMethod('UI', 'resetProgressBar');
}

// Экспортируем основные функции для использования в других модулях
window.App = {
    ...App,
    initializeApp,
    refreshProducts,
    searchProducts,
    startApp,
    enableImageRotation,
    disableImageRotation,
    setImageRotationSpeed,
    setImageRotationMode,
    getImageRotationStatus,
    testImageRotation,
    forceStartImageRotation,
    startImageRotationWithoutMouseHandlers,
    resetProgressBar,
    // Добавляем утилиты для других модулей
    getModule,
    callModuleMethod
};

// Запускаем приложение при загрузке страницы
if (typeof window !== 'undefined') {
    window.addEventListener('load', startApp);
} 