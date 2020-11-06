const User = require("../models/user");

class UserController {
  static async addUser(name) {
    const user = new User();
    user.name = name;

    return await user.save()
  }

  static async getUsers() {
    return await User.find();
  }

  static async deleteUsers(id) {
    return await User.deleteOne({ _id: id });
  }
}
