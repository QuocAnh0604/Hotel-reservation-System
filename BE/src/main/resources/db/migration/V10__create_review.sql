CREATE TABLE review (
    review_id BIGSERIAL PRIMARY KEY,
    hotel_id BIGINT NOT NULL REFERENCES hotel(hotel_id),
    room_type_id VARCHAR(100),
    guest_id BIGINT NOT NULL REFERENCES guest(guest_id),
    reservation_id BIGINT NOT NULL UNIQUE REFERENCES reservation(reservation_id),
    rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment VARCHAR(2000),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_review_hotel_id ON review(hotel_id);
CREATE INDEX idx_review_room_type ON review(hotel_id, room_type_id);
CREATE INDEX idx_review_guest_id ON review(guest_id);
