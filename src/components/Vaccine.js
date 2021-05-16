import React from 'react';

import classes from './Vaccine.module.css';

const Vaccine = (props) => {
  return (
    <li className={classes.vaccine}>
      <h2>{props.title}</h2>
      <h3>{props.vaccinationDate}</h3>
      <p>{props.location}</p>
    </li>
  );
};

export default Vaccine;
