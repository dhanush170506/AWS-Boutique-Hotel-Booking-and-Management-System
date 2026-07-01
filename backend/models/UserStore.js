const {
  GetCommand,
  PutCommand,
  DeleteCommand,
} = require("@aws-sdk/lib-dynamodb");
const { v4: uuidv4 } = require("uuid");
const { docClient, scanAll, tables } = require("../services/dynamoDb");

const defaultPreferences = {
  bedPreference: "King Bed",
  smokingPreference: "Non-Smoking",
  airportPickup: false,
  foodPreference: "Vegetarian",
};

const defaultRole = "user";
const allowedRoles = new Set(["user", "admin"]);

function publicUser(user) {
  if (!user) return null;
  const { password, ...safeUser } = user;
  const normalizedId =
    safeUser.userId ||
    safeUser.id ||
    safeUser.UserID ||
    safeUser.userID ||
    safeUser.user_id;
  if (!safeUser.id && normalizedId) safeUser.id = normalizedId;
  if (!safeUser.userId && normalizedId) safeUser.userId = normalizedId;
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
    const role = allowedRoles.has(
      String(payload.role || "")
        .trim()
        .toLowerCase(),
    )
      ? String(payload.role).trim().toLowerCase()
      : defaultRole;
    const user = {
      userId,
      id: userId,
      fullName: payload.fullName.trim(),
      email: payload.email.trim().toLowerCase(),
      phone: payload.phone.trim(),
      password: payload.password,
      role,
      preferences: {
        ...defaultPreferences,
        ...(payload.preferences || {}),
      },
      createdAt: new Date().toISOString(),
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

    const requestedRole = String(payload.role || "")
      .trim()
      .toLowerCase();
    const updatedRole = allowedRoles.has(requestedRole)
      ? requestedRole
      : existing.role || defaultRole;

    const updated = {
      ...existing,
      userId,
      id: existing.id || userId,
      fullName: payload.fullName?.trim() || existing.fullName,
      phone: payload.phone?.trim() || existing.phone,
      role: updatedRole,
      preferences: {
        ...existing.preferences,
        ...(payload.preferences || {}),
      },
      updatedAt: new Date().toISOString(),
    };

    await docClient.send(
      new PutCommand({
        TableName: this.tableName,
        Item: updated,
      }),
    );
    return publicUser(updated);
  }

  async delete(userId) {
    const existing = await this.findById(userId);
    if (!existing) return null;

    await docClient.send(
      new DeleteCommand({
        TableName: this.tableName,
        Key: { userId },
      }),
    );
    return existing;
  }

  #normalizeUser(user) {
    if (!user) return null;
    const normalizedId =
      user.userId || user.id || user.UserID || user.userID || user.user_id;
    return {
      ...user,
      id: user.id || normalizedId,
      userId: user.userId || normalizedId,
    };
  }
}

module.exports = { UserStore, publicUser };
