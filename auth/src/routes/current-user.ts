import express from "express";
import jwt from "jsonwebtoken";

const router = express.Router();

router.get("/api/users/currentuser", (req, res) => {
  // The below is TS shorthand for `if (!req.session || !req.session.jwt)`. We need the first check in order to "prove" to TS that we're
  // addressing the case where req.session could be `null`.
  if (!req.session?.jwt) {
    return res.send({ currentuser: null });
  }

  const payload = jwt.verify(req.session.jwt, process.env.JWT_KEY!);
});

export { router as currentUserRouter };
