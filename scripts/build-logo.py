"""Deploy the supplied outlined logo without redrawing or substituting its lettering."""
from pathlib import Path
import xml.etree.ElementTree as E
NS='http://www.w3.org/2000/svg'
E.register_namespace('',NS)
r=E.parse('docs/art/brand/TIGGYS-KIDS-LOGO-source.svg').getroot()
for e in list(r):
 if e.tag=='{'+NS+'}metadata':r.remove(e)
assert not any(e.tag.split('}')[-1] in ['script','image','foreignObject','text'] for e in r.iter())
E.ElementTree(r).write('public/assets/branding/tiggys-play-logo.svg',encoding='utf-8',xml_declaration=True)
r.set('viewBox','2100 80 520 520')
E.ElementTree(r).write('public/assets/branding/tiggys-play-icon.svg',encoding='utf-8',xml_declaration=True)
print('Copied supplied outlined logo and derived character-head icon; no artwork redrawn.')
