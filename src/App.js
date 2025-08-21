import './App.css';
import React, { useEffect, useState } from 'react';
import { getCurrentWeather, getForecast } from './weatherService';

function App() {
  const [city, setCity] = useState('Austin');
  const [searchText, setSearchText] = useState('');
  const [isDay, setIsDay] = useState(true);
  const [todayString, setTodayString] = useState('');
  // New state for the time
  const [currentTime, setCurrentTime] = useState('');
  const [current, setCurrent] = useState(null);
  const [forecastDays, setForecastDays] = useState([]);
  const [hourlyToday, setHourlyToday] = useState([]);
  const [selectedHourIndex, setSelectedHourIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [units, setUnits] = useState("metric");

  useEffect(() => {
    const hour = new Date().getHours();
    setIsDay(hour >= 6 && hour < 18);
    // Initial date string
    setTodayString(new Date().toLocaleDateString(undefined, {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    }));

    // Start a timer to update the clock every minute
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };

    updateTime(); // Call immediately to set the initial time

    const intervalId = setInterval(updateTime, 60000); // Update every 60 seconds

    return () => clearInterval(intervalId); // Cleanup on component unmount
  }, []);

  useEffect(() => {
    const loadWeather = async () => {
      setLoading(true);
      setError(null);
      try {
        const currentData = await getCurrentWeather(city, units);
        setCurrent(currentData);

        const forecastData = await getForecast(city, units);
        processForecast(forecastData);
      } catch (err) {
        console.error(err);
        setError('Could not load weather. Try another city or check your API key.');
        setCurrent(null);
        setForecastDays([]);
        setHourlyToday([]);
      } finally {
        setLoading(false);
      }
    };
    loadWeather();
  }, [city, units]);

  const processForecast = (forecastData) => {
    if (!forecastData || !forecastData.list) return;

    const buckets = {};
    forecastData.list.forEach(item => {
      const dayKey = new Date(item.dt * 1000).toISOString().split('T')[0];
      if (!buckets[dayKey]) buckets[dayKey] = [];
      buckets[dayKey].push(item);
    });

    const todayKey = new Date().toISOString().split('T')[0];

    setHourlyToday(buckets[todayKey] || []);
    setSelectedHourIndex(0);

    const days = Object.keys(buckets).sort().map(dayKey => {
      const items = buckets[dayKey];
      const rep = items.reduce((best, it) => {
        const hr = ts => new Date(ts * 1000).getHours();
        return Math.abs(hr(it.dt) - 12) < Math.abs(hr(best.dt) - 12) ? it : best;
      }, items[0]);
      return {
        date: dayKey,
        temp: Math.round(rep.main.temp),
        main: rep.weather[0].main,
        description: rep.weather[0].description
      };
    });

    setForecastDays(days.filter(d => d.date !== todayKey).slice(0, 3));
  };

  const iconForCondition = (main, description = '') => {
    const m = (main || '').toLowerCase();
    const d = (description || '').toLowerCase();
    if (m.includes('clear')) return 'bunny_sunny.png';
    if (m.includes('cloud')) return d.includes('partly') ? 'partlycloudy_bunny.png' : 'cloudy_bunny.png';
    if (m.includes('drizzle')) return 'drizzle_bunny.png';
    if (m.includes('rain')) return 'rainy_bunny.png';
    if (m.includes('snow')) return 'snowy_bunny.png';
    if (m.includes('thunder') || m.includes('storm')) return 'stormy_bunny.png';
    if (m.includes('mist') || m.includes('fog') || m.includes('haze') || m.includes('smoke') || m.includes('dust')) return 'foggy_bunny.png';
    if (m.includes('wind') || m.includes('squall')) return 'windy_bunny.png';
    return 'bunny_sunny.png';
  };

  const formatTemp = (temp) => {
    if (temp == null) return '—';
    const rounded = Math.round(temp);
    return units === "metric" ? `${rounded}°C` : `${rounded}°F`;
  };

  const submitSearch = () => {
    const value = searchText.trim();
    if (!value) return;
    setCity(value);
    setSearchText('');
  };

  const toggleUnits = () => setUnits(prev => prev === "metric" ? "imperial" : "metric");

  const selectedHour = hourlyToday[selectedHourIndex] || current;

  const backgroundStyle = {
    backgroundImage: `url(/assets/backgrounds/${isDay ? 'day_bg.png' : 'night_bg.png'})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    minHeight: '100vh',
    color: isDay ? '#000' : '#fff',
    padding: '2rem'
  };

  return (
    <div style={backgroundStyle}>
      <div style={{ maxWidth: 980, margin: '0 auto', backdropFilter: 'blur(6px)', backgroundColor: 'rgba(255,255,255,0.35)', borderRadius: 16, padding: 20 }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: 0 }}>Weather Bunny</h1>
            <div style={{ fontSize: 14, opacity: 0.8 }}>
              {/* Display the date and the live time */}
              {todayString} &bull; {currentTime}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') submitSearch(); }}
              placeholder="Search city (press Enter or click Go)"
              style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(0,0,0,0.12)' }}
            />
            <button onClick={submitSearch} style={{ padding: '8px 12px', borderRadius: 8 }}>Go</button>
            <button onClick={toggleUnits} style={{ padding: '8px 12px', borderRadius: 8 }}>
              {units === "metric" ? "°C" : "°F"}
            </button>
          </div>
        </header>

        <main style={{ marginTop: 22, display: 'flex', gap: 20, alignItems: 'flex-start' }}>
          <section style={{ flex: 1 }}>
            {loading && <div>Loading...</div>}
            {error && <div style={{ color: 'crimson' }}>{error}</div>}

            {selectedHour && (
              <>
                <div style={{ fontSize: 18, fontWeight: 600 }}>{current?.name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 8 }}>
                  <img
                    src={`/assets/icons/${iconForCondition(selectedHour.weather[0].main, selectedHour.weather[0].description)}`}
                    alt={selectedHour.weather[0].description}
                    style={{ width: 140, height: 140 }}
                  />
                  <div>
                    <div style={{ fontSize: 36, fontWeight: 300 }}>{formatTemp(selectedHour.main.temp)}</div>
                    <div style={{ opacity: 0.85, marginTop: 6 }}>{selectedHour.weather[0].description}</div>
                    {hourlyToday.length > 0 && (
                      <div style={{ marginTop: 10, fontSize: 14, opacity: 0.7 }}>
                        Time: {new Date(selectedHour.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Show slider only if hourlyToday exists */}
                {hourlyToday.length > 0 && (
                  <input
                    type="range"
                    min="0"
                    max={hourlyToday.length - 1}
                    value={selectedHourIndex}
                    onChange={e => setSelectedHourIndex(Number(e.target.value))}
                    style={{ width: '100%', marginTop: 12 }}
                  />
                )}
              </>
            )}
          </section>

          <aside style={{ width: 320 }}>
            <div style={{ background: 'rgba(255,255,255,0.6)', padding: 12, borderRadius: 12 }}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>3-Day Forecast</div>
              {forecastDays.length === 0 && <div style={{ opacity: 0.7 }}>No forecast available</div>}
              {forecastDays.map(d => (
                <div key={d.date} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                  <div>{new Date(d.date).toLocaleDateString(undefined, { weekday: 'short' })}</div>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <img src={`/assets/icons/${iconForCondition(d.main, d.description)}`} alt={d.description} style={{ width: 36, height: 36 }} />
                    <div style={{ minWidth: 48, textAlign: 'right' }}>{formatTemp(d.temp)}</div>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
}

export default App;