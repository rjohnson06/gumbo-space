import React, { useState, useEffect } from 'react';
import { DateTime, Interval } from 'luxon';

import Booker from '../Booker/Booker';
import Desk from './Desk/Desk';
import Modal from '../UI/Modal/Modal';
import DeskoApi from '../../API/Desko/Desko';

import classes from './Map.module.css';
import modalClasses from '../UI/Modal/Modal.module.css';

import 'react-calendar/dist/Calendar.css';

// TODO : loading states, etc...
const Map = props => {
  const [selectedDeskId, setSelectedDeskId] = useState(null);
  const [showBooker, setShowBooker] = useState(false);
  const [renderableDesks, setRenderableDesks] = useState([]);
  const [allUsers, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);

  const onDeskClicked = (id, evt) => {
    console.log("desk clicked id " + id);
    setSelectedDeskId(id);
    setShowBooker(true);
  };

  const onBookerClosed = () => {
    setShowBooker(false);
  };

  // desk + occupied, user.name
  const getDesksRenderableData = (users) => {
    return DeskoApi.getDesks()
      .then((desks) => {
        desks.forEach(desk => {
          const matchingUser = users.find(user => user._id === desk.owner);

          desk.ownerName = matchingUser ? matchingUser.name : "";

          desk.reservationIntervals = desk.reservations.map(res => {
            return Interval.fromDateTimes(
              DateTime.fromJSDate(res.startDate),
              DateTime.fromJSDate(res.endDate));
          });

          const viewDateTime = DateTime.fromJSDate(props.viewDate);
          desk.occupied = desk.reservationIntervals
            .filter(interval => interval.contains(viewDateTime))
            .length > 0;
        });

        return desks;
      })
      .catch(error => {
        console.log(error);
        throw new Error("unhandled problem getting desk data");
      });
  };

  const refreshDesks = (users) => {
    getDesksRenderableData(users)
      .then((renderDesks) => {
        setRenderableDesks(renderDesks);
      });
  };

  const refreshUsers = () => {
    return DeskoApi
      .getUsers()
      .then(users => {
        setUsers(users);
        return users;
      });
  };

  useEffect(() => {
    refreshUsers()
      .then(users => {
        refreshDesks(users);
      });
  }, []);

  const handleDeleteClicked = deskId => {
    DeskoApi
      .deleteDesk(deskId)
      .then(() => { refreshDesks(allUsers) });
  };

  const handleAddDesk = () => {
    DeskoApi
      .addDesk(selectedUserId)
      .then(() => { refreshDesks(allUsers) });
  };

  const editUI = (
    <div>
      <label>Add Desk</label>
      <br />
      <label>Owner : </label>
      <select
        value={selectedUserId || "default"}
        onChange={e => setSelectedUserId(e.target.value)}>
        { [<option key="default">-- Please select a user --</option>]
            .concat(allUsers.map((user, ind) => {
              return <option key={user._id} value={user._id}>{user.name}</option>
            }))
        }
      </select>
      <button onClick={handleAddDesk}>Add Desk</button>
    </div>
  );

  return (
    <div>
      { props.showEditUI ?
          editUI :
          null }
      <div className={classes.map}>
      {renderableDesks.map(desk => {
        return (
          <div className={classes.deskContainer} key={desk._id}>
            <Desk
              occupied={desk.occupied}
              name={desk.ownerName}
              clicked=
                {!showBooker ?
                  (evt) => onDeskClicked(desk._id, evt) :
                  () => {}} />
            { props.showEditUI ? <button
              className={classes.deskDeleteButton}
              onClick={() => handleDeleteClicked(desk._id)}>
                X
            </button> : null }
          </div>
        );
      })}
      </div>
      { selectedDeskId !== null ?
        <Modal show={showBooker} modalClosed={onBookerClosed} classes={modalClasses.bookerModal}>
          <Booker
            date={props.viewDate}
            deskEditedId={selectedDeskId} />
        </Modal> :
        null
      }
    </div>
  );
}

export default Map;
