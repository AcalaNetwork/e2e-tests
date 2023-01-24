import { afterAll, describe, expect, it } from "vitest";
import { connectVertical } from "@acala-network/chopsticks";

import { expectEvent, matchSnapshot, setupContext, testingPairs } from "../helper";

describe("Polkadot <-> Acala", async () => {
  const polkadot = await setupContext({
    endpoint: "wss://rpc.polkadot.io",
  });
  const acala = await setupContext({
    endpoint: "wss://acala-rpc-1.aca-api.network",
  });
  await connectVertical(polkadot.chain, acala.chain);

  const { alice } = testingPairs();

  afterAll(async () => {
    await polkadot.teardown();
    await acala.teardown();
  });

  it("Polkadot transfer assets to Acala", async () => {
    await polkadot.dev.setStorage({
      System: {
        Account: [[[alice.address], { data: { free: 1000 * 1e10 } }]],
      },
    });

    await matchSnapshot(polkadot.api.query.system.account(alice.address));
    await matchSnapshot(acala.api.query.tokens.accounts(alice.address, { token: "DOT" }));

    await polkadot.api.tx.xcmPallet
      .reserveTransferAssets(
        {
          V0: {
            X1: {
              Parachain: 2000,
            },
          },
        },
        {
          V0: {
            X1: {
              AccountId32: {
                network: "Any",
                id: alice.addressRaw,
              },
            },
          },
        },
        {
          V0: [
            {
              ConcreteFungible: { id: "Null", amount: 100e10 },
            },
          ],
        },
        0
      )
      .signAndSend(alice);

    await polkadot.chain.newBlock();
    await acala.chain.upcomingBlock();

    await matchSnapshot(polkadot.api.query.system.account(alice.address));
    await expectEvent(polkadot.api.query.system.events(), {
      event: expect.objectContaining({
        section: "xcmPallet",
        method: "Attempted",
      }),
    });

    await matchSnapshot(acala.api.query.tokens.accounts(alice.address, { token: "DOT" }));
    await expectEvent(acala.api.query.system.events(), {
      event: expect.objectContaining({
        section: "parachainSystem",
        method: "DownwardMessagesReceived",
      }),
    });
  });
});
