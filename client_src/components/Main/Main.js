import React, { useState } from 'react';
import Calendar from 'react-calendar';
import _ from 'lodash';

import Booker from '../Booker/Booker';
import Modal from '../UI/Modal/Modal';
import Map from '../Map/Map';

import classes from './Main.module.css';

import 'react-calendar/dist/Calendar.css';

const Main = props => {
  const [viewDate, setViewDate] = useState(new Date());

  const onViewAvailCalendarChange = date => {
    const newViewDate = new Date(date.getTime());
    setViewDate(newViewDate);
  };

  const onViewAvailTimeChange = timeMinutes => {
    const newViewDate = new Date(viewDate.getTime());
    newViewDate.setHours(timeMinutes / 60);
    newViewDate.setMinutes(timeMinutes % 60);

    setViewDate(newViewDate);
  };

  return (
    <div>
      <div>
        <h2>View Date</h2>
        <p>{viewDate.toString()}</p>
        <div className={classes.ViewAvailCalendar}>
          <Calendar
            onChange={onViewAvailCalendarChange}
            value={viewDate}
          />
        </div>
        <div className={classes.ViewAvailTime}>
          <p>Time: {viewDate.getHours()}:{viewDate.getMinutes()}</p>
          <input
            type="range"
            min="0"
            max="1439"
            step="15"
            value={viewDate.getHours() * 60 + viewDate.getMinutes()}
            onChange={(evt) => onViewAvailTimeChange(evt.target.value)} />
        </div>
        <Map showEditUI={true} />
      </div>

    </div>
  );
}

export default Main;
