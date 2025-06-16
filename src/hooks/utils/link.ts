export function getChatUrl(sellerId: string) {
  return `https://seil.ai.kr/chat/${sellerId}`;
}

export function maskPhone(phone: string): string {
  return phone.replace(/(\d{2,3})-?(\d{3,4})-?(\d{4})/, (_, a, b, c) => `${a}-${b[0]}***-${c.slice(0, 2)}**`);
}

export function isPhoneNumber(text: string): boolean {
  return /(\d{2,3}-?\d{3,4}-?\d{4})/.test(text);
}

export function isEmail(text: string): boolean {
  return /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z]{2,}\b/i.test(text);
}

export function hasNameIndicator(text: string): boolean {
  return /이름[:：]\s*[\uac00-\ud7a3]+/.test(text);
}
