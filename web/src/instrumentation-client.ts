import posthog from "posthog-js";

/**
 * PostHog analytics (project 642580, US cloud). Runs once in the browser before the page is
 * interactive. Every event carries `product: "lotteryclock"` so it can be filtered out of a shared
 * project. The key is a public project token, safe to ship to the client.
 */
const POSTHOG_KEY = "phc_wHmU9xGagja5baLnbfXbBsDSepVnU7h5bBB6Do6DAdGs";

try {
  posthog.init(POSTHOG_KEY, {
    api_host: "https://us.i.posthog.com",
    defaults: "latest",
    person_profiles: "identified_only",
    loaded: (ph) => {
      ph.register({ product: "lotteryclock" });
    },
  });
} catch {
  // Analytics must never break the page
}
