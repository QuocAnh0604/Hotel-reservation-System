ALTER TABLE reservation
    ADD COLUMN room_count INT NOT NULL DEFAULT 1;

ALTER TABLE reservation
    ADD CONSTRAINT check_reservation_room_count CHECK (room_count > 0);
