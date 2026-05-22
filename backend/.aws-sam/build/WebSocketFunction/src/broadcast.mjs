import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { ScanCommand, DeleteCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { ApiGatewayManagementApiClient, PostToConnectionCommand } from "@aws-sdk/client-apigatewaymanagementapi";

const client = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.TABLE_NAME;

export const handler = async (event) => {
  let connectionData;
  
  try {
    // Scan all active connection IDs
    const scanResult = await ddbDocClient.send(
      new ScanCommand({
        TableName: TABLE_NAME,
        ProjectionExpression: "connectionId",
      })
    );
    connectionData = scanResult.Items || [];
  } catch (err) {
    console.error("Failed to scan connections", err);
    return { statusCode: 500, body: JSON.stringify(err) };
  }

  // Parse the payload sent from the presenter
  let payload;
  try {
    const body = JSON.parse(event.body);
    // Expected format: { "action": "broadcast", "currentSlide": number, "isDemoMode": boolean }
    payload = JSON.stringify({
      currentSlide: body.currentSlide,
      isDemoMode: body.isDemoMode,
    });
  } catch (err) {
    console.error("Malformed payload", err);
    return { statusCode: 400, body: "Malformed body." };
  }

  // Instantiating API Gateway client using context info
  const domainName = event.requestContext.domainName;
  const stage = event.requestContext.stage;
  
  // Architect correction: API Gateway requires endpoint override for websocket management
  const apigwClient = new ApiGatewayManagementApiClient({
    endpoint: `https://${domainName}/${stage}`,
  });

  // Batch execution to handle up to 5000 parallel requests without crushing Node's callstack
  const BATCH_SIZE = 200;
  for (let i = 0; i < connectionData.length; i += BATCH_SIZE) {
    const batch = connectionData.slice(i, i + BATCH_SIZE);
    
    const sendPromises = batch.map(async ({ connectionId }) => {
      try {
        await apigwClient.send(
          new PostToConnectionCommand({
            ConnectionId: connectionId,
            Data: new TextEncoder().encode(payload),
          })
        );
      } catch (err) {
        // If connection is gone (410), clean it up from DynamoDB
        if (err.$metadata && err.$metadata.httpStatusCode === 410) {
          console.log(`Pruning stale connection: ${connectionId}`);
          try {
            await ddbDocClient.send(
              new DeleteCommand({
                TableName: TABLE_NAME,
                Key: { connectionId },
              })
            );
          } catch (deleteErr) {
            console.error(`Failed to delete connection ${connectionId}`, deleteErr);
          }
        } else {
          console.error(`Failed to post to connection ${connectionId}`, err);
        }
      }
    });

    await Promise.allSettled(sendPromises);
  }

  return { statusCode: 200, body: "Broadcast completed." };
};
