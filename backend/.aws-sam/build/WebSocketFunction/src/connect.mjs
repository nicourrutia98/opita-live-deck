import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.TABLE_NAME;

export const handler = async (event) => {
  const connectionId = event.requestContext.connectionId;
  
  try {
    await ddbDocClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          connectionId: connectionId,
          connectedAt: new Date().toISOString(),
        },
      })
    );
    
    return {
      statusCode: 200,
      body: "Connected.",
    };
  } catch (err) {
    console.error("Error connecting", err);
    return {
      statusCode: 500,
      body: "Failed to connect: " + JSON.stringify(err),
    };
  }
};
