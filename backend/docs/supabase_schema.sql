-- ============================================================
-- ECHOCHAIN PROVENANCE PLATFORM - SUPABASE POSTGRESQL SCHEMA (PHASES 1-8)
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ROLES TABLE
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO roles (name, description) VALUES
    ('PRODUCER', 'Field harvester capturing environmental audio signatures'),
    ('CONSUMER', 'Public consumer verifying origin and acoustic proofs'),
    ('CERTIFIER', 'Auditor attesting provenance compliance'),
    ('ADMIN', 'System administrator with governance controls')
ON CONFLICT (name) DO NOTHING;

-- 2. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    organization VARCHAR(255),
    role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE NOT NULL,
    reset_token VARCHAR(255),
    reset_token_expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role_id ON users(role_id);

-- 3. REFRESH TOKENS TABLE
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    revoked BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    producer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_name VARCHAR(255) NOT NULL,
    product_type VARCHAR(100) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    batch_id VARCHAR(100) UNIQUE NOT NULL,
    echochain_product_id VARCHAR(100) UNIQUE,
    qr_code_b64 TEXT,
    region VARCHAR(255) NOT NULL,
    country VARCHAR(100) NOT NULL,
    protected_gps_latitude DOUBLE PRECISION,
    protected_gps_longitude DOUBLE PRECISION,
    harvest_date DATE NOT NULL,
    description TEXT,
    certification_status VARCHAR(100) DEFAULT 'Pending Review' NOT NULL,
    verification_status VARCHAR(50) DEFAULT 'UNVERIFIED' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. AUDIO RECORDINGS TABLE
CREATE TABLE IF NOT EXISTS audio_recordings (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_size INTEGER NOT NULL,
    duration DOUBLE PRECISION DEFAULT 0.0 NOT NULL,
    sample_rate INTEGER DEFAULT 44100 NOT NULL,
    channels INTEGER DEFAULT 1 NOT NULL,
    storage_status VARCHAR(50) DEFAULT 'STORED_LOCAL' NOT NULL,
    processing_status VARCHAR(50) DEFAULT 'UNPROCESSED' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. AUDIO CAPTURES TABLE (PHASE 5)
CREATE TABLE IF NOT EXISTS audio_captures (
    id SERIAL PRIMARY KEY,
    capture_id VARCHAR(100) UNIQUE NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_size INTEGER NOT NULL,
    duration DOUBLE PRECISION DEFAULT 0.0 NOT NULL,
    sample_rate INTEGER DEFAULT 44100 NOT NULL,
    channels INTEGER DEFAULT 1 NOT NULL,
    evidence_label VARCHAR(100) DEFAULT 'Environmental audio evidence' NOT NULL,
    capture_source VARCHAR(50) DEFAULT 'BROWSER_MIC' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. ACOUSTIC FINGERPRINTS TABLE (PHASE 6)
CREATE TABLE IF NOT EXISTS acoustic_fingerprints (
    id SERIAL PRIMARY KEY,
    capture_id VARCHAR(100) UNIQUE NOT NULL REFERENCES audio_captures(capture_id) ON DELETE CASCADE,
    fingerprint VARCHAR(255) NOT NULL,
    fingerprint_hex_vector TEXT NOT NULL,
    feature_vector JSONB NOT NULL,
    algorithm_version VARCHAR(50) DEFAULT 'ECHO-DSP-v1.0' NOT NULL,
    signal_label VARCHAR(100) DEFAULT 'Acoustic similarity signal' NOT NULL,
    waveform_plot_b64 TEXT,
    melspectrogram_plot_b64 TEXT,
    mfcc_plot_b64 TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. LIVENESS CHALLENGES TABLE (PHASE 7)
CREATE TABLE IF NOT EXISTS liveness_challenges (
    id SERIAL PRIMARY KEY,
    challenge_id VARCHAR(100) UNIQUE NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    nonce_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'ACTIVE' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. LIVENESS RESULTS TABLE (PHASE 7)
CREATE TABLE IF NOT EXISTS liveness_results (
    id SERIAL PRIMARY KEY,
    capture_id VARCHAR(100) UNIQUE NOT NULL REFERENCES audio_captures(capture_id) ON DELETE CASCADE,
    challenge_id VARCHAR(100) REFERENCES liveness_challenges(challenge_id) ON DELETE SET NULL,
    liveness_score DOUBLE PRECISION NOT NULL,
    replay_risk VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    analysis_metadata JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. PROVENANCE RECORDS TABLE (PHASE 8)
CREATE TABLE IF NOT EXISTS provenance_records (
    id SERIAL PRIMARY KEY,
    provenance_id VARCHAR(100) UNIQUE NOT NULL,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    batch_id VARCHAR(100) NOT NULL REFERENCES products(batch_id) ON DELETE CASCADE,
    capture_id VARCHAR(100) NOT NULL REFERENCES audio_captures(capture_id) ON DELETE CASCADE,
    producer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    region VARCHAR(255) NOT NULL,
    country VARCHAR(100) NOT NULL,
    fingerprint VARCHAR(255) NOT NULL,
    liveness_score DOUBLE PRECISION NOT NULL,
    replay_risk VARCHAR(50) NOT NULL,
    liveness_status VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'DRAFT' NOT NULL,
    provenance_hash VARCHAR(255) NOT NULL,
    metadata_json JSONB NOT NULL,
    is_sealed BOOLEAN DEFAULT FALSE NOT NULL,
    sealed_at TIMESTAMP WITH TIME ZONE,
    ipfs_cid VARCHAR(255),
    ipfs_url VARCHAR(500),
    tx_hash VARCHAR(255),
    block_number INTEGER,
    network VARCHAR(100),
    contract_address VARCHAR(255),
    is_anchored BOOLEAN DEFAULT FALSE NOT NULL,
    anchored_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_provenance_records_provenance_id ON provenance_records(provenance_id);
CREATE INDEX IF NOT EXISTS idx_provenance_records_product_id ON provenance_records(product_id);
CREATE INDEX IF NOT EXISTS idx_provenance_records_capture_id ON provenance_records(capture_id);
CREATE INDEX IF NOT EXISTS idx_provenance_records_status ON provenance_records(status);
