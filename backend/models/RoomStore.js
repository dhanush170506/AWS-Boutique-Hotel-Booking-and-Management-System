const { GetCommand } = require("@aws-sdk/lib-dynamodb");
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
}

module.exports = RoomStore;
