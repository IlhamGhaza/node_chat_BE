import express, { Request, Response } from "express";
import { json } from "body-parser";
import http from "http";
import { Server } from "socket.io";
import authRoutes from "./routes/authRoutes";
import conversationRoutes from "./routes/conversationRoutes"
import messageRoutes from "./routes/messageRoutes";
import { saveMessage } from "./controllers/messageContrroller";
import contactRoutes from "./routes/contactRoutes";
import userRoutes from "./routes/userRoutes";

const app = express();
const host = "0.0.0.0";
const port = parseInt(process.env.PORT ?? '6000', 10);
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
        // methods: ["GET", "POST"],
    },
});
app.use(json());

// TODO : uncomment this to test the server
app.get("/", (req: Request, res: Response) => {
    console.log("Hello World!");
    res.send("yes it works");
});

app.use("/auth", authRoutes);
app.use('/conversations', conversationRoutes);
app.use('/messages', messageRoutes);
app.use("/contacts", contactRoutes);
app.use('/uploads', express.static('public/uploads'));
app.use("/user", userRoutes);


io.on("connection", (socket) => {
    console.log("A user connected", socket.id);
    socket.on('joinConversation', (conversationId: string) => {
        socket.join(conversationId);
        console.log("User joined conversation", conversationId);
    });
    //send message
    socket.on(
        "sendMessage",
        (message) =>
            async (conversationId: string, senderId: string, content: string) => {
                try {
                    const savedMessage = await saveMessage(conversationId, senderId, content);
                    console.log("Saved message:", savedMessage);
                    io.to(conversationId).emit("newMessage", savedMessage);
                } catch (error) {
                    console.error("Error sending message:", error);
                }
            });
    socket.on("disconnect", () => {
        console.log("A user disconnected", socket.id);
    });
});

server.listen(port, host, () => {
    console.log(`Server is running on ${host}:${port}`);
});