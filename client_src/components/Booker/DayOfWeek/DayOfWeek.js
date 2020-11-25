import React, { Component } from 'react';
import classes from './DayOfWeek.module.css';

const dayOfWeek = props => {
  const addMinutes = (date, minutes) => {
    return new Date(date.getTime() + minutes * 60000);
  }

  const validReservations = props.validReservations;
  const dayStartDate = props.dayStartDate;
  const dayEndDate = props.dayEndDate;

  const times = [];
  const timeSegmentLength = props.timeSegmentLengthMinutes;
  for (let t = 0; t <= 24 * 60; t += timeSegmentLength) {
    const date = new Date(props.dayStartDate);

    date.setHours(t / 60);
    date.setMinutes(t % 60);

    times.push(date);
  }

  return (
    <div
      className={classes.bookerDayOfWeek}>
      {times.map((timeDate, ind) => {

        const minutes = timeDate.getMinutes();
        let hour = timeDate.getHours();

        //const minutes = timeDate.getUTCMinutes();
        //let hour = timeDate.getUTCHours();

        const AmPm = hour >= 12 ? "pm" : "am";
        hour = hour % 12;

        const endDate = addMinutes(timeDate, timeSegmentLength - 1);

        return (
          //<div style={{"grid-column": "col", "grid-row": ind}} className={classes.timeSlot}>
          <div
            onClick={props.timeSlotClicked}
            data-date-start={timeDate.toJSON()}
            data-date-end={endDate.toJSON()}
            key={ind}
            style={{gridRow: ind, gridColumnStart: 1, gridColumnEnd: 1}}
            className={classes.timeSlot}>
            {hour + ":" + (minutes.toString().length === 1 ? "0" + minutes : minutes) + " " + AmPm}
          </div>
        );
      })}

      {validReservations.map((reservation, ind) => {

        let resStartDate;
        let resEndDate;

        if (reservation.startDate >= dayStartDate && reservation.endDate <= dayEndDate) {
          resStartDate = reservation.startDate;
          resEndDate = reservation.endDate;
        } else if (reservation.startDate < dayStartDate) {
          // clamp date to beginning of day
          resStartDate = new Date(dayStartDate);
        } else if (reservation.endDate > dayEndDate) {
          resEndDate = new Date(dayEndDate);
        }

        const startTimeMinutesSinceDayStart =
          resStartDate.getHours() * 60 + resStartDate.getMinutes();

        const endTimeMinutesSinceDayStart =
          resEndDate.getHours() * 60 + resEndDate.getMinutes();

        //startDate, endDate
        const gridRowStart =
          Math.round(startTimeMinutesSinceDayStart / timeSegmentLength);
        const gridRowEnd =
          Math.round(endTimeMinutesSinceDayStart / timeSegmentLength);

        const smallLayout =
          endTimeMinutesSinceDayStart - startTimeMinutesSinceDayStart <=
          props.timeSegmentLengthMinutes * 2 - 1;

        return (
          <div
            key={ind}
            style={{gridRowStart: gridRowStart, gridRowEnd: gridRowEnd, gridColumnStart: 1, gridColumnEnd: 1}}
            className={
              classes.reservation +
              (smallLayout ? " " + classes.reservationSmall : "") }>

            <div
              onMouseDown={props.resStartOnMouseDown}
              data-res-start={reservation._id}
              className={
                  classes.reservationHandle +
                  " " +
                  classes.reservationStartTimeHandle}>
              &uarr;
            </div>
            <div
              onClick={() => props.reservationClicked(reservation)}
              className={classes.reservationContent}>
              <span
                className={classes.reservationContentInner}>
                  {reservation.userName}
              </span>
            </div>
            <div
              onMouseDown={props.resEndOnMouseDown}
              data-res-end={reservation._id}
              className={
                classes.reservationHandle +
                " " +
                classes.reservationEndTimeHandle }>
              &darr;
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default dayOfWeek;
