/**
 * Predefined NODE_ENV values
 */

/** `NODE_ENV=production` */
export const prod = process.env.NODE_ENV === 'production';

/** `NODE_ENV=development` */
export const dev = process.env.NODE_ENV === 'development';

/** `NODE_ENV=test` */
export const test = process.env.NODE_ENV === 'test';
