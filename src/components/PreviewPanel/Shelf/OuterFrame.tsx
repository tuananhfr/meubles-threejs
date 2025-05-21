// components/OuterFrame.tsx
import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import taupeTexture from "../../../assets/images/samples-wenge-wood-effect-800x800.jpg";
import { ThreeEvent, useFrame, useLoader } from "@react-three/fiber";
import { useConfig } from "../../context/ConfigContext";
import { useBackPanelManager } from "../../../hooks/useBackPanelManager";
interface DrawerAnimationData {
  drawerKey: string;
  startPosition: number;
  targetPosition: number;
  startTime: number;
  duration: number;
}

interface DoorAnimationData {
  doorKey: string;
  startRotation: number;
  targetRotation: number;
  startTime: number;
  duration: number;
  hingePosition: [number, number, number]; // Vị trí bản lề
  isLeftHinged: boolean; // Xác định loại bản lề (trái/phải)
}
const OuterFrame: React.FC<OuterFrameProps> = ({
  columns,
  depth,
  cellHeight,
  thickness,
  totalWidth,
  shelfBottomY,
  texture,
  getColumnHeight,
  getColumnWidth,
  getColumnXPosition,
}) => {
  const { config, batchUpdate } = useConfig();
  const textureBackboard = useLoader(THREE.TextureLoader, taupeTexture);
  const [openedDrawers, setOpenedDrawers] = useState<Record<string, boolean>>(
    {}
  );
  const [openedDoors, setOpenedDoors] = useState<Record<string, boolean>>({});

  // Ref để lưu trữ dữ liệu animation
  const animationRef = useRef<Record<string, DrawerAnimationData>>({});
  const drawerGroupRefs = useRef<Record<string, THREE.Group>>({});

  // Ref cho cửa
  const doorGroupRefs = useRef<Record<string, THREE.Group>>({});
  const doorAnimationRef = useRef<Record<string, DoorAnimationData>>({});

  const { syncBackPanels } = useBackPanelManager();

  // Hook để cập nhật animation mỗi frame
  useFrame(() => {
    // Xử lý animation cho mỗi ngăn kéo
    Object.keys(animationRef.current).forEach((key) => {
      const animation = animationRef.current[key];
      const drawerGroup = drawerGroupRefs.current[animation.drawerKey];

      if (!drawerGroup) return;

      const now = Date.now();
      const elapsed = Math.min(
        (now - animation.startTime) / animation.duration,
        1
      );

      // Áp dụng easing để animation mượt mà hơn
      const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
      const easedElapsed = easeOutCubic(elapsed);

      // Tính toán vị trí mới
      const newZ =
        animation.startPosition +
        (animation.targetPosition - animation.startPosition) * easedElapsed;

      // Cập nhật vị trí ngăn kéo
      if (drawerGroup.position) {
        drawerGroup.position.z = newZ;
      }

      // Xóa animation khi hoàn thành
      if (elapsed >= 1) {
        delete animationRef.current[key];
      }
    });

    // Xử lý animation cho mỗi cửa
    Object.keys(doorAnimationRef.current).forEach((key) => {
      const animation = doorAnimationRef.current[key];
      const doorGroup = doorGroupRefs.current[animation.doorKey];

      if (!doorGroup) return;

      const now = Date.now();
      const elapsed = Math.min(
        (now - animation.startTime) / animation.duration,
        1
      );

      // Áp dụng easing để animation mượt mà hơn
      const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
      const easedElapsed = easeOutCubic(elapsed);

      // Tính toán góc xoay mới
      const newRotation =
        animation.startRotation +
        (animation.targetRotation - animation.startRotation) * easedElapsed;

      // Cập nhật góc xoay cửa
      if (doorGroup.rotation) {
        doorGroup.rotation.y = newRotation;
      }

      // Xóa animation khi hoàn thành
      if (elapsed >= 1) {
        delete doorAnimationRef.current[key];
      }
    });
  });

  useEffect(() => {
    // Kiểm tra xem có shelf nào không
    const activeShelvesCount = Object.values(config.shelves || {}).filter(
      (shelf) => !shelf.isRemoved
    ).length;

    let updatedBackPanels: Record<string, BackPanelsData>;

    if (activeShelvesCount > 0) {
      updatedBackPanels = syncBackPanels(config.backPanels || {});
    } else {
      // Nếu không có shelf, tạo panel mặc định như cũ
      updatedBackPanels = createDefaultBackPanels();
    }

    // Cập nhật state
    batchUpdate({
      backPanels: updatedBackPanels,
    });

    // Hàm createDefaultBackPanels tạo panel mặc định khi không có shelf
    function createDefaultBackPanels(): Record<string, BackPanelsData> {
      const defaultPanels: Record<string, BackPanelsData> = {};

      // Lưu lại các panel tùy chỉnh nếu có
      if (config.backPanels) {
        Object.keys(config.backPanels).forEach((key) => {
          if (key.startsWith("custom-panel-")) {
            defaultPanels[key] = { ...config.backPanels[key] };
          }
        });
      }

      // Tạo back panel mặc định cho từng cột
      for (let col = 0; col < columns; col++) {
        const colWidth = getColumnWidth(col);
        const colHeight = getColumnHeight(col);
        const colX = getColumnXPosition(col);
        const shelfSpacing = cellHeight + thickness;
        const numberOfShelves = Math.max(
          2,
          Math.round((colHeight - thickness) / shelfSpacing) + 1
        );
        const numberOfPanels = numberOfShelves - 1;

        for (let row = 0; row < numberOfPanels; row++) {
          const cellY =
            shelfBottomY + thickness + row * shelfSpacing + cellHeight / 2;
          const cellX = colX + colWidth / 2 + thickness / 2;
          const backPanelZ = -depth / 2 + thickness / 2 + 0.0001;
          const panelKey = `back-panel-${row}-${col}`;

          // Kiểm tra xem panel này đã tồn tại chưa
          const existingPanel =
            config.backPanels && config.backPanels[panelKey];
          let isRemoved = true;
          let permanentlyDeleted = false;

          if (existingPanel) {
            isRemoved = existingPanel.isRemoved;
            if (existingPanel.permanentlyDeleted !== undefined) {
              permanentlyDeleted = existingPanel.permanentlyDeleted;
            }
          }

          defaultPanels[panelKey] = {
            key: panelKey,
            row: row,
            column: col,
            isRemoved: isRemoved,
            permanentlyDeleted: permanentlyDeleted,
            position: [cellX, cellY, backPanelZ],
            dimensions: [colWidth, cellHeight, thickness],
            material: "taupeTexture",
          };
        }
      }

      return defaultPanels;
    }
  }, [
    columns,
    depth,
    cellHeight,
    thickness,
    totalWidth,
    shelfBottomY,
    getColumnHeight,
    getColumnWidth,
    getColumnXPosition,
    config.backPanels,
    config.shelves,
    batchUpdate,
    syncBackPanels,
  ]);

  // Xử lý sự kiện hover và click cho ngăn kéo
  const handleDrawerPointerOver = (
    e: ThreeEvent<PointerEvent>,
    drawerKey: string
  ) => {
    e.stopPropagation();
    document.body.style.cursor = "pointer";

    // Chỉ bắt đầu animation nếu ngăn kéo chưa mở
    if (!openedDrawers[drawerKey]) {
      animateDrawer(drawerKey, true);
    }
  };

  const handleDrawerPointerOut = (
    e: ThreeEvent<PointerEvent>,
    drawerKey: string
  ) => {
    e.stopPropagation();
    document.body.style.cursor = "auto";

    // Đóng ngăn kéo khi không hover nữa, trừ khi đã được click để mở
    if (!openedDrawers[drawerKey]) {
      animateDrawer(drawerKey, false);
    }
  };

  const handleDrawerClick = (e: ThreeEvent<MouseEvent>, drawerKey: string) => {
    e.stopPropagation();

    // Toggle trạng thái mở/đóng của ngăn kéo
    setOpenedDrawers((prev) => ({
      ...prev,
      [drawerKey]: !prev[drawerKey],
    }));

    // Mở/đóng ngăn kéo dựa trên trạng thái mới
    animateDrawer(drawerKey, !openedDrawers[drawerKey]);
  };

  const handleDoorPointerOver = (
    e: ThreeEvent<PointerEvent>,
    doorKey: string
  ) => {
    e.stopPropagation();
    document.body.style.cursor = "pointer";

    // Chỉ bắt đầu animation nếu cửa chưa mở
    if (!openedDoors[doorKey]) {
      const isLeftHinged = doorKey.includes("Left");
      animateDoor(doorKey, true, isLeftHinged);
    }
  };

  const handleDoorPointerOut = (
    e: ThreeEvent<PointerEvent>,
    doorKey: string
  ) => {
    e.stopPropagation();
    document.body.style.cursor = "auto";

    // Đóng cửa khi không hover nữa, trừ khi đã được click để mở
    if (!openedDoors[doorKey]) {
      const isLeftHinged = doorKey.includes("Left");
      animateDoor(doorKey, false, isLeftHinged);
    }
  };

  const handleDoorClick = (e: ThreeEvent<MouseEvent>, doorKey: string) => {
    e.stopPropagation();

    // Toggle trạng thái mở/đóng của cửa
    setOpenedDoors((prev) => ({
      ...prev,
      [doorKey]: !prev[doorKey],
    }));

    // Mở/đóng cửa dựa trên trạng thái mới
    const isLeftHinged = doorKey.includes("Left");
    animateDoor(doorKey, !openedDoors[doorKey], isLeftHinged);
  };

  // Hàm animation mở/đóng ngăn kéo với hiệu ứng mượt mà
  const animateDrawer = (drawerKey: string, opening: boolean) => {
    const drawerGroup = drawerGroupRefs.current[drawerKey];
    if (!drawerGroup) return;

    // Xác định vị trí hiện tại và vị trí mục tiêu
    const currentPosition = drawerGroup.position.z;
    const targetPosition = opening
      ? depth / 2 + thickness / 2 + depth * 0.4
      : depth / 2 + thickness / 2; // Sử dụng cùng vị trí khởi tạo

    // Bỏ qua nếu ngăn kéo đã ở vị trí mục tiêu
    if (Math.abs(currentPosition - targetPosition) < 0.001) return;

    // Tạo animation mới
    const animationId = `${drawerKey}-${Date.now()}`;
    animationRef.current[animationId] = {
      drawerKey,
      startPosition: currentPosition,
      targetPosition,
      startTime: Date.now(),
      duration: 300, // ms
    };
  };

  const animateDoor = (
    doorKey: string,
    opening: boolean,
    isLeftHinged: boolean
  ) => {
    const doorGroup = doorGroupRefs.current[doorKey];
    if (!doorGroup) return;

    // Xác định góc xoay hiện tại và góc xoay mục tiêu
    const currentRotation = doorGroup.rotation.y;

    // Xác định góc xoay mục tiêu dựa trên loại bản lề và trạng thái mở/đóng
    let targetRotation = 0;
    if (opening) {
      // Cửa bản lề trái xoay theo chiều kim đồng hồ (góc dương)
      // Cửa bản lề phải xoay ngược chiều kim đồng hồ (góc âm)
      targetRotation = isLeftHinged ? Math.PI / 3 : -Math.PI / 3; // Xoay 60 độ
    }

    // Bỏ qua nếu cửa đã ở vị trí mục tiêu
    if (Math.abs(currentRotation - targetRotation) < 0.001) return;

    // Tạo animation mới
    const animationId = `${doorKey}-${Date.now()}`;
    doorAnimationRef.current[animationId] = {
      doorKey,
      startRotation: currentRotation,
      targetRotation,
      startTime: Date.now(),
      duration: 300, // ms
      hingePosition: [0, 0, 0], // Không cần dùng trong logic hiện tại
      isLeftHinged,
    };
  };

  const renderOuterFrame = () => {
    const frames = [];
    const startX = -totalWidth / 2;

    // Vẽ khung ngoài
    for (let col = 0; col < columns; col++) {
      const colWidth = getColumnWidth(col);
      const colHeight = getColumnHeight(col);
      const colX = getColumnXPosition(col);

      const verticalWallHeight = colHeight;

      // Vách trái (chỉ vẽ cho cột đầu tiên)
      if (col === 0) {
        frames.push(
          <mesh
            key="left-wall"
            position={[
              startX + thickness / 2,
              shelfBottomY + verticalWallHeight / 2,
              0,
            ]}
          >
            <boxGeometry args={[thickness, verticalWallHeight, depth]} />
            <meshStandardMaterial
              map={texture}
              roughness={0.7}
              metalness={0.1}
            />
          </mesh>
        );
      }

      // Vách phải (chỉ vẽ cho cột cuối cùng)
      if (col === columns - 1) {
        frames.push(
          <mesh
            key="right-wall"
            position={[
              colX + colWidth + thickness / 2,
              shelfBottomY + verticalWallHeight / 2,
              0,
            ]}
          >
            <boxGeometry args={[thickness, verticalWallHeight, depth]} />
            <meshStandardMaterial
              map={texture}
              roughness={0.7}
              metalness={0.1}
            />
          </mesh>
        );
      }
    }

    // Vẽ mặt sau cho từng ô trong kệ
    if (config.backPanels) {
      // Chỉ lặp qua các panel một lần
      Object.values(config.backPanels).forEach((panel) => {
        if (!panel.isRemoved) {
          frames.push(
            <mesh key={panel.key} position={panel.position}>
              <boxGeometry args={panel.dimensions} />
              <meshStandardMaterial
                map={textureBackboard}
                roughness={0.7}
                metalness={0.1}
              />
            </mesh>
          );
        }
      });
    }

    // Vẽ mặt trước (facade panels)
    if (config.facadePanels) {
      // Chỉ lặp qua các panel một lần
      Object.values(config.facadePanels).forEach((panel) => {
        // Xác định loại panel dựa vào key
        const isPanelTiroir = panel.key.includes("tiroir");
        const isPanelPorte = panel.key.includes("porte");

        if (isPanelTiroir) {
          // Cấu hình cho ngăn kéo
          const drawerDepth = depth * 0.8; // 80% độ sâu của kệ
          const frontThickness = thickness / 3; // Độ dày mặt trước của ngăn kéo

          frames.push(
            <group
              key={panel.key}
              ref={(ref) => {
                if (ref) drawerGroupRefs.current[panel.key] = ref;
              }}
              position={[
                panel.position[0],
                panel.position[1],
                panel.position[2] || -depth / 2 + thickness / 2,
              ]}
            >
              {/* Mặt trước ngăn kéo */}
              <mesh
                onPointerOver={(e) => handleDrawerPointerOver(e, panel.key)}
                onPointerOut={(e) => handleDrawerPointerOut(e, panel.key)}
                onClick={(e) => handleDrawerClick(e, panel.key)}
                position={[0, 0, frontThickness / 2]}
              >
                <boxGeometry
                  args={[
                    panel.dimensions[0],
                    panel.dimensions[1],
                    frontThickness,
                  ]}
                />
                <meshStandardMaterial
                  map={textureBackboard}
                  roughness={0.7}
                  metalness={0.1}
                />
              </mesh>

              {/* Tay cầm ngăn kéo */}
              <mesh position={[0, 0, frontThickness + 0.005]}>
                <boxGeometry args={[panel.dimensions[0] * 0.3, 0.02, 0.01]} />
                <meshStandardMaterial color="#777777" />
              </mesh>

              {/* Thành bên trái */}
              <mesh
                position={[
                  -panel.dimensions[0] / 2 + thickness / 2,
                  0,
                  -drawerDepth / 2 + frontThickness / 2,
                ]}
              >
                <boxGeometry
                  args={[
                    thickness,
                    panel.dimensions[1] - thickness,
                    drawerDepth,
                  ]}
                />
                <meshStandardMaterial
                  map={textureBackboard}
                  roughness={0.7}
                  metalness={0.1}
                />
              </mesh>

              {/* Thành bên phải */}
              <mesh
                position={[
                  panel.dimensions[0] / 2 - thickness / 2,
                  0,
                  -drawerDepth / 2 + frontThickness / 2,
                ]}
              >
                <boxGeometry
                  args={[
                    thickness,
                    panel.dimensions[1] - thickness,
                    drawerDepth,
                  ]}
                />
                <meshStandardMaterial
                  map={textureBackboard}
                  roughness={0.7}
                  metalness={0.1}
                />
              </mesh>

              {/* Đáy ngăn kéo */}
              <mesh
                position={[
                  0,
                  -panel.dimensions[1] / 2 + thickness / 2,
                  -drawerDepth / 2 + frontThickness / 2,
                ]}
              >
                <boxGeometry
                  args={[
                    panel.dimensions[0] - thickness * 2,
                    thickness,
                    drawerDepth,
                  ]}
                />
                <meshStandardMaterial
                  map={textureBackboard}
                  roughness={0.7}
                  metalness={0.1}
                />
              </mesh>

              {/* Mặt sau ngăn kéo */}
              <mesh
                position={[
                  0,
                  0,
                  -drawerDepth + thickness / 2 + frontThickness / 2,
                ]}
              >
                <boxGeometry
                  args={[
                    panel.dimensions[0] - thickness * 2,
                    panel.dimensions[1] - thickness,
                    thickness,
                  ]}
                />
                <meshStandardMaterial
                  map={textureBackboard}
                  roughness={0.7}
                  metalness={0.1}
                />
              </mesh>
            </group>
          );
        } else if (isPanelPorte) {
          // Xác định loại bản lề dựa vào key của panel
          const isLeftHinged = panel.key.includes("Left");
          const doorThickness = thickness;

          // Tính vị trí bản lề (pivot)
          let hingeX = panel.position[0];
          if (isLeftHinged) {
            hingeX += panel.dimensions[0] / 2; // Bản lề bên phải
          } else {
            hingeX -= panel.dimensions[0] / 2; // Bản lề bên trái
          }

          frames.push(
            <group
              key={panel.key}
              position={[hingeX, panel.position[1], panel.position[2]]}
              ref={(ref) => {
                if (ref) doorGroupRefs.current[panel.key] = ref;
              }}
            >
              <group
                position={[
                  isLeftHinged
                    ? -panel.dimensions[0] / 2
                    : panel.dimensions[0] / 2,
                  0,
                  0,
                ]}
              >
                {/* Thân cửa */}
                <mesh
                  onPointerOver={(e) => handleDoorPointerOver(e, panel.key)}
                  onPointerOut={(e) => handleDoorPointerOut(e, panel.key)}
                  onClick={(e) => handleDoorClick(e, panel.key)}
                >
                  <boxGeometry
                    args={[
                      panel.dimensions[0],
                      panel.dimensions[1],
                      doorThickness,
                    ]}
                  />
                  <meshStandardMaterial
                    map={textureBackboard}
                    roughness={0.7}
                    metalness={0.1}
                  />
                </mesh>

                {/* Tay nắm cửa */}
                <mesh
                  position={[
                    isLeftHinged
                      ? -panel.dimensions[0] / 2 + 0.05
                      : panel.dimensions[0] / 2 - 0.05,
                    0,
                    doorThickness / 2 + 0.005,
                  ]}
                >
                  <boxGeometry args={[0.02, 0.1, 0.01]} />
                  <meshStandardMaterial color="#777777" />
                </mesh>
              </group>
            </group>
          );
        } else {
          // Các loại mặt tiền khác (mặc định)
          frames.push(
            <mesh key={panel.key} position={panel.position}>
              <boxGeometry args={panel.dimensions} />
              <meshStandardMaterial
                map={textureBackboard}
                roughness={0.7}
                metalness={0.1}
              />
            </mesh>
          );
        }
      });
    }

    return frames;
  };

  return <>{renderOuterFrame()}</>;
};

export default OuterFrame;
