import { useState, useEffect } from 'react';

const useForm = ({ initialValues, onSubmit }) => {
  const [values, setValues] = useState(initialValues);

  // the dependencies are compared by reference
  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

  const handleChange = (e) => {
    const { target } = e;
    const { value, name } = target;

    setValues({ ...values, [name]: value });
  };

  const handleSubmit = () => {
    onSubmit(values);
  };

  return {
    values,
    handleChange,
    handleSubmit
  };
};

export default useForm;
