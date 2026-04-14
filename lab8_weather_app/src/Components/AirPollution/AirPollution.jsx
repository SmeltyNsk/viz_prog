import { getAirQualityLabel } from '../../../Utils/Formatters.js';
import './AirPollution.css';

function AirPollution({ airData }) {
  const item = airData?.list?.[0];

  if (!item) {
    return null;
  }

  const { aqi } = item.main;
  const { co, no2, pm2_5, pm10 } = item.components;

  return (
    <section className="card air-pollution">
      <h3 className="air-pollution__title">Качество воздуха</h3>

      <div className="air-pollution__summary">
        <span className="air-pollution__aqi-value">AQI: {aqi}</span>
        <span className="air-pollution__aqi-label">{getAirQualityLabel(aqi)}</span>
      </div>

      <div className="air-pollution__grid">
        <div className="air-pollution__item">
          <span>CO</span>
          <strong>{co}</strong>
        </div>
        <div className="air-pollution__item">
          <span>NO₂</span>
          <strong>{no2}</strong>
        </div>
        <div className="air-pollution__item">
          <span>PM2.5</span>
          <strong>{pm2_5}</strong>
        </div>
        <div className="air-pollution__item">
          <span>PM10</span>
          <strong>{pm10}</strong>
        </div>
      </div>
    </section>
  );
}

export default AirPollution;