import React, { useState, useCallback } from 'react';
import Sound from 'react-sound'
import Hello from '../src/sounds/Hello.m4a'
import districts from './resources/districts'

import VaccineList from './components/VaccineList';
import SearchVaccine from './components/SearchVaccine';
import './App.css';

function App() {
  const [vaccines, setVaccines] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [limitWeeks, setlimitWeeks] = useState(2)
  const [contactNo, setContactNo] = useState('')
  const [isPlaying, setIsPlaying] = useState(false)
  const [stopSearch, setStopSearch] = useState(true)
  const [selectedDistrict, setSelectedDistrict] = useState({
    "district_id": 302,
    "district_name": "Malappuram",
    "key": 302
  })
  
    const apiCallsLimit = 100;
    const waitingPeriod = (5 * 60) / apiCallsLimit * limitWeeks * 1000
  
  function GetFormattedDate(inp) {
    var todayTime = new Date();
    todayTime.setDate(todayTime.getDate() + (inp * 7));
    var month = (todayTime.getMonth() + 1);
    var day = (todayTime.getDate());
    var year = (todayTime.getFullYear());
    return day + "-" + month + "-" + year;
  }

  const sendSMS = async (contact) => {
    var OTPRequestBody = {
      mobile: contact
    }
    const endpoint = 'https://cdn-api.co-vin.in/api/v2/auth/public/generateOTP';
    try{
      await fetch(endpoint, {
        method: 'POST', 
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(OTPRequestBody)
      })
    }catch(error){
    }
  }

  const fetchVaccinesHandler = useCallback(async (checker) => {
    setError(null);
    const identifier = setTimeout(async () => {
      setIsLoading(true);
      try {
        const transformedVaccines = []
        var currentCenter = {}
        for (var currentCount = 0; currentCount < limitWeeks; currentCount++) {
          let considerdynDate = (GetFormattedDate(currentCount))
          const API = `https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id=${selectedDistrict.district_id}+&date=${considerdynDate}`
          const response = await fetch(API);
          if (!response.ok) {
            throw new Error('Something went wrong!');
          }

          const data = await response.json();
          for (var key = 0; key < data.centers.length; key++) {
            for (var diffSession = 0; diffSession < data.centers[key].sessions.length; diffSession++) {
              currentCenter =
              {
                centerID: 'CenterID: ' + data.centers[key].center_id,
                location: 'Location: ' + data.centers[key].address,
                title: 'Age_limit: ' + data.centers[key].sessions[diffSession].min_age_limit + ', Availability: ' + data.centers[key].sessions[diffSession].available_capacity,
                vaccinationDate: 'Date: ' + data.centers[key].sessions[diffSession].date,
                available_capacity: data.centers[key].sessions[diffSession].available_capacity,
                min_age_limit: data.centers[key].sessions[diffSession].min_age_limit
              }
              if (currentCenter.available_capacity > 0) {
                transformedVaccines.push(currentCenter)
              }
            }
          }
          setVaccines(transformedVaccines);
          (transformedVaccines.length > 0) ? setIsPlaying((prevVal)=>true) : setIsPlaying((prevVal)=>false)
          if (transformedVaccines.length > 0) {
            if(!checker && contactNo.length===10){
              sendSMS(contactNo)
            }
          }
        }
      } catch (error) {
        setError(error.message);
      }
      setIsLoading(false);
      fetchVaccinesHandler(true)
      return (() => {
        clearTimeout(identifier)
      })
    }, waitingPeriod)
  }, [limitWeeks, contactNo, selectedDistrict, waitingPeriod]);

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
      fetchVaccinesHandler()
  }

  const limitChangeHandler = ((newLimit) => {
    setlimitWeeks(newLimit)
  })

  const contactNumberChangeHandler = ((newNumber) => {
    if (!isNaN(newNumber)) {
      setContactNo(newNumber)
    }
  })

  let content = <p>No vaccination slot found yet!</p>;

  if (vaccines.length > 0) {
    content = <VaccineList vaccines={vaccines} />;
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
          onNumberChange={contactNumberChangeHandler}
          contactNo={contactNo}
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
