-- ========================================
-- ESCROW SYSTEM - CHILE VEHICLE ESCROW
-- PostgreSQL Schema
-- ========================================

-- Extension para UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- ENUMS
-- ========================================

CREATE TYPE user_role AS ENUM ('BUYER', 'SELLER', 'ADMIN');

CREATE TYPE operation_status AS ENUM (
    'CREADA',
    'ACEPTADA',
    'FONDOS_EN_CUSTODIA',
    'EN_TRANSFERENCIA',
    'LIBERADA',
    'CANCELADA'
);

CREATE TYPE document_type AS ENUM (
    'COMPRAVENTA',
    'TRANSFERENCIA',
    'COMPROBANTE_PAGO',
    'IDENTIFICACION',
    'OTRO'
);

CREATE TYPE audit_action AS ENUM (
    'CREATE_OPERATION',
    'ACCEPT_TERMS',
    'DEPOSIT_VALIDATED',
    'DOCUMENT_UPLOADED',
    'STATUS_CHANGED',
    'FUNDS_RELEASED',
    'FUNDS_RETURNED',
    'OPERATION_CANCELLED'
);

-- ========================================
-- TABLES
-- ========================================

-- Tabla de usuarios
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rut VARCHAR(12) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role user_role NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de operaciones
CREATE TABLE operations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    operation_number VARCHAR(20) UNIQUE NOT NULL,
    buyer_id UUID NOT NULL REFERENCES users(id),
    seller_id UUID NOT NULL REFERENCES users(id),
    vehicle_patent VARCHAR(10),
    vehicle_brand VARCHAR(100),
    vehicle_model VARCHAR(100),
    vehicle_year INTEGER,
    agreed_price DECIMAL(12, 2) NOT NULL,
    status operation_status DEFAULT 'CREADA',
    deadline_date DATE NOT NULL,
    buyer_accepted BOOLEAN DEFAULT FALSE,
    seller_accepted BOOLEAN DEFAULT FALSE,
    buyer_accepted_at TIMESTAMP WITH TIME ZONE,
    seller_accepted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT check_different_parties CHECK (buyer_id != seller_id),
    CONSTRAINT check_positive_price CHECK (agreed_price > 0),
    CONSTRAINT check_future_deadline CHECK (deadline_date >= CURRENT_DATE)
);

-- Tabla de escrow (custodia de fondos)
CREATE TABLE escrows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    operation_id UUID UNIQUE NOT NULL REFERENCES operations(id),
    deposited_amount DECIMAL(12, 2),
    deposit_date TIMESTAMP WITH TIME ZONE,
    deposit_validated_by UUID REFERENCES users(id),
    deposit_validated_at TIMESTAMP WITH TIME ZONE,
    deposit_reference VARCHAR(100),
    released_amount DECIMAL(12, 2),
    released_to UUID REFERENCES users(id),
    released_by UUID REFERENCES users(id),
    released_at TIMESTAMP WITH TIME ZONE,
    release_reference VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT check_positive_deposit CHECK (deposited_amount IS NULL OR deposited_amount > 0),
    CONSTRAINT check_positive_release CHECK (released_amount IS NULL OR released_amount > 0)
);

-- Tabla de documentos
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    operation_id UUID NOT NULL REFERENCES operations(id),
    uploaded_by UUID NOT NULL REFERENCES users(id),
    document_type document_type NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    description TEXT,
    is_validated BOOLEAN DEFAULT FALSE,
    validated_by UUID REFERENCES users(id),
    validated_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT check_positive_size CHECK (file_size > 0)
);

-- Tabla de auditoría
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    operation_id UUID REFERENCES operations(id),
    user_id UUID REFERENCES users(id),
    action audit_action NOT NULL,
    description TEXT NOT NULL,
    metadata JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de notificaciones
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    operation_id UUID REFERENCES operations(id),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- INDEXES
-- ========================================

-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_rut ON users(rut);
CREATE INDEX idx_users_role ON users(role);

-- Operations indexes
CREATE INDEX idx_operations_buyer ON operations(buyer_id);
CREATE INDEX idx_operations_seller ON operations(seller_id);
CREATE INDEX idx_operations_status ON operations(status);
CREATE INDEX idx_operations_number ON operations(operation_number);
CREATE INDEX idx_operations_created ON operations(created_at DESC);

-- Escrows indexes
CREATE INDEX idx_escrows_operation ON escrows(operation_id);
CREATE INDEX idx_escrows_deposit_date ON escrows(deposit_date);

-- Documents indexes
CREATE INDEX idx_documents_operation ON documents(operation_id);
CREATE INDEX idx_documents_uploaded_by ON documents(uploaded_by);
CREATE INDEX idx_documents_type ON documents(document_type);

-- Audit logs indexes
CREATE INDEX idx_audit_operation ON audit_logs(operation_id);
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_created ON audit_logs(created_at DESC);

-- Notifications indexes
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);

-- ========================================
-- TRIGGERS
-- ========================================

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_operations_updated_at BEFORE UPDATE ON operations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_escrows_updated_at BEFORE UPDATE ON escrows
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para generar número de operación
CREATE OR REPLACE FUNCTION generate_operation_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.operation_number = 'ESC-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || 
                           LPAD(NEXTVAL('operation_number_seq')::TEXT, 6, '0');
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Secuencia para números de operación
CREATE SEQUENCE operation_number_seq START 1;

CREATE TRIGGER set_operation_number BEFORE INSERT ON operations
    FOR EACH ROW EXECUTE FUNCTION generate_operation_number();

-- ========================================
-- VIEWS
-- ========================================

-- Vista para operaciones con información completa
CREATE VIEW v_operations_full AS
SELECT 
    o.*,
    b.full_name as buyer_name,
    b.email as buyer_email,
    b.rut as buyer_rut,
    s.full_name as seller_name,
    s.email as seller_email,
    s.rut as seller_rut,
    e.deposited_amount,
    e.deposit_date,
    e.released_amount,
    e.released_at,
    COUNT(DISTINCT d.id) as document_count
FROM operations o
LEFT JOIN users b ON o.buyer_id = b.id
LEFT JOIN users s ON o.seller_id = s.id
LEFT JOIN escrows e ON o.id = e.operation_id
LEFT JOIN documents d ON o.id = d.operation_id
GROUP BY o.id, b.id, s.id, e.id;

-- Vista para estadísticas de administrador
CREATE VIEW v_admin_stats AS
SELECT 
    COUNT(*) FILTER (WHERE status = 'CREADA') as creadas,
    COUNT(*) FILTER (WHERE status = 'ACEPTADA') as aceptadas,
    COUNT(*) FILTER (WHERE status = 'FONDOS_EN_CUSTODIA') as en_custodia,
    COUNT(*) FILTER (WHERE status = 'EN_TRANSFERENCIA') as en_transferencia,
    COUNT(*) FILTER (WHERE status = 'LIBERADA') as liberadas,
    COUNT(*) FILTER (WHERE status = 'CANCELADA') as canceladas,
    SUM(agreed_price) FILTER (WHERE status = 'FONDOS_EN_CUSTODIA') as total_en_custodia,
    SUM(agreed_price) FILTER (WHERE status = 'LIBERADA') as total_liberado
FROM operations;

-- ========================================
-- INITIAL DATA
-- ========================================

-- Usuario admin por defecto (password: Admin123!)
-- Hash generado con bcrypt
INSERT INTO users (email, password_hash, rut, full_name, role, email_verified) VALUES
('admin@escrow.cl', '$2b$10$YourHashHere', '11111111-1', 'Administrador Sistema', 'ADMIN', TRUE);

-- ========================================
-- COMMENTS
-- ========================================

COMMENT ON TABLE users IS 'Usuarios del sistema: compradores, vendedores y administradores';
COMMENT ON TABLE operations IS 'Operaciones de escrow para compra/venta de vehículos';
COMMENT ON TABLE escrows IS 'Registro de custodia de fondos por operación';
COMMENT ON TABLE documents IS 'Documentos subidos por las partes (compraventa, transferencia, etc)';
COMMENT ON TABLE audit_logs IS 'Log de auditoría de todas las acciones críticas del sistema';
COMMENT ON TABLE notifications IS 'Notificaciones para usuarios';

COMMENT ON COLUMN operations.operation_number IS 'Número único de operación formato ESC-YYYY-NNNNNN';
COMMENT ON COLUMN operations.deadline_date IS 'Fecha límite para completar la operación';
COMMENT ON COLUMN escrows.deposited_amount IS 'Monto efectivamente depositado y validado';
COMMENT ON COLUMN escrows.released_amount IS 'Monto liberado al vendedor o devuelto al comprador';
