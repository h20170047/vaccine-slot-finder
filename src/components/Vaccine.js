import React from 'react';

import classes from './Vaccine.module.css';

const Vaccine = (props) => {
  return (
    <li className={classes.vaccine}>
      <yellow>{props.name} <br/> {props.address} <br/>{props.fee_type}</yellow>
      <p>{props.ageLimit}</p>
      <yellow>{props.available_capacityText}<br/></yellow>
      <dose>{props.available_capacity_dose1} {props.available_capacity_dose2} </dose>
      <h3>{props.vaccinationDate}</h3>
    </li>
  );
};

export default Vaccine;
