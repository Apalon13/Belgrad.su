/**
 * Модуль утилит
 * Содержит вспомогательные функции для работы с данными, форматированием и другими задачами
 */

// Кэш для форматирования цен
const priceCache = new Map();

// Кэш для форматирования дат
const dateCache = new Map();

// Кэш для уведомлений
const notificationCache = new Map();

// Дебаунс кэш
const debounceCache = new Map();

/**
 * Форматирует цену в российских рублях с кэшированием
 * @param {string|number} price - Цена для форматирования
 * @returns {string} Отформатированная цена
 */
function formatPrice(price) {
    if (typeof price === 'string') {
        return price; // Если уже отформатировано
    }
    
    // Проверяем кэш
    if (priceCache.has(price)) {
        return priceCache.get(price);
    }
    
    const formatted = new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0
    }).format(price);
    
    // Кэшируем результат
    priceCache.set(price, formatted);
    
    return formatted;
}

/**
 * Форматирует дату в российском формате с кэшированием
 * @param {Date|string} date - Дата для форматирования
 * @returns {string} Отформатированная дата
 */
function formatDate(date) {
    const dateKey = date instanceof Date ? date.getTime() : date;
    
    // Проверяем кэш
    if (dateCache.has(dateKey)) {
        return dateCache.get(dateKey);
    }
    
    const dateObj = new Date(date);
    const formatted = dateObj.toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    // Кэшируем результат
    dateCache.set(dateKey, formatted);
    
    return formatted;
}

/**
 * Создает задержку выполнения
 * @param {number} ms - Время задержки в миллисекундах
 * @returns {Promise} Promise для await
 */
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Дебаунс функция для ограничения частоты вызова с кэшированием
 * @param {Function} func - Функция для выполнения
 * @param {number} wait - Время ожидания в миллисекундах
 * @returns {Function} Дебаунсированная функция
 */
function debounce(func, wait) {
    const cacheKey = `${func.toString()}-${wait}`;
    
    if (debounceCache.has(cacheKey)) {
        return debounceCache.get(cacheKey);
    }
    
    let timeout;
    const debouncedFunc = function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
    
    // Кэшируем дебаунсированную функцию
    debounceCache.set(cacheKey, debouncedFunc);
    
    return debouncedFunc;
}

/**
 * Throttle функция для ограничения частоты вызова
 * @param {Function} func - Функция для выполнения
 * @param {number} limit - Лимит времени в миллисекундах
 * @returns {Function} Throttled функция
 */
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Проверяет, находится ли элемент в области видимости
 * @param {HTMLElement} element - Элемент для проверки
 * @returns {boolean} true если элемент видим
 */
function isElementInViewport(element) {
    if (!element) return false;
    
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

/**
 * Плавная прокрутка к элементу
 * @param {HTMLElement|string} target - Элемент или селектор
 * @param {Object} options - Опции прокрутки
 */
function smoothScrollTo(target, options = {}) {
    const element = typeof target === 'string' ? document.querySelector(target) : target;
    
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: options.block || 'start',
            inline: options.inline || 'nearest'
        });
    }
}

/**
 * Копирует текст в буфер обмена
 * @param {string} text - Текст для копирования
 * @returns {Promise<boolean>} Результат операции
 */
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        console.error('Ошибка при копировании в буфер обмена:', err);
        return false;
    }
}

/**
 * Генерирует уникальный ID
 * @returns {string} Уникальный ID
 */
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Валидирует URL
 * @param {string} url - URL для проверки
 * @returns {boolean} true если URL корректный
 */
function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

/**
 * Получает параметры из URL
 * @param {string} name - Имя параметра
 * @returns {string|null} Значение параметра
 */
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

/**
 * Устанавливает параметр в URL
 * @param {string} name - Имя параметра
 * @param {string} value - Значение параметра
 */
function setUrlParameter(name, value) {
    const url = new URL(window.location);
    url.searchParams.set(name, value);
    window.history.replaceState({}, '', url);
}

/**
 * Логирует информацию в консоль с временной меткой
 * @param {string} message - Сообщение для логирования
 * @param {*} data - Данные для логирования
 * @param {string} level - Уровень логирования (INFO, WARN, ERROR, DEBUG)
 */
function log(message, data = null, level = 'INFO') {
    const timestamp = new Date().toLocaleTimeString('ru-RU');
    const prefix = `[${timestamp}] [${level}]`;
    
    if (data !== null && data !== undefined) {
        console.log(`${prefix} ${message}`, data);
    } else {
        console.log(`${prefix} ${message}`);
    }
}

/**
 * Логирует информационное сообщение
 * @param {string} message - Сообщение для логирования
 * @param {*} data - Данные для логирования
 */
function logInfo(message, data = null) {
    log(message, data, 'INFO');
}

/**
 * Логирует предупреждение
 * @param {string} message - Сообщение для логирования
 * @param {*} data - Данные для логирования
 */
function logWarn(message, data = null) {
    log(message, data, 'WARN');
}

/**
 * Логирует ошибку
 * @param {string} message - Сообщение для логирования
 * @param {*} data - Данные для логирования
 */
function logError(message, data = null) {
    log(message, data, 'ERROR');
}

/**
 * Логирует отладочную информацию
 * @param {string} message - Сообщение для логирования
 * @param {*} data - Данные для логирования
 */
function logDebug(message, data = null) {
    log(message, data, 'DEBUG');
}

/**
 * Показывает уведомление пользователю с кэшированием
 * @param {string} message - Сообщение
 * @param {string} type - Тип уведомления (success, error, warning, info)
 * @param {number} duration - Длительность показа в миллисекундах
 */
function showNotification(message, type = 'info', duration = 3000) {
    // Проверяем кэш для одинаковых уведомлений
    const cacheKey = `${message}-${type}`;
    if (notificationCache.has(cacheKey)) {
        const existingNotification = notificationCache.get(cacheKey);
        if (existingNotification && document.contains(existingNotification)) {
            // Обновляем существующее уведомление
            existingNotification.style.animation = 'none';
            existingNotification.offsetHeight; // Trigger reflow
            existingNotification.style.animation = 'slideIn 0.3s ease';
            return;
        }
    }
    
    // Создаем элемент уведомления
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Стили для уведомления
    const styles = {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '1rem 2rem',
        borderRadius: '5px',
        color: 'white',
        zIndex: '10000',
        animation: 'slideIn 0.3s ease',
        maxWidth: '300px',
        wordWrap: 'break-word',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        fontSize: '14px',
        lineHeight: '1.4'
    };
    
    // Цвета в зависимости от типа
    const colors = {
        success: '#4CAF50',
        error: '#f44336',
        warning: '#ff9800',
        info: '#2196F3'
    };
    
    styles.background = colors[type] || colors.info;
    
    // Применяем стили
    Object.assign(notification.style, styles);
    
    // Добавляем в DOM
    document.body.appendChild(notification);
    
    // Кэшируем уведомление
    notificationCache.set(cacheKey, notification);
    
    // Удаляем уведомление через указанное время
    setTimeout(() => {
        if (document.contains(notification)) {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (document.contains(notification)) {
                    document.body.removeChild(notification);
                }
                notificationCache.delete(cacheKey);
            }, 300);
        }
    }, duration);
}

/**
 * Сохраняет данные в localStorage
 * @param {string} key - Ключ для сохранения
 * @param {*} value - Значение для сохранения
 */
function saveToStorage(key, value) {
    try {
        const serializedValue = JSON.stringify(value);
        localStorage.setItem(key, serializedValue);
    } catch (error) {
        console.error('Ошибка при сохранении в localStorage:', error);
    }
}

/**
 * Загружает данные из localStorage
 * @param {string} key - Ключ для загрузки
 * @param {*} defaultValue - Значение по умолчанию
 * @returns {*} Загруженное значение или значение по умолчанию
 */
function loadFromStorage(key, defaultValue = null) {
    try {
        const serializedValue = localStorage.getItem(key);
        if (serializedValue === null) {
            return defaultValue;
        }
        return JSON.parse(serializedValue);
    } catch (error) {
        console.error('Ошибка при загрузке из localStorage:', error);
        return defaultValue;
    }
}

/**
 * Удаляет данные из localStorage
 * @param {string} key - Ключ для удаления
 */
function removeFromStorage(key) {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.error('Ошибка при удалении из localStorage:', error);
    }
}

/**
 * Очищает все кэши
 */
function clearAllCaches() {
    priceCache.clear();
    dateCache.clear();
    notificationCache.clear();
    debounceCache.clear();
    logInfo('Все кэши очищены');
}

/**
 * Получает статистику использования кэшей
 * @returns {Object} Статистика кэшей
 */
function getCacheStats() {
    return {
        priceCache: priceCache.size,
        dateCache: dateCache.size,
        notificationCache: notificationCache.size,
        debounceCache: debounceCache.size
    };
}

// Экспортируем функции для использования в других модулях
window.Utils = {
    formatPrice,
    formatDate,
    delay,
    debounce,
    throttle,
    isElementInViewport,
    smoothScrollTo,
    copyToClipboard,
    generateId,
    isValidUrl,
    getUrlParameter,
    setUrlParameter,
    log,
    logInfo,
    logWarn,
    logError,
    logDebug,
    showNotification,
    saveToStorage,
    loadFromStorage,
    removeFromStorage,
    clearAllCaches,
    getCacheStats
}; 