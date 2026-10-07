/**
 * Case folding for the component browser's search box.
 *
 * The catalogue's component names are ASCII identifiers — HEX_SENSOR_IMU_TORSO,
 * HEX_ACT_HIP_L — while the interface around them is bilingual. Turkish casing
 * folds ASCII `I` to dotless `ı`, so lowercasing an identifier with the Turkish
 * locale produced `hex_sensor_ımu_torso` while a reader typing `imu` produced
 * `imu`: the two could never meet. Search stopped matching, silently, for every
 * name containing an `I` — most of the catalogue.
 *
 * Folding the ASCII side in English would fix that side but break a Turkish
 * reader searching for a dotless `ı` in translated text, so both sides are
 * folded to the same canonical character instead.
 *
 * Kept out of the component so the rule can be exercised without rendering.
 */
export function foldForSearch(text: string): string {
  return text
    .replace(/İ/g, "i")
    .toLocaleLowerCase("tr")
    // Turkish lowercasing maps ASCII `I` to `ı`; map it back so an ASCII
    // identifier and a dotted Turkish needle land on the same character.
    .replace(/ı/g, "i");
}