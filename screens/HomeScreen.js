import {
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "../theme";
import { MagnifyingGlassIcon, XMarkIcon } from "react-native-heroicons/outline";
import { CalendarDaysIcon, MapPinIcon } from "react-native-heroicons/solid";
import { debounce } from "lodash";
import { fetchLocations, fetchWeatherForecast } from "../api/weather";
import { weatherImages } from "../constants";
import * as Progress from "react-native-progress";
import { getData } from "../utils/asyncStorage";

export default HomeScreen = () => {
  const [showSearch, toggleSearch] = useState(false);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [weather, setWeather] = useState({});
 

  const handleSearch = search => {
    // fetch locations
    if (search && search.length > 2) {
      fetchLocations({ cityName: search }).then(data => {
        // console.log("got location", data);
        setLocations(data);
      });
    }
  };

  const handleLocation = loc => {
    // console.log("Location", loc);
    setLoading(true);
    toggleSearch(false);
    setLocations([]);
    fetchWeatherForecast({
      cityName: loc.name,
      days:7
    }).then((data) => {
      setLoading(false);
      setWeather(data);
      storeData('city',loc.name);
    });
  };




  useEffect(()=>{
    fetchMyWeatherData();
  },[]);

  const fetchMyWeatherData = async ()=>{
    let myCity = await getData('city');
    let cityName = 'Mumbai';
    if(cityName) cityName = myCity;
    fetchWeatherForecast({
      cityName,
      days:7,
    }).then(data=>{
      setWeather(data);
      setLoading(false)
    })
    
  }

  const handleTextDebounce = useCallback(debounce(handleSearch, 1200), []);
  
  const {current, location} = weather;

  return (
    <View className="flex-1 relative">
      <StatusBar style="light" />
      <Image
        blurRadius={50}
        source={require("../assets/images/appbg.webp")}
        className="absolute h-full w-full"
      />

      {
        loading?(
             <View className="flex-1 flex-row justify-center items-center">
                {/* <Text className="text-white text-4xl">Loading Weather...</Text> */}
                <Progress.CircleSnail thickness={10} size={100} color="#0bb3b2"  />
             </View>
        ):(
          <SafeAreaView className="flex flex-1 m-2">
          {/* search section */}
          <View style={{ height: "7%" }} className="mx-2 relative z-50">
            <View
              className="flex-row justify-start item-center rounded-full"
              style={{
                backgroundColor: showSearch ? theme.searchInputColor(0.4) : "transparent",
              }}
            >
              {showSearch ? (
                <TextInput
                  onChangeText={handleTextDebounce}
                  placeholder="Search City"
                  placeholderTextColor={"#f4f5f8"}
                  className="pl-6 pt-4 h-11 pb-1 flex-1 text-base text-green-300"
                />
              ) : null}
  
              <TouchableOpacity
                onPress={() => toggleSearch(!showSearch)}
                style={{ backgroundColor: theme.bgWhite(0.3) }}
                className="rounded-full p-3 m-1"
              >

                {showSearch?(
                  <XMarkIcon size="25" color="#8e4e4e" />
                ):(
                  <MagnifyingGlassIcon size="25" color="#2ef3e3" />
                )}
              </TouchableOpacity>
            </View>
            {locations.length > 0 && showSearch?(
              <View className="absolute w-full bg-green-100 top-16 rounded-3xl ">
                {locations.map((loc, index) => {
                  let showBorder = index+1 != locations.length;
                  let borderClass = showBorder
                    ? "border-b-2 border-b-gray-400"
                    : "";
                  return (
                    <TouchableOpacity
                    key={index}
                      onPress={() => handleLocation(loc)}
                      className={
                        "flex-row item-center border-0 p-3 px-4 mb-1 "+borderClass
                      }
                    >
                      <MapPinIcon size="20" color="gray" />
                      <Text className="text-black text-lg ml-2">
                        {loc?.name}, {loc?.country}
                      </Text>
                    </TouchableOpacity>
                  );
                })} 
              </View>
            ) : null}
          </View>
          {/* forcast sections */}
          <View className="mx-1 flex justify-around flex-1 mb-10">
            <Text className="text-green-300 text-center text-2xl font-bold">
              {location?.name} ,
              <Text className="text-lg text-center text-yellow-200">
                {"  "+location?.country}
              </Text>
            </Text>
  
            {/* weather image */}
            <View className="flex-row justify-center">
              <Image
               source={{uri:"https:"+current?.condition.icon}}
                // source={require("../assets/images/partlycloudy.png")}
                // source={weatherImages[current?.condition?.text || "other"]}
                className="w-64 h-64"
              />
            </View>
            {/* degree-celcius */}
            <View className="space-y-2">
              <Text className="text-center font-bold text-pink-600 text-6xl ml-5">
                {current?.temp_c}&#176;
              </Text>
              <Text className="text-center text-emerald-400 text-2xl tracking-widest ">
                {current?.condition?.text}
              </Text>
            </View>
            {/* other stats */}
            <View className="flex-row justify-between mx-2 bg-indigo-900 p-4 rounded">
              <View className="flex-row space-x-2 items-center">
                <Image
                  source={require("../assets/icons/wind.png")}
                  className="w-6 h-6"
                />
                <Text className=" text-yellow-200 font-semibold text-base">{current?.wind_kph}km          </Text>
              </View>
              <View className="flex-row space-x-2 items-center">
                <Image
                  source={require("../assets/icons/drop.png")}
                  className="w-6 h-6"
                />
                <Text className=" text-cyan-400 font-semibold text-base">{current?.humidity}%</Text>
              </View>
              <View className="flex-row space-x-2 items-center">
                <Image
                  source={require("../assets/icons/sun.png")}
                  className="w-6 h-6"
                />
                <Text className=" text-fuchsia-500 font-semibold text-base">
                   {weather?.forecast?.forecastday[0]?.astro?.sunrise}
                </Text>
              </View>
            </View>
            <View className="flex-row justify-between mx-2 bg-indigo-900 p-4 rounded">
              <View className="flex-row space-x-3 items-center">
                <Image
                  source={require("../assets/icons/pressure.png")}
                  className="w-6 h-6"
                />
                <Text className=" text-pink-500 font-semibold text-base">{current?.pressure_in}</Text>
              </View>
              <View className="flex-row space-x-2 items-center">
                <Image
                  source={require("../assets/icons/mist.png")}
                  className="w-6 h-6"
                />
                <Text className=" text-orange-500 font-semibold text-base">{current?.wind_degree}°</Text>
              </View>
              <View className="flex-row space-x-2 items-center">
                <Image
                  source={require("../assets/icons/wind-d.png")}
                  className="w-6 h-6"
                />
                <Text className=" text-emerald-400 font-semibold text-base">
                   {current?.wind_dir}
                </Text>
              </View>
            </View>
          </View>
  
          {/* forcast for next days */}
          <View className="mb-2 space-y-5">
            <View className="flex-row items-center mx-2 space-x-2">
              <CalendarDaysIcon size="22" color="white" />
              <Text className=" text-lime-200 text-base">Daily Forcast</Text>
            </View>
            <ScrollView
              horizontal
              contentContainerStyle={{ paddingHorizontal: 10 }}
              showsHorizontalScrollIndicator={true}
            >
  
              {
                weather?.forecast?.forecastday?.map((item, index)=>{
                  const date = new Date(item.date);
                  const options = { weekday: 'long' };
                  let dayName = date.toLocaleDateString('en-US', options);
                  dayName = dayName.split(',')[0];
                  return(
                    <View
                    key={index}
                    className="flex justify-center items-center w-24 rounded-3xl py-3 space-y-1 mr-4"
                    style={{ backgroundColor: theme.bgColor1(0.45) }}
                  >
                    <Image
                    source={{uri:"https:"+current?.condition.icon} || weatherImages[item?.day?.condition?.text || "other"]}
                      // source={require("../assets/images/heavyrain.png")}
                      className="w-12 h-12"
                    />
                    <Text className=" text-green-400 text-base"> {dayName} </Text>
                    <Text className=" text-stone-50 text-xl font-semibold">
                      {" "}
                      {item?.day?.avgtemp_c}&#176;
                    </Text>
                  </View>
                  )
                })
              }
          
            </ScrollView>
          </View>
        </SafeAreaView>
        )
      }

     
    </View>
  );
};

const styles = StyleSheet.create({});
