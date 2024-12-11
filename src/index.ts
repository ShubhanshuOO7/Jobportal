import express from "express";
import { userRouter } from "./routes/user";
const app = express();
app.use("/api/v1/user",userRouter);
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`server is running on http://localhost:${PORT}`);
});