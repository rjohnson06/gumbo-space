// TODO : how do we test this?
class Desko {
  // TODO : what's a good way of getting an environment variable into here?
  static #apiUrl = "http://localhost:3000";

  static async getUsers() {
    return fetch(Desko.#apiUrl + "/api/users")
      .then(response => response.json());
  }

  static async deleteUser(id) {
    return fetch(Desko.#apiUrl + "/api/user/" + id, { method: "DELETE" })
      .then(response => response.json());
  }

  static async addUser (name) {
    return fetch(
      Desko.#apiUrl + "/api/user",
      {
        method: "POST",
        mode: "cors",
        body: JSON.stringify({ name: name }),
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
      })
      .then(response => response.json());
  }

  static async getDesks() {
    return fetch(Desko.#apiUrl + "/api/desks")
      .then(response => response.json())
      .then(response => {
        response.forEach(desk => {
          desk.reservations = desk.reservations.map(res => {
            return {
              ...res,
              startDate: new Date(Date.parse(res.startDate)),
              endDate: new Date(Date.parse(res.endDate))
            }
          });
        });

        return response;
      });
  }

  static deskORM(desk) {
    desk.reservations = desk.reservations.map(res => {
      return {
        ...res,
        startDate: new Date(Date.parse(res.startDate)),
        endDate: new Date(Date.parse(res.endDate))
      }
    });

    return desk;
  }

  static async getDesk(id) {
    return fetch(Desko.#apiUrl + "/api/desk/" + id)
      .then(response => response.json())
      .then(response => {
        if (response.length === 0) {
          return null;
        }

        const desk = response[0];

        return Desko.deskORM(desk);
      });
  }

  static async addDesk(ownerId) {
    return fetch(
      Desko.#apiUrl + "/api/desk",
      {
        method: "POST",
        mode: "cors",
        body: JSON.stringify({ owner: ownerId }),
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
      })
      .then(response => response.json());
  }

  static async updateDesk({ deskId, ownerId }) {
    return fetch(
      Desko.#apiUrl + "/api/desk" + deskId,
      {
        method: "PUT",
        mode: "cors",
        body: JSON.stringify({ owner: ownerId }),
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
      })
      .then(response => response.json());
  }

  static async deleteDesk(id) {
    return fetch(Desko.#apiUrl + "/api/desk/" + id, { method: "DELETE" })
      .then(response => response.json());
  }

  static async addDeskReservation({ deskId, userId, startDate, endDate }) {
    return fetch(
      Desko.#apiUrl + `/api/desk/${deskId}/reservation`,
      {
        method: "POST",
        mode: "cors",
        body: JSON.stringify({ userId, startDate, endDate }),
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
      })
      .then(response => response.json());
  }

  static async updateDeskReservation({
    deskId, resId, userId, startDate, endDate
  }) {
    return fetch(
      Desko.#apiUrl + `/api/desk/${deskId}/reservation/${resId}`,
      {
        method: "PUT",
        mode: "cors",
        body: JSON.stringify({ userId, startDate, endDate }),
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
      })
      .then(response => response.json());
  }

  static async deleteDeskReservation({ deskId, resId }) {
    return fetch(
      Desko.#apiUrl + `/api/desk/${deskId}/reservation/${resId}`, { method: "DELETE" })
      .then(response => response.json());
  }

  // "extra" methods, not 1-1 with the REST API
  static async getFlatDeskData(deskId) {
    return Promise.all([
        fetch(Desko.#apiUrl + "/api/desk/" + deskId)
          .then(response => response.json()),
        Desko.getUsers()
      ])
      .then(([desks, users]) => {
        const desk = desks[0];

        if (desks.length === 0) {
          return null;
        }

        const matchingUser = users.find(user => desk.owner === user._id);
        desk.userName = matchingUser ? matchingUser.name : null;

        desk.reservations.forEach(res => {
          const user = users.find(user => res.userId === user._id);
          res.userName = user ? user.name : null;
        });

        return Desko.deskORM(desk);
      });
  }
}

export default Desko;
