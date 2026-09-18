from pathlib import Path
import cairosvg

source = Path('public/midnight-anime-logo.svg')
out = Path('public/icons')
out.mkdir(parents=True, exist_ok=True)
for size in (192, 512):
    cairosvg.svg2png(url=str(source), write_to=str(out / f'icon-{size}.png'), output_width=size, output_height=size)
