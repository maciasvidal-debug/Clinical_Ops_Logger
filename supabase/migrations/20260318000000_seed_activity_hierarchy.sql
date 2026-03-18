-- Drop everything
DELETE FROM activity_subtasks;
DELETE FROM activity_tasks;
DELETE FROM category_roles;
DELETE FROM activity_categories;

-- Recreate based on new unified standard

-- 1. START-UP & REGULATORY
WITH cat AS (
  INSERT INTO activity_categories (name) VALUES ('01. START-UP & REGULATORY') RETURNING id
),
t1 AS (INSERT INTO activity_tasks (category_id, name, role_context) SELECT id, 'Regulatory Management and Dossier', 'site_led' FROM cat RETURNING id),
t2 AS (INSERT INTO activity_tasks (category_id, name, role_context) SELECT id, 'Site Selection Visit (SSV)', 'cro_led' FROM cat RETURNING id),
t3 AS (INSERT INTO activity_tasks (category_id, name, role_context) SELECT id, 'Site Initiation Visit (SIV)', 'cro_led' FROM cat RETURNING id),
t4 AS (INSERT INTO activity_tasks (category_id, name, role_context) SELECT id, 'Trial Master File (TMF) Processing', 'cro_led' FROM cat RETURNING id)
INSERT INTO activity_subtasks (task_id, name)
VALUES
  ((SELECT id FROM t1), 'Initial Submission to Ethics Committees (CEC/IRB)'),
  ((SELECT id FROM t1), 'Investigator Site File (ISF) Update and Pagination'),
  ((SELECT id FROM t1), 'Clinical Trial Agreement (CTA) Signature Management'),
  ((SELECT id FROM t2), 'Facility Assessment'),
  ((SELECT id FROM t2), 'PI Qualification Review'),
  ((SELECT id FROM t3), 'Protocol Training'),
  ((SELECT id FROM t3), 'IP Handling Review'),
  ((SELECT id FROM t4), 'Uploading to eTMF');

-- 2. RECRUITMENT & RETENTION
WITH cat AS (
  INSERT INTO activity_categories (name) VALUES ('02. RECRUITMENT & RETENTION') RETURNING id
),
t1 AS (INSERT INTO activity_tasks (category_id, name, role_context) SELECT id, 'Recruitment Execution', 'site_led' FROM cat RETURNING id),
t2 AS (INSERT INTO activity_tasks (category_id, name, role_context) SELECT id, 'Retention Strategies', 'site_led' FROM cat RETURNING id)
INSERT INTO activity_subtasks (task_id, name)
VALUES
  ((SELECT id FROM t1), 'Pre-screening Execution and Logs'),
  ((SELECT id FROM t1), 'Potential Patient Database Management'),
  ((SELECT id FROM t2), 'Logistics and Transport Coordination for Subjects'),
  ((SELECT id FROM t2), 'Reminder Calls and Visit Follow-up');

-- 3. CONDUCT & MONITORING
WITH cat AS (
  INSERT INTO activity_categories (name) VALUES ('03. CONDUCT & MONITORING') RETURNING id
),
t1 AS (INSERT INTO activity_tasks (category_id, name, role_context) SELECT id, 'eCRF Data Management', 'site_led' FROM cat RETURNING id),
t2 AS (INSERT INTO activity_tasks (category_id, name, role_context) SELECT id, 'Query Resolution', 'site_led' FROM cat RETURNING id),
t3 AS (INSERT INTO activity_tasks (category_id, name, role_context) SELECT id, 'Subject Visit Control', 'site_led' FROM cat RETURNING id),
t4 AS (INSERT INTO activity_tasks (category_id, name, role_context) SELECT id, 'Routine Monitoring Visit (RMV)', 'cro_led' FROM cat RETURNING id),
t5 AS (INSERT INTO activity_tasks (category_id, name, role_context) SELECT id, 'Centralized Monitoring', 'cro_led' FROM cat RETURNING id),
t6 AS (INSERT INTO activity_tasks (category_id, name, role_context) SELECT id, 'Site Communication', 'cro_led' FROM cat RETURNING id)
INSERT INTO activity_subtasks (task_id, name)
VALUES
  ((SELECT id FROM t1), 'Source to eCRF Transcription'),
  ((SELECT id FROM t1), 'Laboratory and Procedure Results Upload'),
  ((SELECT id FROM t1), 'AE/SAE Logs Registration and Update'),
  ((SELECT id FROM t2), 'Technical Response to Queries'),
  ((SELECT id FROM t2), 'Corrections Execution in EDC and Source'),
  ((SELECT id FROM t2), 'Investigator Sign-off Management'),
  ((SELECT id FROM t3), 'In-window Visit Scheduling and Registration'),
  ((SELECT id FROM t4), 'SDV/SDR'),
  ((SELECT id FROM t4), 'IP Accountability'),
  ((SELECT id FROM t5), 'KRI Review'),
  ((SELECT id FROM t5), 'Data Trending Analysis'),
  ((SELECT id FROM t6), 'Weekly Check-in Calls'),
  ((SELECT id FROM t6), 'Email Correspondence');

-- 4. SAFETY & PHARMACOVIGILANCE
WITH cat AS (
  INSERT INTO activity_categories (name) VALUES ('04. SAFETY & PHARMACOVIGILANCE') RETURNING id
),
t1 AS (INSERT INTO activity_tasks (category_id, name, role_context) SELECT id, 'Safety Reporting', 'site_led' FROM cat RETURNING id)
INSERT INTO activity_subtasks (task_id, name)
VALUES
  ((SELECT id FROM t1), 'SAE Initial Notification and Follow-up'),
  ((SELECT id FROM t1), 'Medical Source Collection and Anonymization'),
  ((SELECT id FROM t1), 'Medical Assessment of Causality and Severity');

-- 5. QUALITY, COMPLIANCE & CLOSE-OUT
WITH cat AS (
  INSERT INTO activity_categories (name) VALUES ('05. QUALITY, COMPLIANCE & CLOSE-OUT') RETURNING id
),
t1 AS (INSERT INTO activity_tasks (category_id, name, role_context) SELECT id, 'Audit and Monitoring Support', 'shared' FROM cat RETURNING id),
t2 AS (INSERT INTO activity_tasks (category_id, name, role_context) SELECT id, 'Close-Out Visit (COV)', 'cro_led' FROM cat RETURNING id)
INSERT INTO activity_subtasks (task_id, name)
VALUES
  ((SELECT id FROM t1), 'Visit Preparation (SDV/SDR readiness)'),
  ((SELECT id FROM t1), 'Quality Control Activities Execution'),
  ((SELECT id FROM t1), 'Follow-up Letter (FUL) Findings Response'),
  ((SELECT id FROM t2), 'Final IP Reconciliation');

-- 6. SYSTEM ADMINISTRATION
WITH cat AS (
  INSERT INTO activity_categories (name) VALUES ('06. SYSTEM ADMINISTRATION') RETURNING id
),
t1 AS (INSERT INTO activity_tasks (category_id, name, role_context) SELECT id, 'User Management', 'shared' FROM cat RETURNING id)
INSERT INTO activity_subtasks (task_id, name)
VALUES
  ((SELECT id FROM t1), 'Account Provisioning');

-- Reassign roles to categories
INSERT INTO category_roles (category_id, role)
SELECT id, 'ra' FROM activity_categories WHERE name = '01. START-UP & REGULATORY'
UNION ALL
SELECT id, 'recruitment_specialist' FROM activity_categories WHERE name IN ('02. RECRUITMENT & RETENTION', '05. QUALITY, COMPLIANCE & CLOSE-OUT')
UNION ALL
SELECT id, 'retention_specialist' FROM activity_categories WHERE name IN ('02. RECRUITMENT & RETENTION', '03. CONDUCT & MONITORING', '05. QUALITY, COMPLIANCE & CLOSE-OUT')
UNION ALL
SELECT id, 'data_entry' FROM activity_categories WHERE name IN ('03. CONDUCT & MONITORING', '05. QUALITY, COMPLIANCE & CLOSE-OUT')
UNION ALL
SELECT id, 'crc' FROM activity_categories WHERE name IN ('01. START-UP & REGULATORY', '02. RECRUITMENT & RETENTION', '03. CONDUCT & MONITORING', '04. SAFETY & PHARMACOVIGILANCE', '05. QUALITY, COMPLIANCE & CLOSE-OUT')
UNION ALL
SELECT id, 'cra' FROM activity_categories WHERE name IN ('01. START-UP & REGULATORY', '03. CONDUCT & MONITORING', '05. QUALITY, COMPLIANCE & CLOSE-OUT')
UNION ALL
SELECT id, 'cta' FROM activity_categories WHERE name IN ('01. START-UP & REGULATORY', '03. CONDUCT & MONITORING')
UNION ALL
SELECT id, 'manager' FROM activity_categories WHERE name IN ('01. START-UP & REGULATORY', '02. RECRUITMENT & RETENTION', '03. CONDUCT & MONITORING', '04. SAFETY & PHARMACOVIGILANCE', '05. QUALITY, COMPLIANCE & CLOSE-OUT')
UNION ALL
SELECT id, 'super_admin' FROM activity_categories WHERE name IN ('01. START-UP & REGULATORY', '02. RECRUITMENT & RETENTION', '03. CONDUCT & MONITORING', '04. SAFETY & PHARMACOVIGILANCE', '05. QUALITY, COMPLIANCE & CLOSE-OUT', '06. SYSTEM ADMINISTRATION');
