import React, { useState } from 'react';
import _ from 'lodash';

const Form = (props) => {
  // we want this to update when the props.fields changes
  // we want this to update when one of the field values changes (2 way binding)

  console.log("Form rendered");

  const [formFields, setFormFields] = useState(props.fields);

  const formFieldChanged = (e, key) => {
    const newFormFields = { ...formFields };
    newFormFields[key] = { ...newFormFields[key] };

    console.log("formFieldChanged " + JSON.stringify(newFormFields));

    newFormFields[key].value = e.target.value;

    // TODO : check validity

    setFormFields(newFormFields);
  };

  return (
    <form>
      {
        Object
          .entries(formFields)
          .map(([key, field]) => {
            return (
              <input
                key={key}
                type={field.type}
                value={field.value}
                onChange={(e) => formFieldChanged(e, key)} />
            );
          })
      }
    </form>
  );
};

export default Form;
