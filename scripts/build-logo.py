"""Build an outlined, font-independent wordmark from the bundled OFL Outfit source."""
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen
root=Path(__file__).resolve().parents[1]
source=root/'docs/art/brand-font/Outfit.ttf'
fonts={w:instantiateVariableFont(TTFont(source),{'wght':w},inplace=False) for w in [550,750]}
def lettering(text,x,baseline,size,weight,fill,tracking=0):
 f=fonts[weight]; gs=f.getGlyphSet(); cmap=f.getBestCmap(); units=f['head'].unitsPerEm; scale=size/units; parts=[]
 for char in text:
  glyph=cmap[ord(char)];pen=SVGPathPen(gs);gs[glyph].draw(pen)
  if pen.getCommands():parts.append(f'<path d="{pen.getCommands()}" transform="translate({x:.3f} {baseline}) scale({scale:.5f} {-scale:.5f})"/>')
  x+=f['hmtx'][glyph][0]*scale+tracking
 return '<g fill="'+fill+'">'+''.join(parts)+'</g>',x
navy='#143657';teal='#087f80';gold='#edb746'
icon=f'<rect x="3" y="8" width="58" height="58" rx="17" fill="{navy}"/><rect x="15" y="22" width="34" height="9" rx="4.5" fill="{gold}"/><rect x="27" y="25" width="10" height="29" rx="4" fill="{gold}"/><path d="M36 35 Q34 34 34 37 V49 Q34 52 37 50 L46 44 Q48 42 46 41Z" fill="#fff9e6"/>'
a,end=lettering('TIGGY’S',76,43,39,750,navy,-.25)
b,last=lettering('Play',end+10,43,39,550,teal,-.3)
c,_=lettering('PLAY · LEARN · GROW',77,66,10,550,navy,1.6)
svg=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {last+5:.0f} 78"><title>Tiggy’s Play — Play, Learn, Grow</title>{icon}{a}{b}{c}</svg>'
(root/'public/assets/branding/tiggys-play-logo.svg').write_text(svg)
(root/'public/assets/branding/tiggys-play-icon.svg').write_text(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 72"><title>Tiggy’s Play</title><g transform="translate(4 -1)">{icon}</g></svg>')
print('Outlined wordmark and app icon generated.')
