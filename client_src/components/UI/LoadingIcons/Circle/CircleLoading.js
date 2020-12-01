import React from 'react';
import classes from './CircleLoading.module.css';

const circleLoading = props => {
  return (
    <div className={classes['lds-roller'] + ' ' + props.classes}>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  );
};

export default circleLoading;
