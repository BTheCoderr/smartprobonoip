/**
 * GA4 Measurement Protocol forwarding for private-page conversions.
 *
 * Sends: event name, engagement_time_msec, and allowlisted enum params.
 * Never sends page_location, page_referrer, user_id, user properties,
 * project ids or any intake content. Only forwards when the browser already
 * has a GA client id (set by GA on a public page), so no new identifier is
 * created on private pages.
 */
import {
  conversionFor,
  conversionParams,
  isPrivatePageConversion,
  type ConversionParams,
  type GaConversionName,
} from "./conversions";

const CLIENT_ID_PATTERN = /^\d{1,20}\.\d{1,20}$/;
const MEASUREMENT_ID_PATTERN = /^G-[A-Z0-9]{4,20}$/;

/** `_ga` cookie looks like GA1.1.1234567890.1700000000 -> "1234567890.1700000000". */
export function gaClientIdFromCookie(cookieHeader: string | null | undefined): string | null {
  if (!cookieHeader) return null;
  const match = /(?:^|;\s*)_ga=GA\d\.\d\.(\d{1,20}\.\d{1,20})(?:;|$)/.exec(cookieHeader);
  return match ? match[1] : null;
}

export interface MeasurementProtocolRequest {
  url: string;
  body: {
    client_id: string;
    non_personalized_ads: true;
    events: { name: GaConversionName; params: ConversionParams & { engagement_time_msec: number } }[];
  };
}

export function buildMeasurementProtocolRequest(input: {
  eventName: string;
  clientId: string | null | undefined;
  metadata?: Record<string, unknown> | null;
  measurementId?: string | null;
  apiSecret?: string | null;
}): MeasurementProtocolRequest | null {
  const conversion = conversionFor(input.eventName);
  if (!conversion || !isPrivatePageConversion(conversion)) return null;
  if (!input.clientId || !CLIENT_ID_PATTERN.test(input.clientId)) return null;
  const measurementId = input.measurementId?.trim();
  const apiSecret = input.apiSecret?.trim();
  if (!measurementId || !MEASUREMENT_ID_PATTERN.test(measurementId) || !apiSecret) return null;

  const params = conversionParams(input.metadata);
  if (params.demo === true) return null; // keep GA conversions real-user only

  const url =
    "https://www.google-analytics.com/mp/collect" +
    `?measurement_id=${encodeURIComponent(measurementId)}` +
    `&api_secret=${encodeURIComponent(apiSecret)}`;

  return {
    url,
    body: {
      client_id: input.clientId,
      non_personalized_ads: true,
      events: [{ name: conversion, params: { ...params, engagement_time_msec: 1 } }],
    },
  };
}
