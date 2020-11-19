import React, { useState } from 'react';

const Input = (props) => {
  const [value, setValue] = useState(props.value);

  return (
    <input
      type={props.type}
      value={value}
      onChange={(e) => { setValue(e.target.value); }} />
  );
};

export default Input;
