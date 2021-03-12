const express = require("express");
const { dealers } = require("../dealers");
const axios = require("axios");
const router = express.Router();

const apiKey = process.env.OPEN_WEATHER_MAP_API_KEY;
let cachedData;
let cacheTime;
const fetchWeather = (dealer) => {
  let url = `https://api.openweathermap.org/data/2.5/onecall?units=imperial&lat=${dealer.lat}&lon=${dealer.lon}&exclude=hourly,minutely&appid=${apiKey}`;
  return axios.get(url);
};

const fetchWeatherAll = async (dealers) => {
  // console.log('fetching new forecasts')

  let promises = [];

  dealers.forEach((dealer) => {
    promises.push(fetchWeather(dealer));
  });

  try {
    const data = await Promise.all(promises);

    const forecasts = data.map((item, idx) => {
      item.data.dealer = dealers[idx].name;
      item.data.shipDays = dealers[idx].shipDays;
      item.data.country = dealers[idx].country;
      item.data.city = dealers[idx].city;
      item.data.state = dealers[idx].state;
      return item.data;
    });
    cachedData = forecasts; // store the newly fetched forecasts in cache
    cacheTime = Date.now(); // reset cache timer (< 6 hours)
    return forecasts;
  } catch (err) {
    console.log(err);
  }
};

router.get("/", async (req, res) => {
  const timeElapsed = Date.now();
  const today = new Date(timeElapsed);

  // if forecast data is less than 6 hours old, use cached data
  if (cacheTime && cacheTime > Date.now() - 6 * 60 * 60 * 1000) {
    console.log("Responded with cached at " + today.toUTCString());
    res.json(cachedData);
    return;
  }
  // otherwise fetch new forecasts
  console.log("Fetched new forecats at " + today.toUTCString());
  const forecasts = await fetchWeatherAll(dealers);
  res.json(forecasts);
});

module.exports = router;
