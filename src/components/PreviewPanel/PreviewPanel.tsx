import ThreeDPreview from "./ThreeDPreview";
import ShelfModel1 from "./Shelf/ShelfModel1";
import "../../css/components/PreviewPanel.css";

const PreviewPanel: React.FC = () => {
  return (
    <div className="text-center preview-container">
      <div className="three-d-container">
        <ThreeDPreview />
      </div>
    </div>
  );
};

export default PreviewPanel;
