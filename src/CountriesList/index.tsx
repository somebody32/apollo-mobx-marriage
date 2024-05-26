import { observer } from "mobx-react-lite";
import { useDeferredValue, useEffect, useState } from "react";
import store from "../CountriesList/store";

function CountriesList() {
  const [filter, setFilter] = useState("");
  const deferredFilter = useDeferredValue(filter);

  useEffect(() => {
    return () => store.reset();
  }, []);

  useEffect(() => {
    store.fetchCountries({ nameStarts: deferredFilter });
  }, [deferredFilter]);

  const { loading, error, countries, totalPages, page } = store;

  const onFilter = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(event.target.value);
  };

  return (
    <div>
      <h1>Countries</h1>
      {loading && <div>Loading...</div>}
      {error && <div>Error: {error}</div>}
      <div>
        Page {page} of {totalPages}
        <button onClick={() => store.getNextPage()}>Next</button>
      </div>
      <input
        type="text"
        value={filter}
        placeholder="Filter countries..."
        onChange={onFilter}
      />
      <ul>
        {countries.map((country) => (
          <li key={country.code}>
            {country.emoji} {country.name} ({country.code})
          </li>
        ))}
      </ul>
    </div>
  );
}

export default observer(CountriesList);
