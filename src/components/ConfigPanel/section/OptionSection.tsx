const OptionSection: React.FC<OptionSectionProps> = ({
  title,
  children,
  actionText,
  onActionClick,
}) => {
  return (
    <div className="option-section">
      <div className="d-flex justify-content-between">
        <p className="option-title mb-0">{title}</p>
        {actionText && (
          <a
            className="action-link"
            onClick={onActionClick}
            style={{ cursor: "pointer" }}
          >
            {actionText}
          </a>
        )}
      </div>
      {children}
    </div>
  );
};

export default OptionSection;
