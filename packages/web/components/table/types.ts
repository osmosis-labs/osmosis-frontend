export interface BaseCell {
  /** "Default" value to be rendered.
   * Leave undefined if using a custom ReactElement to render the cell
   * (or have that component accept `value` in it's props). */
  value?: string;
  rowHovered?: boolean;
}
