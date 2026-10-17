CREATE TABLE hotel (
    hotel_id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(500) NOT NULL,
    location VARCHAR(255),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE room (
    room_id BIGSERIAL PRIMARY KEY,
    room_type_id VARCHAR(100) NOT NULL,
    floor INTEGER,
    number VARCHAR(20) NOT NULL,
    hotel_id BIGINT NOT NULL REFERENCES hotel(hotel_id),
    name VARCHAR(100) NOT NULL,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX idx_room_hotel_id ON room(hotel_id);
CREATE INDEX idx_room_type_id ON room(room_type_id);
