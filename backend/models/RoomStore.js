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
    const totalRooms = Number(payload.totalRooms || payload.capacity || 1);
    const availableRooms = Number(
      payload.availableRooms !== undefined
        ? payload.availableRooms
        : totalRooms,
    );
    const room = {
      roomId,
      roomNumber:
        payload.roomNumber || `${Math.floor(Math.random() * 900) + 100}`,
      name: payload.name,
      roomType: payload.roomType || payload.name,
      description: payload.description || "",
      price: Number(payload.price) || 0,
      capacity: Number(payload.capacity) || 1,
      bedType: payload.bedType || "King Bed",
      roomSize: payload.roomSize || "Standard",
      floor: payload.floor || "Ground",
      view: payload.view || "City",
      smoking: payload.smoking || "No",
      breakfast: Boolean(payload.breakfast),
      tv: Boolean(payload.tv),
      wifi: Boolean(payload.wifi),
      ac: Boolean(payload.ac),
      balcony: Boolean(payload.balcony),
      amenities: payload.amenities || [],
      images: payload.images || [],
      totalRooms,
      availableRooms: Math.min(totalRooms, Math.max(0, availableRooms)),
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

    const totalRooms =
      payload.totalRooms !== undefined
        ? Number(payload.totalRooms)
        : existing.totalRooms || existing.capacity || 1;
    const occupiedRooms =
      (existing.totalRooms || 0) - (existing.availableRooms || 0);
    const recalculatedAvailableRooms = Math.max(0, totalRooms - occupiedRooms);

    const updated = {
      ...existing,
      roomNumber: payload.roomNumber || existing.roomNumber,
      name: payload.name?.trim() || existing.name,
      roomType: payload.roomType || existing.roomType || existing.name,
      description: payload.description ?? existing.description,
      price:
        payload.price !== undefined ? Number(payload.price) : existing.price,
      capacity:
        payload.capacity !== undefined
          ? Number(payload.capacity)
          : existing.capacity,
      bedType: payload.bedType || existing.bedType,
      roomSize: payload.roomSize || existing.roomSize,
      floor: payload.floor || existing.floor,
      view: payload.view || existing.view,
      smoking: payload.smoking || existing.smoking,
      breakfast:
        payload.breakfast !== undefined
          ? Boolean(payload.breakfast)
          : existing.breakfast,
      tv: payload.tv !== undefined ? Boolean(payload.tv) : existing.tv,
      wifi: payload.wifi !== undefined ? Boolean(payload.wifi) : existing.wifi,
      ac: payload.ac !== undefined ? Boolean(payload.ac) : existing.ac,
      balcony:
        payload.balcony !== undefined
          ? Boolean(payload.balcony)
          : existing.balcony,
      amenities: payload.amenities || existing.amenities,
      images: payload.images || existing.images || [],
      totalRooms,
      availableRooms:
        payload.availableRooms !== undefined
          ? Math.min(totalRooms, Math.max(0, Number(payload.availableRooms)))
          : recalculatedAvailableRooms,
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

    const totalRooms = Number(room.totalRooms || room.capacity || 1);
    let availableRooms = Number(room.availableRooms || totalRooms);

    if (available === false) {
      availableRooms = Math.max(0, availableRooms - 1);
    } else {
      availableRooms = Math.min(totalRooms, availableRooms + 1);
    }

    const updated = {
      ...room,
      availableRooms,
      available: room.available !== false,
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
