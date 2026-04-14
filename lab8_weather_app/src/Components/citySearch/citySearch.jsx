import { useState } from 'react';
import './citySearch.css';

function CitySearch({ onSearch, initialValue = '' }) {
  const [value, setValue] = useState(initialValue);

  function handleSubmit(event) {
    event.preventDefault();

    const trimmedValue = value.trim();

    if (!trimmedValue) {
      return;
    }

    onSearch(trimmedValue);
  }

  return (
    <form className="city-search" onSubmit={handleSubmit}>
      <input
        className="city-search__input"
        type="text"
        placeholder="Введите город"
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
      <button className="city-search__button" type="submit">
        Найти
      </button>
    </form>
  );
}

export default CitySearch;