import axios from "axios";
const API_KEY= "6a3fcab39d530038e71e80f36ebe40df";
const BASE_URL= "https://api.openweathermap.org/data/2.5";


export const getCurrentWeather = async (city, units = "metric") => {
  const response = await axios.get(`${BASE_URL}/weather`, {
    params: { q: city, appid: API_KEY, units },
  });
  return response.data;
};

export const getForecast = async (city, units = "metric") => {
  const response = await axios.get(`${BASE_URL}/forecast`, {
    params: { q: city, appid: API_KEY, units },
  });
  return response.data;
};