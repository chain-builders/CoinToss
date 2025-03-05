import { formatUnits } from "ethers";

export const formatFigures = (value: string | bigint): string => {
  try {
    const valueAsString = value.toString();

    const formattedValue = formatUnits(valueAsString, 18);

    const numValue = parseFloat(formattedValue);

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

    return "0 CORE";
  }
};
