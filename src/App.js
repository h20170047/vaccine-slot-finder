import React, { useState, useCallback, useEffect } from 'react';
import Sound from 'react-sound'
import Hello from '../src/sounds/Hello.m4a'
import districts from './resources/districts'
import dummyData from './resources/dummyData'

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
    try {
      await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(OTPRequestBody)
      })
    } catch (error) {
    }
  }

  const fetchVaccinesHandler = useCallback(async (checker) => {
    setError(null);
    const identifier = setTimeout(async () => {
      setIsLoading(true);
      try {
        for (var currentCount = 0; currentCount < limitWeeks; currentCount++) {
          let considerdynDate = (GetFormattedDate(currentCount))
          const API = `https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id=${selectedDistrict.district_id}+&date=${considerdynDate}`
          const response = await fetch(API);
          if (!response.ok) {
            throw new Error('Something went wrong!');
          }

          const transformedVaccines = []
          var currentCenter = {}
          const data = await response.json();
          var dose1 = 0
          var dose2 = 0
          for (var key = 0; key < data.centers.length; key++) {
            const centerData = data.centers[key]
            for (var diffSession = 0; diffSession < data.centers[key].sessions.length; diffSession++) {
              const sessionData = centerData.sessions[diffSession]
              dose1 = sessionData.available_capacity_dose1
              dose2 = sessionData.available_capacity_dose2
              currentCenter =
              {
                centerID: 'CenterID: ' + centerData.center_id,
                location: 'Location: ' + centerData.address,
                name: centerData.name,
                address: centerData.address,
                fee_type: 'Fee: '+centerData.fee_type,
                ageLimit: 'Age_limit: ' + sessionData.min_age_limit,
                available_capacity_dose1: (dose1 > 0 ? ('Dose1:' + dose1) : ''),
                available_capacity_dose2: (dose2 > 0 ? ('Dose2:' + dose2) : ''),
                vaccinationDate: 'Date: ' + centerData.sessions[diffSession].date,
                available_capacityText: 'Availability: ' + sessionData.available_capacity,
                available_capacity: sessionData.available_capacity,
                min_age_limit: sessionData.min_age_limit
              }
              if (currentCenter.available_capacity > 0) {
                transformedVaccines.push(currentCenter)
              }
            }
          }
          setVaccines(transformedVaccines);
          (transformedVaccines.length > 0) ? setIsPlaying((prevVal) => true) : setIsPlaying((prevVal) => false)
          if (transformedVaccines.length > 0) {
            if (!checker && contactNo.length === 10) {
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
