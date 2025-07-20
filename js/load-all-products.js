/**
 * Скрипт для загрузки всех товаров из отдельных файлов
 * Объединяет товары из всех стран в один массив
 */

// Кэш для загруженных товаров
const productsCache = new Map();

// Кэш для метаданных
let metadataCache = null;

// Флаг загрузки
let loaderIsLoading = false;

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
 * Загружает все товары из отдельных JSON файлов с кэшированием
 * @returns {Promise<Array>} Массив всех товаров
 */
async function loadAllProducts() {
    // Проверяем кэш
    if (productsCache.has('all_products')) {
        safeLog('Info', 'Товары загружены из кэша');
        return productsCache.get('all_products');
    }
    
    // Проверяем, не загружаются ли уже данные
    if (loaderIsLoading) {
        safeLog('Info', 'Товары уже загружаются');
        // Ждем завершения загрузки
        while (loaderIsLoading) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        return productsCache.get('all_products') || [];
    }
    
    try {
        loaderIsLoading = true;
        
        safeLog('Info', 'Начало загрузки всех товаров');
        
        // Загружаем товары параллельно для ускорения
        const loadPromises = [
            loadProductsFromFile('product/serbia-products.json'),
            loadProductsFromFile('product/russia-products.json'),
            loadProductsFromFile('product/china-products.json'),
            loadProductsFromFile('product/czech-products.json'),
            loadProductsFromFile('product/georgia-products.json'),
            loadProductsFromFile('product/germany-products.json')
        ];
        
        // Ждем завершения всех загрузок
        const [serbiaProducts, russiaProducts, chinaProducts, czechProducts, georgiaProducts, germanyProducts] = await Promise.allSettled(loadPromises);
        
        // Объединяем все товары
        const allProducts = [
            ...(serbiaProducts.status === 'fulfilled' ? serbiaProducts.value : []),
            ...(russiaProducts.status === 'fulfilled' ? russiaProducts.value : []),
            ...(chinaProducts.status === 'fulfilled' ? chinaProducts.value : []),
            ...(czechProducts.status === 'fulfilled' ? czechProducts.value : []),
            ...(georgiaProducts.status === 'fulfilled' ? georgiaProducts.value : []),
            ...(germanyProducts.status === 'fulfilled' ? germanyProducts.value : [])
        ];
        
        safeLog('Info', `Загружено товаров: ${allProducts.length}`);
        safeLog('Info', `Сербия: ${serbiaProducts.status === 'fulfilled' ? serbiaProducts.value.length : 0}, Россия: ${russiaProducts.status === 'fulfilled' ? russiaProducts.value.length : 0}, Китай: ${chinaProducts.status === 'fulfilled' ? chinaProducts.value.length : 0}, Чехия: ${czechProducts.status === 'fulfilled' ? czechProducts.value.length : 0}, Грузия: ${georgiaProducts.status === 'fulfilled' ? georgiaProducts.value.length : 0}, Германия: ${germanyProducts.status === 'fulfilled' ? germanyProducts.value.length : 0}`);
        
        // Кэшируем результат
        productsCache.set('all_products', allProducts);
        
        return allProducts;
        
    } catch (error) {
        safeLog('Error', 'Ошибка при загрузке всех товаров', error);
        if (window.Utils && window.Utils.showNotification) {
            window.Utils.showNotification('Ошибка при загрузке товаров', 'error');
        }
        return [];
    } finally {
        loaderIsLoading = false;
    }
}

/**
 * Загружает товары из конкретного JSON файла с кэшированием
 * @param {string} filePath - Путь к файлу
 * @returns {Promise<Array>} Массив товаров из файла
 */
async function loadProductsFromFile(filePath) {
    // Проверяем кэш
    if (productsCache.has(filePath)) {
        return productsCache.get(filePath);
    }
    
    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} for ${filePath}`);
        }
        const products = await response.json();
        
        // Валидируем данные
        if (!Array.isArray(products)) {
            throw new Error(`Invalid data format in ${filePath}: expected array`);
        }
        
        safeLog('Info', `Загружено из ${filePath}: ${products.length} товаров`);
        
        // Кэшируем результат
        productsCache.set(filePath, products);
        
        return products;
    } catch (error) {
        safeLog('Error', `Ошибка при загрузке ${filePath}`, error);
        // Возвращаем пустой массив в случае ошибки
        return [];
    }
}

/**
 * Создает основной JSON файл со всеми товарами
 * @returns {Promise<Object>} Объект с данными и метаданными
 */
async function createMainProductsFile() {
    try {
        const allProducts = await loadAllProducts();
        
        const mainProductsData = {
            products: allProducts,
            metadata: {
                totalCount: allProducts.length,
                lastUpdated: new Date().toISOString(),
                countries: {
                    serbia: allProducts.filter(p => p.tags.includes('serbia')).length,
                    russia: allProducts.filter(p => p.tags.includes('russia')).length,
                    china: allProducts.filter(p => p.tags.includes('china')).length,
                    czech: allProducts.filter(p => p.tags.includes('czech')).length,
                    georgia: allProducts.filter(p => p.tags.includes('georgia')).length,
                    germany: allProducts.filter(p => p.tags.includes('germany')).length
                }
            }
        };
        
        // Кэшируем метаданные
        metadataCache = mainProductsData.metadata;
        
        // В реальном проекте здесь можно сохранить файл на сервере
        safeLog('Info', 'Основной файл товаров создан:', mainProductsData);
        
        return mainProductsData;
        
    } catch (error) {
        safeLog('Error', 'Ошибка при создании основного файла товаров', error);
        throw error;
    }
}

/**
 * Получает метаданные о товарах
 * @returns {Object|null} Метаданные или null
 */
function getMetadata() {
    return metadataCache;
}

/**
 * Получает статистику по странам
 * @returns {Object} Статистика по странам
 */
function getCountryStats() {
    if (!productsCache.has('all_products')) {
        return {};
    }
    
    const allProducts = productsCache.get('all_products');
    const stats = {};
    
    allProducts.forEach(product => {
        product.tags.forEach(tag => {
            if (!stats[tag]) {
                stats[tag] = 0;
            }
            stats[tag]++;
        });
    });
    
    return stats;
}

/**
 * Получает товары по стране
 * @param {string} country - Код страны
 * @returns {Array} Массив товаров из указанной страны
 */
function getProductsByCountry(country) {
    if (!productsCache.has('all_products')) {
        return [];
    }
    
    const allProducts = productsCache.get('all_products');
    return allProducts.filter(product => product.tags.includes(country));
}

/**
 * Очищает все кэши
 */
function clearCaches() {
    productsCache.clear();
    metadataCache = null;
    safeLog('Info', 'Кэши загрузчика товаров очищены');
}

/**
 * Получает статистику использования кэшей
 * @returns {Object} Статистика кэшей
 */
function getCacheStats() {
    return {
        productsCacheSize: productsCache.size,
        hasMetadataCache: metadataCache !== null,
        isLoading: loaderIsLoading
    };
}

/**
 * Предзагружает все файлы товаров
 * @returns {Promise<void>}
 */
async function preloadAllFiles() {
    const files = [
        'product/serbia-products.json',
        'product/russia-products.json',
        'product/china-products.json',
        'product/czech-products.json',
        'product/georgia-products.json',
        'product/germany-products.json'
    ];
    
    safeLog('Info', 'Предзагрузка файлов товаров');
    
    const preloadPromises = files.map(async (filePath) => {
        try {
            const response = await fetch(filePath, { method: 'HEAD' });
            if (response.ok) {
                safeLog('Info', `${filePath} доступен`);
            } else {
                safeLog('Warn', `${filePath} недоступен (${response.status})`);
            }
        } catch (error) {
            safeLog('Error', `Ошибка при проверке ${filePath}`, error);
        }
    });
    
    await Promise.allSettled(preloadPromises);
    safeLog('Info', 'Предзагрузка завершена');
}

/**
 * Проверяет доступность всех файлов
 * @returns {Promise<Object>} Статус доступности файлов
 */
async function checkFilesAvailability() {
    const files = [
        'product/serbia-products.json',
        'product/russia-products.json',
        'product/china-products.json',
        'product/other-countries.json'
    ];
    
    const availability = {};
    
    for (const filePath of files) {
        try {
            const response = await fetch(filePath, { method: 'HEAD' });
            availability[filePath] = {
                available: response.ok,
                status: response.status,
                statusText: response.statusText
            };
        } catch (error) {
            availability[filePath] = {
                available: false,
                error: error.message
            };
        }
    }
    
    return availability;
}

// Экспортируем функции
window.ProductLoader = {
    loadAllProducts,
    loadProductsFromFile,
    createMainProductsFile,
    getMetadata,
    getCountryStats,
    getProductsByCountry,
    clearCaches,
    getCacheStats,
    preloadAllFiles,
    checkFilesAvailability
}; 