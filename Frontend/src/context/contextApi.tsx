import { createContext, useState, ReactNode, Dispatch, SetStateAction } from "react";
import { MyContextProviderProps, PoolInterface, RecentWinner } from "../utils/Interfaces";

// Define the context type
interface MyContextType {
  myPools: PoolInterface[] | null; 
  setMyPools: Dispatch<SetStateAction<PoolInterface[] | null>>; 
  recentWinners: RecentWinner[]; 
  setRecentWinners: Dispatch<SetStateAction<RecentWinner[]>>;
}

// Create the context with a default value
export const MyContext = createContext<MyContextType>({
  myPools: null, 
  setMyPools: () => {}, 
  recentWinners: [], 
  setRecentWinners: () => {}, 
});

// Define the provider component
export const MyContextProvider = ({ children }: MyContextProviderProps) => {
  const [myPools, setMyPools] = useState<PoolInterface[] | null>(null); 
  const [recentWinners, setRecentWinners] = useState<RecentWinner[]>([
    { name: "Player429", amount: "1,240", time: "2m ago" },
    { name: "CryptoKing", amount: "450", time: "5m ago" },
    { name: "LuckyStrike", amount: "2,100", time: "8m ago" },
  ]);

  // Create the context value
  const value: MyContextType = {
    myPools,
    setMyPools,
    recentWinners,
    setRecentWinners,
  };

  return <MyContext.Provider value={value}>{children}</MyContext.Provider>;
};
