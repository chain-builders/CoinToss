import { useEffect, useState } from "react";
import { usePublicClient } from "wagmi";
import { parseAbiItem } from "viem";

// Define minimal event types based on the contract events
type PlayerJoinedEvent = {
  poolId: bigint;
  player: `0x${string}`;
};

type PointsAwardedEvent = {
  player: `0x${string}`;
  points: number;
  reason: number; // 1 = joined, 2 = round win, 3 = final win
};

type RoundCompletedEvent = {
  poolId: bigint;
  round: bigint;
  winningSelection: number; // 1 for HEADS, 2 for TAILS
};

export function usePoolEvents(contractAddress: `0x${string}`, poolId?: bigint) {
  const publicClient = usePublicClient();

  // Event callbacks - you'll set these from your components
  const [onPlayerJoined, setOnPlayerJoined] = useState<
    (event: PlayerJoinedEvent) => void
  >(() => () => {});
  const [onPointsAwarded, setOnPointsAwarded] = useState<
    (event: PointsAwardedEvent) => void
  >(() => () => {});
  const [onRoundCompleted, setOnRoundCompleted] = useState<
    (event: RoundCompletedEvent) => void
  >(() => () => {});

  // Setup event listeners
  useEffect(() => {
    if (!contractAddress || !publicClient) return;

    // Listen for PlayerJoined events
    const playerJoinedUnwatch = publicClient.watchEvent({
      address: contractAddress,
      event: parseAbiItem(
        "event PlayerJoined(uint256 indexed poolId, address indexed player)"
      ),
      onLogs: (logs) => {
        logs.forEach((log) => {
          if (poolId === undefined || log.args.poolId === poolId) {
            const event = {
              poolId: log.args.poolId as bigint,
              player: log.args.player as `0x${string}`,
            };
            onPlayerJoined(event);
          }
        });
      },
    });

    // Listen for PointsAwarded events
    const pointsAwardedUnwatch = publicClient.watchEvent({
      address: contractAddress,
      event: parseAbiItem(
        "event PointsAwarded(address indexed player, uint16 points, uint8 reason)"
      ),
      onLogs: (logs) => {
        logs.forEach((log) => {
          const event = {
            player: log.args.player as `0x${string}`,
            points: Number(log.args.points),
            reason: Number(log.args.reason),
          };
          onPointsAwarded(event);
        });
      },
    });

    // Listen for RoundCompleted events
    const roundCompletedUnwatch = publicClient.watchEvent({
      address: contractAddress,
      event: parseAbiItem(
        "event RoundCompleted(uint256 indexed poolId, uint256 round, uint8 winningSelection)"
      ),
      onLogs: (logs) => {
        logs.forEach((log) => {
          if (poolId === undefined || log.args.poolId === poolId) {
            const event = {
              poolId: log.args.poolId as bigint,
              round: log.args.round as bigint,
              winningSelection: Number(log.args.winningSelection),
            };
            onRoundCompleted(event);
          }
        });
      },
    });

    // Clean up listeners when component unmounts
    return () => {
      playerJoinedUnwatch();
      pointsAwardedUnwatch();
      roundCompletedUnwatch();
    };
  }, [
    contractAddress,
    publicClient,
    poolId,
    onPlayerJoined,
    onPointsAwarded,
    onRoundCompleted,
  ]);

  return {
    setOnPlayerJoined,
    setOnPointsAwarded,
    setOnRoundCompleted,
  };
}
