import React, { useState, useEffect } from 'react';

const Users = props => {
  const commState = {
    default: 0,
    loading: 1,
    error: 2
  };

  const [users, setUsers] = useState([]);
  const [loadingState, setLoading] = useState(commState.default);
  const [newUserName, setNewUserName] = useState("");

  useEffect(() => {
    // load the users
    refreshUsers();
  }, []);

  const refreshUsers = () => {
    setLoading(commState.loading);

    fetch("/api/users")
      .then(response => response.json())
      .then(responseData => {
        setLoading(commState.default);
        setUsers(responseData);
      })
      .catch(err => {
        setLoading(commState.error);
      });
  };

  const deleteUser = (id) => {
    setLoading(commState.loading);

    fetch("/api/user/" + id, { method: "DELETE" })
      .then(response => response.json())
      .then(response => {
        refreshUsers();
      })
      .catch(err => {
        setLoading(commState.default);
        setLoading(commState.error);
      });
  };

  const addUser = (name) => {
    setLoading(commState.loading);

    fetch(
      "/api/user",
      {
        method: "POST",
        mode: "cors",
        body: JSON.stringify({ name: name }),
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
      })
      .then(response => response.json())
      .then(response => {
        refreshUsers();
      })
      .catch(err => {
        setLoading(commState.default);
        setLoading(commState.error);
      });
  }

  return (
    <div>
      <h1>Users</h1>
      <div>
        {
          (() => {
              switch(loadingState) {
                case commState.loading:
                  return "Loading";
                case commState.error:
                  return "Error";
                default:
                  return ""
              }
            }
          )()
        }
      </div>
      <div>
        Name:
        <input
          type="text"
          value={newUserName}
          onChange={(e) => setNewUserName(e.target.value)} />
        <button onClick={() => addUser(newUserName)}>Add User</button>
      </div>
      <ul>
        {users.map(user => {
          return (
            <li>
              {user.name}
              <button onClick={() => deleteUser(user._id)}>Delete</button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Users;
