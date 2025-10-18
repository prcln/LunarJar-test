import { nanoid } from 'nanoid'; // Import at the top of your file

// This function is the perfect replacement
export const generateUniqueToken = () => {
  // Generates a 10-character, URL-safe, unique ID
  return nanoid(10); 
};

