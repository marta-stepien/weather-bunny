import axios from "axios";
const API_KEY= "6a3fcab39d530038e71e80f36ebe40df";
const BASE_URL= "https://api.openweathermap.org/data/2.5";


// Get current weather
export const getCurrentWeather = async (city, units = "metric") => {
  try {
    const response = await axios.get(`${BASE_URL}/weather`, {
      params: {
        q: city,
        appid: API_KEY,
        units,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching current weather:", error);
    throw error;
  }
};

// Get forecast (5-day / 3-hour interval)
export const getForecast = async (city, units = "metric") => {
  try {
    const response = await axios.get(`${BASE_URL}/forecast`, {
      params: {
        q: city,
        appid: API_KEY,
        units,
        cnt: 40, // max 5 days / 3-hour entries
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching forecast:", error);
    throw error;
  }
};