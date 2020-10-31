import React, { Component } from 'react';
import classes from './DayOfWeek.module.css';

class DayOfWeek extends Component {
  state = {
    currTimeSlotElement: null,
    dragging: false
  }

  addMinutes = (date, minutes) => {
    return new Date(date.getTime() + minutes*60000);
  }

  render() {
    const validReservations = this.props.validReservations;
    const dayStartDate = this.props.dayStartDate;
    const dayEndDate = this.props.dayEndDate;

    const times = [];
    const timeSegmentLength = this.props.timeSegmentLengthMinutes;
    for (let t = 0; t <= 24 * 60; t += timeSegmentLength) {
      const date = new Date(this.props.dayStartDate);

      date.setHours(t / 60);
      date.setMinutes(t % 60);

      //date.setUTCHours(t / 60);
      //date.setUTCMinutes(t % 60);

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

          const endDate = this.addMinutes(timeDate, timeSegmentLength - 1);

          return (
            //<div style={{"grid-column": "col", "grid-row": ind}} className={classes.timeSlot}>
            <div
              onClick={this.props.timeSlotClicked}
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

          //startDate, endDate
          const gridRowStart =
            Math.round((resStartDate.getHours() * 60 + resStartDate.getMinutes()) / timeSegmentLength);
          const gridRowEnd =
            Math.round((resEndDate.getHours() * 60 + resEndDate.getMinutes()) / timeSegmentLength);

          return (
            <div
              key={ind}
              style={{gridRowStart: gridRowStart, gridRowEnd: gridRowEnd, gridColumnStart: 1, gridColumnEnd: 1}}
              className={classes.reservation}>

              <div
                onMouseDown={this.props.resStartOnMouseDown}
                data-res-start={reservation.id}
                className={classes.reservationHandle + " " + classes.reservationStartTimeHandle}>
                &uarr;
              </div>
              <div
                onMouseDown={this.props.resEndOnMouseDown}
                data-res-end={reservation.id}
                className={classes.reservationHandle + " " + classes.reservationEndTimeHandle}>
                &darr;
              </div>
              {reservation.userName}

            </div>
          );
        })}
      </div>
    );
  }
}

export default DayOfWeek;
