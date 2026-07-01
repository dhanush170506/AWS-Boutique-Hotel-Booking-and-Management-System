const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, ScanCommand } = require("@aws-sdk/lib-dynamodb");

const REGION = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || "us-east-1";

const client = new DynamoDBClient({ region: REGION });

const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    removeUndefinedValues: true,
  },
});

const tables = {
  users: process.env.DYNAMODB_USERS_TABLE || "Users",
  bookings: process.env.DYNAMODB_BOOKINGS_TABLE || "Bookings",
  rooms: process.env.DYNAMODB_ROOMS_TABLE || "Rooms",
};

async function scanAll(params) {
  const items = [];
  let ExclusiveStartKey;

  do {
    const result = await docClient.send(
      new ScanCommand({
        ...params,
        ExclusiveStartKey,
      }),
    );
    items.push(...(result.Items || []));
    ExclusiveStartKey = result.LastEvaluatedKey;
  } while (ExclusiveStartKey);

  return items;
}

module.exports = { docClient, scanAll, tables };
