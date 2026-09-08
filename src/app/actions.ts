'use server';

import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/chowly_db',
});

// 1. Fetch menu items matching your schema columns (estimated_prep_time)
export async function getMenuItemsAction() {
  const client = await pool.connect();
  try {
    const res = await client.query(
      'SELECT menu_id as id, item_name as name, item_type as type, price, estimated_prep_time as "prepTime", description FROM menu WHERE is_available = TRUE'
    );
    return res.rows;
  } catch (error) {
    console.error('Failed to fetch menu items from DB:', error);
    return [];
  } finally {
    client.release();
  }
}

// 2. Submit order using INTEGER serial keys properly
export async function submitOrderAction(sessionId: string, staffId: string, items: any[]) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const maxWaitTime = items.length > 0 ? Math.max(...items.map((i) => Number(i.prepTime) || 15)) : 25;
    const parsedSessionId = Number(sessionId.replace(/\D/g, '')) || 1;
    const parsedStaffId = Number(staffId.replace(/\D/g, '')) || 1;

    // Insert into orders (order_id is auto-increment SERIAL)
    const orderRes = await client.query(
      `INSERT INTO orders (session_id, staff_id, overall_status, total_expected_wait, order_time) 
       VALUES ($1, $2, 'Processing', $3, CURRENT_TIMESTAMP) RETURNING order_id`,
      [parsedSessionId, parsedStaffId, maxWaitTime]
    );

    const orderId = orderRes.rows[0].order_id;

    // Insert each line item into order_items
    for (const item of items) {
      const targetMenuId = Number(item.menuId || item.id);
      const targetQuantity = Number(item.quantity) || 1;
      const targetPrepTime = Number(item.prepTime) || 15;

      // Fetch current item price from database to ensure accuracy
      const priceRes = await client.query('SELECT price FROM menu WHERE menu_id = $1', [targetMenuId]);
      const unitPrice = priceRes.rows[0]?.price || item.price || 0;

      await client.query(
        `INSERT INTO order_items (order_id, menu_id, quantity, unit_price_at_order, item_preparation_status, max_prep_time) 
         VALUES ($1, $2, $3, $4, 'Preparing', $5)`,
        [orderId, targetMenuId, targetQuantity, unitPrice, targetPrepTime]
      );
    }

    await client.query('COMMIT');
    return { success: true, orderId };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Failed to submit order transaction:', error);
    return { success: false, error: 'Database transaction failed' };
  } finally {
    client.release();
  }
}

// 3. Get exact order total dynamically from order_items
export async function getOrderTotalFromDB(orderId: string | number) {
  const client = await pool.connect();
  try {
    const res = await client.query(
      `SELECT SUM(quantity * unit_price_at_order) as total_amount 
       FROM order_items 
       WHERE order_id = $1`,
      [Number(orderId)]
    );
    return res.rows[0]?.total_amount ? Number(res.rows[0].total_amount) : 0;
  } catch (error) {
    console.error('Failed to fetch order total from DB:', error);
    return 0;
  } finally {
    client.release();
  }
}

// 4. Submit payment and log into payments table + update order status
export async function submitPaymentAction(orderId: string | number, totalAmount: number, paymentMethod: string) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(
      `INSERT INTO payments (order_id, total_amount_paid, payment_method, payment_status) 
       VALUES ($1, $2, $3, 'Completed')`,
      [Number(orderId), totalAmount, paymentMethod]
    );

    await client.query(
      `UPDATE orders SET overall_status = 'Completed' WHERE order_id = $1`,
      [Number(orderId)]
    );

    await client.query('COMMIT');
    return { success: true };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Failed to process payment in DB:', error);
    return { success: false };
  } finally {
    client.release();
  }
}

// 5. Fetch receipt data matching schema columns
export async function getReceiptDataAction(orderId: string | number) {
  const client = await pool.connect();
  try {
    const orderRes = await client.query(
      `SELECT o.*, s.staff_name as waiter_name 
       FROM orders o 
       LEFT JOIN staff s ON o.staff_id = s.staff_id 
       WHERE o.order_id = $1`,
      [Number(orderId)]
    );

    const itemsRes = await client.query(
      `SELECT oi.*, m.item_name as name, m.item_type as type, oi.unit_price_at_order as price 
       FROM order_items oi 
       LEFT JOIN menu m ON oi.menu_id = m.menu_id 
       WHERE oi.order_id = $1`,
      [Number(orderId)]
    );

    return {
      order: orderRes.rows[0] || null,
      items: itemsRes.rows || [],
    };
  } catch (error) {
    console.error('Failed to fetch receipt data from DB:', error);
    return { order: null, items: [] };
  } finally {
    client.release();
  }
}

// 6. Submit feedback into the complaints table
export async function submitComplaintAction(orderId: string | number, complaintText: string, rating: number) {
  const client = await pool.connect();
  try {
    await client.query(
      `INSERT INTO complaints (order_id, complaint_details, customer_rating) 
       VALUES ($1, $2, $3)`,
      [Number(orderId), complaintText, rating]
    );
    return { success: true };
  } catch (error) {
    console.error('Failed to submit feedback to DB:', error);
    return { success: false };
  } finally {
    client.release();
  }
}

// 7. Restaurant info fetcher
export async function getRestaurantInfoAction() {
  const client = await pool.connect();
  try {
    const res = await client.query('SELECT restaurant_name, location FROM restaurants WHERE restaurant_id = 1');
    const rest = res.rows[0];
    return {
      branchName: rest ? `${rest.restaurant_name} • ${rest.location} Branch` : 'Ocean Basket • Ikeja',
      status: 'Open & Accepting Orders',
    };
  } catch (error) {
    return { branchName: 'Ocean Basket', status: 'Online' };
  } finally {
    client.release();
  }
}