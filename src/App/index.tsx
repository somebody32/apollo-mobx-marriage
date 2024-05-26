import { useState } from "react";
import CountriesList from "../CountriesList";

function App() {
  const [showCountriesList, setShowCountriesList] = useState(true);

  return (
    <div>
      <h1>App</h1>
      <button onClick={() => setShowCountriesList(!showCountriesList)}>
        Toggle Countries List
      </button>
      {showCountriesList && <CountriesList />}
    </div>
  );
}

export default App;
