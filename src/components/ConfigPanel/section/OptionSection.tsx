const OptionSection: React.FC<OptionSectionProps> = ({
  title,
  children,
  actionText,
  onActionClick,
}) => {
  return (
    <div className="py-3">
      <div className="d-flex justify-content-between">
        <p className="fw-normal text-darke mb-0">{title}</p>
        {actionText && (
          <a
            className="btn btn-link text-primary text-decoration-none small p-0"
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
