import express from "express";

const router = express.Router();

router.post("/api/users/signout", (req, res) => {
  /*
  What does it mean to sign out a user? Essentially, the response will include a header that will tell the browser to dump all 
  the information in the cookie, which will of course remove the JWT. 
  cookie-session documentation tells us that to destroy a session, we just do `req.session = null`. And, of course we
  still have to send back a response, so we just send back an empty object. 
  */
  req.session = null;
  res.send({});
});

export { router as signoutRouter };
