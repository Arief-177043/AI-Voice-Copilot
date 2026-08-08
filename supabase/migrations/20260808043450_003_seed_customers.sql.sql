/*
# Seed: 20 Synthetic Customers (PII-Masked)

All customer data is synthetic and PII-masked. Names are masked to initials,
phone numbers and emails are partially masked per data protection guidelines.
*/

INSERT INTO customers (id, full_name, masked_name, phone_masked, email_masked, city, age, monthly_income, kyc_status, credit_score, existing_customer, product_interest, purchase_amount, previous_interactions) VALUES
('c0000001-0000-0000-0000-000000000001', 'Rahul Sharma', 'Rahul S.', '****-****-7821', 'r****@gmail.com', 'Mumbai', 28, 45000, 'verified', 742, true, 'Pay-in-3', 9000, 3),
('c0000001-0000-0000-0000-000000000002', 'Priya Patel', 'Priya P.', '****-****-3345', 'p****@gmail.com', 'Ahmedabad', 31, 52000, 'verified', 781, true, 'Pay-in-3', 15000, 2),
('c0000001-0000-0000-0000-000000000003', 'Arun Kumar', 'Arun K.', '****-****-9012', 'a****@yahoo.com', 'Bengaluru', 24, 28000, 'in_progress', 665, false, 'Pay-in-3', 6000, 1),
('c0000001-0000-0000-0000-000000000004', 'Sneha Reddy', 'Sneha R.', '****-****-5567', 's****@gmail.com', 'Hyderabad', 35, 68000, 'verified', 805, true, 'Pay-in-3', 27000, 4),
('c0000001-0000-0000-0000-000000000005', 'Vikram Singh', 'Vikram S.', '****-****-1234', 'v****@outlook.com', 'Jaipur', 29, 38000, 'not_started', 690, false, 'Pay-in-3', 9000, 0),
('c0000001-0000-0000-0000-000000000006', 'Anita Desai', 'Anita D.', '****-****-8890', 'a****@gmail.com', 'Pune', 42, 95000, 'verified', 820, true, 'Pay-in-3', 45000, 5),
('c0000001-0000-0000-0000-000000000007', 'Karthik Iyer', 'Karthik I.', '****-****-4456', 'k****@gmail.com', 'Chennai', 27, 32000, 'pending', 671, false, 'Pay-in-3', 7500, 1),
('c0000001-0000-0000-0000-000000000008', 'Deepika Nair', 'Deepika N.', '****-****-6678', 'd****@yahoo.com', 'Kochi', 33, 58000, 'verified', 755, true, 'Pay-in-3', 12000, 3),
('c0000001-0000-0000-0000-000000000009', 'Rohan Gupta', 'Rohan G.', '****-****-2231', 'r****@gmail.com', 'Delhi', 26, 35000, 'rejected', 620, false, 'Pay-in-3', 8000, 2),
('c0000001-0000-0000-0000-000000000010', 'Meera Joshi', 'Meera J.', '****-****-9987', 'm****@gmail.com', 'Nagpur', 38, 72000, 'verified', 790, true, 'Pay-in-3', 30000, 4),
('c0000001-0000-0000-0000-000000000011', 'Sanjay Verma', 'Sanjay V.', '****-****-5512', 's****@outlook.com', 'Lucknow', 30, 42000, 'verified', 735, false, 'Pay-in-3', 10500, 2),
('c0000001-0000-0000-0000-000000000012', 'Lakshmi Menon', 'Lakshmi M.', '****-****-7743', 'l****@gmail.com', 'Thiruvananthapuram', 45, 110000, 'verified', 840, true, 'Pay-in-3', 48000, 6),
('c0000001-0000-0000-0000-000000000013', 'Arjun Mehta', 'Arjun M.', '****-****-3398', 'a****@gmail.com', 'Surat', 23, 22000, 'in_progress', 645, false, 'Pay-in-3', 5000, 1),
('c0000001-0000-0000-0000-000000000014', 'Pooja Agarwal', 'Pooja A.', '****-****-1122', 'p****@yahoo.com', 'Kolkata', 34, 62000, 'verified', 770, true, 'Pay-in-3', 18000, 3),
('c0000001-0000-0000-0000-000000000015', 'Naveen Rao', 'Naveen R.', '****-****-8865', 'n****@gmail.com', 'Bengaluru', 29, 40000, 'not_started', 700, false, 'Pay-in-3', 9000, 0),
('c0000001-0000-0000-0000-000000000016', 'Farida Khan', 'Farida K.', '****-****-4421', 'f****@gmail.com', 'Hyderabad', 36, 55000, 'verified', 760, true, 'Pay-in-3', 14000, 2),
('c0000001-0000-0000-0000-000000000017', 'Aditya Bose', 'Aditya B.', '****-****-7790', 'a****@outlook.com', 'Kolkata', 25, 30000, 'pending', 655, false, 'Pay-in-3', 7000, 1),
('c0000001-0000-0000-0000-000000000018', 'Geetha Raj', 'Geetha R.', '****-****-5567', 'g****@gmail.com', 'Madurai', 40, 85000, 'verified', 810, true, 'Pay-in-3', 36000, 5),
('c0000001-0000-0000-0000-000000000019', 'Manish Tiwari', 'Manish T.', '****-****-9923', 'm****@gmail.com', 'Indore', 32, 48000, 'verified', 748, false, 'Pay-in-3', 11000, 2),
('c0000001-0000-0000-0000-000000000020', 'Zara Sheikh', 'Zara S.', '****-****-3340', 'z****@yahoo.com', 'Mumbai', 27, 36000, 'in_progress', 680, false, 'Pay-in-3', 8500, 1)
ON CONFLICT (id) DO NOTHING;
