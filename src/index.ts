import express, { Request, Response } from "express";
import { json } from "body-parser";
import authRoutes from "./routes/authRoutes";

const app = express();

app.use(json());

// uncomment this to test the server
// app.get("/", (req: Request, res: Response) => {
//     console.log("Hello World!");
//     res.send("yes it works");
// });

app.use("/auth", authRoutes);

const port = process.env.PORT ?? 6000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});