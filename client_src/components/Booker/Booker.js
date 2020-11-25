import React, { useState, useEffect, useRef } from 'react';

import _ from 'lodash';
import { DateTime, Interval } from 'luxon';

import ReservationEditor from './ReservationEditor/ReservationEditor';
import DayOfWeek from './DayOfWeek/DayOfWeek';
import Modal from '../UI/Modal/Modal';
import DeskoApi from '../../API/Desko/Desko';

import classes from './Booker.module.css';
import modalClasses from '../UI/Modal/Modal.module.css';

/*
  You need to get the flattened data (user name) when you create a new reservation
  If you have a central store/layer of data for the whole app, it would make
  sense to push this task there
  The data layer could be implemented in a hook maybe!!
*/

// This draggable stuff creates a lot of changes
// we throttle how often we're synching with the server
const Booker = props => {

  const [editionState, setEditionState] = useState(editingState.loading);
  const [resEdited, setResEdited] = useState(null);

  // we set this is mousedown and read it in mousemove
  // should we use ref instead?
  const [lastTimeSlotDate, setLastTimeSlotDate] = useState(null);

  const [synching, setSynching] = useState(false);
  const [synchingText, setSynchingText] = useState("");

  const [desk, setDesk] = useState(null);
  const [users, setUsers] = useState(null);

  const [updatedReservations, setUpdatedReservations] = useState(new Set());

  const updatedResRef = useRef(updatedReservations);
  updatedResRef.current = updatedReservations;

  const deskRef = useRef(desk);
  deskRef.current = desk;

  const synchingRef = useRef(synching);
  synchingRef.current = synching;

  const editionStateRef = useRef(editionState);
  editionStateRef.current = editionState;

  const resEditedRef = useRef(resEdited);
  resEditedRef.current = resEdited;

  useEffect(() => {
    DeskoApi.getUsers()
      .then(allUsers => {
        setUsers(allUsers);
      });

    DeskoApi.getFlatDeskData(props.deskEditedId)
      .then(deskData => {
        setDesk(deskData);
      });
  }, []);

  // sync reservation changes with back-end
  useEffect(() => {
    const interval = setInterval(() => {
      if (synchingRef.current || editionStateRef === editingState.loading) {
        return;
      }

      // TOOD : is this okay to do?
      setSynching(true);

      const promises = [];

      updatedResRef.current.forEach(resId => {
        const res = deskRef.current.reservations.find(r => r._id === resId);

        const promise = DeskoApi.updateDeskReservation({
          deskId: deskRef.current._id,
          resId: resId,
          userId: res.userId,
          startDate: res.startDate,
          endDate: res.endDate
        })
        .then(() => {
          const newSet = new Set(updatedResRef.current);
          newSet.delete(resId);
          setUpdatedReservations(newSet);
        });

        promises.push(promise);
      });

      if (promises.length > 0) {
        setSynchingText("Saving...");
      }

      Promise.all(promises).then(() => {
        setSynching(false);
        setTimeout(() => {
          setSynchingText("Saved");
        }, 2000);
      })
      .catch(() => {
        setSynchingText("Error");
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // transition to the finished loading state once we get all the data we need
  useEffect(() => {
    if (editionState === editingState.loading &&
        desk !== null &&
        users !== null) {
      setEditionState(editingState.editing);
    }
  }, [desk, users]);

  const timeSegmentLengthMinutes = 30;

  // TODO : you need to update the flattened data (user name) as well
  const updateReservationLocal = (resId, startDate, endDate, userId) => {
    const updatedDesk = { ...desk };
    updatedDesk.reservations = updatedDesk.reservations.map(res => {
      if (res._id === resId) {
        return {
          ...res,
          startDate: startDate,
          endDate: endDate,
          userId: userId
        };
      }

      return res;
    });

    setDesk(updatedDesk);

    const newSet = new Set(updatedReservations);
    newSet.add(resId);
    setUpdatedReservations(newSet);
  };

  const resStartOnMouseDown = (evt) => {
    if (editionState !== editingState.editing) {
      return;
    }

    const timeSlotData = findTimeSlotData(evt);

    const resId = evt.target.getAttribute("data-res-start");
    const res = _.cloneDeep(desk.reservations.find(res => res._id === resId));

    setResEdited(res);
    setLastTimeSlotDate(timeSlotData.timeSlotStartDate);
    setEditionState(editingState.changingStartTime);
  }

  const resEndOnMouseDown = (evt) => {
    if (editionState !== editingState.editing) {
      return;
    }

    const timeSlotData = findTimeSlotData(evt);

    const resId = evt.target.getAttribute("data-res-end");
    const res = _.cloneDeep(desk.reservations.find(res => res._id === resId));

    setResEdited(res);
    setLastTimeSlotDate(timeSlotData.timeSlotStartDate);
    setEditionState(editingState.changingEndTime);
  }

  const onMouseMove = (evt) => {
    if (editionState !== editingState.changingStartTime &&
        editionState !== editingState.changingEndTime) {
        return;
    }

    const reservation = resEdited;
    const timeSlotData = findTimeSlotData(evt);

    if (lastTimeSlotDate.getDate() !== timeSlotData.timeSlotStartDate.getDate()) {
      // we moused into a new day, start over
      //setEditionState(editingState.editing);
      return;
    }

    if (lastTimeSlotDate.getTime() !== timeSlotData.timeSlotStartDate.getTime()) {
      // mouse has moved into a new time slot

      setLastTimeSlotDate(timeSlotData.timeSlotStartDate);

      if ((editionState === editingState.changingStartTime &&
           timeSlotData.timeSlotStartDate > reservation.endDate) ||
          (editionState === editingState.changingEndTime &&
           timeSlotData.timeSlotEndDate < reservation.startDate)) {
        // we can't drag the end time earlier than the start time
        // we can't drag the start time later than the end time
        return;
      }

      // make sure new reservation doesn't conflict with any existing reservations
      let resStartDate = resEdited.startDate;
      let resEndDate = resEdited.endDate;

      if (editionState === editingState.changingStartTime) {
        resStartDate = timeSlotData.timeSlotStartDate;
      }

      if (editionState === editingState.changingEndTime) {
        resEndDate = timeSlotData.timeSlotEndDate;
      }

      const resInterval = Interval.fromDateTimes(
        DateTime.fromJSDate(resStartDate),
        DateTime.fromJSDate(resEndDate)
      );

      const conflictingResses = desk.reservations.filter(res => {
        if (res._id === resEdited._id) {
          return false;
        }

        const interval = Interval.fromDateTimes(
          DateTime.fromJSDate(res.startDate),
          DateTime.fromJSDate(res.endDate)
        );

        return interval.overlaps(resInterval);
      });

      if (conflictingResses.length === 0) {
        updateReservationLocal(
          resEdited._id,
          resStartDate,
          resEndDate,
          reservation.userId);
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
        return DeskoApi.getFlatDeskData(desk._id);
      })
      .then(result => {

        // TODO : what if you user has already done other stuff
        // by the time this request completes?
        // you override their work I guess
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
      .catch(err => {
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
    if (editionState === editingState.creatingReservation ||
        editionState === editingState.editingReservation) {
      return;
    }

    setEditionState(editingState.editing);
    setResEdited(null);
  };

  const reservationOnClick = (res) => {
    if (editionState === editingState.loading) {
      return;
    }

    console.log("reservationClick " + JSON.stringify(res));

    setResEdited(res);
    setEditionState(editingState.editingReservation);
  };

  const onDeleteClicked = () => {
    const removeResId = resEdited._id;

    DeskoApi.deleteDeskReservation({ deskId: desk._id, resId: resEdited._id })
    .then(() => {
      const updatedDesk = { ...desk };
      updatedDesk.reservations = desk.reservations.filter(res => {
        return res._id !== removeResId;
      });

      setDesk(updatedDesk);
      setEditionState(editingState.editing);
    })
    .catch((e) => {
      throw new Error("you need to do something here " + e);
    });
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
      <div className={classes.headerParent}>
        <div className={classes.headerTitleCol}>
          <h2 className={classes.headerTitle}>Desk Calendar</h2>
        </div>
        <div className={classes.headerStatus}>{ synchingText }</div>
      </div>
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
              timeSlotClicked={timeSlotClicked}
              reservationClicked={reservationOnClick} />
          );
        })}
      </div>
      { editionState !== editingState.creatingReservation &&
        editionState !== editingState.editingReservation ?
          null :
          <Modal
            show={true}
            modalClosed={reservationEditorClosed}
            classes={modalClasses.reservationEditor}>
            <ReservationEditor
              userChanged={onResUserChanged}
              acceptClicked={onAcceptClicked}
              cancelClicked={onCancelClicked}
              deleteClicked={onDeleteClicked}
              reservation={resEdited}
              users={users} />
          </Modal>
      }
    </div>
  );
};

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

export default Booker;
