const { GetCommand, PutCommand } = require("@aws-sdk/lib-dynamodb");
const { v4: uuidv4 } = require("uuid");
const { docClient, scanAll, tables } = require("../services/dynamoDb");

const defaultPreferences = {
  bedPreference: "King Bed",
  smokingPreference: "Non-Smoking",
  airportPickup: false,
  foodPreference: "Vegetarian"
};

function publicUser(user) {
  if (!user) return null;
  const { password, ...safeUser } = user;
  if (!safeUser.id && safeUser.userId) safeUser.id = safeUser.userId;
  return safeUser;
}

class UserStore {
  constructor(tableName = tables.users) {
    this.tableName = tableName;
  }

  async findAll() {
    const users = await scanAll({
      TableName: this.tableName,
    });
    return users.map(this.#normalizeUser);
  }

  async findById(userId) {
    const result = await docClient.send(
      new GetCommand({
        TableName: this.tableName,
        Key: { userId },
      }),
    );
    return this.#normalizeUser(result.Item);
  }

  async findByEmail(email) {
    const normalizedEmail = email.trim().toLowerCase();
    const users = await scanAll({
      TableName: this.tableName,
      FilterExpression: "#email = :email",
      ExpressionAttributeNames: {
        "#email": "email",
      },
      ExpressionAttributeValues: {
        ":email": normalizedEmail,
      },
    });
    return this.#normalizeUser(users[0]);
  }

  async create(payload) {
    const userId = `USR-${uuidv4().slice(0, 8).toUpperCase()}`;
    const user = {
      userId,
      id: userId,
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

    await docClient.send(
      new PutCommand({
        TableName: this.tableName,
        Item: user,
        ConditionExpression: "attribute_not_exists(userId)",
      }),
    );
    return publicUser(user);
  }

  async update(userId, payload) {
    const existing = await this.findById(userId);
    if (!existing) return null;

    const updated = {
      ...existing,
      userId,
      id: existing.id || userId,
      fullName: payload.fullName?.trim() || existing.fullName,
      phone: payload.phone?.trim() || existing.phone,
      preferences: {
        ...existing.preferences,
        ...(payload.preferences || {})
      },
      updatedAt: new Date().toISOString()
    };

    await docClient.send(
      new PutCommand({
        TableName: this.tableName,
        Item: updated,
      }),
    );
    return publicUser(updated);
  }

  #normalizeUser(user) {
    if (!user) return null;
    return {
      ...user,
      id: user.id || user.userId,
      userId: user.userId || user.id,
    };
  }
}

module.exports = { UserStore, publicUser };
