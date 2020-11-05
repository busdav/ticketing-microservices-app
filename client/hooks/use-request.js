import axios from "axios";
import { useState } from "react";

export default ({ url, method, body, onSuccess }) => {
  const [errors, setErrors] = useState(null);

  const doRequest = async () => {
    // To capture errors and display them to the user, we're going to wrap this into a try catch statement:
    try {
      // We want to make sure that, e.g. after the first try that generated and displayed errors, these error
      // messages get cleared before a second try, so that they don't keep showing in case of a successful try, without errors.
      setErrors(null);
      // We're looking up the appropriate method for the axios request, with the url and body
      const response = await axios[method](url, body);

      if (onSuccess) {
        onSuccess(response.data);
      }

      return response.data;
    } catch (err) {
      setErrors(
        <div className="alert alert-danger">
          <h4>Ooops....</h4>
          <ul className="my-0">
            {/* 
            We saw that, as expected, when we console.logged the `err.response.data`, we saw the errors array (i.e. the normalized
            response structure) we'd set at the backend. So, we can now
            assign that errors array to the `errors` piece of state, and then use it in our form to display it to the user.
            */}
            {err.response.data.errors.map((err) => (
              <li key={err.message}>{err.message}</li>
            ))}
          </ul>
        </div>
      );
    }
  };

  // The react convention here would be to return an array with the two elements in it, but here we're using an object
  // (seems to make a bit more sense here than to rely on the elements being in a particular order)
  return { doRequest, errors };
};
