import "bootstrap/dist/css/bootstrap.css";

export default ({ Component, pageProps }) => {
  /* Whenever you try to navigate to some distinct page with next.js, next.js is going to import your component from one of the 
  files in the pages directory. However, Next doesn't just display your component however. Instead, it wraps it up inside 
  its own custom default component (referred to inside of Next as the `_app` component). So, if we had a "banana.js" page inside
  our pages directory, that banana component would be imported and passed into the `_app` component as the 
  `Component` prop above. And `pageProps` are the set of components that we have passed to the banana component. 
  Why do we have to define this i.e. write it out at all? Because we want to import a global CSS file above (bootstrap) 
  into our project, which  we can only do into this `_app.js` file.  
  */
  return <Component {...pageProps} />;
};
