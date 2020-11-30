import "bootstrap/dist/css/bootstrap.css";
import buildClient from "../api/build-client";
import Header from "../components/header";

const AppComponent = ({ Component, pageProps, currentUser }) => {
  /* 
  Whenever you try to navigate to some distinct page with Next.js, Next.js is going to import your component from one of the 
  files in the pages directory. However, Next doesn't just display your component however. Instead, it wraps it up inside 
  its own custom default component (referred to inside of Next as the `_app` component). So, if we had a "banana.js" page inside
  our pages directory, that banana component would be imported and passed into the `_app` component as the 
  `Component` prop above. And `pageProps` are the set of components that we have passed to the banana component. 
  Why do we have to define this i.e. write it out at all? Because we want to import a global CSS file above (bootstrap) 
  into our project, which  we can only do into this `_app.js` file.
  However, there are more reasons: we can also use this _app.js to add elements that are visible on EVERY page, such as, 
  for instance, a header. 
  Note that initially we just directly exported this as a function by saying `export default ({ Component, pageProps }) => {`, 
  but we then replaced it with `const AppComponent = ({ Component, pageProps }) => {`, because we no longer wanted to directly
  export just one function - instead we wanted to define the `getInitialProps` function on it. Why did we want to do so? 
  Because several page components below _app.js need to know who the currentUser is, so we moved that call up to _app.js rather 
  than having it in several places at the level of individual components. However, we can ALSO have a getInitialProps on 
  the component level, in addition. 
  However, note that in such case, the getInitialProps functions of the page components are *no longer invoked automatically*. 
  Therefore, we have to manually invoke them. For that, see below: we invoke them here on _app.js and then pass on the data that 
  is returned down to the page components. We have acecss to the component that we're trying to render with AppComponent 
  through appContext.Component (see a console.log of appContext), and therefore can call its getInitialProps, to which again 
  we have to pass the context of the component we're trying to render within _app.js. 
  With that solution, we fetch data that is common for EVERY singly page inside the _app.js getInitialProps, and we fetch 
  data that the page that _app.js is actually trying to render needs. 
  */
  return (
    <div>
      <Header currentUser={currentUser} />
      <Component {...pageProps} />;
    </div>
  );
};

/* 
Note that the first argument (`context`) of getInitialProps on this wrapper Custom App Component in this _app.js file 
is DIFFERENT from the `context` that you have on a getInitialProps in one of the PAGE Components. In a page component,
the `context` has { req, res }, but in this 
AppComponent, the `context` is nested more deeply: `context === { Component, ctx: { req, res } }
That's why here in this Custom App Component, we have to call `buildClient(appContext.ctx)`, rather than just simply 
`buildClient(context)`. (it is the `req` that we are essentially interested in). 
Below, we're calling the getInitialProps of _app.js (see comments above), for data that the entire app needs to have.
*/
AppComponent.getInitialProps = async (appContext) => {
  const client = buildClient(appContext.ctx);
  const { data } = await client.get("/api/users/currentuser");

  // Here, we are calling the getInitialProps of the page that we're trying to render inside _app.js (see comments above).
  // We need to cover for the case where `getInitialProps` is not present and therefore undefined on a Component:
  let pageProps = {};
  if (appContext.Component.getInitialProps) {
    pageProps = await appContext.Component.getInitialProps(appContext.ctx);
  }

  return {
    pageProps,
    // the below in this case essentially equates `currentUser: data.currentUser`:
    ...data,
  };
};

export default AppComponent;
