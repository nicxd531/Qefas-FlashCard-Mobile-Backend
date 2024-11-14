export const generateToken = (lenght = 6) => {
  let otp = "";

  for (let i = 0; i < lenght; i++) {
    let digit = Math.floor(Math.random() * 10);
    otp += digit;
  }
  return otp;
};
