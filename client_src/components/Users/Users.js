import React, { useState, useEffect, useContext, useCallback } from 'react';

import useForm from '../../hooks/Form/useForm';
import GlobalConfigContext from '../../contexts/GlobalConfig/GlobalConfig';
import DeskoApi from '../../API/Desko/Desko';

const initialFormValues = { name: "" };
const commState = {
  default: 0,
  loading: 1,
  error: 2
};

const Users = props => {
  const [users, setUsers] = useState([]);
  const [loadingState, setLoading] = useState(commState.default);

  const onSubmit = (values) => {
    //console.log("Form submitted " + JSON.stringify(values));
    addUser(values.name);
  };

  const { values, handleChange, handleSubmit } =
  useForm({ initialValues: initialFormValues, onSubmit: onSubmit });

  // TODO: move some of this handling/api to an external file
  // TODO: you should be able to generate a client API from a JSON API config
  const refreshUsers = useCallback(() => {
    setLoading(commState.loading);

    DeskoApi.getUsers()
      .then(responseData => {
        setLoading(commState.default);
        setUsers(responseData);
      })
      .catch(err => {
        setLoading(commState.error);
      });
  }, []);

  const deleteUser = (id) => {
    setLoading(commState.loading);

    DeskoApi.deleteUser(id)
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

    DeskoApi.addUser(name)
      .then(response => {
        refreshUsers();
      })
      .catch(err => {
        setLoading(commState.default);
        setLoading(commState.error);
      });
  };

  useEffect(() => {
    // load the users
    refreshUsers();
  }, [refreshUsers]);

  /*
  <input
    type="text"
    value={newUserName}
    onChange={(e) => setNewUserName(e.target.value)} />
  */

  // <Form fields={{ name: { type: "text", value: "" } }}/>
  // <button onClick={() => addUser(newUserName)}>Add User</button>

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
          name="name"
          onChange={handleChange}
          value={values.name} />
        <button onClick={handleSubmit}>Add User</button>
      </div>
      <ul>
        {users.map((user, ind)=> {
          return (
            <li key={ind}>
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
