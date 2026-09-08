import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/chowly_db',
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const restaurantId = searchParams.get('restaurant') || '1';

  const client = await pool.connect();
  try {
    const ordersRes = await client.query(
      `SELECT o.*, r.restaurant_name, s.staff_name as waiter_name 
       FROM orders o 
       LEFT JOIN restaurants r ON o.restaurant_id = r.restaurant_id 
       LEFT JOIN staff s ON o.staff_id = s.staff_id 
       WHERE o.restaurant_id = $1 
       ORDER BY o.order_time DESC`,
      [Number(restaurantId)]
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
      [Number(restaurantId)]
    );

    return NextResponse.json({
      orders: ordersRes.rows || [],
      items: itemsRes.rows || [],
      staff: staffRes.rows || [],
    });
  } catch (error) {
    console.error('Failed to fetch waiter branch data:', error);
    return NextResponse.json({ orders: [], items: [], staff: [] }, { status: 500 });
  } finally {
    client.release();
  }
}

// Fetch active orders and staff for a specific restaurant branch
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