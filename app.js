const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const defaultRoom = "defaultRoom";

function log(mssg) {
  console.debug(new Date(), "DEBUG", JSON.stringify(mssg));
}

app.get("/", (req, res) => {
  res.json({ message: "server is running..." });
});

io.on("connection", (socket) => {
  log(`a cient connected: ${socket.id}`);
  // join the client to default room when connected
  socket.join(defaultRoom, () => {
    log("user join to default room");
    io.to(defaultRoom).emit("a new user has joined the room");
  });
  // when client send message to the group
  socket.on("message", (mssg) => {
    log(`event message : ${mssg}`);
    io.to(defaultRoom).emit("message", { ...mssg, date: Date.now() });
  });
  // when client send private message
  socket.on("pm", (recepient) => {
    log(`event pm : ${recepient}`);
    const mssg = { ...recepient, date: Date.now() };
    socket.to(recepient.socketID).emit("pm", mssg);
    socket.emit("pm", mssg);
  });

  socket.on("disconnect", (reason) => {
    log(`a client disconnected ${reason}`);
  });
});

http.listen(4000, (error) => {
  if (error) log(`ERROR: ${error}`);
  else log(`server listening on *:${4000}`);
});
