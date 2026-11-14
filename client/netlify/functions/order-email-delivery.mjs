import {
  sendCustomerOrderConfirmation,
  sendOrderNotification,
} from "./order-emails.mjs";

const DELIVERY_TABLE = "stripe_order_email_deliveries";
const STALE_PROCESSING_MS = 2 * 60 * 1000;

function errorColumnFor(statusColumn) {
  return statusColumn.replace(/_status$/, "_error");
}

function assertSmtpConfigured() {
  if (!process.env.SMTP_USER?.trim() || !process.env.SMTP_PASS?.trim()) {
    throw new Error(
      "SMTP non configuré sur Netlify (SMTP_USER / SMTP_PASS manquants).",
    );
  }
}

async function tryClaim(supabase, sessionId, statusColumn, extraFilter) {
  const errorColumn = errorColumnFor(statusColumn);
  let query = supabase
    .from(DELIVERY_TABLE)
    .update({
      [statusColumn]: "processing",
      [errorColumn]: null,
      updated_at: new Date().toISOString(),
    })
    .eq("checkout_session_id", sessionId);

  query = extraFilter(query);

  const { data, error } = await query
    .select("checkout_session_id")
    .maybeSingle();

  if (error) {
    console.error(
      `[order-email] claim failed for ${sessionId}/${statusColumn}:`,
      error.message,
      error.details || "",
      error.hint || "",
    );
    throw error;
  }

  return Boolean(data);
}

/**
 * Atomically claim one email lane for a Checkout session.
 * Claims pending/failed first, then stale "processing" rows from crashed runs.
 *
 * IMPORTANT: never write a non-existent `last_error` column on this table
 * (that silently blocked all site emails).
 */
async function claimDelivery(supabase, sessionId, statusColumn) {
  const claimedFresh = await tryClaim(
    supabase,
    sessionId,
    statusColumn,
    (query) => query.in(statusColumn, ["pending", "failed"]),
  );
  if (claimedFresh) {
    console.log(`[order-email] claimed ${statusColumn} for ${sessionId}`);
    return true;
  }

  const staleIso = new Date(Date.now() - STALE_PROCESSING_MS).toISOString();
  const claimedStale = await tryClaim(
    supabase,
    sessionId,
    statusColumn,
    (query) =>
      query.eq(statusColumn, "processing").lt("updated_at", staleIso),
  );
  if (claimedStale) {
    console.log(
      `[order-email] reclaimed stale ${statusColumn} for ${sessionId}`,
    );
    return true;
  }

  console.log(
    `[order-email] skip ${statusColumn} for ${sessionId} (already sent or claimed)`,
  );
  return false;
}

async function setDeliveryStatus(
  supabase,
  sessionId,
  statusColumn,
  status,
  errorMessage = null,
) {
  const errorColumn = errorColumnFor(statusColumn);
  const { error } = await supabase
    .from(DELIVERY_TABLE)
    .update({
      [statusColumn]: status,
      [errorColumn]: errorMessage,
      updated_at: new Date().toISOString(),
    })
    .eq("checkout_session_id", sessionId);
  if (error) throw error;
}

async function sendOnce(supabase, sessionId, statusColumn, send) {
  if (!(await claimDelivery(supabase, sessionId, statusColumn))) return;
  try {
    await send();
    await setDeliveryStatus(supabase, sessionId, statusColumn, "sent");
    console.log(`[order-email] sent ${statusColumn} for ${sessionId}`);
  } catch (error) {
    const message = String(error?.message || error).slice(0, 500);
    try {
      await setDeliveryStatus(
        supabase,
        sessionId,
        statusColumn,
        "failed",
        message,
      );
    } catch (statusError) {
      console.error(
        `[order-email] Could not record ${statusColumn} failure:`,
        statusError.message,
      );
    }
    throw error;
  }
}

export async function deliverOrderEmails(supabase, session, lineItems) {
  assertSmtpConfigured();

  const sessionId = String(session?.id || "");
  if (!/^cs_[A-Za-z0-9_]+$/.test(sessionId)) {
    throw new Error("Session Stripe invalide pour les emails");
  }

  const orderNumber = String(session?.metadata?.order_number || "").trim();
  if (!/^MR\d{5}$/.test(orderNumber)) {
    throw new Error(
      `Numéro de commande manquant avant envoi email (session ${sessionId})`,
    );
  }

  const { error: upsertError } = await supabase.from(DELIVERY_TABLE).upsert(
    { checkout_session_id: sessionId },
    { onConflict: "checkout_session_id", ignoreDuplicates: true },
  );
  if (upsertError) {
    console.error(
      `[order-email] upsert deliveries failed for ${sessionId}:`,
      upsertError.message,
    );
    throw upsertError;
  }

  console.log(
    `[order-email] delivering site emails for ${sessionId} / ${orderNumber}`,
  );

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
