import React from 'react';

import classes from './SearchVaccine.module.css';

function SearchVaccine(props) {

  function submitHandler(event) {
    event.preventDefault();

    props.onSwitchSearchCriterion();
  }

  const districtSelectionHandler = (event) => {
    props.onDistrictSelected(event.target.value)
  }

  const limitChangeHandler = (event) => {
    props.onLimitChange(event.target.value)
  }

  return (
    <form onSubmit={submitHandler}>
      <div className={classes.control}>
        <label htmlFor='title'>District:</label>
        <select id="myList" onChange={districtSelectionHandler} value={props.selectedDistrict} >
          {props.districts.map(district =>
            <option value={district.district_name} key={district.key}> {district.district_name} </option>)}
        </select>
      </div>
      <div className={classes.control}>
        <label>Number of days to be checked for, in advance from today:</label>
        <input type='number' onChange={limitChangeHandler}></input>
      </div>
      <button>{(props.title && "Search in Loop") ||
        (!props.title && "Stop search in Loop!")}</button>
    </form>
  );
}

export default SearchVaccine;
