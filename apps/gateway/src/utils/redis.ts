import Redis from 'ioredis';
export const redisProductsKey = 'index-products';
export const redisStocksKey = 'index-stocks';
export const redisCategoriesKey = 'index-categories';
export const redisVariantsKey = 'index-variant';
export const redisRatingsKey = 'index-rating';
export const redis = new Redis();
