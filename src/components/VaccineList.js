import React from 'react';

import Vaccine from './Vaccine';
import classes from './VaccineList.module.css';

const VaccineList = (props) => {
  return (
    <ul className={classes['vaccines-list']}>
      {props.vaccines.map((vaccine) => (
        <Vaccine
          key={vaccine.centerID+" "+vaccine.vaccinationDate+" "+vaccine.ageLimit+" "+vaccine.vaccine}
          ageLimit={vaccine.ageLimit}
          vaccine= {vaccine.vaccine}
          available_capacityText={vaccine.available_capacityText}
          available_capacity_dose1={vaccine.available_capacity_dose1}
          available_capacity_dose2={vaccine.available_capacity_dose2}
          vaccinationDate={vaccine.vaccinationDate}
          location={vaccine.location}
          name={vaccine.name}
          address= {vaccine.address}
          fee_type= {vaccine.fee_type}
        />
      ))}
    </ul>
  );
};

export default VaccineList;
