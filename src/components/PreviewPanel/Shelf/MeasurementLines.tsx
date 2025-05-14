// components/MeasurementLines.tsx
import React from "react";
import LineWithLabel from "../LineWithLabel";

interface MeasurementLinesProps {
  totalWidth: number;
  height: number;
  depth: number;
  shelfBottomY: number;
  configHeight: number;
  configDepth: number;
}

const MeasurementLines: React.FC<MeasurementLinesProps> = ({
  totalWidth,
  height,
  depth,
  shelfBottomY,
  configHeight,
  configDepth,
}) => {
  return (
    <group>
      <LineWithLabel
        start={[-totalWidth / 2, shelfBottomY + height + 0.1, 0]}
        end={[totalWidth / 2, shelfBottomY + height + 0.1, 0]}
        label={`${Math.round(totalWidth * 100)} cm`}
        color="#FF0000"
      />
      <LineWithLabel
        start={[totalWidth / 2 + 0.1, shelfBottomY, 0]}
        end={[totalWidth / 2 + 0.1, shelfBottomY + height, 0]}
        label={`${configHeight} cm`}
        color="#0000FF"
      />
      <LineWithLabel
        start={[totalWidth / 2, shelfBottomY + height, -depth / 2]}
        end={[totalWidth / 2, shelfBottomY + height, depth / 2]}
        label={`${configDepth} cm`}
        color="#00AA00"
      />
    </group>
  );
};

export default MeasurementLines;
