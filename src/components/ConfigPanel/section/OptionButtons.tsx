const OptionButtons: React.FC<OptionButtonsProps> = ({
  options,
  activeOption,
  onChange,
  showInfo = false,
}) => {
  return (
    <div className="d-flex">
      {options.map((option) => (
        <button
          key={option}
          className={`option-button ${activeOption === option ? "active" : ""}`}
          onClick={() => onChange(option)}
        >
          {option}
        </button>
      ))}
      {showInfo && (
        <span className="info-icon ms-2">
          <i className="bi bi-info-circle"></i>
        </span>
      )}
    </div>
  );
};

export default OptionButtons;
