const DimensionControl: React.FC<DimensionControlProps> = ({
  label,
  value,
  min,
  max,
  step,
  onChange,
}) => {
  return (
    <div className="dimension-control">
      <label>{label}</label> : <label htmlFor="">{value} cm</label>
      <div className="d-flex align-items-center">
        <span className="">{min} cm</span>
        <input
          type="range"
          className="form-range dimension-slider"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
        />
        <span className="ms-3">{max} cm</span>
      </div>
    </div>
  );
};

export default DimensionControl;
