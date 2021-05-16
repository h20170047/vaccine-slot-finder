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

  const limitChangeHandler = (event) => {
    props.onLimitChange(event.target.value)
  }

  const onNumberChange=(event)=>{
    props.onNumberChange(event.target.value)
  }

  const refreshPageHandler = () => {
    window.location.reload();
  }

  return (
    <form onSubmit={submitHandler}>
      <div className={classes.control}>
        <label htmlFor='title'>District:</label>
        <select disabled={disableSearch} id="myList" onChange={districtSelectionHandler} value={props.selectedDistrict} >
          {props.districts.map(district =>
            <option value={district.district_name} key={district.key}> {district.district_name} </option>)}
        </select>
      </div>
      <div className={classes.control}>
        <label>Number of weeks to be checked for, in advance from today:</label>
        <input disabled={disableSearch} type='number' min="1" max="5" defaultValue="2" onChange={limitChangeHandler}></input>
        <label>Contact number(without +91) for SMS alert</label>
        <input disabled={disableSearch} value={props.contactNo} type='text'  onChange={onNumberChange} ></input>
      </div>
      <button disabled={disableSearch}>{(props.title && "Search in Loop") ||
        (!props.title && "Searching...")}</button>
      <button onClick={refreshPageHandler} className="refreshButton">Try a new search!</button>
    </form>
  );
}

export default SearchVaccine;
