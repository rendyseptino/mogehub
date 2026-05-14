import { useEffect } from "react";
import { Box, Select, Stack } from "@chakra-ui/react";

export default function AddFilter({
  selectedCategory,
  setSortPrice,
  setSortYear,
  setSortKm,
  sortPrice,
  sortYear,
  sortKm,
}) {
  const isMotorBekas =
    selectedCategory?.toLowerCase() === "motor bekas";
  const isMotorBaru =
    selectedCategory?.toLowerCase() === "motor baru";
  const isMotor = isMotorBekas || isMotorBaru;

  // 🔥 DEBUG FULL STATE
  useEffect(() => {
    console.log("===== ADD FILTER DEBUG =====");
    console.log("selectedCategory:", selectedCategory);
    console.log("isMotorBekas:", isMotorBekas);
    console.log("isMotorBaru:", isMotorBaru);
    console.log("isMotor:", isMotor);
    console.log("sortYear:", sortYear);
    console.log("sortKm:", sortKm);
  }, [selectedCategory, sortYear, sortKm]);

  return (
    <Box>
      <Stack spacing={3}>

        <Select
          placeholder="Sort Harga"
          value={sortPrice}
          onChange={(e) => setSortPrice(e.target.value)}
        >
          <option value="low_high">Harga terendah → tertinggi</option>
          <option value="high_low">Harga tertinggi → terendah</option>
        </Select>

        {isMotor && (
          <Select
            placeholder="Sort Tahun"
            value={sortYear}
            onChange={(e) => {
              console.log("YEAR CHANGE:", e.target.value);
              setSortYear(e.target.value);
            }}
          >
            <option value="new_old">Terbaru → Terlama</option>
            <option value="old_new">Terlama → Terbaru</option>
          </Select>
        )}

        {isMotorBekas && (
          <Select
            placeholder="Sort KM"
            value={sortKm}
            onChange={(e) => {
              console.log("KM CHANGE:", e.target.value);
              setSortKm(e.target.value);
            }}
          >
            <option value="low_high">KM rendah → tinggi</option>
            <option value="high_low">KM tinggi → rendah</option>
          </Select>
        )}

      </Stack>
    </Box>
  );
}