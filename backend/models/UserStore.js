const fs = require("fs/promises");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const DATA_FILE = path.join(__dirname, "..", "data", "users.json");

const defaultPreferences = {
  bedPreference: "King Bed",
  smokingPreference: "Non-Smoking",
  airportPickup: false,
  foodPreference: "Vegetarian"
};

function publicUser(user) {
  if (!user) return null;
  const { password, ...safeUser } = user;
  return safeUser;
}

class UserStore {
  constructor(filePath = DATA_FILE) {
    this.filePath = filePath;
  }

  async findAll() {
    return this.#read();
  }

  async findById(userId) {
    const users = await this.#read();
    return users.find((user) => user.id === userId);
  }

  async findByEmail(email) {
    const users = await this.#read();
    return users.find((user) => user.email.toLowerCase() === email.toLowerCase());
  }

  async create(payload) {
    const users = await this.#read();
    const user = {
      id: `USR-${uuidv4().slice(0, 8).toUpperCase()}`,
      fullName: payload.fullName.trim(),
      email: payload.email.trim().toLowerCase(),
      phone: payload.phone.trim(),
      password: payload.password,
      preferences: {
        ...defaultPreferences,
        ...(payload.preferences || {})
      },
      createdAt: new Date().toISOString()
    };

    users.unshift(user);
    await this.#write(users);
    return publicUser(user);
  }

  async update(userId, payload) {
    const users = await this.#read();
    const index = users.findIndex((user) => user.id === userId);
    if (index === -1) return null;

    users[index] = {
      ...users[index],
      fullName: payload.fullName?.trim() || users[index].fullName,
      phone: payload.phone?.trim() || users[index].phone,
      preferences: {
        ...users[index].preferences,
        ...(payload.preferences || {})
      },
      updatedAt: new Date().toISOString()
    };

    await this.#write(users);
    return publicUser(users[index]);
  }

  async #read() {
    try {
      const content = await fs.readFile(this.filePath, "utf8");
      return JSON.parse(content);
    } catch (error) {
      if (error.code === "ENOENT") return [];
      throw error;
    }
  }

  async #write(users) {
    await fs.writeFile(this.filePath, JSON.stringify(users, null, 2));
  }
}

module.exports = { UserStore, publicUser };
