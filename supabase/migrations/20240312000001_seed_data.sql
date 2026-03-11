INSERT INTO departments (name, description) VALUES
('Clinical Operations', 'Management of clinical trial execution and monitoring.'),
('Site Management', 'Coordination of site activities, patient recruitment and retention.'),
('Data Management', 'Handling of clinical trial data, entry, and quality control.')
ON CONFLICT (name) DO NOTHING;
