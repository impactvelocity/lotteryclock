/**
 * A tiny reader for the synced scene art (../art.generated.ts), so Classic can take its
 * illustrations apart and recolour them live, like the web's inlined art does with CSS
 * variables. The art is plain generated SVG (paths, rects, circles, ellipses, groups, one
 * clip path), so a couple of regexes are enough. Each file is parsed once and cached.
 */
import { createElement, type ComponentType, type ReactNode } from 'react';
import { Circle, ClipPath, Defs, Ellipse, G, Path, Rect } from 'react-native-svg';

import { ART, type ArtKey } from '../art';

export type SvgNode = { tag: string; attrs: Record<string, string>; kids: SvgNode[] };

const TAG = /<(\/?)([a-zA-Z]+)((?:\s+[\w:-]+="[^"]*")*)\s*(\/?)>/g;
const ATTR = /([\w:-]+)="([^"]*)"/g;

const parsed = new Map<ArtKey, SvgNode>();

/** The <svg> root of an art file, as a tree. */
export function parseArt(key: ArtKey): SvgNode {
  let root = parsed.get(key);
  if (!root) {
    const top: SvgNode = { tag: '', attrs: {}, kids: [] };
    const stack = [top];
    for (const [, close, tag, raw, selfClose] of ART[key].matchAll(TAG)) {
      if (close) {
        stack.pop();
        continue;
      }
      const node: SvgNode = { tag, attrs: {}, kids: [] };
      for (const [, k, v] of raw.matchAll(ATTR)) node.attrs[k] = v;
      stack[stack.length - 1].kids.push(node);
      if (!selfClose) stack.push(node);
    }
    root = top.kids[0];
    parsed.set(key, root);
  }
  return root;
}

/** The first element with this id, anywhere in the tree. */
export function byId(node: SvgNode, id: string): SvgNode | undefined {
  if (node.attrs.id === id) return node;
  for (const kid of node.kids) {
    const hit = byId(kid, id);
    if (hit) return hit;
  }
  return undefined;
}

/** The same path with a different outline (and its plain nonzero fill). */
export function withD(node: SvgNode, d: string): SvgNode {
  const { 'fill-rule': _rule, ...attrs } = node.attrs;
  return { ...node, attrs: { ...attrs, d } };
}

/** A path's outline split at each move-to. */
export const subpaths = (d: string) =>
  d
    .trim()
    .split(/(?=M)/)
    .map((s) => s.trim());

/** Palette swaps: an art colour (upper-case hex) → the colour to draw it in. */
export type Paint = Record<string, string>;

const ELEMENTS: Record<string, ComponentType<any>> = {
  g: G,
  path: Path,
  rect: Rect,
  circle: Circle,
  ellipse: Ellipse,
  defs: Defs,
  clipPath: ClipPath,
};

const camel = (k: string) => k.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());

/**
 * Draw nodes as react-native-svg elements (titles and anything unknown are dropped), with
 * fills and strokes swapped through `paint`.
 */
export function renderSvg(nodes: SvgNode[], paint?: Paint, key = 'n'): ReactNode[] {
  return nodes
    .filter((n) => ELEMENTS[n.tag])
    .map((n, i) => {
      const props: Record<string, string> = { key: `${key}${i}` };
      for (const [k, v] of Object.entries(n.attrs)) {
        // Ids only matter for clip paths (and those are scoped to their own <Svg>)
        if (k === 'id' && n.tag !== 'clipPath') continue;
        props[camel(k)] = paint && (k === 'fill' || k === 'stroke') ? (paint[v.toUpperCase()] ?? v) : v;
      }
      return createElement(ELEMENTS[n.tag], props, ...renderSvg(n.kids, paint, `${key}${i}.`));
    });
}
