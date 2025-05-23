import React, { useEffect, useState } from "react";
import * as THREE from "three";
import { useConfig } from "../../context/ConfigContext";

const ShelfFeet: React.FC<{
  totalWidth: number;
  depth: number;
  shelfBottomY: number;
  texture: THREE.Texture; // Texture mặc định nếu không có texture riêng
}> = ({ totalWidth, depth, shelfBottomY, texture }) => {
  const { config } = useConfig();
  const feetType = config.editFeet?.feetType || "sans_pieds";
  const feetHeight = config.editFeet?.heightFeet || 0;

  // State để lưu texture cho chân kệ
  const [feetTexture, setFeetTexture] = useState<THREE.Texture | null>(null);

  // Lấy đường dẫn texture cho chân kệ từ config
  const feetTexturePath = config.editFeet?.texture?.src || null;

  // Load texture riêng cho chân kệ nếu có
  useEffect(() => {
    if (feetTexturePath) {
      const textureLoader = new THREE.TextureLoader();
      textureLoader.load(feetTexturePath, (loadedTexture) => {
        loadedTexture.wrapS = THREE.RepeatWrapping;
        loadedTexture.wrapT = THREE.RepeatWrapping;
        setFeetTexture(loadedTexture);
      });
    }
  }, [feetTexturePath]);

  // Sử dụng texture riêng nếu có, ngược lại dùng texture mặc định
  const finalTexture = feetTexture || texture;

  // Lấy thông số vật liệu từ config hoặc sử dụng giá trị mặc định
  const metalness =
    config.editFeet?.metalness !== undefined ? config.editFeet.metalness : 0.1;
  const roughness =
    config.editFeet?.roughness !== undefined ? config.editFeet.roughness : 0.8;

  // Không hiển thị gì nếu là loại "sans_pieds"
  if (feetType === "sans_pieds") {
    return null;
  }

  // Vị trí Y của chân kệ = shelfBottomY - (feetHeight / 100) / 2
  const feetPositionY = shelfBottomY - feetHeight / 100 / 2;

  // Các thông số kích thước chân
  const feetDimensions = {
    design: {
      // Chân "design" giờ là một thanh dài ở giữa
      width: totalWidth - 0.1, // 8cm chiều rộng của thanh dọc theo trục X
      height: feetHeight / 100, // Chiều cao (cm -> THREE.js)
      depth: depth - 0.1, // Chiều dài của thanh dọc theo trục Z (gần bằng chiều sâu của kệ)
      geometry: "box",
      style: "center_bar", // Kiểu thanh giữa
    },
    classic: {
      width: 0.05, // 5cm
      height: feetHeight / 100,
      depth: 0.05,
      geometry: "box",
      style: "foot", // Kiểu chân riêng lẻ
    },
  };

  // Lấy thông số kích thước dựa trên loại chân
  const dimensions = feetDimensions[feetType as keyof typeof feetDimensions];

  // Tạo material cho chân kệ
  const feetMaterial = (
    <meshStandardMaterial
      map={finalTexture}
      metalness={metalness}
      roughness={roughness}
    />
  );

  // Nếu là kiểu "center_bar" (thanh giữa), tạo 1 thanh dài ở giữa kệ
  if (dimensions.style === "center_bar") {
    return (
      <group>
        <mesh position={[0, feetPositionY, 0]}>
          <boxGeometry
            args={[dimensions.width, dimensions.height, dimensions.depth]}
          />
          {feetMaterial}
        </mesh>
      </group>
    );
  }

  // Nếu là kiểu "foot" (chân riêng lẻ), dùng code gốc
  // Tính toán vị trí chân kệ - đặt chính xác ở 4 góc của kệ
  const feetPositions = [
    // Chân trước bên trái
    {
      x: -totalWidth / 2 + dimensions.width / 2,
      y: feetPositionY,
      z: depth / 2 - dimensions.depth / 2,
    },
    // Chân trước bên phải
    {
      x: totalWidth / 2 - dimensions.width / 2,
      y: feetPositionY,
      z: depth / 2 - dimensions.depth / 2,
    },
    // Chân sau bên trái
    {
      x: -totalWidth / 2 + dimensions.width / 2,
      y: feetPositionY,
      z: -depth / 2 + dimensions.depth / 2,
    },
    // Chân sau bên phải
    {
      x: totalWidth / 2 - dimensions.width / 2,
      y: feetPositionY,
      z: -depth / 2 + dimensions.depth / 2,
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
          {feetMaterial}
        </mesh>
      ))}
    </group>
  );
};

export default ShelfFeet;
