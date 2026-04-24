import { validationResult } from 'express-validator';

/**
 * Security: Generic validation middleware that intercepts requests.
 * If express-validator found errors in the request body/params,
 * it instantly rejects the request with a 400 Bad Request before
 * it ever reaches your controllers or database.
 */
export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: 'Security Validation Failed: Invalid Input Data',
      details: errors.array() 
    });
  }
  next();
};

/**
 * Example usage in a route file:
 * import { body } from 'express-validator';
 * import { validateRequest } from '../middleware/validationMiddleware.js';
 * 
 * router.post('/', [
 *   body('email').isEmail().normalizeEmail(),
 *   body('password').isLength({ min: 8 }).trim(),
 *   validateRequest
 * ], (req, res) => { ... })
 */
