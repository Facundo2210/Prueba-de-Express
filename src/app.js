const express = require("express");
const server = express();

server.use(express.json());
const model = {
  clients: {},
  reset: () => (model.clients = {}),

  /*   addAppointment: (name, object) => {
    let clients = model.clients;
    let asiggn = { ...object, status: "pending" };

    clients.hasOwnProperty(name)
      ? clients[name].push(asiggn)
      : { ...clients, ...(clients[name] = [asiggn]) };
  }, */

  addAppointment(name, objeto) {
    !model.clients[name] && (model.clients[name] = []);
    objeto.status = "pending";
    model.clients[name].push(objeto);
  },

  attend: (name, dato) =>
    (model.clients[name] = model.clients[name].map((e) =>
      e.date === dato ? { ...e, status: "attended" } : e
    )),
  expire: (name, dato) =>
    (model.clients[name] = model.clients[name].map((e) =>
      e.date === dato ? { ...e, status: "expired" } : e
    )),
  cancel: (name, dato) =>
    (model.clients[name] = model.clients[name].map((e) =>
      e.date === dato ? { ...e, status: "cancelled" } : e
    )),
  erase: (name, date) => {
    date === "attended" || date === "cancelled" || date === "expired"
      ? (model.clients[name] = model.clients[name].filter(
          (e) => e.status !== date
        ))
      : (model.clients[name] = model.clients[name].filter(
          (e) => e.date !== date
        ));
  },
  getAppointments: (name, statu) =>
    statu !== undefined
      ? model.clients[name].filter((e) => e.status === statu)
      : model.clients[name],
  /*   addAppointment: (name, object) => {
    let clients = model.clients;
    let asiggn = { ...object, status: "pending" };

    clients.hasOwnProperty(name)
      ? clients[name].push(asiggn)
      : { ...clients, ...(clients[name] = [asiggn]) };
  }, */

  getClients: () => Object.keys(model.clients),
};

server.get("/api", (req, res) => res.json(model.clients));

server.post("/api/Appointments", (req, res) => {
  const { appointment, client } = req.body;
  if (!client) {
    return res.status(400).send("the body must have a client property");
  }
  if (typeof client !== "string") {
    return res.status(400).send("client must be a string");
  }
  model.addAppointment(client, appointment);
  let post = model.getAppointments(client, "pending");
  res.send(post[post.length - 1]);
});

/* server.post("/api/Appointments", (req, res) => {
  const { appointment, client } = req.body;
  !client
    ? res.status(400).send("the body must have a client property")
    : typeof client !== "string"
    ? res.status(400).send("client must be a string")
    : model.addAppointment(client, appointment),
    res .send({ date: appointment.date, status: "pending" });
}); */

server.get("/api/Appointments/:name", (req, res) => {
  const { name } = req.params;
  const { date, option } = req.query;
  let sust = model.clients[name];
  let finded = sust && sust.find((e) => e.date === date);

  if (name === "clients") {
    return res.send(model.getClients());
  }

  if (!sust) {
    return res.status(400).send("the client does not exist");
  }

  if (!finded) {
    return res
      .status(400)
      .send("the client does not have a appointment for that date");
  }
  if (option === "attend") {
    return res.send(model.attend(name, date));
  }
  if (option === "expire") {
    return res.send(model.expire(name, date));
    //return res .send(model.clients[name]);
  }
  if (option === "cancel") {
    model.cancel(name, date);
    const findedCancel = model.clients[name].find((e) => e.date === date);
    return res.send(findedCancel);
  }
  if (option !== "attend" || option !== "cancel" || option !== "expire") {
    return res.status(400).send("the option must be attend, expire or cancel");
  }

  res.status(400).send("the client does not exist");
});

server.get("/api/Appointments/:name/erase", (req, res) => {
  const { name } = req.params;
  const { date } = req.query;

  if (!model.clients[name]) {
    return res.status(400).send("the client does not exist");
  }

  res.send(model.getAppointments(name, date));
  model.erase(name, date);
});

server.get("/api/Appointments/getAppointments/:name", (req, res) => {
  const { name } = req.params;
  const { status } = req.query;

  return res.send(model.getAppointments(name, status));
});

server.listen();
module.exports = { model, server };
