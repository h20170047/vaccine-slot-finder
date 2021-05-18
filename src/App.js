import React, { useState, useEffect } from 'react';
import Sound from 'react-sound'
import Hello from '../src/sounds/Hello.m4a'
import districts from './resources/districts'
import dummyData from './resources/dummyData'

import VaccineList from './components/VaccineList';
import SearchVaccine from './components/SearchVaccine';
import './App.css';

function App() {
  const [vaccines, setVaccines] = useState([]);
  const [error, setError] = useState(null);
  const [limitWeeks, setlimitWeeks] = useState(2)
  const [contactNo, setContactNo] = useState('')
  const [isPlaying, setIsPlaying] = useState(false)
  const [smsSent, setSmsSent] = useState(true)
  const [stopSearch, setStopSearch] = useState(true)
  const [doseCode, setDoseCode] = useState('3')
  const [minAgeCode, setMinAgeCode] = useState('3')
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

  const sendSMS = async () => {
    var OTPRequestBody = {
      mobile: contactNo
    }
    const endpoint = 'https://cdn-api.co-vin.in/api/v2/auth/public/generateOTP';
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(OTPRequestBody)
      })
      if (!response.ok) {
        throw new Error('OTP was already sent!')
      }
    } catch (error) {
      console.log(error);
    }
    setSmsSent(true)
  }

  const sendSmsHandler = () => {
    setStopSearch(false)
    setSmsSent(false)
  }

  useEffect(() => {
    fetchVaccinesHandler()

    var waitingTime = !limitWeeks ? 10 : limitWeeks
    waitingTime = (5 * 60) / apiCallsLimit * waitingTime * 1000

    const interval = setInterval(() => {
      fetchVaccinesHandler()
    }, waitingTime)

    return () => clearInterval(interval)
  }, [selectedDistrict, limitWeeks, smsSent, doseCode, minAgeCode])


  const fetchVaccinesHandler = async () => {
    var transformedVaccines = []
    try {
      for (var currentCount = 0; currentCount < limitWeeks; currentCount++) {
        let considerdynDate = (GetFormattedDate(currentCount))
        const API = `https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id=${selectedDistrict.district_id}+&date=${considerdynDate}`
        const response = await fetch(API);
        if (!response.ok) {
          throw new Error('Retrying in ', waitingPeriod / 1000, ' seconds...');
        }

        const data = await response.json();
        var dose1 = 0
        var dose2 = 0
        for (var key = 0; key < data.centers.length; key++) {
          const centerData = data.centers[key]
          for (var diffSession = 0; diffSession < centerData.sessions.length; diffSession++) {
            var currentCenter = {}
            const sessionData = centerData.sessions[diffSession]
            dose1 = sessionData.available_capacity_dose1
            dose2 = sessionData.available_capacity_dose2
            currentCenter =
            {
              centerID: 'CenterID: ' + centerData.center_id,
              location: 'Location: ' + centerData.address,
              name: centerData.name,
              address: centerData.address,
              fee_type: 'Fee: ' + centerData.fee_type,
              ageLimit: 'Age_limit: ' + sessionData.min_age_limit,
              available_capacity_dose1: (dose1 > 0 ? ('Dose1:' + dose1) : ''),
              available_capacity_dose2: (dose2 > 0 ? ('Dose2:' + dose2) : ''),
              vaccinationDate: 'Date: ' + centerData.sessions[diffSession].date,
              available_capacityText: 'Availability: ' + sessionData.available_capacity,
              available_capacity: sessionData.available_capacity,
              min_age_limit: sessionData.min_age_limit,
              dose1_availability: dose1,
              dose2_availability: dose2
            }
            if (currentCenter.available_capacity > 0) {
              if (doseCode === '3') {
                if (minAgeCode === '3' || minAgeCode === JSON.stringify(currentCenter.min_age_limit)) {
                  transformedVaccines.push(currentCenter)
                }
              } else {
                if (doseAvailabilityChecker(doseCode, currentCenter, '3')) {
                  if (minAgeCode === '3' || minAgeCode === JSON.stringify(currentCenter.min_age_limit)) {
                    transformedVaccines.push(currentCenter)
                  }
                }
              }
            }
          }
        }
        if (vaccines.length !== transformedVaccines.length) {
          setError(null);
          setVaccines(transformedVaccines);
        }
        (transformedVaccines.length > 0) ? setIsPlaying((prevVal) => true) : setIsPlaying((prevVal) => false)
      }
    } catch (error) {
      setError(error.message);
    }
    if (!smsSent && transformedVaccines.length > 0 && contactNo.length === 10) {
      sendSMS()
    }
  }

  const doseAvailabilityChecker = (doseSelected, inpObject, passKey) => {
    if (doseSelected === passKey || (doseSelected === '1' && inpObject.dose1_availability > 0) ||
      (doseSelected === '2' && inpObject.dose2_availability > 0)) {
      return true
    }
    return false
  }

  const districtSelectionHandler = (selectedDistrict) => {
    var selectedDistrictInstance = {}
    selectedDistrictInstance = districts.filter(districtInstance => {
      return districtInstance.district_name === selectedDistrict
    })
    setSelectedDistrict(selectedDistrictInstance[0])
  }

  const limitChangeHandler = ((newLimit) => {
    setlimitWeeks(newLimit)
  })

  const contactNumberChangeHandler = ((newNumber) => {
    if (!isNaN(newNumber)) {
      setContactNo(newNumber)
    }
  })

  const doseChangeHandler = ((newDoseSelection) => {
    setDoseCode(newDoseSelection)
  })

  const ageChangeHandler = ((newAgeSelected) => {
    setMinAgeCode(newAgeSelected)
  })

  let content = <p>No vaccination slot found yet!</p>;

  if (vaccines.length > 0) {
    content = <VaccineList vaccines={vaccines} />;
  } else if (vaccines.length === 0) {
    content = <p>No vaccination slot found yet!</p>;
  }

  if (error) {
    content = <p>{error}</p>;
  }

  return (
    <React.Fragment>
      <section>
        <SearchVaccine selectedDistrict={selectedDistrict.district_name}
          districts={districts}
          onDistrictSelected={districtSelectionHandler}
          title={stopSearch}
          onSwitchSearchCriterion={sendSmsHandler}
          onLimitChange={limitChangeHandler}
          onNumberChange={contactNumberChangeHandler}
          contactNo={contactNo}
          doseCode={doseCode}
          onDoseSelected={doseChangeHandler}
          minAgeCode={minAgeCode}
          onAgeSelected={ageChangeHandler}
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
