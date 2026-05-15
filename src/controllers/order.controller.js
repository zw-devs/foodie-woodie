import * as orderService from "../services/order/order.service.js";
import { successResponse, errorResponse } from "../utils/helper.js";

// POST /api/orders
// Body: { restaurant_id, priority, delivery_address, delivery_lat, delivery_lng, items: [{ product_id, quantity }] }
export const placeOrder = async (req, res) => {
  try {
    const order = await orderService.placeOrder(req.user.userId, req.body);
    return successResponse(res, order, "Order placed successfully", 201);
  } catch (err) {
    return errorResponse(res, err, "Failed to place order");
  }
};

// GET /api/orders/my  (customer sees their own orders)
export const getMyOrders = async (req, res) => {
  try {
    const orders = await orderService.getMyOrders(req.user.userId, req.query);
    return successResponse(res, orders, "Your orders fetched");
  } catch (err) {
    return errorResponse(res, err, "Failed to fetch your orders");
  }
};

// GET /api/orders/:id
export const getOrderById = async (req, res) => {
  try {
    const order = await orderService.getOrderById(
      req.params.id,
      req.user.userId,
      req.user.role,
    );
    return successResponse(res, order, "Order fetched successfully");
  } catch (err) {
    return errorResponse(res, err, "Failed to fetch order details");
  }
};

// GET /api/orders  (admin only)
// Query: ?status=pending&restaurant_id=xxx
export const getAllOrders = async (req, res) => {
  try {
    const orders = await orderService.getAllOrders(req.query);
    return successResponse(res, orders, "All orders fetched");
  } catch (err) {
    return errorResponse(res, err, "Failed to fetch all orders");
  }
};

// GET /api/restaurants/:restaurantId/orders  (restaurant owner)
// Query: ?status=pending
export const getRestaurantOrders = async (req, res) => {
  try {
    const orders = await orderService.getRestaurantOrders(
      req.params.restaurantId,
      req.user.userId,
      req.query,
    );
    return successResponse(res, orders, "Restaurant orders fetched");
  } catch (err) {
    return errorResponse(res, err, "Failed to fetch restaurant orders");
  }
};

// PATCH /api/orders/:id/status  (admin / restaurant_owner)
// Body: { status: 'confirmed' | 'preparing' | 'picked_up' | 'delivered' | 'cancelled' }
export const updateOrderStatus = async (req, res) => {
  try {
    const order = await orderService.updateOrderStatus(
      req.params.id,
      req.body.status,
      req.user,
    );
    return successResponse(res, order, "Order status updated");
  } catch (err) {
    return errorResponse(res, err, "Failed to update order status");
  }
};

// POST /api/orders/:id/cancel  (customer cancels their own order)
export const cancelOrder = async (req, res) => {
  try {
    const order = await orderService.cancelOrder(req.params.id, req.user.userId);
    return successResponse(res, order, "Order cancelled");
  } catch (err) {
    return errorResponse(res, err, "Failed to cancel order");
  }
};
