import { formatUnits, BigNumberish } from "ethers";

export const formatFigures = (value: BigNumberish): string => {
  try {
   
    const formattedValue = formatUnits(value, 18);
    const numValue = parseFloat(formattedValue);

    
    const formatNumber = (num: number): string => {
      
      if (num >= 1_000_000) {
        const millionsValue = num / 1_000_000;
        return `${millionsValue.toFixed(2)}M`;
      }
      
      
      if (num >= 1_000) {
        const thousandsValue = num / 1_000;
        return `${thousandsValue.toFixed(2)}K`;
      }
      
     
      return num.toFixed(2);
    };

    
    return `${formatNumber(numValue)} CORE`;

  } catch (error) {
    console.error("Error formatting value:", error);
   
    return `${value.toString().slice(0, 10)}... CORE`;
  }
};