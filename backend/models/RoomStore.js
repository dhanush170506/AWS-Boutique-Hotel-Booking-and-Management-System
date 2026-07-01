const {
  GetCommand,
  PutCommand,
  DeleteCommand,
} = require("@aws-sdk/lib-dynamodb");
const { v4: uuidv4 } = require("uuid");
const { docClient, scanAll, tables } = require("../services/dynamoDb");

class RoomStore {
  constructor(tableName = tables.rooms) {
    this.tableName = tableName;
  }

  async findAll() {
    return scanAll({
      TableName: this.tableName,
    });
  }

  async findById(roomId) {
    const result = await docClient.send(
      new GetCommand({
        TableName: this.tableName,
        Key: { roomId },
      }),
    );
    return result.Item || null;
  }

  async findByName(name) {
    if (!name) return null;
    const normalizedName = name.trim().toLowerCase();
    const rooms = await scanAll({
      TableName: this.tableName,
      FilterExpression: "contains (lower(#name), :name)",
      ExpressionAttributeNames: { "#name": "name" },
      ExpressionAttributeValues: { ":name": normalizedName },
    });
    return (
      rooms.find(
        (room) => room.name?.trim().toLowerCase() === normalizedName,
      ) ||
      rooms[0] ||
      null
    );
  }

  async create(payload) {
    const roomId = `ROOM-${uuidv4().slice(0, 8).toUpperCase()}`;
    const room = {
      roomId,
      name: payload.name,
      description: payload.description || "",
      price: Number(payload.price) || 0,
      capacity: Number(payload.capacity) || 1,
      amenities: payload.amenities || [],
      image: payload.image || "",
      available:
        payload.available !== undefined ? Boolean(payload.available) : true,
      createdAt: new Date().toISOString(),
    };

    await docClient.send(
      new PutCommand({
        TableName: this.tableName,
        Item: room,
        ConditionExpression: "attribute_not_exists(roomId)",
      }),
    );

    return room;
  }

  async update(roomId, payload) {
    const existing = await this.findById(roomId);
    if (!existing) return null;

    const updated = {
      ...existing,
      name: payload.name?.trim() || existing.name,
      description: payload.description ?? existing.description,
      price:
        payload.price !== undefined ? Number(payload.price) : existing.price,
      capacity:
        payload.capacity !== undefined
          ? Number(payload.capacity)
          : existing.capacity,
      amenities: payload.amenities || existing.amenities,
      image: payload.image ?? existing.image,
      available:
        payload.available !== undefined
          ? Boolean(payload.available)
          : existing.available,
      updatedAt: new Date().toISOString(),
    };

    await docClient.send(
      new PutCommand({
        TableName: this.tableName,
        Item: updated,
      }),
    );

    return updated;
  }

  async delete(roomId) {
    const existing = await this.findById(roomId);
    if (!existing) return null;

    await docClient.send(
      new DeleteCommand({
        TableName: this.tableName,
        Key: { roomId },
      }),
    );

    return existing;
  }

  async updateAvailability(roomId, available) {
    const room = await this.findById(roomId);
    if (!room) return null;

    const updated = {
      ...room,
      available: Boolean(available),
      updatedAt: new Date().toISOString(),
    };

    await docClient.send(
      new PutCommand({
        TableName: this.tableName,
        Item: updated,
      }),
    );

    return updated;
  }
}

module.exports = RoomStore;
