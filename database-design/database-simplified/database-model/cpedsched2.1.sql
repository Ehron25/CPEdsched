CREATE TYPE user_role AS ENUM ('student', 'admin');
CREATE TYPE req_status AS ENUM ('pending', 'verified', 'confirmed', 'rejected', 'cancelled', 'completed');
CREATE TYPE room_status AS ENUM ('available', 'occupied', 'maintenance');

CREATE TABLE profiles (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT,
    student_number TEXT,
    program TEXT,
    year_section TEXT,
    contact_number TEXT,
    role user_role,
    cor_url TEXT,
    is_verified BOOLEAN,
    created_at TIMESTAMPTZ
);

CREATE TABLE rooms (
    id SERIAL PRIMARY KEY,
    room_number TEXT NOT NULL,
    description TEXT,
    type TEXT,
    status room_status,
    capacity INT,
    floor TEXT,
    features TEXT[]
);

CREATE TABLE equipment (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    total_quantity INT,
    available_quantity INT,
    status TEXT
);

CREATE TABLE blocked_dates (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    reason TEXT NOT NULL,
    created_at TIMESTAMPTZ
);

CREATE TABLE reservations (
    id SERIAL PRIMARY KEY,
    reservation_number TEXT,
    user_id INT,
    room_id INT NOT NULL,
    subject_code TEXT,
    professor_name TEXT,
    professor_email TEXT,
    date_reserved DATE NOT NULL,
    time_start TIME NOT NULL,
    time_end TIME NOT NULL,
    status req_status,
    verified_by INT,
    created_at TIMESTAMPTZ,
    cancel_reason TEXT,
    professor_contact_number TEXT,
    professor_status TEXT,
    cancelled_by INT,
    cancelled_at TIMESTAMPTZ,
    verified_at TIMESTAMPTZ
);

CREATE TABLE reservation_equipment (
    id SERIAL PRIMARY KEY,
    reservation_id INT,
    equipment_id INT,
    quantity_requested INT NOT NULL
);

CREATE TABLE incident_reports (
    id SERIAL PRIMARY KEY,
    reporter_id INT,
    reservation_id INT,
    room_id INT,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT,
    admin_notes TEXT,
    created_at TIMESTAMPTZ,
    equipment_id INT
);

CREATE TABLE key_issuance (
    id SERIAL PRIMARY KEY,
    reservation_id INT,
    key_id INT,
    student_id INT,
    issued_by INT,
    issued_at TIMESTAMPTZ,
    returned_at TIMESTAMPTZ,
    status TEXT
);

CREATE TABLE room_keys (
    id SERIAL PRIMARY KEY,
    room_id INT,
    key_number TEXT NOT NULL,
    status TEXT
);

CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT,
    is_read BOOLEAN,
    created_at TIMESTAMPTZ
);

ALTER TABLE reservations
    ADD CONSTRAINT fk_reservations_user FOREIGN KEY (user_id) REFERENCES profiles(id),
    ADD CONSTRAINT fk_reservations_room FOREIGN KEY (room_id) REFERENCES rooms(id),
    ADD CONSTRAINT fk_reservations_verified_by FOREIGN KEY (verified_by) REFERENCES profiles(id),
    ADD CONSTRAINT fk_reservations_cancelled_by FOREIGN KEY (cancelled_by) REFERENCES profiles(id);

ALTER TABLE reservation_equipment
    ADD CONSTRAINT fk_reservation_equipment_reservation FOREIGN KEY (reservation_id) REFERENCES reservations(id),
    ADD CONSTRAINT fk_reservation_equipment_equipment FOREIGN KEY (equipment_id) REFERENCES equipment(id);

ALTER TABLE incident_reports
    ADD CONSTRAINT fk_incident_reports_reporter FOREIGN KEY (reporter_id) REFERENCES profiles(id),
    ADD CONSTRAINT fk_incident_reports_reservation FOREIGN KEY (reservation_id) REFERENCES reservations(id),
    ADD CONSTRAINT fk_incident_reports_room FOREIGN KEY (room_id) REFERENCES rooms(id),
    ADD CONSTRAINT fk_incident_reports_equipment FOREIGN KEY (equipment_id) REFERENCES equipment(id);

ALTER TABLE key_issuance
    ADD CONSTRAINT fk_key_issuance_reservation FOREIGN KEY (reservation_id) REFERENCES reservations(id),
    ADD CONSTRAINT fk_key_issuance_key FOREIGN KEY (key_id) REFERENCES room_keys(id),
    ADD CONSTRAINT fk_key_issuance_student FOREIGN KEY (student_id) REFERENCES profiles(id),
    ADD CONSTRAINT fk_key_issuance_issued_by FOREIGN KEY (issued_by) REFERENCES profiles(id);

ALTER TABLE room_keys
    ADD CONSTRAINT fk_room_keys_room FOREIGN KEY (room_id) REFERENCES rooms(id);

ALTER TABLE notifications
    ADD CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES profiles(id);
CREATE INDEX idx_reservations_user_id ON reservations(user_id);
CREATE INDEX idx_reservations_room_id ON reservations(room_id);
CREATE INDEX idx_reservations_date ON reservations(date_reserved);
CREATE INDEX idx_reservations_status ON reservations(status);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_incident_reports_reservation_id ON incident_reports(reservation_id);

CREATE OR REPLACE FUNCTION deduct_equipment_stock()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE equipment
    SET available_quantity = available_quantity - NEW.quantity_requested
    WHERE id = NEW.equipment_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION restore_equipment_stock()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status != NEW.status AND NEW.status IN ('cancelled', 'completed') THEN
        UPDATE equipment e
        SET available_quantity = available_quantity + re.quantity_requested
        FROM reservation_equipment re
        WHERE re.reservation_id = NEW.id AND e.id = re.equipment_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_equipment_request
    AFTER INSERT ON reservation_equipment
    FOR EACH ROW
    EXECUTE FUNCTION deduct_equipment_stock();

CREATE TRIGGER on_reservation_status_change
    AFTER UPDATE ON reservations
    FOR EACH ROW
    EXECUTE FUNCTION restore_equipment_stock();