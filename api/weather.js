import axios from "axios";
import { apiKey } from "../constants";

const forecastEndPoint = (params) =>
`https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${params.cityName}&days=${params.days}`;

const locationsEndPoint = (params) =>
`https://api.weatherapi.com/v1/search.json?key=${apiKey}&q=${params.cityName}`;


const apiCall = async (endpoint) => {
  const options = {
    method: "GET",
    url: endpoint,
  };
  try {
    const response = await axios.request(options);
    return response.data;
  } catch (err) {
    console.log("error", err);
    return null;
  }
};
export const fetchWeatherForecast = (params) => {
  let forecastUrl = forecastEndPoint(params);
  return apiCall(forecastUrl);
};

export const fetchLocations = (params) => {
  let locationsUrl = locationsEndPoint(params);
  return apiCall(locationsUrl);
};
