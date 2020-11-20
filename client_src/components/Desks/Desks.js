import React from 'react';

import Map from '../Map/Map';
import DeskoApi from '../../API/Desko/Desko';

// TODO : implement 
const desks = props => {
  const handleDeleteClicked = deskId => {
    DeskoApi
      .deleteDesk(deskId)
      .then(() => { refreshDesks() });
  };

  return (
    <Map showEditUI={true} handleDeleteClicked={handleDeleteClicked} />
  );
};
