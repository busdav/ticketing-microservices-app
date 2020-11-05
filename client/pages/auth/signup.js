// Next.js: by creating a folder `auth` and a file `signup.js`, Next is going to create a route `auth/signup`
// inside of our application. Now, all we have to do is define and export a react component from this file.
import { useState } from "react";
import Router from "next/router";
import useRequest from "../../hooks/use-request";

export default () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // We want to make use of useRequest now - remember that when we call it, we will get back an object with the elements
  // `doRequest` and `errors`:
  const { doRequest, errors } = useRequest({
    url: "/api/users/signup",
    method: "post",
    body: {
      email,
      password,
    },
    // `onSuccess` is an additional argument we've defined in our useRequest hook.
    // It is a callback that shall be invoked anytime a request is made successfully.
    onSuccess: () => Router.push("/"),
  });

  const onSubmit = async (event) => {
    // We want to make sure that the form does not try to submit itself through the browser (with reload)
    event.preventDefault();

    await doRequest();
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
      {errors}
      <button className="btn btn-primary">Sign Up</button>
    </form>
  );
};
