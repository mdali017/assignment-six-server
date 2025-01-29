import express, { Application, Request, Response } from "express";
import cors from "cors";
import router from "./app/routes";
import notFoundRoute from "./app/utils/notFoundRoutes";
import globalErrorHandler from "./app/utils/globalErrorHandler";

const app: Application = express();

app.use(express.json());
app.use(cors());

app.use("/api/v1", router);

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    status: 200,
    message: "Assignment Six Server is running successfully",
  });
});

app.use(notFoundRoute);
app.use(globalErrorHandler);

export default app;
