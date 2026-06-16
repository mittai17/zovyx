/**
 * Help examples shown by the Browser CLI root command.
 */
/** Core Browser CLI examples for lifecycle and inspection commands. */
export const browserCoreExamples = [
  "zuvix browser status",
  "zuvix browser start",
  "zuvix browser start --headless",
  "zuvix browser stop",
  "zuvix browser tabs",
  "zuvix browser open https://example.com",
  "zuvix browser focus abcd1234",
  "zuvix browser close abcd1234",
  "zuvix browser screenshot",
  "zuvix browser screenshot --full-page",
  "zuvix browser screenshot --ref 12",
  "zuvix browser snapshot",
  "zuvix browser snapshot --format aria --limit 200",
  "zuvix browser snapshot --efficient",
  "zuvix browser snapshot --labels",
];

/** Browser CLI examples for interaction/action commands. */
export const browserActionExamples = [
  "zuvix browser navigate https://example.com",
  "zuvix browser resize 1280 720",
  "zuvix browser click 12 --double",
  "zuvix browser click-coords 120 340",
  'zuvix browser type 23 "hello" --submit',
  "zuvix browser press Enter",
  "zuvix browser hover 44",
  "zuvix browser drag 10 11",
  "zuvix browser select 9 OptionA OptionB",
  "zuvix browser upload /tmp/zuvix/uploads/file.pdf",
  "zuvix browser upload media://inbound/file.pdf",
  'zuvix browser fill --fields \'[{"ref":"1","value":"Ada"}]\'',
  "zuvix browser dialog --accept",
  'zuvix browser wait --text "Done"',
  "zuvix browser evaluate --fn '(el) => el.textContent' --ref 7",
  "zuvix browser evaluate --fn 'const title = document.title; return title;'",
  "zuvix browser console --level error",
  "zuvix browser pdf",
];
