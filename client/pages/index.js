import buildClient from "../api/build-client";

// The argument to this function will be an object that will contain the currentUser object (`data`, see below). So
// we're going to destructure the `currentUser` property from such object.
const LandingPage = ({ currentUser }) => {
  return currentUser ? (
    <h1>You are signed in</h1>
  ) : (
    <h1>You are NOT signed in</h1>
  );
};

// The first argument to this function is usually referred to as `context`.
LandingPage.getInitialProps = async (context) => {
  /*
  Note that `buildClient(context)` just gives returns the pre-configured axios instance, on which we can then chain on the 
  actual request we want to make using axios. 
  */
  const client = buildClient(context);
  const { data } = await client.get("/api/users/currentuser");
  /*
  Given our backend, we expect the `data` property of our `response` object to be an object that has a `currentUser` property
  whose value is either an object or null. So, now that we've returned such object in this getInitialProps,
  we should now have access to `currentUser` (desctructured) as a property to our component, see above.
  We can (as we've done) destructure `response` into `{ data }`, so that we don't need to return `response.data`. 
  */
  return data;
};

export default LandingPage;
