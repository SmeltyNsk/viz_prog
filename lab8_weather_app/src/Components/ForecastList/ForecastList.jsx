import ForecastCard from '../ForecastCard/ForecastCard';
import { groupForecastByDay } from '../../../Utils/Formatters.js';
import './ForecastList.css';

function ForecastList({ forecastList }) {
  const days = groupForecastByDay(forecastList);

  return (
    <section className="card forecast-list">
      <h3 className="forecast-list__title">Прогноз на 5 дней</h3>

      <div className="forecast-list__items">
        {days.map((day) => (
          <ForecastCard key={day.dt} day={day} />
        ))}
      </div>
    </section>
  );
}

export default ForecastList;