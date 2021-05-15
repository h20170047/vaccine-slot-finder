import React from 'react';

import Vaccine from './Vaccine';
import classes from './VaccineList.module.css';

const VaccineList = (props) => {
  return (
    <ul className={classes['vaccines-list']}>
      {props.movies.map((movie) => (
        <Vaccine
          key={movie.id}
          title={movie.title}
          releaseDate={movie.releaseDate}
          openingText={movie.openingText}
        />
      ))}
    </ul>
  );
};

export default VaccineList;
