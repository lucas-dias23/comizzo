const BASE_URL = "https://api.abacatepay.com/v2";

export type PlanId = "monthly" | "yearly";

const PRODUCT_ENV: Record<PlanId, string> = {
  monthly: "ABACATEPAY_PRODUCT_MONTHLY",
  yearly: "ABACATEPAY_PRODUCT_YEARLY",
};

export function getProductId(plan: PlanId): string {
  const id = process.env[PRODUCT_ENV[plan]];
  if (!id) throw new Error(`env ${PRODUCT_ENV[plan]} não configurada`);
  return id;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.ABACATEPAY_API_KEY}`,
      ...options.headers,
    },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? `AbacatePay ${res.status}`);
  return (json.data ?? json) as T;
}

type CheckoutData = {
  id: string;  // checkout ID — a assinatura real (subs_...) só existe após pagamento
  url: string;
};

export async function createSubscriptionCheckout(params: {
  productId: string;
  userId: string;
  customer: { name: string; email: string; cellphone: string; taxId: string };
  returnUrl: string;
  completionUrl: string;
}): Promise<CheckoutData> {
  return request<CheckoutData>("/subscriptions/create", {
    method: "POST",
    body: JSON.stringify({
      productId: params.productId,
      customer: params.customer,
      returnUrl: params.returnUrl,
      completionUrl: params.completionUrl,
      metadata: { user_id: params.userId },
    }),
  });
}
