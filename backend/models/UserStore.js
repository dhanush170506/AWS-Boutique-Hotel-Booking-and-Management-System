const { GetCommand, PutCommand } = require("@aws-sdk/lib-dynamodb");
const { v4: uuidv4 } = require("uuid");
const { docClient, getTableKeyNames, scanAll, tables } = require("../services/dynamoDb");

const defaultPreferences = {
  bedPreference: "King Bed",
  smokingPreference: "Non-Smoking",
  airportPickup: false,
  foodPreference: "Vegetarian"
};

function publicUser(user) {
  if (!user) return null;
  const { password, ...safeUser } = user;
  const normalizedId = safeUser.userId || safeUser.id || safeUser.UserID || safeUser.userID || safeUser.user_id;
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
    const keyNames = await getTableKeyNames(this.tableName);
    const idKeyName = this.#findKeyName(keyNames, ["userId", "id", "UserID", "userID", "user_id"]);

    if (idKeyName && keyNames.length === 1) {
      const result = await docClient.send(
        new GetCommand({
          TableName: this.tableName,
          Key: { [idKeyName]: userId },
        }),
      );
      return this.#normalizeUser(result.Item);
    }

    const users = await scanAll({
      TableName: this.tableName,
      FilterExpression: "#userId = :userId OR #id = :userId OR #UserID = :userId OR #userID = :userId OR #user_id = :userId",
      ExpressionAttributeNames: {
        "#userId": "userId",
        "#id": "id",
        "#UserID": "UserID",
        "#userID": "userID",
        "#user_id": "user_id",
      },
      ExpressionAttributeValues: {
        ":userId": userId,
      },
    });
    return this.#normalizeUser(users[0]);
  }

  async findByEmail(email) {
    const normalizedEmail = email.trim().toLowerCase();
    const keyNames = await getTableKeyNames(this.tableName);
    const emailKeyName = this.#findKeyName(keyNames, ["email", "Email"]);

    if (emailKeyName && keyNames.length === 1) {
      const result = await docClient.send(
        new GetCommand({
          TableName: this.tableName,
          Key: { [emailKeyName]: normalizedEmail },
        }),
      );
      return this.#normalizeUser(result.Item);
    }

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

    const keyNames = await getTableKeyNames(this.tableName);
    this.#applyTableKeys(user, keyNames);

    await docClient.send(
      new PutCommand({
        TableName: this.tableName,
        Item: user,
        ConditionExpression: `attribute_not_exists(#partitionKey)`,
        ExpressionAttributeNames: {
          "#partitionKey": keyNames[0],
        },
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

    const keyNames = await getTableKeyNames(this.tableName);
    this.#applyTableKeys(updated, keyNames);

    await docClient.send(
      new PutCommand({
        TableName: this.tableName,
        Item: updated,
      }),
    );
    return publicUser(updated);
  }

  #applyTableKeys(user, keyNames) {
    for (const keyName of keyNames) {
      if (user[keyName] !== undefined && user[keyName] !== null && user[keyName] !== "") continue;

      const normalizedKey = keyName.toLowerCase().replace(/[_-]/g, "");
      if (normalizedKey === "email") {
        user[keyName] = user.email;
      } else if (normalizedKey === "id" || normalizedKey === "userid" || normalizedKey === "pk") {
        user[keyName] = user.userId;
      } else {
        throw Object.assign(new Error(`Users table key "${keyName}" is not mapped by the application.`), {
          status: 500,
        });
      }
    }
  }

  #findKeyName(keyNames, candidates) {
    return keyNames.find((keyName) => candidates.includes(keyName));
  }

  #normalizeUser(user) {
    if (!user) return null;
    const normalizedId = user.userId || user.id || user.UserID || user.userID || user.user_id;
    return {
      ...user,
      id: user.id || normalizedId,
      userId: user.userId || normalizedId,
    };
  }
}

module.exports = { UserStore, publicUser };
