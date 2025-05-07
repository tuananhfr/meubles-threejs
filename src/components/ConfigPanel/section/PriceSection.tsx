const PriceSection: React.FC = () => {
  return (
    <div className="price-section row">
      <div className="col-lg-6">
        <div className="old-price">1.699 €</div>
        <div className="current-price">849 €</div>
      </div>
      <div className="col-lg-6">
        <div className="price-info">incl. 20% TVA hors frais de livraison</div>
        <div className="price-info">Livraison sous 6-7 semaines</div>
        <div className="price-info">Le prix le plus bas en 30 jours: 849 €</div>
      </div>
    </div>
  );
};

export default PriceSection;
