import { NETLIFY_INTEREST_FORM_NAME } from "@/lib/interestNetlify";

/** Static markup for Netlify Forms build-time detection. Supabase remains source of truth. */
export function NetlifyInterestFormDetection() {
  return (
    <form
      name={NETLIFY_INTEREST_FORM_NAME}
      data-netlify="true"
      data-netlify-honeypot="bot-field"
      hidden
    >
      <input type="hidden" name="form-name" value={NETLIFY_INTEREST_FORM_NAME} />
      <input name="bot-field" />
      <input name="name" />
      <input name="email" />
      <input name="organization" />
      <input name="role" />
      <input name="interest_type" />
      <textarea name="message" />
      <input name="source" />
      <input name="medium" />
      <input name="campaign" />
      <input name="landing_page" />
    </form>
  );
}
