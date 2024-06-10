const Hovered = ({ hoveredGeography, location } : any) => {
  if (!hoveredGeography) return null;
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
      <strong>{hoveredGeography}</strong>
      <strong>{hoveredGeography.province}</strong> <br />
      <strong>Strong : {hoveredGeography.year}</strong><br />
      <strong>Health : {hoveredGeography.health_index}</strong><br />
      <strong>Polution : {hoveredGeography.polution}</strong><br />
      <strong>Crime : {hoveredGeography.crime_rate}</strong><br />
      <strong>Purchasing : {hoveredGeography.purchasing_power}</strong><br />
      <strong>Living Cost: {Math.round(hoveredGeography.living_cost * 100) / 100}</strong><br />
      <strong>Livability index : {hoveredGeography.livability_index}</strong>
    </div>
  );
};

export default Hovered;
