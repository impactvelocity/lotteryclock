/**
 * Where everything sits on the Play screen, shared by the screen itself and the scene preview
 * so theme scenes can rely on it. The scene fills the screen from the very top down to the
 * rail (the timeline the Set Alarm button sits on); below the rail is the footer, where the
 * rail's minute ticks hang down above the tab bar.
 */
export type PlayLayout = {
  width: number;
  height: number;
  /** Top of the header row (below the status bar). */
  headerTop: number;
  /** Top of the theme picker row. */
  pickerTop: number;
  /** Top edge of the dial (and of the bedside clock once set). */
  dialTop: number;
  /** Dial diameter. */
  dialSize: number;
  /** The dial's centre, in screen (and scene) coordinates. */
  dialX: number;
  dialY: number;
  /** The rail line's y: the scene ends here. */
  railY: number;
};

export const HEADER_H = 44;
export const PICKER_H = 48;
/** Footer: the rail's hanging ticks plus the floating tab bar. */
export const FOOTER_H = 132;
/** From the bottom of the dial to the rail: side labels, the tier / status, and the button's top half. */
const BELOW_DIAL = 176;

export function playLayout(width: number, height: number, insetTop: number): PlayLayout {
  const headerTop = insetTop + 2;
  const pickerTop = headerTop + HEADER_H + 8;
  const railY = height - FOOTER_H;
  const dialTop = pickerTop + PICKER_H + 26;
  const room = railY - dialTop - BELOW_DIAL;
  const dialSize = Math.round(Math.max(220, Math.min(width * 0.82, 340, room)));
  return {
    width,
    height,
    headerTop,
    pickerTop,
    dialTop,
    dialSize,
    dialX: width / 2,
    dialY: dialTop + dialSize / 2,
    railY,
  };
}
