'use server';

import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/chowly_db',
});

// Server action to submit an order into PostgreSQL
export async function submitOrderAction(sessionId: string, staffId: string, items: Array<{ menuId: string; quantity: number; price: number; prepTime: number }>) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const orderId = 'ORD' + Math.floor(100 + Math.random() * 900);
    const orderTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    const maxWait = Math.max(...items.map(i => i.prepTime));

    // 1. Insert into orders table
    await client.query(
      `INSERT INTO orders (order_id, session_id, staff_id, order_time, total_expected_wait, overall_status) VALUES ($1, $2, $3, $4, $5, $6)`,
      [orderId, sessionId, staffId, orderTime, maxWait, 'Processing']
    );

    // 2. Insert into order_items table
    for (const [index, item] of items.entries()) {
      const orderItemId = `ORIT-${orderId}-${index + 1}`;
      await client.query(
        `INSERT INTO order_items (order_item_id, order_id, menu_id, quantity, unit_price_at_order, item_preparation_status, max_prep_time) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [orderItemId, orderId, item.menuId, item.quantity, item.price, 'Preparing', item.prepTime]
      );
    }

    await client.query('COMMIT');
    return { success: true, orderId };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Failed to submit order to DB:', error);
    return { success: false, error: 'Database error' };
  } finally {
    client.release();
  }
}

// Server action to log customer complaints
export async function submitComplaintAction(orderId: string, details: string, rating: number) {
  const client = await pool.connect();
  try {
    const complaintId = 'CMP' + Math.floor(100 + Math.random() * 900);
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

    await client.query(
      `INSERT INTO complaint (complaint_id, order_id, complaint_details, customer_rating, submission_time) VALUES ($1, $2, $3, $4, $5)`,
      [complaintId, orderId, details, rating, time]
    );
    return { success: true };
  } catch (error) {
    console.error('Failed to submit complaint:', error);
    return { success: false };
  } finally {
    client.release();
  }
}

// Server action to log payments
export async function submitPaymentAction(orderId: string, amount: number, method: string) {
  const client = await pool.connect();
  try {
    const paymentId = 'PAY' + Math.floor(100 + Math.random() * 900);
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

    await client.query(
      `INSERT INTO payment (payment_id, order_id, total_amount_paid, payment_method, payment_time, payment_status) VALUES ($1, $2, $3, $4, $5, $6)`,
      [paymentId, orderId, amount, method, time, 'Completed']
    );

    // Update order status
    await client.query(`UPDATE orders SET overall_status = 'Completed' WHERE order_id = $1`, [orderId]);

    return { success: true };
  } catch (error) {
    console.error('Failed to record payment:', error);
    return { success: false };
  } finally {
    client.release();
  }
}