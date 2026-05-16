import * as riderService from "../services/rider/rider.service.js";
import { successResponse, errorResponse } from "../utils/helper.js";

// GET /api/riders/orders/available
export const getAvailableOrders = async (req, res) => {
  try {
    const orders = await riderService.getAvailableOrders(req.query);
    return successResponse(res, orders, "Available orders fetched successfully");
  } catch (err) {
    return errorResponse(res, err, "Failed to fetch available orders");
  }
};

// POST /api/riders/orders/:id/accept
export const acceptOrder = async (req, res) => {
  try {
    const order = await riderService.acceptOrder(req.params.id, req.user.userId);
    return successResponse(res, order, "Order accepted successfully");
  } catch (err) {
    return errorResponse(res, err, "Failed to accept order");
  }
};

// PATCH /api/riders/orders/:id/status
// Body: { status: 'picked_up' | 'delivered' }
export const updateDeliveryStatus = async (req, res) => {
  try {
    const order = await riderService.updateDeliveryStatus(
      req.params.id,
      req.user.userId,
      req.body.status,
    );
    return successResponse(res, order, "Delivery status updated successfully");
  } catch (err) {
    return errorResponse(res, err, "Failed to update delivery status");
  }
};

// GET /api/riders/deliveries
export const getMyDeliveries = async (req, res) => {
  try {
    const deliveries = await riderService.getMyDeliveries(req.user.userId, req.query);
    return successResponse(res, deliveries, "Deliveries fetched successfully");
  } catch (err) {
    return errorResponse(res, err, "Failed to fetch deliveries");
  }
};

// PATCH /api/riders/location
// Body: { latitude, longitude }
export const updateLocation = async (req, res) => {
  try {
    const location = await riderService.updateLocation(req.user.userId, req.body);
    return successResponse(res, location, "Location updated successfully");
  } catch (err) {
    return errorResponse(res, err, "Failed to update location");
  }
};
