import React from "react";
import * as THREE from "three";
import { useConfig } from "../../context/ConfigContext";

const ShelfFeet: React.FC<{
  totalWidth: number;
  depth: number;
  shelfBottomY: number;
  texture: THREE.Texture;
}> = ({ totalWidth, depth, shelfBottomY, texture }) => {
  const { config } = useConfig();
  const feetType = config.editFeet?.feetType || "sans_pieds";
  const feetHeight = config.editFeet?.heightFeet || 0;

  // Không hiển thị gì nếu là loại "sans_pieds"
  if (feetType === "sans_pieds") {
    return null;
  }

  // Vị trí Y của chân kệ = shelfBottomY - (feetHeight / 100) / 2
  const feetPositionY = shelfBottomY - feetHeight / 100 / 2;

  // Các thông số kích thước chân
  const feetDimensions = {
    lyft: {
      // Chân "lyft" giờ là một thanh dài ở giữa
      width: totalWidth - 0.1, // 8cm chiều rộng của thanh dọc theo trục X
      height: feetHeight / 100, // Chiều cao (cm -> THREE.js)
      depth: depth - 0.1, // Chiều dài của thanh dọc theo trục Z (gần bằng chiều sâu của kệ)
      geometry: "box",
      style: "center_bar", // Kiểu thanh giữa
    },
    classyc: {
      width: 0.05, // 5cm
      height: feetHeight / 100,
      depth: 0.05,
      geometry: "box",
      style: "foot", // Kiểu chân riêng lẻ
    },
  };

  // Lấy thông số kích thước dựa trên loại chân
  const dimensions = feetDimensions[feetType as keyof typeof feetDimensions];

  // Nếu là kiểu "center_bar" (thanh giữa), tạo 1 thanh dài ở giữa kệ
  if (dimensions.style === "center_bar") {
    return (
      <group>
        <mesh
          position={[0, feetPositionY, 0]} // Vị trí chính giữa kệ
        >
          <boxGeometry
            args={[dimensions.width, dimensions.height, dimensions.depth]}
          />
          <meshStandardMaterial map={texture} metalness={0.1} roughness={0.8} />
        </mesh>
      </group>
    );
  }

  // Nếu là kiểu "foot" (chân riêng lẻ), dùng code gốc
  // Tính toán vị trí chân kệ - đặt chính xác ở 4 góc của kệ
  const feetPositions = [
    // Chân trước bên trái
    {
      x: -totalWidth / 2 + dimensions.width / 2, // Vị trí X của vách trái
      y: feetPositionY,
      z: depth / 2 - dimensions.depth / 2, // Mặt trước của kệ
    },
    // Chân trước bên phải
    {
      x: totalWidth / 2 - dimensions.width / 2, // Tương ứng với vị trí X của vách phải
      y: feetPositionY,
      z: depth / 2 - dimensions.depth / 2, // Mặt trước của kệ
    },
    // Chân sau bên trái
    {
      x: -totalWidth / 2 + dimensions.width / 2, // Vị trí X của vách trái
      y: feetPositionY,
      z: -depth / 2 + dimensions.depth / 2, // Mặt sau của kệ
    },
    // Chân sau bên phải
    {
      x: totalWidth / 2 - dimensions.width / 2, // Tương ứng với vị trí X của vách phải
      y: feetPositionY,
      z: -depth / 2 + dimensions.depth / 2, // Mặt sau của kệ
    },
  ];

  // Render các chân kệ
  return (
    <group>
      {feetPositions.map((position, index) => (
        <mesh
          key={`foot-${index}`}
          position={[position.x, position.y, position.z]}
        >
          {/* Sử dụng hình học phù hợp với loại chân */}
          {dimensions.geometry === "box" ? (
            <boxGeometry
              args={[dimensions.width, dimensions.height, dimensions.depth]}
            />
          ) : (
            <cylinderGeometry
              args={[
                dimensions.width / 2,
                dimensions.width / 2,
                dimensions.height,
                16,
              ]}
            />
          )}
          <meshStandardMaterial map={texture} metalness={0.1} roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
};

export default ShelfFeet;
