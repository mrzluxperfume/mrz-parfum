import {
  sendCustomerOrderConfirmation,
  sendOrderNotification,
} from "./mail.mjs";

const DELIVERY_TABLE = "stripe_order_email_deliveries";

async function claimDelivery(supabase, sessionId, column) {
  const { data, error } = await supabase
    .from(DELIVERY_TABLE)
    .update({
      [column]: "processing",
      last_error: null,
      updated_at: new Date().toISOString(),
    })
    .eq("checkout_session_id", sessionId)
    .in(column, ["pending", "failed"])
    .select("checkout_session_id")
    .maybeSingle();
  if (error) throw error;
  return Boolean(data);
}

async function setDeliveryStatus(supabase, sessionId, column, status, errorMessage = null) {
  const errorColumn = column.replace("_status", "_error");
  const { error } = await supabase
    .from(DELIVERY_TABLE)
    .update({
      [column]: status,
      [errorColumn]: errorMessage,
      updated_at: new Date().toISOString(),
    })
    .eq("checkout_session_id", sessionId);
  if (error) throw error;
}

async function sendOnce(supabase, sessionId, column, send) {
  if (!(await claimDelivery(supabase, sessionId, column))) return;
  try {
    await send();
    await setDeliveryStatus(supabase, sessionId, column, "sent");
  } catch (error) {
    try {
      await setDeliveryStatus(
        supabase,
        sessionId,
        column,
        "failed",
        String(error?.message || error).slice(0, 500),
      );
    } catch (statusError) {
      console.error(
        `[order-email] Could not record ${column} failure:`,
        statusError.message,
      );
    }
    throw error;
  }
}

export async function deliverOrderEmails(supabase, session, lineItems) {
  const sessionId = String(session?.id || "");
  if (!/^cs_[A-Za-z0-9_]+$/.test(sessionId)) {
    throw new Error("Session Stripe invalide pour les emails");
  }

  const { error } = await supabase.from(DELIVERY_TABLE).upsert(
    { checkout_session_id: sessionId },
    { onConflict: "checkout_session_id", ignoreDuplicates: true },
  );
  if (error) throw error;

  const results = await Promise.allSettled([
    sendOnce(supabase, sessionId, "merchant_email_status", () =>
      sendOrderNotification({ session, lineItems }),
    ),
    sendOnce(supabase, sessionId, "customer_email_status", () =>
      sendCustomerOrderConfirmation({ session, lineItems }),
    ),
  ]);
  const failures = results
    .filter((result) => result.status === "rejected")
    .map((result) => result.reason?.message || String(result.reason));

  if (failures.length) {
    console.error(`[order-email] Delivery failed for ${sessionId}:`, failures);
    throw new Error(failures.join("; "));
  }
}
