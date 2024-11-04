import jwt from "jsonwebtoken";

export function generateAccessToken(userId: string) {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, {
    expiresIn: "30m",
  });
}
export function generateRefreshAccessToken(userId: string) {
  return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: "2d",
  });
}
export function generateCustomToken(
  userId: string,
  secret: string,
  expiryTime: string
) {
  return jwt.sign({ userId }, secret, { expiresIn: `${expiryTime}` });
}
