/* 
This file is loaded up automatically whenever next.js starts our app. We are changing a config option with the below, essentially
telling next.JS to poll all files within our project directory once every 300 ms, rather than attempting "upon changes". Reason: 
Next.js is a bit finnicky when running inside a container, and auto-updated are not always working right. 
*/
module.exports = {
  webpackDevMiddleware: (config) => {
    config.watchOptions.poll = 300;
    return config;
  },
};
