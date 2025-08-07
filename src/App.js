import './App.css';
import { useEffect, useState } from 'react';

function App() {
  const [isDay, setIsDay] = useState(true);
  const [currentDate, setCurrentDate] = useState('');
  const [temperatureC, setTemperatureC] = useState(22); // Placeholder temp
  const [city, setCity] = useState("Austin"); // Placeholder city
  const [icon, setIcon] = useState("sun"); // Placeholder weather condition

  useEffect(() => {
    const hour = new Date().getHours();
    setIsDay(hour >= 6 && hour < 18);
    setCurrentDate(new Date().toLocaleDateString(undefined, {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    }));
  }, []);

  const backgroundStyle = {
    backgroundImage: `url(/assets/backgrounds/${isDay ? 'day_bg.png' : 'night_bg.png'})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    minHeight: '100vh',
    color: isDay ? '#000' : '#fff',
    textAlign: 'center',
    paddingTop: '2rem',
  };

  const tempF = (temperatureC * 9/5 + 32).toFixed(1);

  return (
    <div style={backgroundStyle}>
      <h1>Weather Bunny</h1>
      <h2>{city}</h2>
      <p>{currentDate}</p>
      <img
        src={`/assets/icons/${icon}.png`}
        alt="weather icon"
        style={{ width: '150px', height: '150px' }}
      />
      <p>{temperatureC}°C / {tempF}°F</p>
    </div>
  );
}

export default App;
