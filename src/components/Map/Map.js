import React, { Component } from 'react';
import Calendar from 'react-calendar';
import _ from 'lodash';

import Booker from './Booker/Booker';
import Desk from './Desk/Desk';
import Modal from '../UI/Modal/Modal';

import classes from './Map.module.css';
import bookerClasses from './Booker/Booker.module.css';
import modalClasses from '../UI/Modal/Modal.module.css';

import 'react-calendar/dist/Calendar.css';

class Map extends Component {
  // just a test function
  addHoursToDate = function(date, h) {
    date.setTime(date.getTime() + (h*60*60*1000));
    return date;
  };

  state = {
    selectedDeskId: 1,
    showBooker: true,
    viewDate: new Date(),

    users: [
      {name: "Sam", userId: 1},
      {name: "Ryan", userId: 2}
    ],
    desks: [
      {id: 1, location: null, type: null},
      {id: 2, location: null, type: null}
    ],
    deskOwners: [
      {userId: 1, deskId: 1},
      {userId: 2, deskId: 2}
    ],
    reservedTimes: [
      {id: 1, startDate: this.addHoursToDate(new Date(), -4), endDate: this.addHoursToDate(new Date(), 4), userId: 1, deskId: 1},
      {id: 2, startDate: new Date(), endDate: new Date(), userId: 2, deskId: 2}
    ]
  };

  // DataStore Queries

  // desk + occupied, user.name
  getDesksRenderableData = () => {
    return this.state.desks.map(desk => {
      const flattenedDesk = _.cloneDeep(desk);

      const ownerId = this.state.deskOwners.find(owner => owner.deskId === desk.id).userId;

      flattenedDesk.ownerName =
        this.state.users.find(user => user.userId === ownerId).name;

      flattenedDesk.occupied = this.state.reservedTimes.filter(reservation => {
        return reservation.deskId === flattenedDesk.id &&
          this.state.viewDate > reservation.startDate &&
          this.state.viewDate < reservation.endDate;
      }).length > 0;

      return flattenedDesk;
    });
  };

  getDeskBookerData = (deskId) => {
    return this.state.reservedTimes
      .filter(reservation => {
        return reservation.deskId === deskId;
      })
      .map(reservation => {
        const flattenedUserReservation = _.cloneDeep(reservation);
        flattenedUserReservation.userName = this.state.users.find(user => user.userId === reservation.userId).name;

        return flattenedUserReservation;
      });
  };

  updateReservation = (resId, startDate, endDate, userId) => {
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

  createReservation = (startDate, endDate, userId, deskId) => {
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

  deleteReservation = (resId) => {

  };
  // End Datastore Queries

  onDeskClicked = (id, evt) => {
    console.log("desk clicked");
    this.setState({
      selectedDeskId: id,
      showBooker: true
    });
  };

  onBookerClosed = () => {
    this.setState({
      showBooker: false
    });
  };

  onViewAvailCalendarChange = date => {
    const newViewDate = new Date(date.getTime());
    this.setState({ viewDate: newViewDate });
  };

  onViewAvailTimeChange = timeMinutes => {
    const newViewDate = new Date(this.state.viewDate.getTime());
    newViewDate.setHours(timeMinutes / 60);
    newViewDate.setMinutes(timeMinutes % 60);

    this.setState({ viewDate: newViewDate });
  };

  render() {
    const renderableDesks = this.getDesksRenderableData();

    return (
      <div>
        <div>
          <h2>View Date</h2>
          <p>{this.state.viewDate.toString()}</p>
          <div className={classes.ViewAvailCalendar}>
            <Calendar
              onChange={this.onViewAvailCalendarChange}
              value={this.state.viewDate}
            />
          </div>
          <div className={classes.ViewAvailTime}>
            <p>Time: {this.state.viewDate.getHours()}:{this.state.viewDate.getMinutes()}</p>
            <input
              type="range"
              min="0"
              max="1439"
              step="15"
              value={this.state.viewDate.getHours() * 60 + this.state.viewDate.getMinutes()}
              onChange={(evt) => this.onViewAvailTimeChange(evt.target.value)} />
          </div>
        </div>
        {renderableDesks.map(desk => {
          return <Desk
                  key={desk.id}
                  occupied={desk.occupied}
                  name={desk.ownerName}
                  clicked={!this.state.showBooker ? (evt) => this.onDeskClicked(desk.id, evt) : () => {}} />
        })}
        <Modal show={this.state.showBooker} modalClosed={this.onBookerClosed} classes={modalClasses.bookerModal}>
          <Booker
            date={this.state.viewDate}
            deskEditedId={this.state.selectedDeskId}
            deskReservations={this.getDeskBookerData(this.state.selectedDeskId)}
            users={this.state.users}
            updateReservation={this.updateReservation}
            createReservation={this.createReservation} />
        </Modal>
      </div>
    );
  }
}

export default Map;
