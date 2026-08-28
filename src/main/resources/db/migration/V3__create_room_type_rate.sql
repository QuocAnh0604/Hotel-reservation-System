CREATE TABLE room_type_rate (
    hotel_id BIGINT NOT NULL,
    rate_date DATE NOT NULL,
    rate DECIMAL(10,2) NOT NULL CHECK (rate > 0),
    PRIMARY KEY (hotel_id, rate_date)
);
CREATE INDEX idx_room_type_rate_hotel_id ON room_type_rate(hotel_id);
