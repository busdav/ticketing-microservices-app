/* 
This file is loaded up automatically whenever Next.js starts our app. We are changing a config option with the below, essentially
telling Next.js to poll all files within our project directory once every 300 ms, rather than attempting "upon changes". Reason: 
Next.js is a bit finnicky when running inside a container, and auto-updated are not always working right. 
Btw, because this is a "synced" file for skaffold (see skaffold config file - for client, all js files are synced), 
skaffold takes it and sticks it directly into the running container. However, Next server itself is, I think, 
only watching the PAGES directory for changes to restart itself / hot reload (at least it is not watching the top level
where we put this next.config.js file). That means that we have to manually kill the running client pod so that 
skaffold will then automatically restart it. 
*/
module.exports = {
  webpackDevMiddleware: (config) => {
    config.watchOptions.poll = 300;
    return config;
  },
};
