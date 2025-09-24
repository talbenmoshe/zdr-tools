export function getCookieByName(cookieName: string): string | undefined {
  const allCookies = `; ${document.cookie}`;
  const parts = allCookies?.split(`; ${cookieName}=`);
  let cookieValue;

  if (parts && parts.length === 2) {
    cookieValue = parts.pop()!.split(';').shift();
  }

  return cookieValue;
}
