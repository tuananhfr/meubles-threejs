const SelectorButtons: React.FC<SelectorButtonsProps> = ({
  options,
  activeOption,
  onChange,
}) => {
  return (
    <div className="selector-buttons">
      {options.map((option) => (
        <button
          key={option}
          className={`selector-button ${
            activeOption === option ? "active" : ""
          }`}
          onClick={() => onChange(option)}
        >
          {option}
        </button>
      ))}
    </div>
  );
};

export default SelectorButtons;
