import { useLoader, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { TextureLoader, Mesh } from "three";

// Interface for TexturedFurniture props
interface TexturedFurnitureProps {
  textureUrl: string;
}

const TexturedFurniture: React.FC<TexturedFurnitureProps> = ({
  textureUrl,
}) => {
  // Add proper type to the ref
  const mesh = useRef<Mesh>(null);

  // Load the image as a texture
  const texture = useLoader(TextureLoader, textureUrl);

  // Simple animation
  useFrame(() => {
    if (mesh.current) {
      mesh.current.rotation.y += 0.005;
    }
  });

  return (
    <mesh ref={mesh}>
      {/* This is a simple cube, but you can use your furniture model here */}
      <boxGeometry args={[1, 0.5, 1]} />
      <meshStandardMaterial map={texture} roughness={0.7} metalness={0.2} />
    </mesh>
  );
};

export default TexturedFurniture;
