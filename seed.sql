INSERT INTO restaurant VALUES ('REST001', 'Ocean Basket', 'Ikeja', '+2348011111111');
INSERT INTO restaurant VALUES ('REST002', 'Spur Steak Ranches', 'Victoria Island', '+2348022222222');
INSERT INTO restaurant VALUES ('REST003', 'Hard Rock Cafe', 'Oniru', '+2348033333333');

INSERT INTO customer VALUES ('CUST001', 'Alice Smith', 'alice@email.com');
INSERT INTO customer VALUES ('CUST002', 'Bob Johnson', 'bob@email.com');
INSERT INTO customer VALUES ('CUST003', 'Charlie Brown', 'charlie@email.com');

INSERT INTO "table" VALUES ('TBL001', 'REST001', '04', 4, 'Available');
INSERT INTO "table" VALUES ('TBL002', 'REST002', '12', 6, 'Occupied');
INSERT INTO "table" VALUES ('TBL003', 'REST001', '07', 4, 'Occupied');

INSERT INTO staff VALUES ('STF001', 'REST001', 'David', 'Waiter', true);
INSERT INTO staff VALUES ('STF002', 'REST001', 'Chef Gordon', 'Chef', true);
INSERT INTO staff VALUES ('STF003', 'REST001', 'Bartender Sam', 'Bartender', true);

INSERT INTO staff_shifts VALUES ('SHFT101', 'REST001', 'STF001', '16:00', NULL);
INSERT INTO staff_shifts VALUES ('SHFT102', 'REST001', 'STF002', '16:00', NULL);
INSERT INTO staff_shifts VALUES ('SHFT103', 'REST001', 'STF003', '17:00', NULL);

INSERT INTO dining_session VALUES ('SES001', 'CUST001', 'REST001', 'TBL001', '18:15', '19:45');
INSERT INTO dining_session VALUES ('SES002', 'CUST002', 'REST002', 'TBL002', '19:00', NULL);

INSERT INTO menu VALUES ('MENU001', 'REST001', 'Grilled Steak', 'Food', 15000.00, 25, true);
INSERT INTO menu VALUES ('MENU002', 'REST001', 'Margarita', 'Drink', 4500.00, 10, true);
INSERT INTO menu VALUES ('MENU003', 'REST002', 'Seafood Pasta', 'Food', 12000.00, 20, false);

INSERT INTO orders VALUES ('ORD001', 'SES001', 'STF001', '18:30', 25, 'Served');

INSERT INTO order_items VALUES ('ORIT001', 'ORD001', 'MENU001', 2, 15000.00, 'Served', 25);
INSERT INTO order_items VALUES ('ORIT002', 'ORD001', 'MENU002', 3, 4500.00, 'Served', 10);