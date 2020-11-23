import React, { useState, useEffect } from 'react';

import _ from 'lodash';

import ReservationEditor from './ReservationEditor/ReservationEditor';
import DayOfWeek from './DayOfWeek/DayOfWeek';
import Modal from '../UI/Modal/Modal';
import DeskoApi from '../../API/Desko/Desko';

import classes from './Booker.module.css';
import modalClasses from '../UI/Modal/Modal.module.css';

const updateReservation = (resId, startDate, endDate, userId) => {
  const currentEntryInd = this.state.reservedTimes.findIndex(reservation => {
    return resId === reservation.id;
  });

  const clone = _.cloneDeep(this.state.reservedTimes[currentEntryInd]);
  clone.startDate = startDate;
  clone.endDate = endDate;
  clone.userId = userId

  const sources = {};
  sources[currentEntryInd] = clone;

  this.setState({
    reservedTimes: Object.assign([], this.state.reservedTimes, sources)
  });
};

const createReservation = (startDate, endDate, userId, deskId) => {
  const reservations = [
    ...this.state.reservedTimes
  ];

  reservations.push({
    id: reservations.length,
    userId: userId,
    startDate: startDate,
    endDate: endDate,
    deskId: deskId
  });

  return reservations.length;
};

const editingState = {
  default: 0,
  changingStartTime: 1,
  changingEndTime: 2
};

const Booker = props => {

  const [showReservationEditor, setShowReservationEditor] = useState(false);
  const [editionState, setEditionState] = useState(editingState.default);
  const [resIdEdited, setResIdEdited] = useState(null);
  const [lastTimeSlotDate, setLastTimeSlotDate] = useState(null);
  const [reservations, setReservations] = useState([]);

  const timeSegmentLengthMinutes = 30;

  const resStartOnMouseDown = (evt) => {
    const timeSlotData = this.findTimeSlotData(evt);

    setLastTimeSlotDate(timeSlotData.timeSlotStartDate);
    setEditionState(editingState.changingStartTime);
    setResIdEdited(parseInt(evt.target.getAttribute("data-res-start")));
  }

  const resEndOnMouseDown = (evt) => {
    const timeSlotData = this.findTimeSlotData(evt);

    setLastTimeSlotDate(timeSlotData.timeSlotStartDate);
    setEditionState(editingState.changingEndTime);
    setResIdEdited(parseInt(evt.target.getAttribute("data-res-end")));
  }

  const findTimeSlotData = (evt) => {
    const x = evt.clientX;
    const y = evt.clientY;
    // I would like to have the references to all the reservation elements directly
    // rather than querying, maybe with refs?
    const reservationElements =
      Array.from(document.querySelectorAll('[data-res-start'))
      .concat(Array.from(document.querySelectorAll('[data-res-end]')));

    reservationElements.forEach((res, i) => {
      res.parentElement.style["pointer-events"] = "none";
    });

    const element = document.elementFromPoint(x, y);

    reservationElements.forEach((res, i) => {
      res.parentElement.style["pointer-events"] = "auto";
    });

    return this.findTimeSlotDateFromElem(element);
  }

  const findTimeSlotDateFromElem = (element) => {
    const timeSlotDateJson = element.dataset.dateStart;
    const timeSlotDate = new Date(timeSlotDateJson);
    const timeSlotEndDate = new Date(element.dataset.dateEnd);

    return {
      timeSlotStartDate: timeSlotDate,
      timeSlotEndDate: timeSlotEndDate
    }
  }

  const onMouseMove = (evt) => {
    if (editionState !== editingState.changingStartTime &&
      editionState !== editingState.changingEndTime) {
        return;
      }

    const reservation =
      props.deskReservations.find(
        (res) => res.id === this.state.resIdEdited);

    const timeSlotData = this.findTimeSlotData(evt);

    if (lastTimeSlotDate === null) {
      setLastTimeSlotDate(timeSlotData.timeSlotStartDate);
    } else {
      if (lastTimeSlotDate.getTime() !== timeSlotData.timeSlotStartDate.getTime()) {
        if (lastTimeSlotDate.getDate() !== timeSlotData.timeSlotStartDate.getDate()) {
          setEditionState(editingState.default);
        } else {

          if (editionState === editingState.changingStartTime &&
            (timeSlotData.timeSlotStartDate < reservation.endDate ||
                timeSlotData.timeSlotStartDate.getTime() === reservation.endDate.getTime())) {

            props.updateReservation(
              resIdEdited,
              timeSlotData.timeSlotStartDate,
              reservation.endDate,
              reservation.userId);
          }

          if (this.state.editionState === editingState.changingEndTime &&
              (timeSlotData.timeSlotEndDate > reservation.startDate ||
                timeSlotData.timeSlotEndDate.getTime() === reservation.startDate.getTime())) {

            props.updateReservation(
              resIdEdited,
              reservation.startDate,
              timeSlotData.timeSlotEndDate,
              reservation.userId);
          }
        }

        this.setState({
          lastTimeSlotDate: timeSlotData.timeSlotStartDate
        });
      }
    }
  }

  const timeSlotClicked = (evt) => {
    const timeSlotData = this.findTimeSlotDateFromElem(evt.target);

    // user is creating a new reservation
    // enter reservation create state
    // modal within the booker for setting the data

    // TODO : make cleaner state management
    //createReservation = (startDate, endDate, userId, deskId)
    const newId = props.createReservation(
      timeSlotData.timeSlotStartDate,
      timeSlotData.timeSlotEndDate,
      1,
      props.deskEditedId
    );

    setShowReservationEditor(true);
    setResIdEdited(newId);
  }

  const reservationEditorClosed = () => {
    setShowReservationEditor(false);
  }

  const bookerMouseDown = (evt) => {
  }

  const bookerMouseUp = () => {
    setEditionState(editingState.default);
    setResIdEdited(null);
  }

  function addDaysToDate(date, days) {
    var newDate = new Date(date.valueOf());
    newDate.setDate(newDate.getDate() + days);
    return newDate;
  }

  const datesInWeek = [props.date];
  for (let x = props.date.getDay() - 1; x >= 0; x--) {
    datesInWeek.unshift(addDaysToDate(props.date, x - props.date.getDay()));
  }

  for (let y = props.date.getDay() + 1; y < 7; y++) {
    datesInWeek.push(addDaysToDate(props.date, y - props.date.getDay()));
  }

  const dayOfWeekNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
  ];

  /*
  grid-column: col ;
  grid-row: row ;
  */

  return (
    <div
      onMouseDown={this.bookerMouseDown}
      onMouseUp={this.bookerMouseUp}
      onMouseMove={this.onMouseMove}
      className={classes.bookerBody} >
      <h2>Desk Calendar</h2>
      <div className={classes.dayOfWeekHeaderContainer}>
        {datesInWeek.map((date, ind) => {
          return (
            <div
              className={classes.dayOfWeekHeader}
              key={ind}>
                {dayOfWeekNames[date.getUTCDay()]} {date.getUTCMonth() + "/" + date.getUTCDate()}
            </div>
          );
        })}
      </div>
      <div className={classes.bookerDates}>
        {datesInWeek.map((date, ind) => {

          const dayStartDate = new Date(date);
          //dayStartDate.setMinutes(0);
          dayStartDate.setHours(0,0,0,0);

          const dayEndDate = new Date(date);
          //dayEndDate.setMinutes(59);
          dayEndDate.setHours(23, 59, 0, 0);

          const validReservations =
            props.deskReservations.filter(reservation => {
              return reservation.startDate >= dayStartDate &&
                reservation.endDate <= dayEndDate;
            });

          return (
            <DayOfWeek
              timeSegmentLengthMinutes={timeSegmentLengthMinutes}
              onMouseLeave={dayOfWeekMouseLeave}
              validReservations={validReservations}
              dayStartDate={dayStartDate}
              dayEndDate={dayEndDate}
              key={ind}
              resStartOnMouseDown={resStartOnMouseDown}
              resEndOnMouseDown={resEndOnMouseDown}
              timeSlotClicked={timeSlotClicked} />
          );
        })}
      </div>
      <Modal
        show={showReservationEditor}
        modalClosed={reservationEditorClosed}
        classes={modalClasses.reservationEditor}>
        <ReservationEditor
          reservation={props.deskReservations.find(res => res.id === resIdEdited)}
          show={showReservationEditor}
          users={props.users}// good canditate for redux global store
          />
      </Modal>
    </div>
  );
};

export default Booker;
