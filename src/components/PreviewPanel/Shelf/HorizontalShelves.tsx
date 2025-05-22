// components/HorizontalShelves.tsx
import React, { useState, useEffect } from "react";
import * as THREE from "three";
import { useConfig } from "../../context/ConfigContext";
import { Text } from "@react-three/drei";

const HorizontalShelves: React.FC<HorizontalShelvesProps> = ({
  columns,
  depth,
  thickness,
  cellHeight,
  shelfBottomY,
  texture,
  getColumnHeight,
  getColumnWidth,
  getColumnXPosition,
}) => {
  const { config } = useConfig();

  // State để lưu texture cho các shelf riêng lẻ
  const [shelfTextures, setShelfTextures] = useState<
    Record<string, THREE.Texture>
  >({});

  // Effect để load texture riêng cho từng shelf
  useEffect(() => {
    const loadShelfTextures = async () => {
      const newTextures: Record<string, THREE.Texture> = {};
      const textureLoader = new THREE.TextureLoader();

      // Duyệt qua tất cả shelves để tìm những shelf có texture riêng
      for (const [key, shelf] of Object.entries(config.shelves || {})) {
        if (shelf?.texture?.src) {
          try {
            const loadedTexture = await new Promise<THREE.Texture>(
              (resolve, reject) => {
                textureLoader.load(
                  shelf.texture!.src,
                  (texture) => {
                    texture.wrapS = THREE.RepeatWrapping;
                    texture.wrapT = THREE.RepeatWrapping;
                    resolve(texture);
                  },
                  undefined,
                  reject
                );
              }
            );
            newTextures[key] = loadedTexture;
          } catch (error) {
            console.warn(`Failed to load texture for shelf ${key}:`, error);
          }
        }
      }

      setShelfTextures(newTextures);
    };

    loadShelfTextures();
  }, [config.shelves]);

  // Hàm để lấy texture cho shelf cụ thể
  const getShelfTexture = (
    row: number,
    column: number,
    isVirtual: boolean = false
  ) => {
    const key = isVirtual ? `${row}-${column}-virtual` : `${row}-${column}`;

    // Sử dụng texture riêng nếu có, ngược lại dùng texture mặc định
    const finalTexture = shelfTextures[key] || texture;
    return finalTexture;
  };

  // Kiểm tra một vị trí có phải là kệ tăng cường không
  const isReinforcedShelf = (
    row: number,
    column: number,
    isVirtual: boolean = false
  ) => {
    // Format: "row-column" hoặc "row-column-virtual"
    const key = isVirtual ? `${row}-${column}-virtual` : `${row}-${column}`;

    // Sử dụng shelves object
    const shelf = config.shelves[key];
    return shelf?.isReinforced === true;
  };

  // Kiểm tra một vị trí có phải là kệ tiêu chuẩn không
  const isStandardShelf = (
    row: number,
    column: number,
    isVirtual: boolean = false
  ) => {
    // Format: "row-column" hoặc "row-column-virtual"
    const key = isVirtual ? `${row}-${column}-virtual` : `${row}-${column}`;

    // Sử dụng shelves object
    const shelf = config.shelves[key];

    if (shelf) {
      return shelf.isStandard === true;
    }

    // Mặc định: kệ thật là tiêu chuẩn, kệ ảo không phải
    return !isVirtual;
  };

  // Kiểm tra một vị trí có phải là kệ đã bị xóa không
  const isRemovedShelf = (
    row: number,
    column: number,
    isVirtual: boolean = false
  ) => {
    // Format: "row-column" hoặc "row-column-virtual"
    const key = isVirtual ? `${row}-${column}-virtual` : `${row}-${column}`;

    // Sử dụng shelves object
    const shelf = config.shelves[key];

    if (shelf) {
      return shelf.isRemoved === true;
    }

    return false;
  };

  // Kiểm tra xem một kệ ảo đã được chuyển thành kệ tăng cường thật hay chưa
  const isVirtualShelfConvertedToReinforced = (row: number, column: number) => {
    const virtualKey = `${row}-${column}-virtual`;
    const realKey = `${row}-${column}`;

    // Sử dụng shelves object
    const virtualShelf = config.shelves[virtualKey];
    const realShelf = config.shelves[realKey];

    if (virtualShelf && realShelf) {
      // Kệ ảo không phải reinforced và kệ thật là reinforced
      return (
        !virtualShelf.isReinforced &&
        realShelf.isReinforced &&
        !virtualShelf.isRemoved &&
        !realShelf.isRemoved
      );
    }
  };

  // Kiểm tra xem một kệ ảo đã được chuyển thành kệ tiêu chuẩn thật hay chưa
  const isVirtualShelfConvertedToStandard = (row: number, column: number) => {
    const virtualKey = `${row}-${column}-virtual`;
    const realKey = `${row}-${column}`;

    // Sử dụng shelves object
    const virtualShelf = config.shelves[virtualKey];
    const realShelf = config.shelves[realKey];

    if (virtualShelf && realShelf) {
      // Kệ ảo không phải standard và kệ thật là standard
      return (
        !virtualShelf.isStandard &&
        realShelf.isStandard &&
        !virtualShelf.isRemoved &&
        !realShelf.isRemoved
      );
    }
  };

  const renderHorizontalShelves = () => {
    const shelves = [];

    // Vẽ kệ ngang cho từng cột
    for (let col = 0; col < columns; col++) {
      const colWidth = getColumnWidth(col);
      const colHeight = getColumnHeight(col);
      const colX = getColumnXPosition(col);
      const centerX = colX + colWidth / 2 + thickness / 2;

      // Khoảng cách giữa các kệ ngang
      const shelfSpacing = cellHeight + thickness;

      // Tính số hàng thực tế dựa trên chiều cao của cột
      const actualRows = Math.max(
        1,
        Math.floor((colHeight - 2 * thickness) / shelfSpacing) + 1
      );

      // Lưu top row index để dùng cho kệ top
      const topRowIndex = actualRows;

      // Vẽ kệ đáy (kiểm tra removed)
      if (!isRemovedShelf(0, col)) {
        const bottomShelfTexture = getShelfTexture(0, col, false);
        shelves.push(
          <group key={`horizontal-shelf-${col}-0`}>
            <mesh position={[centerX, shelfBottomY + thickness / 2, 0]}>
              <boxGeometry args={[colWidth, thickness, depth]} />
              <meshStandardMaterial
                map={bottomShelfTexture}
                roughness={0.7}
                metalness={0.1}
              />
            </mesh>
            {isReinforcedShelf(0, col) && (
              <Text
                position={[
                  centerX - colWidth / 2 + 0.05,
                  shelfBottomY + thickness / 2,
                  depth / 2 + 0.01,
                ]}
                color="#4CAF50"
                fontSize={0.1}
                anchorX="left"
                anchorY="middle"
              >
                F
              </Text>
            )}
          </group>
        );
      }

      // Vẽ kệ đỉnh (kiểm tra removed)
      if (!isRemovedShelf(topRowIndex, col)) {
        const topShelfTexture = getShelfTexture(topRowIndex, col, false);
        shelves.push(
          <group key={`horizontal-shelf-${col}-top`}>
            <mesh
              position={[centerX, shelfBottomY + colHeight - thickness / 2, 0]}
            >
              <boxGeometry args={[colWidth, thickness, depth]} />
              <meshStandardMaterial
                map={topShelfTexture}
                roughness={0.7}
                metalness={0.1}
              />
            </mesh>
            {isReinforcedShelf(topRowIndex, col) && (
              <Text
                position={[
                  centerX - colWidth / 2 + 0.05,
                  shelfBottomY + colHeight - thickness / 2,
                  depth / 2 + 0.01,
                ]}
                color="#4CAF50"
                fontSize={0.1}
                anchorX="left"
                anchorY="middle"
              >
                F
              </Text>
            )}
          </group>
        );
      }

      // Vẽ kệ ngang ở giữa (các kệ đã có, có thể bị xóa)
      for (let row = 1; row < actualRows; row++) {
        // Kiểm tra xem kệ này có bị xóa không
        if (isRemovedShelf(row, col)) {
          continue; // Bỏ qua kệ này nếu nó đã bị xóa
        }

        // Vị trí Y bắt đầu từ đáy lên
        const rowY = shelfBottomY + thickness / 2 + row * shelfSpacing;

        // Chỉ vẽ kệ nếu nằm trong phạm vi chiều cao của cột
        if (rowY < shelfBottomY + colHeight - thickness) {
          const middleShelfTexture = getShelfTexture(row, col, false);
          shelves.push(
            <group key={`horizontal-shelf-${col}-${row}`}>
              <mesh position={[centerX, rowY, 0]}>
                <boxGeometry args={[colWidth, thickness, depth]} />
                <meshStandardMaterial
                  map={middleShelfTexture}
                  roughness={0.7}
                  metalness={0.1}
                />
              </mesh>
              {isReinforcedShelf(row, col) && (
                <Text
                  position={[
                    centerX - colWidth / 2 + 0.05,
                    rowY,
                    depth / 2 + 0.01,
                  ]}
                  color="#4CAF50" // Màu xanh lá cho kệ tăng cường
                  fontSize={0.1}
                  anchorX="left"
                  anchorY="middle"
                >
                  F
                </Text>
              )}
            </group>
          );
        }
      }

      // Vẽ kệ ngang ở giữa với các kệ nửa hàng (half-row) đã được chuyển từ kệ ảo sang kệ thật
      for (let row = 0.5; row < actualRows; row += 1) {
        if (row % 1 === 0) continue; // Bỏ qua các kệ nguyên hàng (đã xử lý ở trên)

        // Kiểm tra xem kệ này có bị xóa không
        if (isRemovedShelf(row, col)) {
          continue; // Bỏ qua kệ này nếu nó nằm trong danh sách removedShelves
        }

        // Format key cho kệ thật và ảo
        const key = `${row}-${col}`;
        const shelf = config.shelves[key];

        // Kiểm tra xem kệ này có phải kệ đã chuyển từ ảo sang thật hay không (cả tăng cường và tiêu chuẩn)
        if (shelf && !shelf.isVirtual && !shelf.isRemoved) {
          // Vị trí Y bắt đầu từ đáy lên
          const rowY = shelfBottomY + thickness / 2 + row * shelfSpacing;

          // Chỉ vẽ kệ nếu nằm trong phạm vi chiều cao của cột
          if (
            rowY > shelfBottomY + thickness &&
            rowY < shelfBottomY + colHeight - thickness
          ) {
            const convertedShelfTexture = getShelfTexture(row, col, false);
            shelves.push(
              <group key={`converted-shelf-${col}-${row}`}>
                <mesh position={[centerX, rowY, 0]}>
                  <boxGeometry args={[colWidth, thickness, depth]} />
                  <meshStandardMaterial
                    map={convertedShelfTexture}
                    roughness={0.7}
                    metalness={0.1}
                  />
                </mesh>
                {shelf.isReinforced && (
                  <Text
                    position={[
                      centerX - colWidth / 2 + 0.05,
                      rowY,
                      depth / 2 + 0.01,
                    ]}
                    color="#4CAF50" // Màu xanh lá cho kệ tăng cường
                    fontSize={0.1}
                    anchorX="left"
                    anchorY="middle"
                  >
                    F
                  </Text>
                )}
              </group>
            );
          }
        }
        // Fallback cho logic cũ sử dụng các mảng string
        else if (isVirtualShelfConvertedToReinforced(row, col)) {
          // Vị trí Y bắt đầu từ đáy lên
          const rowY = shelfBottomY + thickness / 2 + row * shelfSpacing;

          if (
            rowY > shelfBottomY + thickness &&
            rowY < shelfBottomY + colHeight - thickness
          ) {
            const fallbackReinforcedTexture = getShelfTexture(row, col, false);
            shelves.push(
              <group key={`converted-reinforced-shelf-${col}-${row}`}>
                <mesh position={[centerX, rowY, 0]}>
                  <boxGeometry args={[colWidth, thickness, depth]} />
                  <meshStandardMaterial
                    map={fallbackReinforcedTexture}
                    roughness={0.7}
                    metalness={0.1}
                  />
                </mesh>
                <Text
                  position={[
                    centerX - colWidth / 2 + 0.05,
                    rowY,
                    depth / 2 + 0.01,
                  ]}
                  color="#4CAF50" // Màu xanh lá cho kệ tăng cường
                  fontSize={0.1}
                  anchorX="left"
                  anchorY="middle"
                >
                  F
                </Text>
              </group>
            );
          }
        } else if (isVirtualShelfConvertedToStandard(row, col)) {
          // Vị trí Y bắt đầu từ đáy lên
          const rowY = shelfBottomY + thickness / 2 + row * shelfSpacing;

          if (
            rowY > shelfBottomY + thickness &&
            rowY < shelfBottomY + colHeight - thickness
          ) {
            const fallbackStandardTexture = getShelfTexture(row, col, false);
            shelves.push(
              <group key={`converted-standard-shelf-${col}-${row}`}>
                <mesh position={[centerX, rowY, 0]}>
                  <boxGeometry args={[colWidth, thickness, depth]} />
                  <meshStandardMaterial
                    map={fallbackStandardTexture}
                    roughness={0.7}
                    metalness={0.1}
                  />
                </mesh>
              </group>
            );
          }
        }
      }

      // Vẽ kệ ảo (nếu chưa bị xóa và chưa được chuyển thành kệ thật)
      for (let row = 0.5; row < actualRows; row += 1) {
        // Bỏ qua các kệ nguyên hàng (đã xử lý ở trên)
        if (row % 1 === 0) continue;

        // Format key cho kệ ảo và kệ thật
        const virtualKey = `${row}-${col}-virtual`;
        const realKey = `${row}-${col}`;

        // Lấy thông tin từ shelves
        const virtualShelf = config.shelves[virtualKey];
        const realShelf = config.shelves[realKey];

        // Kiểm tra xem kệ ảo này có bị xóa không
        if (isRemovedShelf(row, col, true)) {
          continue; // Bỏ qua kệ này nếu nó đã bị xóa
        }

        // Kiểm tra xem kệ ảo đã được chuyển thành kệ thật chưa
        // Nếu đã chuyển, bỏ qua không vẽ kệ ảo nữa
        if (
          (virtualShelf &&
            realShelf &&
            !virtualShelf.isRemoved &&
            !realShelf.isRemoved) ||
          isVirtualShelfConvertedToReinforced(row, col) ||
          isVirtualShelfConvertedToStandard(row, col)
        ) {
          continue; // Đã chuyển thành kệ thật, không vẽ kệ ảo nữa
        }

        // Kiểm tra loại kệ ảo (tăng cường hoặc tiêu chuẩn)
        const isReinforced = isReinforcedShelf(row, col, true);
        const isStandard = isStandardShelf(row, col, true);

        // Nếu không phải kệ chuẩn hoặc kệ tăng cường, bỏ qua
        if (!isReinforced && !isStandard) continue;

        // Vị trí Y của kệ ảo - đã sửa để đặt chính xác ở giữa
        let rowY;
        if (row % 1 === 0) {
          // Kệ nguyên hàng - giữ nguyên công thức hiện tại
          rowY = shelfBottomY + thickness / 2 + row * shelfSpacing;
        } else {
          // Kệ nửa hàng (ảo) - tính toán vị trí chính giữa
          const lowerRow = Math.floor(row);

          // Vị trí giữa = vị trí kệ dưới + 1/2 khoảng cách giữa hai kệ
          rowY =
            shelfBottomY +
            thickness / 2 +
            lowerRow * shelfSpacing +
            shelfSpacing / 2;
        }
        // Chỉ vẽ kệ nếu nằm trong phạm vi chiều cao của cột
        if (
          rowY > shelfBottomY + thickness &&
          rowY < shelfBottomY + colHeight - thickness
        ) {
          const virtualShelfTexture = getShelfTexture(row, col, true);
          shelves.push(
            <group key={`virtual-shelf-${col}-${row}`}>
              <mesh position={[centerX, rowY, 0]}>
                <boxGeometry args={[colWidth, thickness, depth]} />
                <meshStandardMaterial
                  map={virtualShelfTexture}
                  roughness={0.7}
                  metalness={0.1}
                />
              </mesh>
              {isReinforced && (
                <Text
                  position={[
                    centerX - colWidth / 2 + 0.05,
                    rowY,
                    depth / 2 + 0.01,
                  ]}
                  color="#4CAF50" // Màu xanh lá cho kệ tăng cường
                  fontSize={0.1}
                  anchorX="left"
                  anchorY="middle"
                >
                  F
                </Text>
              )}
            </group>
          );
        }
      }
    }

    return shelves;
  };

  return <>{renderHorizontalShelves()}</>;
};

export default HorizontalShelves;
