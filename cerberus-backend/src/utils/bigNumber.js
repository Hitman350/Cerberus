// src/utils/bigNumber.js
import BigNumber from 'bignumber.js';

// Configure the BigNumber library with global settings for our application.
// This ensures that all calculations are consistent and predictable.
BigNumber.config({
  // Set the number of decimal places for operations like division.
  // A value of 18 is standard for crypto, but we can set it higher for safety.
  DECIMAL_PLACES: 18,
  
  // Define the rounding mode. ROUND_DOWN is the safest for financial calculations
  // as it prevents accidentally giving users more value than they have.
  ROUNDING_MODE: BigNumber.ROUND_DOWN,
});

// Export the configured BigNumber constructor as the default export.
// Any part of our application that needs to perform precise calculations
// will import this configured version.
export default BigNumber;