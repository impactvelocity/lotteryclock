/**
 * The village's illustrations (web/src/components/scenes/art/classic/village), taken apart the
 * way the web's scripts/inline-classic-svgs.mjs does it: cottages split into layers with their
 * windows as data, the windmill's tower, window and hub, the rooster's poses, the trees. Read
 * from the synced art at first use, so a web art change only needs scripts/sync-art.mjs.
 */
import { artViewBox, type ArtKey } from '../art';
import { byId, parseArt, subpaths, withD, type SvgNode } from './svg-tree';

/** The art's palette colours the village recolours with the sunrise. */
export const PALETTE = {
  wall: '#FFF6EC',
  roof: '#E98A7B',
  roof2: '#B985A6',
  glass: '#A794AF',
  wood: '#704C68',
  canopy: '#80AD78',
  light: '#9CBE92',
  trunk: '#9B705E',
} as const;

export type CottageArt = {
  /** The art's grid: ground at y = h, the bottom 20 hidden behind the hill. */
  w: number;
  h: number;
  /** Main wall, chimney and roof. */
  under: SvgNode[];
  /** Drawn over the roof: a dormer's face and roof, and the door. */
  over: SvgNode[];
  /** x, y, w, h: lit one by one. */
  windows: number[][];
  /** Top centre of the chimney, where the smoke comes out. */
  smoke: [number, number] | null;
};

const num = (n: SvgNode, k: string) => Number(n.attrs[k]);

/**
 * A cottage, layered so a dormer reads right: the main wall, chimney and roof underneath; then
 * any further wall pieces (a dormer's face) and roof pieces (its little roof), and the door.
 */
function cottage(key: ArtKey): CottageArt {
  const svg = parseArt(key);
  const { w, h } = artViewBox(key);
  const wall = byId(svg, 'wall')!;
  const roof = byId(svg, 'roof')!;
  const chimney = byId(svg, 'chimney');
  const door = byId(svg, 'door');
  const wallSubs = subpaths(wall.attrs.d);
  const roofSubs = subpaths(roof.attrs.d);
  const under = [withD(wall, wallSubs[0]), chimney, withD(roof, roofSubs[0])];
  const over = [
    ...wallSubs.slice(1).map((d) => withD(wall, d)),
    ...roofSubs
      .slice(1)
      .filter((d) => !wallSubs.includes(d))
      .map((d) => withD(roof, d)),
    door,
  ];
  return {
    w,
    h,
    under: under.filter((n): n is SvgNode => !!n),
    over: over.filter((n): n is SvgNode => !!n),
    windows: (byId(svg, 'windows')?.kids ?? []).map((r) => ['x', 'y', 'width', 'height'].map((k) => num(r, k))),
    smoke: chimney ? [num(chimney, 'x') + num(chimney, 'width') / 2, num(chimney, 'y')] : null,
  };
}

export type MillArt = {
  w: number;
  h: number;
  /** The tower without its window (the window is drawn as a lamp). */
  tower: SvgNode[];
  /** cx, cy, r */
  window: [number, number, number];
  hub: [number, number];
  sails: SvgNode[];
  /** The sails' own square grid: they turn about its centre. */
  sailsSize: number;
};

function windmill(): MillArt {
  const svg = parseArt('classic/village/windmill-tower');
  const { w, h } = artViewBox('classic/village/windmill-tower');
  const win = byId(svg, 'window')!;
  const lamp = win.tag === 'circle' ? win : win.kids[0];
  const hub = byId(svg, 'hub')!;
  return {
    w,
    h,
    tower: svg.kids.filter((n) => n !== win),
    window: [num(lamp, 'cx'), num(lamp, 'cy'), num(lamp, 'r')],
    hub: [num(hub, 'cx'), num(hub, 'cy')],
    sails: parseArt('classic/village/windmill-sails').kids,
    sailsSize: artViewBox('classic/village/windmill-sails').w,
  };
}

export type TreeKind = 'round' | 'poplar' | 'apple';
export type RoosterArt = 'asleep' | 'standing' | 'crowing';

/** Everything, read once on first use. */
let art:
  | {
      cottages: CottageArt[];
      mill: MillArt;
      /** Trees on an 80 × 110 grid, trunk standing at (40, 110). */
      trees: Record<TreeKind, SvgNode[]>;
      /** The rooster facing right on a 64 grid, feet at the bottom: one per pose. */
      rooster: Record<RoosterArt, SvgNode[]>;
    }
  | undefined;

export function villageArt() {
  art ??= {
    cottages: (
      [
        'classic/village/cottage-01',
        'classic/village/cottage-02',
        'classic/village/cottage-03',
        'classic/village/cottage-04',
      ] as const
    ).map(cottage),
    mill: windmill(),
    trees: {
      round: parseArt('classic/village/tree-round').kids,
      poplar: parseArt('classic/village/tree-poplar').kids,
      apple: parseArt('classic/village/tree-apple').kids,
    },
    rooster: {
      asleep: parseArt('classic/village/rooster-asleep').kids,
      standing: parseArt('classic/village/rooster-standing').kids,
      crowing: parseArt('classic/village/rooster-crowing').kids,
    },
  };
  return art;
}
