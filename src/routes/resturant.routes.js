import { Router } from 'express';
import {
  getAllRestaurants,
  getRestaurantById,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  toggleActive,
  getMyRestaurants,
  getActiveRestaurantsWithDiscount,
  applyRestaurantDiscount,
  applyProductDiscount,
  removeDiscount
} from '../controllers/restaurant.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = Router();

// Public routes
router.get('/', getAllRestaurants);
router.get('/active-discounts', getActiveRestaurantsWithDiscount);
router.get('/:id', getRestaurantById);

// Protected - Owner routes
router.post('/', authenticate, authorize('RESTAURANT_OWNER', 'HOME_CHEF'), createRestaurant);
router.get('/my', authenticate, authorize('RESTAURANT_OWNER', 'HOME_CHEF'), getMyRestaurants);
router.put('/:id', authenticate, authorize('RESTAURANT_OWNER', 'HOME_CHEF'), updateRestaurant);
router.delete('/:id', authenticate, authorize('RESTAURANT_OWNER', 'HOME_CHEF'), deleteRestaurant);
router.patch('/:id/toggle-active', authenticate, authorize('RESTAURANT_OWNER', 'HOME_CHEF'), toggleActive);

// Discount routes
router.patch('/:id/discount', authenticate, authorize('RESTAURANT_OWNER', 'HOME_CHEF'), applyRestaurantDiscount);
router.patch('/products/:product_id/discount', authenticate, authorize('RESTAURANT_OWNER', 'HOME_CHEF'), applyProductDiscount);
router.delete('/discount/:type/:id', authenticate, authorize('RESTAURANT_OWNER', 'HOME_CHEF'), removeDiscount);

export default router;