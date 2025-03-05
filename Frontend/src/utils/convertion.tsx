import { formatUnits, BigNumberish } from "ethers";
import { parseUnits } from "ethers";

export const formatFigures = (value: BigNumberish): string => {
  try {
    // Safely convert to a string representation first
    const valueString = value.toString();

    // Ensure we have a valid big number
    const safeValue = valueString.length > 18 
      ? parseUnits(valueString.slice(0, -18), 0)
      : value;

    // Format the units
    const formattedValue = formatUnits(safeValue, 18);

    // Parse the number safely
    const numValue = parseFloat(formattedValue);

    // Custom formatting function
    const formatNumber = (num: number): string => {
      // For very large numbers
      if (num >= 1_000_000) {
        const millionsValue = num / 1_000_000;
        return `${millionsValue.toFixed(2)}M`;
      }
      
      // For thousands
      if (num >= 1_000) {
        const thousandsValue = num / 1_000;
        return `${thousandsValue.toFixed(2)}K`;
      }
      
      // For smaller numbers, show up to 2 decimal places
      return num.toFixed(2);
    };

    // Combine formatted number with CORE
    return `${formatNumber(numValue)} CORE`;

  } catch (error) {
    console.error("Error formatting value:", error);
    
    // Fallback with more defensive handling
    try {
      const truncatedValue = BigInt(value).toString().slice(0, 10);
      return `${truncatedValue}... CORE`;
    } catch {
      return "0 CORE";
    }
  }
};