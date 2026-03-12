-- Create custom types for roles and status
CREATE TYPE user_role AS ENUM ('super_admin', 'manager', 'crc', 'cra', 'data_entry', 'recruitment_specialist', 'retention_specialist', 'cta', 'ra');
CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected');

-- Create departments table
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create user_profiles table linking to auth.users
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    role user_role NOT NULL DEFAULT 'crc',
    status approval_status NOT NULL DEFAULT 'pending',
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    manager_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for performance
CREATE INDEX idx_user_profiles_department_id ON user_profiles(department_id);
CREATE INDEX idx_user_profiles_manager_id ON user_profiles(manager_id);
CREATE INDEX idx_user_profiles_role ON user_profiles(role);
CREATE INDEX idx_user_profiles_status ON user_profiles(status);

-- Enable RLS
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------------
-- RLS POLICIES FOR DEPARTMENTS
-- --------------------------------------------------------
-- Everyone authenticated can view departments (needed for signup form)
CREATE POLICY "Departments are viewable by all authenticated users"
ON departments FOR SELECT TO authenticated USING (true);

-- Only super_admins can insert/update/delete departments
CREATE POLICY "Super admins can manage departments"
ON departments FOR ALL TO authenticated
USING ( (SELECT role FROM user_profiles WHERE id = auth.uid()) = 'super_admin' );

-- --------------------------------------------------------
-- RLS POLICIES FOR USER_PROFILES
-- --------------------------------------------------------
-- Users can view their own profile
CREATE POLICY "Users can view own profile"
ON user_profiles FOR SELECT TO authenticated
USING (id = auth.uid());

-- Super admins can view all profiles
CREATE POLICY "Super admins can view all profiles"
ON user_profiles FOR SELECT TO authenticated
USING ( (SELECT role FROM user_profiles WHERE id = auth.uid()) = 'super_admin' );

-- Managers can view profiles in their department or users who selected them as manager
CREATE POLICY "Managers can view department profiles"
ON user_profiles FOR SELECT TO authenticated
USING (
    (SELECT role FROM user_profiles WHERE id = auth.uid()) = 'manager' AND
    (
        department_id = (SELECT department_id FROM user_profiles WHERE id = auth.uid()) OR
        manager_id = auth.uid() OR
        id = auth.uid()
    )
);

-- Super admins can update any profile
CREATE POLICY "Super admins can update all profiles"
ON user_profiles FOR UPDATE TO authenticated
USING ( (SELECT role FROM user_profiles WHERE id = auth.uid()) = 'super_admin' );

-- Managers can update profiles of their subordinates (to approve/reject/change role)
CREATE POLICY "Managers can update subordinates"
ON user_profiles FOR UPDATE TO authenticated
USING (
    (SELECT role FROM user_profiles WHERE id = auth.uid()) = 'manager' AND
    manager_id = auth.uid()
);

-- Users can update their own profile (basic info, not role/status if we wanted to be strict, but for now we allow basic updates via UI logic)
CREATE POLICY "Users can update own basic info"
ON user_profiles FOR UPDATE TO authenticated
USING (id = auth.uid());
