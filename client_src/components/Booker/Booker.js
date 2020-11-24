import React, { useState, useEffect } from 'react';

import _ from 'lodash';

import ReservationEditor from './ReservationEditor/ReservationEditor';
import DayOfWeek from './DayOfWeek/DayOfWeek';
import Modal from '../UI/Modal/Modal';
import DeskoApi from '../../API/Desko/Desko';

import classes from './Booker.module.css';
import modalClasses from '../UI/Modal/Modal.module.css';

const buildValidDateTimes = timeSegmentLengthMinutes => {
  const times = [];
  for (let t = 0; t <= 24 * 60; t += timeSegmentLengthMinutes) {
    const date = new Date(this.props.dayStartDate);

    date.setHours(t / 60);
    date.setMinutes(t % 60);

    times.push(date);
  }

  return times;
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

  return findTimeSlotDateFromElem(element);
}

const findTimeSlotDateFromElem = (element) => {
  const timeSlotDateJson = element.dataset.dateStart;
  const timeSlotDate = new Date(timeSlotDateJson);
  const timeSlotEndDate = new Date(element.dataset.dateEnd);

  return {
    timeSlotStartDate: timeSlotDate,
    timeSlotEndDate: timeSlotEndDate
  };
}

const editingState = {
  loading: 0,
  editing: 1,
  changingStartTime: 2,
  changingEndTime: 3,
  creatingReservation: 4,
  editingReservation: 5
};

// This draggable stuff creates a lot of changes
// we throttle how often we're synching with the server
const Booker = props => {

  const [editionState, setEditionState] = useState(editingState.loading);
  const [resEdited, setResEdited] = useState(null);
  const [lastTimeSlotDate, setLastTimeSlotDate] = useState(null);

  const [desk, setDesk] = useState(null);
  const [users, setUsers] = useState(null);

  console.log(JSON.stringify(desk));

  useEffect(() => {
    DeskoApi.getUsers()
      .then(allUsers => {
        setUsers(allUsers);
      });

    DeskoApi.getDesk(props.deskEditedId)
      .then(deskData => {
        setDesk(deskData);
      });
  }, []);

  // transition to the finished loading state once we get all the data we need
  useEffect(() => {
    if (desk !== null && users !== null) {
      setEditionState(editingState.editing);
    }
  }, [desk, users]);

  const timeSegmentLengthMinutes = 30;

  const updateReservationLocal = (resId, startDate, endDate, userId) => {
    const updatedDesk = { ...desk };
    updatedDesk.reservations = updatedDesk.reservations.map(res => {
      if (res._id === resId) {
        return { ...res, startDate: startDate, endDate: endDate, userId: userId };
      }

      return res;
    });

    setDesk(updatedDesk);
  };

  const resStartOnMouseDown = (evt) => {
    if (editionState !== editingState.editing) {
      return;
    }

    const timeSlotData = findTimeSlotData(evt);

    const resId = parseInt(evt.target.getAttribute("data-res-start"));
    const res = _.cloneDeep(desk.reservations.find(res => res._id === resId));

    setLastTimeSlotDate(timeSlotData.timeSlotStartDate);
    setEditionState(editingState.changingStartTime);
    setResEdited(res);
  }

  const resEndOnMouseDown = (evt) => {
    if (editionState !== editingState.editing) {
      return;
    }

    const timeSlotData = findTimeSlotData(evt);

    const resId = parseInt(evt.target.getAttribute("data-res-end"));
    const res = _.cloneDeep(desk.reservations.find(res => res._id === resId));

    setLastTimeSlotDate(timeSlotData.timeSlotStartDate);
    setEditionState(editingState.changingEndTime);
    setResEdited(res);
  }

  const onMouseMove = (evt) => {
    if (editionState !== editingState.changingStartTime &&
        editionState !== editingState.changingEndTime) {
        return;
    }

    const reservation = resEdited;
    const timeSlotData = findTimeSlotData(evt);

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

            updateReservationLocal(
              resEdited._id,
              timeSlotData.timeSlotStartDate,
              reservation.endDate,
              reservation.userId);
          }

          if (editionState === editingState.changingEndTime &&
              (timeSlotData.timeSlotEndDate > reservation.startDate ||
                timeSlotData.timeSlotEndDate.getTime() === reservation.startDate.getTime())) {

            updateReservationLocal(
              resEdited._id,
              reservation.startDate,
              timeSlotData.timeSlotEndDate,
              reservation.userId);
          }
        }

        setLastTimeSlotDate(timeSlotData.timeSlotStartDate);
      }
    }
  }

  const timeSlotClicked = (evt) => {
    if (editionState === editingState.loading) {
      return;
    }

    const timeSlotData = findTimeSlotDateFromElem(evt.target);

    setResEdited({
      startDate: timeSlotData.timeSlotStartDate,
      endDate: timeSlotData.timeSlotEndDate
    });

    setEditionState(editingState.creatingReservation);
  };

  const reservationEditorClosed = () => {
    setEditionState(editingState.editing);
  };

  const onAcceptClicked = () => {
    if (editionState === editingState.creatingReservation) {
      // create reservation
      DeskoApi.addDeskReservation({
        deskId: desk._id,
        userId: resEdited.userId,
        startDate: resEdited.startDate,
        endDate: resEdited.endDate
      })
      .then(result => {
        // we need to do this because we don't get the new res id
        // back from the addReservation call
        return DeskoApi.getDesk(desk._id);
      })
      .then(result => {
        setDesk(result);
        setEditionState(editingState.editing);
      })
      .catch(err => {
        throw new Error("you need to do something here");
      });
    } else if (editionState === editingState.editingReservation) {
      // update reservation local, sync with Desko, transition state
      DeskoApi.updateDeskReservation({
        deskId: desk._id,
        resId: resEdited._id,
        userId: resEdited._userId,
        startDate: resEdited.startDate,
        endDate: resEdited.endDate
      })
      .then(result => {
        updateReservationLocal(
          resEdited._id,
          resEdited.startDate,
          resEdited.endDate,
          resEdited.userId);
        setEditionState(editingState.editing);
      })
      .error(err => {
        throw new Error("you need to do something here");
      });
    } else {
      throw new Error("not supposed to reach here");
    }
  };

  const onCancelClicked = () => {
    setEditionState(editingState.editing);
  };

  const onResUserChanged = userId => {
    setResEdited({ ...resEdited, userId: userId });
  };

  const bookerMouseDown = (evt) => {
  };

  const bookerMouseUp = () => {
    setEditionState(editingState.editing);
    setResEdited(null);
  };

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
      onMouseDown={bookerMouseDown}
      onMouseUp={bookerMouseUp}
      onMouseMove={onMouseMove}
      className={classes.bookerBody} >
      <h2>Desk Calendar</h2>
      <div className={classes.dayOfWeekHeaderContainer}>
        {datesInWeek.map((date, ind) => {
          return (
            <div
              className={classes.dayOfWeekHeader}
              key={ind}>
                {dayOfWeekNames[date.getUTCDay()]}
                {date.getUTCMonth() + "/" + date.getUTCDate()}
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

          let validReservations = [];

          if (editionState !== editingState.loading) {
            validReservations = desk.reservations.filter(reservation => {
              return reservation.startDate >= dayStartDate &&
                reservation.endDate <= dayEndDate;
            });
            console.log(desk.reservations[0].startDate);
            console.log(desk.reservations[0].endDate);
            console.log(validReservations);
          }

          return (
            <DayOfWeek
              timeSegmentLengthMinutes={timeSegmentLengthMinutes}
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
      { editionState !== editingState.creatingReservation ?
          null :
          <Modal
            show={true}
            modalClosed={reservationEditorClosed}
            classes={modalClasses.reservationEditor}>
            <ReservationEditor
              userChanged={onResUserChanged}
              acceptClicked={onAcceptClicked}
              cancelClicked={onCancelClicked}
              reservation={resEdited}
              users={users} />
          </Modal>
      }
    </div>
  );
};

export default Booker;
