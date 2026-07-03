const {
  GetCommand,
  PutCommand,
  DeleteCommand,
} = require("@aws-sdk/lib-dynamodb");
const { v4: uuidv4 } = require("uuid");
const { docClient, scanAll, tables } = require("../services/dynamoDb");

function normalizeStringList(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

function getStatus(room) {
  const totalRooms = Number(room.totalRooms || room.capacity || 1);
  const availableRooms = Number(
    room.availableRooms ?? room.available ?? totalRooms,
  );
  if (availableRooms <= 0) return "Booked Out";
  if (availableRooms === 1) return "Only 1 Room Left";
  return "Available";
}

function normalizeRoom(room) {
  if (!room) return null;

  const totalRooms = Number(room.totalRooms ?? room.capacity ?? 1);
  const availableRooms = Number(
    room.availableRooms ?? room.available ?? totalRooms,
  );
  const imageUrls = normalizeStringList(
    room.imageUrls ?? room.images ?? (room.imageUrl ? [room.imageUrl] : []),
  );
  const normalized = {
    ...room,
    roomId: room.roomId || room.id,
    name: room.roomName || room.name || room.roomType || "Room",
    roomName: room.roomName || room.name || room.roomType || "Room",
    roomType: room.roomType || room.name || "Deluxe Room",
    roomNumberPrefix: room.roomNumberPrefix || room.roomNumber || "",
    description: room.description || "",
    bedrooms: Number(room.bedrooms ?? room.bedCount ?? 1),
    beds: Number(room.beds ?? 1),
    maxGuests: Number(room.maxGuests ?? room.capacity ?? 1),
    price: Number(room.price || 0),
    totalRooms,
    availableRooms: Math.min(totalRooms, Math.max(0, availableRooms)),
    facilities: normalizeStringList(room.facilities ?? room.amenities),
    imageUrl: room.imageUrl || imageUrls[0] || "",
    imageUrls,
    images: imageUrls,
    status: room.status || getStatus({ ...room, totalRooms, availableRooms }),
    available: availableRooms > 0,
    createdAt: room.createdAt || new Date().toISOString(),
    updatedAt: room.updatedAt || room.createdAt || new Date().toISOString(),
  };

  normalized.occupiedRooms = Math.max(
    0,
    totalRooms - normalized.availableRooms,
  );
  return normalized;
}

class RoomStore {
  constructor(tableName = tables.rooms) {
    this.tableName = tableName;
  }

  async findAll() {
    const rooms = await scanAll({
      TableName: this.tableName,
    });
    return rooms.map(normalizeRoom).filter(Boolean);
  }

  async findById(roomId) {
    const result = await docClient.send(
      new GetCommand({
        TableName: this.tableName,
        Key: { roomId },
      }),
    );
    return normalizeRoom(result.Item);
  }

  async findByName(name) {
    if (!name) return null;
    const normalizedName = name.trim().toLowerCase();
    const rooms = await this.findAll();
    return (
      rooms.find(
        (room) => room.roomName?.trim().toLowerCase() === normalizedName,
      ) ||
      rooms.find(
        (room) => room.name?.trim().toLowerCase() === normalizedName,
      ) ||
      rooms[0] ||
      null
    );
  }

  async create(payload) {
    const roomId = `ROOM-${uuidv4().slice(0, 8).toUpperCase()}`;
    const totalRooms = Number(payload.totalRooms ?? payload.capacity ?? 1);
    const availableRooms = totalRooms;
    const imageUrls = normalizeStringList(
      payload.imageUrls ??
        payload.images ??
        (payload.imageUrl ? [payload.imageUrl] : []),
    );
    const room = normalizeRoom({
      roomId,
      roomNumberPrefix: payload.roomNumberPrefix || payload.roomNumber || "",
      roomName: payload.roomName || payload.name || payload.roomType || "Room",
      roomType: payload.roomType || payload.name || "Deluxe Room",
      description: payload.description || "",
      bedrooms: Number(payload.bedrooms ?? 1),
      beds: Number(payload.beds ?? 1),
      maxGuests: Number(payload.maxGuests ?? payload.capacity ?? 1),
      price: Number(payload.price || 0),
      facilities: payload.facilities ?? payload.amenities,
      imageUrl: payload.imageUrl || imageUrls[0] || "",
      imageUrls,
      images: imageUrls,
      totalRooms,
      availableRooms: Math.min(totalRooms, Math.max(0, availableRooms)),
      available: availableRooms > 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

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
    const occupiedRooms = Math.max(
      0,
      Number(existing.totalRooms || 0) - Number(existing.availableRooms || 0),
    );
    const recalculatedAvailableRooms = Math.max(0, totalRooms - occupiedRooms);

    const imageUrls = normalizeStringList(
      payload.imageUrls !== undefined
        ? payload.imageUrls
        : payload.imageUrl
          ? [payload.imageUrl]
          : existing.imageUrls,
    );

    const updated = normalizeRoom({
      ...existing,
      ...payload,
      roomId,
      roomName: payload.roomName?.trim() || existing.roomName || existing.name,
      roomType: payload.roomType || existing.roomType || existing.name,
      roomNumberPrefix:
        payload.roomNumberPrefix ??
        existing.roomNumberPrefix ??
        existing.roomNumber,
      description: payload.description ?? existing.description,
      bedrooms:
        payload.bedrooms !== undefined
          ? Number(payload.bedrooms)
          : existing.bedrooms || 1,
      beds:
        payload.beds !== undefined ? Number(payload.beds) : existing.beds || 1,
      maxGuests:
        payload.maxGuests !== undefined
          ? Number(payload.maxGuests)
          : (existing.maxGuests ?? existing.capacity ?? 1),
      price:
        payload.price !== undefined ? Number(payload.price) : existing.price,
      facilities:
        payload.facilities !== undefined
          ? normalizeStringList(payload.facilities)
          : existing.facilities,
      imageUrl: payload.imageUrl || imageUrls[0] || existing.imageUrl || "",
      imageUrls,
      images: imageUrls,
      totalRooms,
      availableRooms: recalculatedAvailableRooms,
      available: recalculatedAvailableRooms > 0,
      updatedAt: new Date().toISOString(),
    });

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

    const updated = normalizeRoom({
      ...room,
      availableRooms,
      available: availableRooms > 0,
      updatedAt: new Date().toISOString(),
    });

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
