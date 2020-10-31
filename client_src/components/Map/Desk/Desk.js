import React from 'react';

import classes from './Desk.module.css';

const desk = (props) => {
  return (
    <div onClick={props.clicked} className={classes.desk + " " + (props.occupied ? classes.occupied : classes.free)}>{props.name}</div>
  );
};

export default desk;
