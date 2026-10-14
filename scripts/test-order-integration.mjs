
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { createServer as createNetServer } from "node:net";
import { spawn } from "node:child_process";
import { once } from "node:events";

const HOST = "127.0.0.1";

const receivedMessages = [];
let webhookStatus = 204;
let nextProcess = null;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getFreePort() {
  const server = createNetServer();

  server.listen(0, HOST);
  await once(server, "listening");

  const port = server.address().port;

  await new Promise((resolve) => server.close(resolve));

  return port;
}

async function startWebhook() {
  const server = createServer(async (req, res) => {
    if (req.method !== "POST" || req.url !== "/webhook") {
      res.writeHead(404);
      res.end();
      return;
    }

    let body = "";

    for await (const chunk of req) {
      body += chunk.toString();
    }

    try {
      receivedMessages.push(JSON.parse(body));
    } catch {
      res.writeHead(400);
      res.end();
      return;
    }

    res.writeHead(webhookStatus);
    res.end();
  });

  server.listen(0, HOST);
  await once(server, "listening");

  return {
    server,
    url: `http://${HOST}:${server.address().port}/webhook`,
  };
}

async function waitForServer(url) {
  for (let attempt = 0; attempt < 100; attempt++) {
    if (nextProcess?.exitCode !== null) {
      throw new Error("Next.js stopped unexpectedly.");
    }

    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(1000),
      });

      if (response.ok) return;
    } catch {
      // Server may still be starting.
    }

    await sleep(300);
  }

  throw new Error("Next.js did not start within 30 seconds.");
}

function createOrder(battleTag = "Integration#1234") {
  return {
    customer: {
      battleTag,
      discord: "integration_test",
      character: "Testrogue",
      realm: "Tarren Mill",
      preferredTime:
        "Flexible — please contact me (Europe/Berlin)",
      comment: "Automated integration test",
      website: "",
    },

    order: {
      keyLevel: 10,
      runs: 1,
      participation: "play",
      role: "dps",
      playerClass: "Rogue",
      traders: 0,
      region: "EU",
      specificDungeon: false,
      dungeonCounts: {},
    },
  };
}

async function submitOrder(baseUrl, order, ipSuffix) {
  const response = await fetch(`${baseUrl}/api/order`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Origin": baseUrl,

      // Different local test clients.
      "x-forwarded-for": `192.0.2.${ipSuffix}`,
    },
    body: JSON.stringify(order),
    signal: AbortSignal.timeout(15000),
  });

  return {
    status: response.status,
    body: await response.json(),
  };
}

function getEmbedField(message, fieldName) {
  const embed = message.embeds?.[0];

  return embed?.fields?.find(
    (field) => field.name.includes(fieldName)
  )?.value;
}

async function runTests(baseUrl) {
  console.log("\nNIKOBOOST INTEGRATION TESTS\n");

  // 1. Successful order
  const first = await submitOrder(
    baseUrl,
    createOrder(),
    11
  );

  assert.equal(first.status, 200);
  assert.equal(first.body.ok, true);
  assert.equal(first.body.total, 80000);
  assert.match(first.body.orderId, /^NB-/);
  assert.equal(receivedMessages.length, 1);

  console.log("✓ Successful order: 200");

  // 2. Server-side price
  const message = receivedMessages[0];

  const priceField = getEmbedField(message, "Price");

  assert.ok(priceField);
  assert.match(priceField, /80,000 GOLD/);

  console.log("✓ Price calculated: 80,000 GOLD");

  // 3. Customer and configuration details
  const customerField = getEmbedField(
    message,
    "Customer"
  );

  const orderField = getEmbedField(message, "Order");

  const characterField = getEmbedField(
    message,
    "Character"
  );

  const timeField = getEmbedField(
    message,
    "Preferred time"
  );

  assert.match(customerField, /Integration#1234/);
  assert.match(customerField, /integration_test/);
  assert.match(customerField, /Testrogue/);
  assert.match(customerField, /Tarren Mill/);

  assert.match(orderField, /Mythic\+ \+10/);
  assert.match(orderField, /Runs: \*\*1\*\*/);
  assert.match(orderField, /Region: \*\*EU\*\*/);

  assert.match(characterField, /Rogue/);
  assert.match(characterField, /DPS/);

  assert.match(timeField, /Flexible/);
  assert.match(timeField, /Europe\/Berlin/);

  assert.match(
    message.embeds[0].title,
    new RegExp(first.body.orderId)
  );

  console.log("✓ Discord message contains correct data");

  // 4. Duplicate protection
  const second = await submitOrder(
    baseUrl,
    createOrder(),
    11
  );

  assert.equal(second.status, 200);
  assert.equal(second.body.ok, true);
  assert.equal(second.body.duplicate, true);

  assert.equal(
    second.body.orderId,
    first.body.orderId
  );

  assert.equal(receivedMessages.length, 1);

  console.log("✓ Duplicate order blocked");

  // 5. Invalid BattleTag
  const invalid = await submitOrder(
    baseUrl,
    createOrder("InvalidBattleTag"),
    12
  );

  assert.equal(invalid.status, 400);
  assert.match(
    invalid.body.error,
    /Invalid BattleTag/i
  );

  assert.equal(receivedMessages.length, 1);

  console.log("✓ Invalid BattleTag rejected");

  // 6. Discord webhook failure
  webhookStatus = 500;

  const failed = await submitOrder(
    baseUrl,
    createOrder("WebhookFailure#1234"),
    13
  );

  assert.equal(failed.status, 502);
  assert.equal(failed.body.ok, false);

  assert.match(
    failed.body.error,
    /could not be sent/i
  );

  assert.equal(receivedMessages.length, 2);

  console.log("✓ Discord failure handled: 502");

  console.log("\nALL 6 INTEGRATION TESTS PASSED!\n");
}

async function main() {
  const webhook = await startWebhook();

  try {
    const appPort = await getFreePort();
    const baseUrl = `http://${HOST}:${appPort}`;

    console.log("Starting isolated NikoBoost server...");
    console.log("Using LOCAL mock Discord webhook.");

    nextProcess = spawn(
      process.execPath,
      [
        "./node_modules/next/dist/bin/next",
        "start",
        "--hostname",
        HOST,
        "--port",
        String(appPort),
      ],
      {
        cwd: process.cwd(),
        env: {
          ...process.env,

          // Override any real webhook configuration.
          DISCORD_WEBHOOK_URL: webhook.url,
          SITE_URL: baseUrl,
          NEXT_TELEMETRY_DISABLED: "1",
        },
        stdio: ["ignore", "pipe", "pipe"],
        windowsHide: true,
      }
    );

    let nextLogs = "";

    nextProcess.stdout.on("data", (chunk) => {
      nextLogs += chunk.toString();
    });

    nextProcess.stderr.on("data", (chunk) => {
      nextLogs += chunk.toString();
    });

    nextProcess.on("error", (error) => {
      nextLogs += error.message;
    });

    try {
      await waitForServer(baseUrl);
      await runTests(baseUrl);
    } catch (error) {
      console.error("\nNext.js logs:\n", nextLogs);
      throw error;
    }
  } finally {
    if (nextProcess && nextProcess.exitCode === null) {
      nextProcess.kill();
    }

    await new Promise((resolve) => {
      webhook.server.close(resolve);
    });
  }
}

main()
  .then(() => {
    process.exitCode = 0;
  })
  .catch((error) => {
    console.error("\nTEST FAILED:", error);
    process.exitCode = 1;
  });
