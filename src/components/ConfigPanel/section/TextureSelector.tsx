import React from "react";

import { useConfig } from "../../context/ConfigContext";
// List of textures

const TextureSelector: React.FC = ({}) => {
  const { config, updateConfig } = useConfig();

  // Function to update texture
  const handleTextureChange = (textureName: string, textureSrc: string) => {
    updateConfig("texture", {
      name: textureName,
      src: textureSrc,
    });
  };

  return (
    <div>
      <div className="d-flex flex-wrap">
        {config.listTextures.map((texture, index) => (
          <button
            key={index}
            onClick={() => handleTextureChange(texture.name, texture.src)}
            className={`btn p-0 m-1 border ${
              config.texture.src === texture.src
                ? "border-primary border-3"
                : "border-secondary border-1"
            } rounded-2`}
            style={{
              width: 40,
              height: 40,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#fff",
            }}
            title={texture.name}
          >
            <img
              src={texture.src}
              alt={texture.name}
              className="rounded-1"
              style={{ width: 32, height: 32, objectFit: "cover" }}
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default TextureSelector;
