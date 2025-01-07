// Function to set data with expiration in sessionStorage
export function setSessionStorageWithExpiry(key, value, expiryInHours) {
  const now = new Date().getTime();
  const expiryTime = now + expiryInHours * 60 * 60 * 1000; // Convert hours to milliseconds
  const data = {
    value: value,
    expiry: expiryTime,
  };
  sessionStorage.setItem(key, JSON.stringify(data));
}

// Function to get data from sessionStorage with expiration check
export function getSessionStorageWithExpiry(key) {
  const dataString = sessionStorage.getItem(key);
  if (!dataString) {
    return null; // No data found
  }

  const data = JSON.parse(dataString);
  const now = new Date().getTime();

  if (now > data.expiry) {
    sessionStorage.removeItem(key); // Remove expired data
    return null; // Data has expired
  }

  return data.value; // Data is still valid
}
