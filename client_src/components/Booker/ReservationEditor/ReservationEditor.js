import React from 'react';

import classes from './ReservationEditor.module.css';

const reservationEditor = (props) => {
  const minuteValues = [];

  for (let x = 0; x < 60 / timeSegmentLengthMinutes; x++) {
    minuteValues.push(timeSegmentLengthMinutes * x);
  }

  const hourValues = [];
  for (let h = 0; h < 24; h++) {
    hourValues.push(h);
  }

  return (
    <div>
      <h2>Reservation Editor</h2>
      <select>
        {props.users.map(user => {
          return <option value={user._id} key={user._id}>{user.name}</option>
        })}
      </select>
      <br />
      Start Date: { reservation.startDate }
      <br />
      End Date: { reservation.endDate }
    </div>
  );
};

export default reservationEditor;
