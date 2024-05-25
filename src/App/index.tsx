import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import store from "./store";

function App() {
  useEffect(() => {
    store.fetchCountries();
  }, []);

  const { loading, error, countries } = store;

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Countries</h1>
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

export default observer(App);
