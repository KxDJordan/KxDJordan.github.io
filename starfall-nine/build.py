#!/usr/bin/env python3
"""Inline src/css and src/js into a single self-contained index.html."""
import re, sys, pathlib
root = pathlib.Path(__file__).parent
src = root / 'src'
html = (src / 'index.html').read_text()
def css(m): return '<style>\n' + (src / m.group(1)).read_text().rstrip('\n') + '\n</style>'
def js(m): return '<script>\n' + (src / m.group(1)).read_text().rstrip('\n').replace('</script', '<\\/script') + '\n</script>'
html = re.sub(r'<!--CSS:(.+?)-->', css, html)
html = re.sub(r'<!--JS:(.+?)-->', js, html)
out = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else root / 'index.html'
out.write_text(html)
print('built', out, len(html), 'bytes')
