import React from 'react';

import classes from './ReservationEditor.module.css';

const reservationEditor = (props) => {
  const userOptions = props.users.map(user => {
    return <option value={user._id} key={user._id}>{user.name}</option>
  });

  userOptions.unshift(
    <option
      value=""
      key="">
        Please select a user
    </option>);

  return (
    <div>
      <h2>Reservation Editor</h2>
      <select
        value={props.reservation.userId}
        onChange={ (e) => props.userChanged(e.target.value) }>
          { userOptions }
      </select>
      <br />
      Start Date: { props.reservation.startDate.toString() }
      <br />
      End Date: { props.reservation.startDate.toString() }
      <br />
      <button onClick={props.acceptClicked}>Accept</button>
      <button onClick={props.cancelClicked}>Cancel</button>
      <button onClick={props.deleteClicked}>Delete</button>
    </div>
  );
};

export default reservationEditor;
