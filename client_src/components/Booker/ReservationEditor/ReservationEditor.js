import React from 'react';

import classes from './ReservationEditor.module.css';

const reservationEditor = (props) => {
  return (
    <div>
      <h2>Reservation Editor</h2>
      <select
        value={props.reservation.userId}
        onChange={ (e) => props.userChanged(e.target.value) }>
        {props.users.map(user => {
          return <option value={user._id} key={user._id}>{user.name}</option>
        })}
      </select>
      <br />
      Start Date: { props.reservation.startDate.toString() }
      <br />
      End Date: { props.reservation.startDate.toString() }
      <br />
      <button onClick={props.acceptClicked}>Accept</button>
      <button onClick={props.cancelClicked}>Cancel</button>
    </div>
  );
};

export default reservationEditor;
