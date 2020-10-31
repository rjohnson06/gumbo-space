import React from 'react';

import classes from './ReservationEditor.module.css';

const reservationEditor = (props) =>{
  return (
    <div>
      <h2>Reservation Editor</h2>
      <select>
        {props.users.map(user => {
          return <option>{user.name}</option>
        })}
      </select>
    </div>
  );
};

export default reservationEditor;
