import React from 'react';

import Vaccine from './Vaccine';
import classes from './VaccineList.module.css';

const VaccineList = (props) => {
  return (
    <ul className={classes['vaccines-list']}>
      {props.vaccines.map((vaccine) => (
        <Vaccine
          key={vaccine.centerID}
          title={vaccine.title}
          vaccinationDate={vaccine.vaccinationDate}
          location={vaccine.location}
        />
      ))}
    </ul>
  );
};

export default VaccineList;
