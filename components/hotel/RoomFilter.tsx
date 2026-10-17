import { SelectField } from "@/components/common/SelectField";
import type { RoomStatus, RoomType } from "@/types/room";

export interface RoomFilterValue {
  roomTypeId: string;
  floor: string;
  status: "" | RoomStatus;
}

interface Props {
  value: RoomFilterValue;
  roomTypes: RoomType[];
  floors: number[];
  onChange: (v: RoomFilterValue) => void;
}

export function RoomFilter({ value, roomTypes, floors, onChange }: Props) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <SelectField
        label="Loại phòng"
        value={value.roomTypeId}
        onChange={(e) => onChange({ ...value, roomTypeId: e.target.value })}
      >
        <option value="">Tất cả loại phòng</option>
        {roomTypes.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </SelectField>
      <SelectField
        label="Tầng"
        value={value.floor}
        onChange={(e) => onChange({ ...value, floor: e.target.value })}
      >
        <option value="">Tất cả các tầng</option>
        {floors.map((f) => (
          <option key={f} value={f}>
            Tầng {f}
          </option>
        ))}
      </SelectField>
      <SelectField
        label="Trạng thái"
        value={value.status}
        onChange={(e) =>
          onChange({
            ...value,
            status: e.target.value as RoomFilterValue["status"],
          })
        }
      >
        <option value="">Tất cả</option>
        <option value="AVAILABLE">Còn trống</option>
        <option value="UNAVAILABLE">Không khả dụng</option>
      </SelectField>
    </div>
  );
}
