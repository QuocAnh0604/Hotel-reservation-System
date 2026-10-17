ALTER TABLE room_type_inventory
    ADD CONSTRAINT check_room_count CHECK (total_inventory - total_reserved >= 0);
