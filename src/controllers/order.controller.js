import prisma from "../lib/prisma";

// ─── 1. CREATE ORDER ───────────────────────────────
export const createOrder = async (req, res) => {
  try {
    const {
      customer_id,
      restaurant_id,
      delivery_address,
      delivery_lat,
      delivery_lng,
      items,
    } = req.body;

    let total_amount = 0;
    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.product_id },
      });
      total_amount += product.price * item.quantity;
    }

    const order = await prisma.order.create({
      data: {
        customer_id,
        restaurant_id,
        total_amount,
        delivery_address,
        delivery_lat,
        delivery_lng,
        items: {
          create: items.map((i) => ({
            product_id: i.product_id,
            quantity: i.quantity,
            unit_price: i.unit_price,
          })),
        },
      },
      include: { items: { include: { product: true } }, restaurant: true },
    });

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ─── 2. GET ALL ORDERS ─────────────────────────────
export const getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const where = {};
    if (status) where.status = status;

    const orders = await prisma.order.findMany({
      where,
      skip: (page - 1) * limit,
      take: parseInt(limit),
      include: {
        customer: { select: { username: true } },
        restaurant: { select: { name: true } },
        rider: { select: { username: true } },
      },
      orderBy: { placed_at: "desc" },
    });

    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ─── 3. GET ORDER BY ID ────────────────────────────  //orders and items from a specifc restaurant
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { product: true } },
        customer: { select: { username: true, phone: true } },
        restaurant: { select: { name: true, address: true } },
        rider: { select: { username: true, phone: true } },
        assignments: true,
      },
    });

    if (!order)
      return res.status(404).json({ success: false, error: "Order not found" });
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ─── 5. GET RESTAURANT ORDERS ──────────────────────
export const getRestaurantOrders = async (req, res) => {
  try {
    const { restaurant_id } = req.params;
    const { status } = req.query;

    const where = { restaurant_id };
    if (status) where.status = status;

    const orders = await prisma.order.findMany({
      where,
      include: {
        customer: { select: { username: true, phone: true } },
        items: { include: { product: true } },
      },
      orderBy: { placed_at: "desc" },
    });

    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ─── 6. UPDATE ORDER STATUS ────────────────────────
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updateData = { status };
    if (status === "delivered") updateData.delivered_at = new Date();

    const order = await prisma.order.update({
      where: { id },
      data: updateData,
      include: { items: true, customer: true, restaurant: true },
    });

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ─── 7. CANCEL ORDER ────────────────────────────────
export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { cancellation_reason } = req.body;

    const order = await prisma.order.update({
      where: { id },
      data: {
        status: "cancelled",
        cancelled_at: new Date(),
        cancellation_reason,
      },
      include: { items: true },
    });

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ─── 8. ASSIGN RIDER ────────────────────────────────
export const assignRider = async (req, res) => {
  try {
    const { id } = req.params;
    const { rider_id } = req.body;

    const order = await prisma.order.update({
      where: { id },
      data: { rider_id, status: "confirmed" },
    });

    await prisma.rider_assignment.create({
      data: { rider_id, order_id: id, status: "assigned" },
    });

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ─── 9. GET RIDER ORDERS ───────────────────────────
export const getRiderOrders = async (req, res) => {
  try {
    const { rider_id } = req.params;
    const { status } = req.query;

    const where = { rider_id };
    if (status) where.status = status;

    const orders = await prisma.order.findMany({
      where,
      include: {
        restaurant: {
          select: {
            name: true,
            address: true,
            latitude: true,
            longitude: true,
          },
        },
        customer: {
          select: { username: true, phone: true, delivery_address: true },
        },
        items: { include: { product: { select: { name: true } } } },
      },
      orderBy: { placed_at: "desc" },
    });

    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
