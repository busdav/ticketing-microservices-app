import express from "express";
import jwt from "jsonwebtoken";

const router = express.Router();

router.get("/api/users/currentuser", (req, res) => {
  /*
  The below is TS shorthand for `if (!req.session || !req.session.jwt)`. We need the first check in order to "prove" to TS that we're
  addressing the case where req.session could be `null`. So, this if statement says "If there is no req.session object, OR, 
  if there is one but the `jwt` property is not defined, then...".
  */
  if (!req.session?.jwt) {
    return res.send({ currentuser: null });
  }

  // If someone has altered the JWT, then `jwt.verify` will throw an error. We need to make sure to capture that error.
  // -> try/catch
  try {
    const payload = jwt.verify(req.session.jwt, process.env.JWT_KEY!);
    res.send({ currentUser: payload });
  } catch (err) {
    res.send({ currentuser: null });
  }
});

export { router as currentUserRouter };
