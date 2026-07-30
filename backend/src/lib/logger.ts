export const logEvents = {
  // server
  serverStarted: "server_started",
  serverStartFailed: "server_start_failed",
  dbCheckSucceeded: "db_check_succeeded",
  dbCheckFailed: "db_check_failed",
  // notification
  notificationJobEnqueued: "notification_job_enqueued",
  notificationJobEnqueueStarted: "notification_job_enqueue_started",
  notificationJobClaimed: "notification_job_claimed",
  notificationJobProcessingStarted: "notification_job_processing_started",
  notificationJobSent: "notification_job_sent",
  notificationJobFailed: "notification_job_failed",
  notificationJobRequeued: "notification_job_requeued",
  notificationJobPermanentlyFailed: "notification_job_permanently_failed",
  // mail
  mailSendStarted: "mail_send_started",
  mailSendSucceeded: "mail_send_succeeded",
  mailSendFailed: "mail_send_failed",
  // worker
  workerStarted: "notification_worker_started",
  workerIdlePoll: "notification_worker_idle_poll",
  // payment
  paymentWebhookReceived: "payment_webhook_received",
  paymentWebhookIgnoredInvalid: "payment_webhook_ignored_invalid",
  paymentWebhookIgnoredStatusMismatch:
    "payment_webhook_ignored_status_mismatch",
  paymentWebhookPaymentNotFound: "payment_webhook_payment_not_found",
  paymentStatusUpdatedFromWebhook: "payment_status_updated_from_webhook",
  orderMarkedPaidFromWebhook: "order_marked_paid_from_webhook",
  orderMarkedPaidFromStatusCheck: "order_marked_paid_from_status_check",
  orderMarkedPendingPaymentFromWebhook:
    "order_marked_pending_payment_from_webhook",
  cdekShipmentCreateFailedForPaidOrder:
    "cdek_shipment_create_failed_for_paid_order",
  paymentStatusCheckRefreshedFromProvider:
    "payment_status_check_refreshed_from_provider",
  paymentCreateSucceeded: "payment_create_succeeded",
  paymentCreateFailed: "payment_create_failed",
  paymentRestoreUnknownSucceeded: "payment_restore_unknown_succeeded",
  paymentRestoreUnknownFailed: "payment_restore_unknown_failed",
  // checkout
  checkoutCreateStarted: "checkout_create_started",
  checkoutCreateSucceeded: "checkout_create_succeeded",
  checkoutCreateFailed: "checkout_create_failed",
  // cdek
  cdekShipmentCreateStarted: "cdek_shipment_create_started",
  cdekShipmentCreateSkippedExisting: "cdek_shipment_create_skipped_existing",
  cdekShipmentRestored: "cdek_shipment_restored",
  cdekShipmentPollRetry: "cdek_shipment_poll_retry",
  cdekShipmentPollExhausted: "cdek_shipment_poll_exhausted",
  cdekShipmentInvalidStatus: "cdek_shipment_invalid_status",
  cdekShipmentCreatedConfirmed: "cdek_shipment_created_confirmed",
  cdekShipmentCreateResponseReceived:
    "cdek_shipment_create_response_received",
  cdekShipmentRemoteCreateSucceeded: "cdek_shipment_remote_create_succeeded",
  cdekShipmentRemoteCreateFailed: "cdek_shipment_remote_create_failed",
} as const;

export type LogEvent = (typeof logEvents)[keyof typeof logEvents];

type LogLevel = "info" | "warn" | "error";

export const logger = {
  info: (event: LogEvent, payload?: Record<string, unknown>) =>
    write("info", event, payload),
  warn: (event: LogEvent, payload?: Record<string, unknown>) =>
    write("warn", event, payload),
  error: (event: LogEvent, payload?: Record<string, unknown>) =>
    write("error", event, payload),
};

function write(
  level: LogLevel,
  event: LogEvent,
  payload?: Record<string, unknown>
) {
  const entry = {
    level,
    event,
    time: new Date().toISOString(),
    ...serializePayload(payload),
  };

  const line = JSON.stringify(entry);

  if (level === "error") {
    console.error(line);
    return;
  }

  console.log(line);
}

function serializePayload(
  payload?: Record<string, unknown>
): Record<string, unknown> {
  if (!payload) {
    return {};
  }

  const seen = new WeakSet<object>();
  // в serializeValue для массивов/объектов теперь возвращается "[Circular]",
  // если объект уже встречался. Всё остальное оставил как было.

  return Object.fromEntries(
    Object.entries(payload).map(([key, value]) => [
      key,
      serializeValue(value, seen),
    ])
  );
}

function serializeValue(value: unknown, seen: WeakSet<object>): unknown {
  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      stack: value.stack,
    };
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    if (seen.has(value)) {
      return "[Circular]";
    }

    seen.add(value);

    return value.map((item) => serializeValue(item, seen));
  }

  if (value && typeof value === "object") {
    if (seen.has(value)) {
      return "[Circular]";
    }

    seen.add(value);

    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [
        key,
        serializeValue(nestedValue, seen),
      ])
    );
  }

  return value;
}
