import React, { Component } from 'react';

import ReservationEditor from './ReservationEditor/ReservationEditor';
import DayOfWeek from './DayOfWeek/DayOfWeek';
import Modal from '../../UI/Modal/Modal';
import classes from './Booker.module.css';
import modalClasses from '../../UI/Modal/Modal.module.css';

class Booker extends Component {
  static #editingState = {
    default: 0,
    changingStartTime: 1,
    changingEndTime: 2
  };

  state = {
    editionState: Booker.#editingState.default,
    resIdEdited: null,
    lastTimeSlotDate: null
  };

  timeSegmentLengthMinutes = 30;

  resStartOnMouseDown = (evt) => {
    const timeSlotData = this.findTimeSlotData(evt);

    this.setState({
      lastTimeSlotDate: timeSlotData.timeSlotStartDate,
      editionState: Booker.#editingState.changingStartTime,
      resIdEdited: parseInt(evt.target.getAttribute("data-res-start"))
    });
  }

  resEndOnMouseDown = (evt) => {
    const timeSlotData = this.findTimeSlotData(evt);

    this.setState({
      lastTimeSlotDate: timeSlotData.timeSlotStartDate,
      editionState: Booker.#editingState.changingEndTime,
      resIdEdited: parseInt(evt.target.getAttribute("data-res-end"))
    });
  }

  findTimeSlotData = (evt) => {
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

  findTimeSlotDateFromElem = (element) => {
    const timeSlotDateJson = element.dataset.dateStart;
    const timeSlotDate = new Date(timeSlotDateJson);
    const timeSlotEndDate = new Date(element.dataset.dateEnd);

    return {
      timeSlotStartDate: timeSlotDate,
      timeSlotEndDate: timeSlotEndDate
    }
  }

  // TODO : trigger mouseEnter events on Booker based on mouse position
  onMouseMove = (evt) => {
    if (this.state.editionState !== Booker.#editingState.changingStartTime &&
      this.state.editionState !== Booker.#editingState.changingEndTime) {
        return;
      }

    const reservation = this.props.deskReservations.find((res) => res.id === this.state.resIdEdited);

    const timeSlotData = this.findTimeSlotData(evt);

    if (this.state.lastTimeSlotDate === null) {
      this.setState({
        lastTimeSlotDate: timeSlotData.timeSlotStartDate
      });
    } else {
      if (this.state.lastTimeSlotDate.getTime() !== timeSlotData.timeSlotStartDate.getTime()) {
        if (this.state.lastTimeSlotDate.getDate() !== timeSlotData.timeSlotStartDate.getDate()) {
          this.setState({
            editionState: Booker.#editingState.default
          });
        } else {
          if (this.state.editionState === Booker.#editingState.changingStartTime &&
            (timeSlotData.timeSlotStartDate < reservation.endDate ||
                timeSlotData.timeSlotStartDate.getTime() === reservation.endDate.getTime())) {
            this.props.updateReservation(this.state.resIdEdited, timeSlotData.timeSlotStartDate, reservation.endDate, reservation.userId);

            console.log("" + timeSlotData.timeSlotStartDate);
            console.log("" + reservation.endDate);
          }

          if (this.state.editionState === Booker.#editingState.changingEndTime &&
          (timeSlotData.timeSlotEndDate > reservation.startDate ||
            timeSlotData.timeSlotEndDate.getTime() === reservation.startDate.getTime())) {
            this.props.updateReservation(this.state.resIdEdited, reservation.startDate, timeSlotData.timeSlotEndDate, reservation.userId);
          }
        }

        this.setState({
          lastTimeSlotDate: timeSlotData.timeSlotStartDate
        });
      }
    }
  }

  timeSlotClicked = (evt) => {
    const timeSlotData = this.findTimeSlotDateFromElem(evt.target);

    // user is creating a new reservation
    // enter reservation create state
    // modal within the booker for setting the data

    // TODO : make cleaner state management
    //createReservation = (startDate, endDate, userId, deskId)
    const newId = this.props.createReservation(
      timeSlotData.timeSlotStartDate,
      timeSlotData.timeSlotEndDate,
      1,
      this.props.deskEditedId
    );

    this.setState({
      showReservationEditor: true,
      resIdEdited: newId
    });
  }

  reservationEditorClosed = () => {
    this.setState({
        showReservationEditor: false
    });
  }

  bookerMouseDown = (evt) => {
  }

  bookerMouseUp = () => {
    this.setState({
      editionState: Booker.#editingState.default,
      resIdEdited: null
    });
  }

  render() {
    const props = this.props;

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

    const dayOfWeekNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

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
              <div className={classes.dayOfWeekHeader} key={ind}>{dayOfWeekNames[date.getUTCDay()]} {date.getUTCMonth() + "/" + date.getUTCDate()}</div>
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

            const validReservations = props.deskReservations.filter(reservation => {
              return reservation.startDate >= dayStartDate && reservation.endDate <= dayEndDate;
            });

            return (
              <DayOfWeek
                timeSegmentLengthMinutes={this.timeSegmentLengthMinutes}
                onMouseLeave={this.dayOfWeekMouseLeave}
                validReservations={validReservations}
                dayStartDate={dayStartDate}
                dayEndDate={dayEndDate}
                key={ind}
                resStartOnMouseDown={this.resStartOnMouseDown}
                resEndOnMouseDown={this.resEndOnMouseDown}
                timeSlotClicked={this.timeSlotClicked} />
            );
          })}
        </div>
        <Modal show={this.state.showReservationEditor} modalClosed={this.reservationEditorClosed} classes={modalClasses.reservationEditor}>
          <ReservationEditor
            reservation={props.deskReservations.find(res => res.id === this.state.resIdEdited)}
            show={this.state.showReservationEditor}
            users={this.props.users}// good canditate for redux global store
            />
        </Modal>
      </div>
    );
  }
};

export default Booker;
