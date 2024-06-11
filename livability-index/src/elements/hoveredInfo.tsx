import { LivabilityIndex } from "../model/livabilityIndex";

const Hovered = ({ hoveredGeography, location } : { hoveredGeography : LivabilityIndex|null , location : any}) => {
  if (!hoveredGeography) return <></>;
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
      <strong>{hoveredGeography.province}</strong> <br />
      <span>Year : {hoveredGeography.year}</span><br />
      <span>Health index : {hoveredGeography.health_index}</span><br />
      <span>Polution : {hoveredGeography.polution}</span><br />
      <span>Crime : {hoveredGeography.crime_rate}</span><br />
      <span>Purchasing : {hoveredGeography.purchasing_power}</span><br />
      <span>Living Cost: {Math.round(hoveredGeography.living_cost * 100) / 100}</span><br />
      <span>Livability index : {hoveredGeography.livability_index}</span>
    </div>
  );
};

export default Hovered;
