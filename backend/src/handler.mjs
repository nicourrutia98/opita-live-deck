import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  DeleteCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import {
  ApiGatewayManagementApiClient,
  PostToConnectionCommand,
} from "@aws-sdk/client-apigatewaymanagementapi";

const ddbClient = new DynamoDBClient({});
const dynamo = DynamoDBDocumentClient.from(ddbClient);
const TABLE = process.env.TABLE_NAME;

export const handler = async (event) => {
  const { requestContext } = event;
  const routeKey = requestContext.routeKey;
  const connectionId = requestContext.connectionId;

  try {
    switch (routeKey) {
      case "$connect":
        return await onConnect(connectionId);
      case "$disconnect":
        return await onDisconnect(connectionId);
      case "$default":
        return await onMessage(event, connectionId);
      default:
        return { statusCode: 400, body: "Unknown route" };
    }
  } catch (err) {
    console.error(`WebSocket error [${routeKey}]:`, err);
    return { statusCode: 500, body: "Internal error" };
  }
};

async function onConnect(connectionId) {
  await dynamo.send(
    new PutCommand({
      TableName: TABLE,
      Item: {
        connectionId: connectionId,
        connectedAt: new Date().toISOString(),
      },
    })
  );
  console.log(`Connected: ${connectionId}`);
  return { statusCode: 200, body: "Connected" };
}

async function onDisconnect(connectionId) {
  await dynamo.send(
    new DeleteCommand({
      TableName: TABLE,
      Key: { connectionId },
    })
  );
  console.log(`Disconnected: ${connectionId}`);
  return { statusCode: 200, body: "Disconnected" };
}

async function onMessage(event, connectionId) {
  const body = JSON.parse(event.body || "{}");
  
  // Custom router inside $default to broadcast slide updates
  if (body.action === "broadcast") {
    const payload = JSON.stringify({
      currentSlide: body.currentSlide,
      isDemoMode: body.isDemoMode,
      isQRFullscreen: body.isQRFullscreen,
    });

    const domain = event.requestContext.domainName;
    const stage = event.requestContext.stage;
    const apigw = new ApiGatewayManagementApiClient({
      endpoint: `https://${domain}/${stage}`,
    });

    // Scan connections
    const scanResult = await dynamo.send(
      new ScanCommand({
        TableName: TABLE,
        ProjectionExpression: "connectionId",
      })
    );
    const connections = scanResult.Items || [];

    // Broadcast in batches of 200 to protect Lambda limits
    const BATCH_SIZE = 200;
    for (let i = 0; i < connections.length; i += BATCH_SIZE) {
      const batch = connections.slice(i, i + BATCH_SIZE);
      
      const sendPromises = batch.map(async ({ connectionId: cid }) => {
        // Don't send the broadcast back to the presenter connection itself to save bandwidth
        if (cid === connectionId) return;

        try {
          await apigw.send(
            new PostToConnectionCommand({
              ConnectionId: cid,
              Data: new TextEncoder().encode(payload),
            })
          );
        } catch (err) {
          // If connection is stale (Gone), clean it up from Dynamo
          if (err.$metadata && err.$metadata.httpStatusCode === 410) {
            console.log(`Pruning connection ${cid}`);
            await dynamo.send(
              new DeleteCommand({
                TableName: TABLE,
                Key: { connectionId: cid },
              })
            );
          } else {
            console.error(`Post to connection failed for ${cid}:`, err);
          }
        }
      });

      await Promise.allSettled(sendPromises);
    }
  }

  return { statusCode: 200, body: "OK" };
}
