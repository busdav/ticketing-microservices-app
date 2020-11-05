import axios from "axios";

const LandingPage = ({ color }) => {
  console.log("I am in the component", color);
  return <h1>Landing page</h1>;
};

/*
`getInitialProps` is specific to NextJS. If we decide to implement it, then Next.js is going to call this function while it
is attemptig to render our initial application on the server. So, getInitialProps is our opportunity to fetch some data that
this component needs during this server side rendering process. Any data returned from getInitialProps, usually an object, 
is going to be provided to our component as a prop, and so, we can access it from within the component.
(We could not do it DIRECTLY from within the component during initial rendering; only subsequently.)
Next.js is then going to assemble HTML from all components, and send back the response. 
Note that all of our components are rendered just one single time. So we cannot make a request and wait for a response 
and possibly update some state. Instead, each of our components during server side rendering SSR are 
just rendered once, we take the result, and that's what's going to be sent to the user. 
So, getInitialProps allows us to get some data for the initial rendering of our app. 
Note 2: getInitialProps is a plain function, NOT A COMPONENT. That's why we cannot use the `useRequest` hook we made, 
because hooks are used only within components. 
*/
LandingPage.getInitialProps = () => {
  console.log("I am on the server");

  return { color: "red" };
};

export default LandingPage;
