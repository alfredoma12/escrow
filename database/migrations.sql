-- ========================================
-- MIGRACIONES INICIALES
-- ========================================

-- Migration: 001_create_base_schema.sql
-- Ejecutar primero el schema.sql

-- ========================================
-- Migration: 002_add_terms_acceptance.sql
-- ========================================

-- Tabla para aceptación de términos y condiciones
CREATE TABLE terms_acceptances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    operation_id UUID NOT NULL REFERENCES operations(id),
    user_id UUID NOT NULL REFERENCES users(id),
    terms_version VARCHAR(10) NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    accepted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(operation_id, user_id)
);

CREATE INDEX idx_terms_operation ON terms_acceptances(operation_id);
CREATE INDEX idx_terms_user ON terms_acceptances(user_id);

COMMENT ON TABLE terms_acceptances IS 'Registro de aceptación de términos y condiciones por operación';

-- ========================================
-- Migration: 003_add_banking_info.sql
-- ========================================

-- Información bancaria de vendedores para liberación de fondos
CREATE TABLE banking_info (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id),
    bank_name VARCHAR(100) NOT NULL,
    account_type VARCHAR(20) NOT NULL, -- CORRIENTE, VISTA, AHORRO
    account_number VARCHAR(50) NOT NULL,
    account_holder_name VARCHAR(255) NOT NULL,
    account_holder_rut VARCHAR(12) NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_banking_user ON banking_info(user_id);

CREATE TRIGGER update_banking_info_updated_at BEFORE UPDATE ON banking_info
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE banking_info IS 'Información bancaria de usuarios para transferencias';

-- ========================================
-- Migration: 004_add_refund_tracking.sql
-- ========================================

-- Tabla para tracking de devoluciones
CREATE TABLE refunds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    operation_id UUID NOT NULL REFERENCES operations(id),
    escrow_id UUID NOT NULL REFERENCES escrows(id),
    amount DECIMAL(12, 2) NOT NULL,
    reason TEXT NOT NULL,
    requested_by UUID NOT NULL REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    refunded_to UUID NOT NULL REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, APPROVED, COMPLETED, REJECTED
    refund_reference VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT check_refund_amount CHECK (amount > 0)
);

CREATE INDEX idx_refunds_operation ON refunds(operation_id);
CREATE INDEX idx_refunds_status ON refunds(status);

COMMENT ON TABLE refunds IS 'Solicitudes y tracking de devoluciones de fondos';

-- ========================================
-- Migration: 005_add_email_verification.sql
-- ========================================

-- Tokens de verificación de email
CREATE TABLE email_verification_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_email_tokens_user ON email_verification_tokens(user_id);
CREATE INDEX idx_email_tokens_token ON email_verification_tokens(token);

-- Tokens de recuperación de contraseña
CREATE TABLE password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_password_tokens_user ON password_reset_tokens(user_id);
CREATE INDEX idx_password_tokens_token ON password_reset_tokens(token);

COMMENT ON TABLE email_verification_tokens IS 'Tokens para verificación de correo electrónico';
COMMENT ON TABLE password_reset_tokens IS 'Tokens para recuperación de contraseña';
