const Hovered = ({ hoveredGeography, location } : any) => {
  if (!hoveredGeography) return null;
  const windowWidth = window.innerWidth;
  const tooltipPosition = location.x > windowWidth / 2 ? 'left' : 'right';
  const tooltipLeft = tooltipPosition === 'left' ? `${location.x - 100}px` : `${location.x + 10}px`;
  return (
    <div style={{
      position: 'absolute',
      top: `${location.y + 10}px`, 
      left: tooltipLeft,
      padding: '10px',
      backgroundColor: '#fff',
      border: '1px solid #ccc',
      borderRadius: '5px',
      boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)'
    }}>
      <strong>{hoveredGeography}</strong>
    </div>
  );
};

export default Hovered;
