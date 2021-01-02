import express from "express";

import { currentUser } from "@db-udemy-microservices-ticketing/common";

const router = express.Router();

router.get("/api/users/currentuser", currentUser, (req, res) => {
  // We want to send back `null` if the currentUser is not defined, rather than `undefined` -> we make that explicit
  res.send({ currentUser: req.currentUser || null });
});

export { router as currentUserRouter };
