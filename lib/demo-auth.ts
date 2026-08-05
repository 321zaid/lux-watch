/** Local-only authentication used when Supabase is not configured.
 *  Mirrors the Supabase auth surface so the UI can swap transparently. */

export interface DemoUser {
  email: string;
  name: string;
  createdAt: string;
}

export interface DemoOrder {
  id: string;
  status: "paid";
  createdAt: string;
  totalCents: number;
  items: { name: string; variantName: string; quantity: number; priceCents: number }[];
  shipping: { name: string; address: string; city: string; country: string };
}

const USERS_KEY = "astra-demo-users";
const SESSION_KEY = "astra-demo-session";

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

export const demoAuth = {
  signUp(email: string, password: string, name: string): { error?: string } {
    const users = read<Record<string, { name: string; password: string; createdAt: string }>>(USERS_KEY, {});
    if (users[email]) return { error: "An account already exists for that address." };
    if (password.length < 8) return { error: "Password must be at least 8 characters." };
    users[email] = { name, password, createdAt: new Date().toISOString() };
    write(USERS_KEY, users);
    write(SESSION_KEY, { email, name });
    return {};
  },
  signIn(email: string, password: string): { error?: string } {
    const users = read<Record<string, { name: string; password: string; createdAt: string }>>(USERS_KEY, {});
    const record = users[email];
    if (!record || record.password !== password)
      return { error: "Incorrect address or password." };
    write(SESSION_KEY, { email, name: record.name });
    return {};
  },
  signOut() {
    localStorage.removeItem(SESSION_KEY);
  },
  session(): DemoUser | null {
    return read<DemoUser | null>(SESSION_KEY, null);
  },
  orders(): DemoOrder[] {
    return read<DemoOrder[]>("astra-demo-orders", []);
  },
  placeOrder(order: DemoOrder): DemoOrder[] {
    const orders = read<DemoOrder[]>("astra-demo-orders", []);
    orders.unshift(order);
    write("astra-demo-orders", orders);
    return orders;
  },
};