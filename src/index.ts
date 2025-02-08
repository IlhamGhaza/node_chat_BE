import express, { Request, Response } from "express";
import { json } from "body-parser";
import authRoutes from "./routes/authRoutes";

const app = express();
const host = "192.168.1.11";
const port = parseInt(process.env.PORT ?? '6000', 10);

app.use(json());

// uncomment this to test the server
// app.get("/", (req: Request, res: Response) => {
//     console.log("Hello World!");
//     res.send("yes it works");
// });

app.use("/auth", authRoutes);

app.listen(port, host, () => {
    console.log(`Server is running on ${host}:${port}`);
});