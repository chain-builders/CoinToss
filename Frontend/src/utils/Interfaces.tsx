// Define types for the pool object
import { ReactNode } from "react";
export  interface PoolInterface {
  id: number;
  entryFee: BigInt;
  maxParticipants: number;
  currentParticipants: number;
  prizePool: number;
  poolStatus: number;
}



// Define types for the recent winners
export interface RecentWinner {
    name: string;
    amount: string;
    time: string;
  }

export  interface MyContextProviderProps {
    children: ReactNode; // Correct type for the `children` prop
  } 


 export  interface MyContextType {
    myPools: Record<string, any>; // Replace `any` with a more specific type if needed
    setMyPools: React.Dispatch<React.SetStateAction<Record<string, any>>>;
  }

export  interface GameStats {
    totalPlayers: number;
    remainingPlayers: number;
    rounds: number;
    roundsCompleted: number;
    winningChoice: string | null;
  }
  
export  interface PlayerHistoryEntry {
    round: number;
    players: GamePlayer[];
    headsCount: number;
    tailsCount: number;
    minorityChoice: string;
    survivors: number;
  }
  
export  interface GamePlayer {
    id: number;
    address: string;
    choice: string;
    survived: boolean;
  }
  
export  interface NotificationProps {
    isVisible: boolean;
    isSuccess: boolean;
    message: string;
    subMessage: string;
  }
