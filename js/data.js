/**
 * Модуль для работы с данными товаров
 * Отвечает за загрузку и управление данными о товарах
 */

// Глобальная переменная для хранения всех товаров
let products = [];

// Кэш для фильтрации товаров
const filterCache = new Map();

// Кэш для статистики
let statsCache = null;

// Флаг загрузки данных
let dataIsLoading = false;

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
 * Загружает данные товаров из всех JSON файлов
 * @returns {Promise<Array>} Массив товаров
 */
async function loadProducts() {
    // Проверяем, не загружаются ли уже данные
    if (dataIsLoading) {
        safeLog('Info', 'Данные уже загружаются');
        return products;
    }
    
    // Проверяем, не загружены ли уже данные
    if (products.length > 0) {
        safeLog('Info', 'Данные уже загружены из кэша');
        return products;
    }
    
    try {
        dataIsLoading = true;
        safeLog('Info', 'Начало загрузки товаров');
        
        // Используем новый загрузчик для загрузки всех товаров
        if (window.ProductLoader && typeof window.ProductLoader.loadAllProducts === 'function') {
            safeLog('Info', 'Используем ProductLoader для загрузки товаров');
            products = await window.ProductLoader.loadAllProducts();
        } else {
            // Fallback к старому методу
            safeLog('Info', 'ProductLoader не найден, используем fallback к product.json');
            const response = await fetch('product/product.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            products = data.products;
        }
        
        safeLog('Info', `Товары успешно загружены: ${products.length} шт.`);
        
        // Очищаем кэши при загрузке новых данных
        clearCaches();
        
        return products;
    } catch (error) {
        safeLog('Error', 'Ошибка при загрузке товаров', error);
        // Возвращаем пустой массив в случае ошибки
        return [];
    } finally {
        dataIsLoading = false;
    }
}

/**
 * Получает все товары
 * @returns {Array} Массив всех товаров
 */
function getAllProducts() {
    return products;
}

/**
 * Фильтрует товары по категории (стране) с кэшированием
 * @param {string} category - Категория для фильтрации (serbia, russia, china, czech, georgia, germany)
 * @returns {Array} Отфильтрованный массив товаров
 */
function filterProductsByCategory(category) {
    // Проверяем кэш
    if (filterCache.has(category)) {
        return filterCache.get(category);
    }
    
    let filteredProducts;
    
    if (category === 'all') {
        filteredProducts = products;
    } else {
        filteredProducts = products.filter(product => 
            product.tags.includes(category)
        );
    }
    
    // Кэшируем результат
    filterCache.set(category, filteredProducts);
    
    return filteredProducts;
}

/**
 * Находит товар по ID с кэшированием
 * @param {number} id - ID товара
 * @returns {Object|null} Объект товара или null если не найден
 */
function getProductById(id) {
    // Проверяем кэш
    const cacheKey = `product_${id}`;
    if (filterCache.has(cacheKey)) {
        return filterCache.get(cacheKey);
    }
    
    const product = products.find(product => product.id === id) || null;
    
    // Кэшируем результат
    filterCache.set(cacheKey, product);
    
    return product;
}

/**
 * Получает уникальные категории товаров с кэшированием
 * @returns {Array} Массив уникальных категорий
 */
function getUniqueCategories() {
    // Проверяем кэш
    if (filterCache.has('unique_categories')) {
        return filterCache.get('unique_categories');
    }
    
    const categories = new Set();
    products.forEach(product => {
        product.tags.forEach(tag => categories.add(tag));
    });
    
    const uniqueCategories = Array.from(categories);
    
    // Кэшируем результат
    filterCache.set('unique_categories', uniqueCategories);
    
    return uniqueCategories;
}

/**
 * Получает статистику по товарам с кэшированием
 * @returns {Object} Объект со статистикой
 */
function getProductsStats() {
    // Проверяем кэш статистики
    if (statsCache) {
        return statsCache;
    }
    
    const stats = {
        total: products.length,
        byCountry: {},
        byCategory: {}
    };
    
    products.forEach(product => {
        // Статистика по странам
        if (!stats.byCountry[product.country]) {
            stats.byCountry[product.country] = 0;
        }
        stats.byCountry[product.country]++;
        
        // Статистика по категориям
        if (!stats.byCategory[product.category]) {
            stats.byCategory[product.category] = 0;
        }
        stats.byCategory[product.category]++;
    });
    
    // Кэшируем статистику
    statsCache = stats;
    
    return stats;
}

/**
 * Поиск товаров по тексту с кэшированием
 * @param {string} query - Поисковый запрос
 * @returns {Array} Массив найденных товаров
 */
function searchProducts(query) {
    if (!query || !query.trim()) {
        return products;
    }
    
    const normalizedQuery = query.toLowerCase().trim();
    
    // Проверяем кэш
    if (filterCache.has(`search_${normalizedQuery}`)) {
        return filterCache.get(`search_${normalizedQuery}`);
    }
    
    const searchResults = products.filter(product => 
        product.name.toLowerCase().includes(normalizedQuery) ||
        product.description.toLowerCase().includes(normalizedQuery) ||
        product.country.toLowerCase().includes(normalizedQuery) ||
        product.category.toLowerCase().includes(normalizedQuery)
    );
    
    // Кэшируем результат поиска
    filterCache.set(`search_${normalizedQuery}`, searchResults);
    
    return searchResults;
}

/**
 * Получает товары по диапазону цен
 * @param {number} minPrice - Минимальная цена
 * @param {number} maxPrice - Максимальная цена
 * @returns {Array} Массив товаров в диапазоне цен
 */
function getProductsByPriceRange(minPrice, maxPrice) {
    const cacheKey = `price_${minPrice}_${maxPrice}`;
    
    // Проверяем кэш
    if (filterCache.has(cacheKey)) {
        return filterCache.get(cacheKey);
    }
    
    const filteredProducts = products.filter(product => {
        const price = parseFloat(product.price.replace(/[^\d.]/g, ''));
        return price >= minPrice && price <= maxPrice;
    });
    
    // Кэшируем результат
    filterCache.set(cacheKey, filteredProducts);
    
    return filteredProducts;
}

/**
 * Получает товары по стране
 * @param {string} country - Страна
 * @returns {Array} Массив товаров из указанной страны
 */
function getProductsByCountry(country) {
    const cacheKey = `country_${country}`;
    
    // Проверяем кэш
    if (filterCache.has(cacheKey)) {
        return filterCache.get(cacheKey);
    }
    
    const filteredProducts = products.filter(product => 
        product.country.toLowerCase() === country.toLowerCase()
    );
    
    // Кэшируем результат
    filterCache.set(cacheKey, filteredProducts);
    
    return filteredProducts;
}

/**
 * Очищает все кэши
 */
function clearCaches() {
    filterCache.clear();
    statsCache = null;
    safeLog('Info', 'Кэши данных очищены');
}

/**
 * Получает статистику использования кэшей
 * @returns {Object} Статистика кэшей
 */
function getCacheStats() {
    return {
        filterCacheSize: filterCache.size,
        hasStatsCache: statsCache !== null,
        totalProducts: products.length
    };
}

/**
 * Обновляет данные товаров
 * @returns {Promise<Array>} Обновленный массив товаров
 */
async function refreshProducts() {
    // Очищаем кэши
    clearCaches();
    
    // Сбрасываем массив товаров
    products = [];
    
    // Загружаем данные заново
    return await loadProducts();
}

// Экспортируем функции для использования в других модулях
window.ProductData = {
    loadProducts,
    getAllProducts,
    filterProductsByCategory,
    getProductById,
    getUniqueCategories,
    getProductsStats,
    searchProducts,
    getProductsByPriceRange,
    getProductsByCountry,
    clearCaches,
    getCacheStats,
    refreshProducts
}; 