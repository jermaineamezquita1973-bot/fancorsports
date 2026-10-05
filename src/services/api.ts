/**
 * API Services for communicating with full-stack endpoints.
 * This abstracts HTTP requests and provides clean, typed methods.
 */

export interface ChatResponse {
  text: string;
}

export interface Shop {
  id: number;
  title: string;
  [key: string]: any;
}

export interface PrintifySetupResponse {
  shops: Shop[];
  error?: string;
}

export interface PrintifyProduct {
  id: string | number;
  title: string;
  description: string;
  tags: string[];
  variants: Array<{ price: number; id: string; [key: string]: any }>;
  images: Array<{ src: string; [key: string]: any }>;
  [key: string]: any;
}

export interface ProductsResponse {
  products: PrintifyProduct[];
  error?: string;
}

/**
 * Sends a chat message to the server-side Gemini agent
 */
export async function sendChatMessage(message: string): Promise<ChatResponse> {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(errText || `Chat API error: ${response.status}`);
  }
  return response.json();
}

/**
 * Fetches the connected Printify shops
 */
export async function fetchPrintifySetup(): Promise<PrintifySetupResponse> {
  const response = await fetch("/api/fulfillment/setup");
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(errText || `Fulfillment setup error: ${response.status}`);
  }
  return response.json();
}

/**
 * Fetches products from the active Printify shop
 */
export async function fetchProducts(): Promise<ProductsResponse> {
  const response = await fetch(`/api/products?t=${Date.now()}`);
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(errText || `Fetch products error: ${response.status}`);
  }
  return response.json();
}

/**
 * Deletes a product from the Printify storefront catalog via backend proxy
 */
export async function deleteProductOnServer(productId: string | number): Promise<{ success: boolean; message?: string }> {
  const response = await fetch("/api/products", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId }),
  });
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(errText || `Delete product error: ${response.status}`);
  }
  return response.json();
}
