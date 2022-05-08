import React, { useState } from 'react';

import classes from './SearchVaccine.module.css';


function SearchVaccine(props) {
  const [disableSearch, setDisableSearch] = useState(false)

  function submitHandler(event) {
    event.preventDefault();
    setDisableSearch(true)
    props.onSwitchSearchCriterion();
  }

  const districtSelectionHandler = (event) => {
    props.onDistrictSelected(event.target.value)
  }

  const doseSelectionHandler = (event) => {
    props.onDoseSelected(event.target.value)
  }

  const ageSelectionHandler = (event) => {
    props.onAgeSelected(event.target.value)
  }

  const limitChangeHandler = (event) => {
    props.onLimitChange(event.target.value)
  }

  const onNumberChange = (event) => {
    props.onNumberChange(event.target.value)
  }

  return (
    <form onSubmit={submitHandler}>
      
      <div className={classes.control}>
        <div className={classes.control}>
        
          <div className={classes.flex}>
            <label>Number of weeks to be checked for, in advance from today{'  '}</label>
            <input type='number'  size='1' min="1" max="5" defaultValue="2" onChange={limitChangeHandler}></input>
          </div>
        </div>
          <div className={classes.flex}>
          <label >District{'  '}
        <select id="districtList" onChange={districtSelectionHandler} value={props.selectedDistrict} >
          {props.districts.map(district =>
            <option value={district.district_name} key={district.key}> {district.district_name} </option>)}
        </select></label>
          <label>Dose{'  '}
          <select  id="doseList" onChange={doseSelectionHandler} value={props.doseCode} >
              <option value="1" key="1"> Dose 1 </option>
              <option value="2" key="2"> Dose 2 </option>
              <option value="3" key="3"> Both </option>
          </select></label>
          <label>Age{'  '}
          <select  id="ageList" onChange={ageSelectionHandler} value={props.minAgeCode} >
              <option value="12" key="12"> 12+ </option>
              <option value="15" key="15"> 15+ </option>
              <option value="18" key="18" > 18+</option>
              <option value="99" key="99"> All </option>
          </select>
          </label>
        </div>
        <div className={classes.flex}>
          <label>Contact number(without +91) for SMS alert (optional)</label>
          <input disabled={disableSearch} value={props.contactNo} type='text' onChange={onNumberChange} size="10" maxlength="10"></input>
        </div>
      </div>
      <button disabled={disableSearch}>{(props.title && "Notify me!") ||
        (!props.title && "Alert set")}</button>
    </form>
  );
}

export default SearchVaccine;
