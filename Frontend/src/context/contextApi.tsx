import { createContext, useState, ReactNode, Dispatch, SetStateAction } from "react";
import { MyContextProviderProps, PoolInterface, RecentWinner } from "../utils/Interfaces";

// Define the context type
interface MyContextType {
  points:number,
  myPools: PoolInterface[] | null; 
  setMyPools: Dispatch<SetStateAction<PoolInterface[] | null>>; 
  setPoints: Dispatch<SetStateAction<number>>; 
  recentWinners: RecentWinner[]; 
  setRecentWinners: Dispatch<SetStateAction<RecentWinner[]>>;
}

// Create the context with a default value
export const MyContext = createContext<MyContextType>({
  points:0,
  myPools: null, 
  setPoints:()=> {},
  setMyPools: () => {}, 
  recentWinners: [], 
  setRecentWinners: () => {}, 
});

// Define the provider component
export const MyContextProvider = ({ children }: MyContextProviderProps) => {
  const [myPools, setMyPools] = useState<PoolInterface[] | null>(null); 
  const [points, setPoints]=useState(10);
  const [recentWinners, setRecentWinners] = useState<RecentWinner[]>([
    { name: "Player429", amount: "1,240", time: "2m ago" },
    { name: "CryptoKing", amount: "450", time: "5m ago" },
    { name: "LuckyStrike", amount: "2,100", time: "8m ago" },
  ]);

  // Create the context value
  const value: MyContextType = {
    points,
    setPoints,
    myPools,
    setMyPools,
    recentWinners,
    setRecentWinners,
  };

  return <MyContext.Provider value={value}>{children}</MyContext.Provider>;
};
