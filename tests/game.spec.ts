import { expect, Page, test } from "@playwright/test";

/**
 * Speed Shopper's own browser tests: walking, grabbing and pushing a cart,
 * picking up merchandise, and buying it at the checkout. One fat test, since
 * starting the game is the slow part (see tests/CLAUDE.md).
 *
 * Positions are set by hand where getting there by walking would make the test
 * slow and flaky. Everything is looked up through `window.DEBUG.game`.
 */

/** Collects page errors and console errors, which should fail any test */
function collectIssues(page: Page): string[] {
  const issues: string[] = [];
  page.on("pageerror", (err) => issues.push(err.message));
  page.on("console", (msg) => {
    if (msg.type() === "error") issues.push(msg.text());
  });
  return issues;
}

/** Holds a key down for `ms` of real time */
async function hold(page: Page, key: string, ms: number) {
  await page.keyboard.down(key);
  await page.waitForTimeout(ms);
  await page.keyboard.up(key);
}

test("shopping: walk, push a cart, pick something up, buy it", async ({
  page,
}) => {
  const issues = collectIssues(page);

  // A fixed seed, which the game should report back
  await page.goto("/?seed=1234");
  await page.waitForFunction(
    () => (window.DEBUG?.game as any)?.entities.getById("shoppingList"),
    { timeout: 30000 },
  );
  expect(
    await page.evaluate(() => (window.DEBUG.game as any).random.seed),
  ).toBe(1234);

  // --- Assertion: The store is all there ---
  const counts = await page.evaluate(() => {
    const entities = (window.DEBUG.game as any).entities;
    return {
      humans: [...entities.getTagged("human")].length,
      carts: [...entities.getTagged("cart")].length,
      merchandise: [...entities.getTagged("merchandise")].length,
    };
  });
  expect(counts).toEqual({ humans: 1, carts: 4, merchandise: 12 });

  const playerPosition = () =>
    page.evaluate(() => {
      const [human] = (window.DEBUG.game as any).entities.getTagged("human");
      return [...human.body.position] as [number, number];
    });

  // --- Assertion: Walking moves the player (the old p2 world never applied
  // damping, and the engine's would stop the player dead if it were on) ---
  const start = await playerPosition();
  await hold(page, "d", 600);
  const walked = await playerPosition();
  expect(walked[0] - start[0]).toBeGreaterThan(0.5);

  // --- Assertion: Space grabs a nearby cart, and pushing moves it ---
  const cartStart = await page.evaluate(() => {
    const game = window.DEBUG.game as any;
    const [human] = game.entities.getTagged("human");
    const cart = [...game.entities.getTagged("cart")][0];
    human.body.velocity.set(0, 0);
    // Just behind the first cart, which faces up (-y)
    human.body.position.set(cart.body.position[0], cart.body.position[1] + 0.9);
    human.body.angle = -Math.PI / 2;
    return [...cart.body.position] as [number, number];
  });
  await page.keyboard.press("Space");
  expect(
    await page.evaluate(() => {
      const [human] = (window.DEBUG.game as any).entities.getTagged("human");
      return human.cart !== undefined;
    }),
  ).toBe(true);

  // Push it forward (W), toward the wall 2.5 m ahead: far enough for this.
  // (Pulling back would swing the casters round, which skids, as it should.)
  // Count the frames where a wheel skids while we push.
  await page.evaluate(() => {
    const [human] = (window.DEBUG.game as any).entities.getTagged("human");
    const w = window as any;
    w.__skid = { frames: 0, skidding: 0, done: false };
    const sample = () => {
      if (w.__skid.done) return;
      w.__skid.frames++;
      if (human.cart?.wheels.some((wheel: any) => wheel.skidding)) {
        w.__skid.skidding++;
      }
      requestAnimationFrame(sample);
    };
    requestAnimationFrame(sample);
  });
  await hold(page, "w", 700);
  const pushed = await page.evaluate(() => {
    const game = window.DEBUG.game as any;
    const w = window as any;
    w.__skid.done = true;
    const [human] = game.entities.getTagged("human");
    return {
      cart: [...human.cart.body.position] as [number, number],
      skidFraction: w.__skid.skidding / w.__skid.frames,
      ticksPerSecond: game.ticksPerSecond,
    };
  });
  const cartMoved = Math.hypot(
    pushed.cart[0] - cartStart[0],
    pushed.cart[1] - cartStart[1],
  );
  console.log(
    `Cart moved ${cartMoved.toFixed(2)} m, skidding ${(
      100 * pushed.skidFraction
    ).toFixed(0)}% of frames, at ${pushed.ticksPerSecond} ticks/s`,
  );
  expect(cartMoved).toBeGreaterThan(0.3);

  // --- Assertion: Pushing in a straight line doesn't skid. The wheels were
  // tuned at 120 ticks per second; at 60 the front casters shimmy and the
  // wheels skid most of the time, so the game fixes its tick rate ---
  expect(pushed.ticksPerSecond).toBeGreaterThanOrEqual(120);
  expect(pushed.skidFraction).toBeLessThan(0.1);

  // --- Assertion: The tick rate stays fixed on a display it doesn't divide
  // evenly: a second of 144 Hz frames runs exactly one second of ticks, never
  // more than one tick apart from frame to frame, all the same length ---
  const uneven = await page.evaluate(() => {
    const game = window.DEBUG.game as any;
    game.manualFrames = true;
    game.refreshRateOverride = 144;
    const perFrame: number[] = [];
    const dts = new Set<number>();
    const [human] = game.entities.getTagged("human");
    const onTick = human.onTick;
    human.onTick = function (data: { dt: number }) {
      dts.add(data.dt);
      return onTick.call(this, data);
    };
    const start = game.ticknumber;
    for (let i = 0; i < 144; i++) {
      const before = game.ticknumber;
      game.stepFrames(1);
      perFrame.push(game.ticknumber - before);
    }
    human.onTick = onTick;
    game.refreshRateOverride = undefined;
    game.manualFrames = false;
    return {
      ticks: game.ticknumber - start,
      tickRate: game.ticksPerSecond,
      min: Math.min(...perFrame),
      max: Math.max(...perFrame),
      dts: [...dts],
    };
  });
  expect(uneven.ticks).toBe(uneven.tickRate);
  expect(uneven.max - uneven.min).toBeLessThanOrEqual(1);
  expect(uneven.dts).toEqual([1 / uneven.tickRate]);

  // --- Assertion: No body has gone NaN or flown off, after all that ---
  const badBodies = await page.evaluate(() => {
    const bad: string[] = [];
    for (const body of (window.DEBUG.game as any).world.bodies) {
      const values = [...body.position, ...body.velocity, body.angle];
      if (!values.every(Number.isFinite) || Math.hypot(...body.velocity) > 50) {
        bad.push(`${body.owner?.constructor.name}: ${values.join(", ")}`);
      }
    }
    return bad;
  });
  expect(badBodies).toEqual([]);

  // Let go of the cart for the next part
  await page.keyboard.press("Space");

  // --- Assertion: Reaching (Q) next to merchandise picks it up, and letting
  // go drops it ---
  await page.keyboard.down("q");
  await page.waitForFunction(() => {
    const [human] = (window.DEBUG.game as any).entities.getTagged("human");
    return human.leftArm.extension === 1;
  });
  await page.evaluate(() => {
    const game = window.DEBUG.game as any;
    const [human] = game.entities.getTagged("human");
    const [merchandise] = game.entities.getTagged("merchandise");
    merchandise.body.position.set(human.leftArm.getHandWorldPosition());
    merchandise.body.velocity.set(0, 0);
  });
  await page.waitForFunction(() => {
    const [human] = (window.DEBUG.game as any).entities.getTagged("human");
    return human.leftArm.merchandise?.state === "pickedUp";
  });
  await page.keyboard.up("q");
  await page.waitForFunction(() => {
    const [merchandise] = (window.DEBUG.game as any).entities.getTagged(
      "merchandise",
    );
    return merchandise.state === "dropped";
  });

  // --- Assertion: Merchandise in a cart that reaches the checkout is bought,
  // and the shopping list counts it ---
  await page.evaluate(() => {
    const game = window.DEBUG.game as any;
    const [merchandise] = game.entities.getTagged("merchandise");
    const cart = [...game.entities.getTagged("cart")][1];
    merchandise.putInCart(cart);
    cart.addMerchandise(merchandise);
    // Straight into the checkout's sensor
    const [checkout] = game.entities.getByFilter(
      (e: any) => e.constructor.name === "Checkout",
    );
    merchandise.body.position.set(checkout.body.position);
  });
  await page.waitForFunction(
    () =>
      (window.DEBUG.game as any).entities.getById("shoppingList").items[0]
        .numberPurchased === 1,
  );
  expect(
    await page.evaluate(
      () =>
        [...(window.DEBUG.game as any).entities.getTagged("merchandise")]
          .length,
    ),
  ).toBe(11);

  // --- Assertion: No errors ---
  expect(issues).toHaveLength(0);
});
