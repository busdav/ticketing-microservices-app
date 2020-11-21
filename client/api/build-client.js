import axios from "axios";

export default ({ req }) => {
  /* 
  With this helper function, we want to create and return a pre-configured axios client that 'just works', 
  no matter which environment we're in, i.e., whether on the server or in the browser. (see background on this below)
  The returned axios client will have some baseURL/domain wired up to it, and it will also have some headers wired up to it as well.
  How can we figure out whether we're in the browser or the server? ->  `window` is an object
  that only exist in the browser. It does not exist in the Node.js environment.
  */
  if (typeof window === "undefined") {
    // we are on the server - requests should be made to http://ingress-nginx-controller.ingress-nginx.svc.cluster.local,
    // in order to reach the Ingress Nginx load balancer, where we want the request to go to
    return axios.create({
      baseURL:
        "http://ingress-nginx-controller.ingress-nginx.svc.cluster.local",
      headers: req.headers,
    });
  } else {
    // We are on the browser - requests can be made with a base url of '' in order to reach the Ingress Nginx load balancer
    // Also, cookies will be managed and therefore appended by the browser automatically.
    return axios.create({
      // We could probably even leave out the line below
      baseURL: "/",
    });
  }
};

/*
Background on why we needed to create this helper function and configure axios for different environments: 

`getInitialProps` (in our index.js) is specific to Next.js. If we decide to implement it, then Next.js is going to call 
this function while it is attemptig to render our initial application on the server. 
So, getInitialProps is our opportunity to fetch some data that
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

Now, if we simply call `("/api/users/currentuser")` in getInitialProps, we will run into a 404 in some cases. Why? 

Background:
If our browser makes a GET request to ticketing.dev, then such request, through the networking layer on our machine, 
i.e. the config in our `/etc/hosts` file, gets forwarded to localhost, i.e. 127.0.0.1 
(or, if we're using the GKE to run our cluster, to the IP address of the GKE cluster, see notes in ingress-srv.yaml). 
As we are not specifying a particular port, the default port (port 80) will be used, so request will be forwarded to 127.0.0.1:80
(or something like 35.187.162.139:80).
And that port in turn has been bound to by Ingress Nginx, probably also by default and because we haven't specified anything else. 
So, `ticketing.dev' will be forwarded to the Ingress Nginx load balancer, where we want it to be. 

Now, if - still from the browser - either the user makes a request, 
or our React.js (i.e. Next.js) app (via Axios) makes an AJAX request,   
to simply `/api/users/currentuser', i.e. without domain, 
then our browser will assume that such request is on the current domain, so will automatically prepend 
`ticketing.dev` in this case, and the request will be forwarded again to the Ingress Nginx load balancer, where we want it to be. 
(Use case: an AJAX request will be made from the browser if it is made from within a COMPONENT. But also getInitialProps will run
in the browser in certain circumstances, see below.)

Now, if our React app (via Axios) makes the same request from the SERVER, then things don't work anymore. Why? 

Firstly, when would it happen that the React app (via Axios) makes a request to `/api/users/currentuser' from the server?

Background: 
If our browser makes a GET request to `ticketing.dev/`, Ingress Nginx will take a look, 
see that we haven't specified a path, and - based on the configuration we've set in ingress-srv.yaml - will forward the request to our 
default route handler, which is our `client` microservice (see ingress-srv.yaml: `- path: /?(.*)` goes to `client-srv`). 
So, that request is then handled inside of Next.js. 

Next.js will then take a look, doesn't see any path, and therefore decides to show our root route, i.e. the index.js file. 
Inside of index.js is our LandingPage component, and inside there we have the getInitialProps, which is a component's function that 
Next.js will call whenever it is rendering that component on the server. (So, this function is NOT INSIDE a component. 
It is purely run on the server, during server side rendering SSR.)
Inside getInitialProps we had initially specified that Axios will make an AJAX request to JUST `/api/users/currentuser`, without domain. 
That AJAX request will then again go into some networking layer - an HTTP layer implemented by Node. 
Node's HTTP layer works similarly to the browser: if you don't specify a domain, then Node is going to assume 
that you're trying to make a request on your local machine, so will automatically prepend 127.0.0.1:80, i.e. the localhost domain. 

Now, because our React/Next.js app is running inside a CONTAINER in a k8s pod, i.e., in its own little world, the localhost domain
was NOT reaching localhost on our machine - instead, it went to port 80 INSIDE of the container. It did NOT somehow get routed to
Ingress Nginx. But right now, there is nothing running on port 80 inside of that container. 
That's why we got an ECONNREFUSED 127.0.0.1:80, which is referring to localhost INSIDE the container. 

Accordingly, we're configuring Axios such that if a request is made from inside the browser, then no specific domain i.e. baseURL 
needs to be prepended. However, if request is made from Next.js during SSR, then reach out directly to ingress-nginx. 
More specifically, anytime our Next.js app needs to fetch data from a microservice inside of our k8s cluster, and such 
fetching is to happen from the server rather than the browser, then Next.js should reach out to Ingress Nginx, which is 
already running inside of the cluster. Ingress Nginx can then figure out where to send this request off to, based upon 
JUST THE PATH by itself, because it already has set up the relevant rules, see ingress-srv.yaml. 

(You could alternatively say, directly to the auth service - remember that we set up a k8s ClusterIP for all of our pods,
so inside the cluster (and INSIDE THE SAME NAMESPACE), we can simply prepend the name of the clusterIP service as the domain, 
which will give you access to the respective pod. However, this would mean that React app has to know the name of 
all of the microservices it may ever want to reach out to, which is less scalable. 
Ingress-nginx on the other hand has all the different routes already configured.

How to reach out to Ingress Nginx from WITHIN the cluster?
Note that you can only access another ClusterIP Service by its name (e.g. `http://auth-srv`) WITHIN THE SAME NAMESPACE. 
There is the 'default' namespace where most pods are, but Ingress Nginx is created in the `ingress-nginx` namespace. 
(see `kubectl get namespace`). 
To do cross namespace communication, we use the following pattern: `http://NAMEOFSERVICE.NAMESPACE.svc.cluster.local`
To get the services that are running in the default namespace, you do `kubectl get services`. Now, to get the name of 
the specific service running in a different namespace, do `kubectl get services -n NAMESPACENAME`.
(You could simplify by using an External Name Service, which will essentially map a simple request like 
`http://ingress-nginx-controller` to `http://ingress-nginx-controller.ingress-nginx.svc.cluster.local`. 

So, since getInitialProps can be executed on the server OR IN THE BROWSER, 
we need to figure out what our env is so we can use the correct domain. 
When is getInitialProps executed on the server? 
Hard refresh of page, clicking link from different domain, typing URL into address bar.
When is getInitialProps executed in the browser? 
Navigating from one page to another while in the app. 

We can test the above out by putting `console.log("SERVER")` before the return statement of the function that's run
on the server, and `console.log("BROWSER")` before the return statement of the function that's run in the browser. 
Note that any console.logs of a function run on the server will of course show in the Terminal (i.e. the server-side console), 
and NOT in the browser console, as it wasn't run in the browser. If it is a function run by the client app (here, Next.js), 
on the server, then it will be preceded in the Terminaly by `[client]`. 
Any console.logs of a function run in the browser will show in the browser console and NOT in the Terminal, as it wasn't 
run on the server.  
During Next.js server side rendering, the component will be built and then sent as HTML. 
Therefore, any console.log in the component will first be shown in the Terminal and then also in the browser console
(I believe). 

Now, when the SERVER makes a request to one of the microservices (i.e. when a function that runs on the server 
makes an AJAX request), we need to manually make sure that the cookie containing the JWT that got sent with 
the original request from the browser gets appended to the AJAX request (because unlike our browser, 
axios doesn't manage cookies and append them to our follow-up requests automatically). 
In order to pass along the cookie: 
Whenever getInitialProps is called on the server, first argument to the function is an object that has a couple of different
properties. One of them is the request object `req`, similar to Express app. I.e., this is the incoming request, 
i.e. the request that came from the browser to index.js and its `getInitialProps`, from where we now make an axios request. 
The req object of course has the cookie as a property, and also the host. So, we can  simply pass along all the headers of 
the req object along with the axios request, and we should pass along the cookie and even specify the host (which we must
here, given that the `http://ingress-nginx-controller.ingress-nginx.svc.cluster.local` isn't a host that the Ingress
controller will recognize, see ingress.srv.yaml. 
*/
