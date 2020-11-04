// Next.js: by creating a folder `auth` and a file `signup.js`, Next is going to create a route `auth/signup`
// inside of our application. Now, all we have to do is define and export a react component from this file.
import { useState } from "react";
import axios from "axios";

export default () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState([]);

  const onSubmit = async (event) => {
    // We want to make sure that the form does not try to submit itself through the browser (with reload)
    event.preventDefault();

    // To capture errors and display them to the user, we're going to wrap this into a try catch statement:
    try {
      const response = await axios.post("/api/users/signup", {
        email,
        password,
      });
      console.log(response.data);
    } catch (err) {
      // We saw that, as expected, when we console.logged the `err.response.data`, we saw an errors array. So, we can now
      // assign that errors array to the `errors` piece of state, and then use it in our form to display it to the user.
      setErrors(err.response.data.errors);
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <h1>Sign Up</h1>
      <div className="form-group">
        <label>Email Address</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="form-control"
        />
      </div>
      <div className="form-group">
        <label>Password</label>
        {/* By making it of type `password`, we obfuscate any text that gets typed there */}
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          className="form-control"
        />
      </div>
      {errors.length > 0 && (
        <div className="alert alert-danger">
          <h4>Ooops....</h4>
          <ul className="my-0">
            {errors.map((err) => (
              <li key={err.message}>{err.message}</li>
            ))}
          </ul>
        </div>
      )}
      <button className="btn btn-primary">Sign Up</button>
    </form>
  );
};
