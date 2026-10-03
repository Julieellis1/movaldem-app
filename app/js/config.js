/* Movaldem Church App — configuration.
 * Flip USE_MOCK to false once the WordPress REST endpoints below are live,
 * then the app talks to the same database as the website. */
window.MOVALDEM_CONFIG = {
  USE_MOCK: false,

  // WordPress site the app shares its database with.
  // Staging while the real domain cutover is pending.
  WP_BASE: "https://movaldem.teta.dpdns.org",
  get WP_JSON() { return this.WP_BASE + "/wp-json"; },

  // Movaldem Radio stream — self-hosted AzuraCast on the church VPS.
  // Station "Movaldem Radio" is live at radio.movaldem.teta.dpdns.org;
  // upload sermon/music audio in the AzuraCast panel and the AutoDJ
  // plays it. HTTPS Icecast mount (no mixed-content issues).
  ZENO_STREAM_URL: "https://radio.movaldem.teta.dpdns.org/listen/movaldem/radio.mp3",
  ZENO_STATION_NAME: "Movaldem Radio",

  // Firebase (for instant push alerts). The church creates a Firebase
  // project, adds google-services.json at android/app/, and pastes the
  // server key into the movaldem-core push settings in WP Admin.
  PUSH_ENABLED: false,

  APP_NAME: "Movaldem",
  CHURCH_FULL_NAME: "Mountain of Victory at the Last Day Evangelical Ministry",
  CHURCH_ADDRESS: "17, Sikiru Omolaja Street, Oke Abiye, Alagbado, Lagos State",
  CHURCH_PHONE: "+234 903 452 9959",
};
