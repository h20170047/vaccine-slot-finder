import React, { useState, useCallback } from 'react';
import Sound from 'react-sound'
import Hello from '../src/sounds/Hello.m4a'
import districts from './resources/districts'

import VaccineList from './components/VaccineList';
import SearchVaccine from './components/SearchVaccine';
import './App.css';

function App() {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [limitDays, setLimitDays] = useState(2)
  const [isPlaying, setIsPlaying] = useState(false)
  const [stopSearch, setStopSearch] = useState(true)
  const [selectedDistrict, setSelectedDistrict] = useState({
    "district_id": 302,
    "district_name": "Malappuram",
    "key": 302
  })

  function GetFormattedDate(inp) {
    var todayTime = new Date();
    todayTime.setDate(todayTime.getDate() + inp);
    var month = (todayTime.getMonth() + 1);
    var day = (todayTime.getDate());
    var year = (todayTime.getFullYear());
    return day + "-" + month + "-" + year;
  }

  const fetchMoviesHandler = useCallback(async () => {
    setError(null);
    const identifier = setTimeout(async () => {
      setIsLoading(true);
      try {
        const transformedMovies = []
        var currentCenter = {}
        for (var currentCount = 0; currentCount < limitDays; currentCount++) {
          let considerdynDate = (GetFormattedDate(currentCount))
          const API = `https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id=${selectedDistrict.district_id}+&date=${considerdynDate}`
          const response = await fetch(API);
          if (!response.ok) {
            throw new Error('Something went wrong!');
          }

          const data = await response.json();

          for (var key = 0; key < data.centers.length; key++) {
            currentCenter =
            {
              id: 'CenterID: ' + data.centers[key].center_id,
              openingText: 'Location: ' + data.centers[key].address,
              title: 'Age_limit: ' + data.centers[key].sessions[0].min_age_limit + ', Availability: ' + data.centers[key].sessions[0].available_capacity,
              releaseDate: 'Date: ' + data.centers[key].sessions[0].date,
              available_capacity: data.centers[key].sessions[0].available_capacity
            }
            if (currentCenter.available_capacity > 0) {
              transformedMovies.push(currentCenter)
            }
          }
          setMovies(transformedMovies);
          (transformedMovies.length > 0) ? setIsPlaying(true) : setIsPlaying(false)
          if (isPlaying) {
            console.log("Sound is started as ", transformedMovies);
          }
        }
      } catch (error) {
        setError(error.message);
      }
      setIsLoading(false);
      fetchMoviesHandler()
      return (() => {
        clearTimeout(identifier)
      })
    }, waitingPeriod)
  }, [stopSearch, limitDays]);

  const districtSelectionHandler = (selectedDistrict) => {
    var selectedDistrictInstance = {}
    selectedDistrictInstance = districts.filter(districtInstance => {
      return districtInstance.district_name === selectedDistrict
    })
    setSelectedDistrict(selectedDistrictInstance[0])
  }

  const swtichSearchCriterionHandler = () => {
    setStopSearch((previousState) => {
      return !previousState
    })
    if (stopSearch)
      fetchMoviesHandler()
  }
  const callMe = useCallback(() => {
    const repeater = setTimeout(() => {
      console.log('In searchLoop');
      if (stopSearch) {
        callMe()
      }
    }, 1000);

    return (() => {
      clearTimeout(repeater)
    })
  }, [stopSearch])

  const apiCallsLimit = 100;
  const waitingPeriod = (5 * 60) / apiCallsLimit * limitDays * 1000

  const limitChangeHandler = ((newLimit) => {
    setLimitDays(newLimit)
  })

  let content = <p>Found no vaccines.</p>;

  if (movies.length > 0) {
    content = <VaccineList movies={movies} />;
  }

  if (error) {
    content = <p>{error}</p>;
  }

  if (isLoading) {
    content = <p>Loading...</p>;
  }

  return (
    <React.Fragment>
      <section>
        <SearchVaccine selectedDistrict={selectedDistrict.district_name}
          districts={districts}
          onDistrictSelected={districtSelectionHandler}
          title={stopSearch}
          onSwitchSearchCriterion={swtichSearchCriterionHandler}
          onLimitChange={limitChangeHandler}
        />
      </section>
        <Sound
          url={Hello}
          playStatus={
            isPlaying ? Sound.status.PLAYING : Sound.status.STOPPED}
          loop={true} />
      <section>{content}</section>
    </React.Fragment>
  );
}

export default App;
