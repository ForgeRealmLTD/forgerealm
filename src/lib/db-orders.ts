import pool from "@/lib/db";
import type { CartItem } from "@/lib/stripe-checkout";

export interface OrderData {
  orderId: string;
  totalAmount: number;
  items: CartItem[];
  email: string;
  status: string;
}

export type OrderStatus =
  | "completed" // Payment successful
  | "expired" // Checkout session expired
  | "failed" // Payment failed
  | "refunded" // Order refunded
  | "cancelled"; // Order cancelled

/**
 * Saves an order to the database
 * @param data - Order data to save
 * @returns Promise with insert result
 */
export async function saveOrder(data: OrderData) {
  try {
    const connection = await pool.getConnection();

    try {
      // Ensure orders table exists with extended schema
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS orders (
          id INT AUTO_INCREMENT PRIMARY KEY,
          order_id VARCHAR(255) UNIQUE NOT NULL,
          total_amount DECIMAL(10, 2) NOT NULL,
          items_json JSON NOT NULL,
          email VARCHAR(255) NOT NULL,
          status VARCHAR(50) NOT NULL DEFAULT 'completed',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_order_id (order_id),
          INDEX idx_email (email),
          INDEX idx_status (status),
          INDEX idx_created_at (created_at)
        )
      `);

      // Insert order
      const query = `
        INSERT INTO orders (order_id, total_amount, items_json, email, status, created_at)
        VALUES (?, ?, ?, ?, ?, NOW())
      `;

      const result = await connection.execute(query, [
        data.orderId,
        data.totalAmount,
        JSON.stringify(data.items),
        data.email,
        data.status,
      ]);

      return result;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error saving order to database:", error);
    throw error;
  }
}

/**
 * Retrieves an order by order ID (Stripe session ID)
 * @param orderId - The order ID to retrieve
 * @returns Promise with order data
 */
export async function getOrder(orderId: string) {
  try {
    const connection = await pool.getConnection();

    try {
      const query = `
        SELECT * FROM orders WHERE order_id = ?
      `;

      const [rows] = await connection.execute(query, [orderId]);

      return rows && rows.length > 0 ? rows[0] : null;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error retrieving order:", error);
    throw error;
  }
}

/**
 * Retrieves an order by Stripe ID (alias for getOrder)
 * @param stripeId - The Stripe ID to retrieve
 * @returns Promise with order data
 */
export async function getOrderByStripeId(stripeId: string) {
  return getOrder(stripeId);
}

/**
 * Retrieves orders by email address
 * @param email - Customer email
 * @returns Promise with array of orders
 */
export async function getOrdersByEmail(email: string) {
  try {
    const connection = await pool.getConnection();

    try {
      const query = `
        SELECT * FROM orders WHERE email = ? ORDER BY created_at DESC
      `;

      const [rows] = await connection.execute(query, [email]);

      return rows || [];
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error retrieving orders by email:", error);
    throw error;
  }
}

/**
 * Updates order status
 * @param orderId - The order ID to update
 * @param status - New status value
 * @returns Promise with update result
 */
export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus
) {
  try {
    const connection = await pool.getConnection();

    try {
      const query = `
        UPDATE orders SET status = ?, updated_at = NOW() WHERE order_id = ?
      `;

      const result = await connection.execute(query, [status, orderId]);

      return result;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error updating order status:", error);
    throw error;
  }
}

/**
 * Retrieves orders by status
 * @param status - Order status to filter by
 * @param limit - Maximum number of orders to return (default: 100)
 * @returns Promise with array of orders
 */
export async function getOrdersByStatus(
  status: OrderStatus,
  limit: number = 100
) {
  try {
    const connection = await pool.getConnection();

    try {
      const query = `
        SELECT * FROM orders WHERE status = ? ORDER BY created_at DESC LIMIT ?
      `;

      const [rows] = await connection.execute(query, [status, limit]);

      return rows || [];
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error retrieving orders by status:", error);
    throw error;
  }
}
