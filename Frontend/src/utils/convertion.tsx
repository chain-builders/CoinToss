import { formatUnits, BigNumberish } from "ethers";

export const formatFigures = (entryFee: BigNumberish): string => {
  try {
    // Safely format units
    const formattedFee = formatUnits(entryFee, 18);

    // Split into whole and decimal parts
    const [whole, decimal] = formattedFee.split(".");

    // If there's a decimal part, trim trailing zeros
    const cleanDecimal = decimal ? decimal.replace(/0+$/, "") : "";

    // Return with or without decimal based on existence
    return cleanDecimal ? `${whole}.${cleanDecimal} CORE` : `${whole} CORE`;
  } catch (error) {
    console.error("Error formatting fee:", error);
    // Fallback to string representation if formatting fails
    return `${entryFee.toString()} CORE`;
  }
};