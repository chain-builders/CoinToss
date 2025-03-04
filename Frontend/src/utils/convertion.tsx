import { formatUnits } from "ethers";

export const formatEntryFee = (entryFee: bigint): string => {
  // native token is CORE
  const formattedFee = formatUnits(entryFee, 18);

  // Split into whole and decimal parts
  const [whole, decimal] = formattedFee.split(".");

  // If there's a decimal part, trim trailing zeros
  const cleanDecimal = decimal ? decimal.replace(/0+$/, "") : "";

  // Return with or without decimal based on existence
  return cleanDecimal ? `${whole}.${cleanDecimal} CORE` : `${whole} CORE`;
};
