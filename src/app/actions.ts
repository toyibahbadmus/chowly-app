'use server';

import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/chowly_db',
});

// 1. Fetch all available restaurants
export async function getRestaurantsAction() {
  const client = await pool.connect();
  try {
    const res = await client.query('SELECT restaurant_id as id, restaurant_name as name, location, contact_number FROM restaurants ORDER BY restaurant_id');
    return res.rows;
  } catch (error) {
    console.error('Failed to fetch restaurants:', error);
    return [];
  } finally {
    client.release();
  }
}

// 2. Fetch tables for a specific restaurant
export async function getTablesForRestaurantAction(restaurantId: string | number) {
  const client = await pool.connect();
  try {
    const res = await client.query(
      'SELECT table_id as id, table_number as number, capacity, table_status as status FROM restaurant_tables WHERE restaurant_id = $1 ORDER BY table_number',
      [Number(restaurantId)]
    );
    return res.rows;
  } catch (error) {
    console.error('Failed to fetch tables:', error);
    return [];
  } finally {
    client.release();
  }
}

// 3. Fetch global menu items
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

// 4. Submit order transaction with restaurant_id
export async function submitOrderAction(restaurantId: string | number, sessionId: string, staffId: string, items: any[]) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const maxWaitTime = items.length > 0 ? Math.max(...items.map((i) => Number(i.prepTime) || 15)) : 25;
    const parsedRestaurantId = Number(restaurantId) || 1;
    const parsedSessionId = Number(sessionId.replace(/\D/g, '')) || 1;
    
    const staffRes = await client.query('SELECT staff_id FROM staff WHERE restaurant_id = $1 LIMIT 1', [parsedRestaurantId]);
    const parsedStaffId = staffRes.rows[0]?.staff_id || 1;

    const orderRes = await client.query(
      `INSERT INTO orders (restaurant_id, session_id, staff_id, overall_status, total_expected_wait, order_time) 
       VALUES ($1, $2, $3, 'Processing', $4, CURRENT_TIMESTAMP) RETURNING order_id`,
      [parsedRestaurantId, parsedSessionId, parsedStaffId, maxWaitTime]
    );

    const orderId = orderRes.rows[0].order_id;

    for (const item of items) {
      const targetMenuId = Number(item.id || item.menuId);
      const targetQuantity = Number(item.quantity) || 1;
      const targetPrepTime = Number(item.prepTime) || 15;

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

// 5. Get exact order total
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

// 6. Submit payment
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

// 7. Fetch receipt data with restaurant details
export async function getReceiptDataAction(orderId: string | number) {
  const client = await pool.connect();
  try {
    const orderRes = await client.query(
      `SELECT o.*, r.restaurant_name, r.location, s.staff_name as waiter_name 
       FROM orders o 
       LEFT JOIN restaurants r ON o.restaurant_id = r.restaurant_id 
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

// 8. Submit feedback
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

// 9. Fetch staff members for a specific restaurant
export async function getStaffForRestaurantAction(restaurantId: string | number, role?: string) {
  const client = await pool.connect();
  try {
    let query = 'SELECT staff_id as id, staff_name as name, staff_role as role FROM staff WHERE restaurant_id = $1';
    let params: any[] = [Number(restaurantId)];

    if (role) {
      query += ' AND staff_role = $2';
      params.push(role);
    }

    const res = await client.query(query, params);
    return res.rows;
  } catch (error) {
    console.error('Failed to fetch staff:', error);
    return [];
  } finally {
    client.release();
  }
}

// 10. Update order assignment (Chef, Bartender) and status
export async function updateOrderAssignmentAction(orderId: string | number, chefId: string | number, bartenderId: string | number, status: string) {
  const client = await pool.connect();
  try {
    await client.query(
      `UPDATE orders 
       SET chef_id = $1, bartender_id = $2, overall_status = $3 
       WHERE order_id = $4`,
      [Number(chefId) || null, Number(bartenderId) || null, status, Number(orderId)]
    );
    return { success: true };
  } catch (error) {
    console.error('Failed to update order assignment:', error);
    return { success: false };
  } finally {
    client.release();
  }
}

// 11. Fetch active orders and staff for a specific restaurant branch
export async function getWaiterBranchDataAction(restaurantId: string | number) {
  const client = await pool.connect();
  try {
    const parsedRestId = Number(restaurantId) || 1;

    const ordersRes = await client.query(
      `SELECT o.*, r.restaurant_name, s.staff_name as waiter_name 
       FROM orders o 
       LEFT JOIN restaurants r ON o.restaurant_id = r.restaurant_id 
       LEFT JOIN staff s ON o.staff_id = s.staff_id 
       WHERE o.restaurant_id = $1 
       ORDER BY o.order_time DESC`,
      [parsedRestId]
    );

    const itemsRes = await client.query(
      `SELECT oi.*, m.item_name as name 
       FROM order_items oi 
       LEFT JOIN menu m ON oi.menu_id = m.menu_id`
    );

    const staffRes = await client.query(
      `SELECT staff_id as id, staff_name as name, staff_role as role 
       FROM staff 
       WHERE restaurant_id = $1`,
      [parsedRestId]
    );

    return {
      orders: ordersRes.rows || [],
      items: itemsRes.rows || [],
      staff: staffRes.rows || [],
    };
  } catch (error) {
    console.error('Failed to fetch waiter branch data:', error);
    return { orders: [], items: [], staff: [] };
  } finally {
    client.release();
  }
}