import React, { useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { ThreeEvent, useFrame } from "@react-three/fiber";
import { useConfig } from "../../context/ConfigContext";

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
  hingePosition: [number, number, number];
  isLeftHinged: boolean;
}

interface FacadePanelsProps {
  depth: number;
  thickness: number;
  texture: THREE.Texture; // Texture mặc định từ config
}

const FacadePanels: React.FC<FacadePanelsProps> = ({
  depth,
  thickness,
  texture,
}) => {
  const { config } = useConfig();

  // State để lưu texture cho các facade panel riêng lẻ
  const [panelTextures, setPanelTextures] = useState<
    Record<string, THREE.Texture>
  >({});

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

  // Effect để load texture riêng cho từng facade panel
  useEffect(() => {
    const loadPanelTextures = async () => {
      const newTextures: Record<string, THREE.Texture> = {};
      const textureLoader = new THREE.TextureLoader();

      // Duyệt qua tất cả facadePanels để tìm những panel có texture riêng
      for (const [key, panel] of Object.entries(config.facadePanels || {})) {
        if (panel?.texture?.src) {
          try {
            const loadedTexture = await new Promise<THREE.Texture>(
              (resolve, reject) => {
                textureLoader.load(
                  panel.texture!.src,
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
            console.warn(
              `Failed to load texture for facade panel ${key}:`,
              error
            );
          }
        }
      }

      setPanelTextures(newTextures);
    };

    loadPanelTextures();
  }, [config.facadePanels]);

  // Hàm để lấy texture cho panel cụ thể
  const getPanelTexture = (panelKey: string) => {
    // Sử dụng texture riêng nếu có, ngược lại dùng texture mặc định từ config
    return panelTextures[panelKey] || texture;
  };

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

  // Xử lý sự kiện hover và click cho ngăn kéo
  const handleDrawerPointerOver = (
    e: ThreeEvent<PointerEvent>,
    drawerKey: string
  ) => {
    e.stopPropagation();
    document.body.style.cursor = "pointer";

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

    if (!openedDrawers[drawerKey]) {
      animateDrawer(drawerKey, false);
    }
  };

  const handleDrawerClick = (e: ThreeEvent<MouseEvent>, drawerKey: string) => {
    e.stopPropagation();

    setOpenedDrawers((prev) => ({
      ...prev,
      [drawerKey]: !prev[drawerKey],
    }));

    animateDrawer(drawerKey, !openedDrawers[drawerKey]);
  };

  const handleDoorPointerOver = (
    e: ThreeEvent<PointerEvent>,
    doorKey: string
  ) => {
    e.stopPropagation();
    document.body.style.cursor = "pointer";

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

    if (!openedDoors[doorKey]) {
      const isLeftHinged = doorKey.includes("Left");
      animateDoor(doorKey, false, isLeftHinged);
    }
  };

  const handleDoorClick = (e: ThreeEvent<MouseEvent>, doorKey: string) => {
    e.stopPropagation();

    setOpenedDoors((prev) => ({
      ...prev,
      [doorKey]: !prev[doorKey],
    }));

    const isLeftHinged = doorKey.includes("Left");
    animateDoor(doorKey, !openedDoors[doorKey], isLeftHinged);
  };

  // Hàm animation mở/đóng ngăn kéo
  const animateDrawer = (drawerKey: string, opening: boolean) => {
    const drawerGroup = drawerGroupRefs.current[drawerKey];
    if (!drawerGroup) return;

    const currentPosition = drawerGroup.position.z;
    const targetPosition = opening
      ? depth / 2 + thickness / 2 + depth * 0.4
      : depth / 2 + thickness / 2;

    if (Math.abs(currentPosition - targetPosition) < 0.001) return;

    const animationId = `${drawerKey}-${Date.now()}`;
    animationRef.current[animationId] = {
      drawerKey,
      startPosition: currentPosition,
      targetPosition,
      startTime: Date.now(),
      duration: 300,
    };
  };

  const animateDoor = (
    doorKey: string,
    opening: boolean,
    isLeftHinged: boolean
  ) => {
    const doorGroup = doorGroupRefs.current[doorKey];
    if (!doorGroup) return;

    const currentRotation = doorGroup.rotation.y;

    let targetRotation = 0;
    if (opening) {
      targetRotation = isLeftHinged ? Math.PI / 3 : -Math.PI / 3;
    }

    if (Math.abs(currentRotation - targetRotation) < 0.001) return;

    const animationId = `${doorKey}-${Date.now()}`;
    doorAnimationRef.current[animationId] = {
      doorKey,
      startRotation: currentRotation,
      targetRotation,
      startTime: Date.now(),
      duration: 300,
      hingePosition: [0, 0, 0],
      isLeftHinged,
    };
  };

  const renderFacadePanels = () => {
    const panels: React.ReactNode[] = [];

    // Check nếu có facade panels
    if (!config.facadePanels || Object.keys(config.facadePanels).length === 0) {
      return panels;
    }

    // Vẽ mặt trước (facade panels)
    Object.values(config.facadePanels).forEach((panel) => {
      const isPanelTiroir = panel.key.includes("tiroir");
      const isPanelPorte = panel.key.includes("porte");

      // Lấy texture cho panel này
      const panelTexture = getPanelTexture(panel.key);

      if (isPanelTiroir) {
        // Cấu hình cho ngăn kéo
        const drawerDepth = depth * 0.8;
        const frontThickness = thickness / 3;

        panels.push(
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
                map={panelTexture}
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
                args={[thickness, panel.dimensions[1] - thickness, drawerDepth]}
              />
              <meshStandardMaterial
                map={panelTexture}
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
                args={[thickness, panel.dimensions[1] - thickness, drawerDepth]}
              />
              <meshStandardMaterial
                map={panelTexture}
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
                map={panelTexture}
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
                map={panelTexture}
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
          hingeX += panel.dimensions[0] / 2;
        } else {
          hingeX -= panel.dimensions[0] / 2;
        }

        panels.push(
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
                  map={panelTexture}
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
        panels.push(
          <mesh key={panel.key} position={panel.position}>
            <boxGeometry args={panel.dimensions} />
            <meshStandardMaterial
              map={getPanelTexture(panel.key)}
              roughness={0.7}
              metalness={0.1}
            />
          </mesh>
        );
      }
    });

    return panels;
  };

  return <>{renderFacadePanels()}</>;
};

export default FacadePanels;
