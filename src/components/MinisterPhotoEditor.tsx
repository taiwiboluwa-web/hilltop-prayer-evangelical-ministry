import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '../supabase';

type MinisterPhotoEditorProps = {
  minister: any | undefined;
  images: string[];
  onSaved?: () => Promise<void> | void;
};

export default function MinisterPhotoEditor({ minister, images, onSaved }: MinisterPhotoEditorProps) {
  const [slot, setSlot] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [x, setX] = useState(50);
  const [y, setY] = useState(50);
  const [fit, setFit] = useState<'cover' | 'contain'>('cover');
  const [saving, setSaving] = useState(false);

  const currentImage = images[slot - 1] || '';

  useEffect(() => {
    if (!minister) return;
    const prefix = slot === 1 ? 'image' : `image_${slot}`;
    setFit(minister[`${prefix}_fit`] === 'contain' ? 'contain' : 'cover');
    setZoom(Number(minister[`${prefix}_zoom`]) || 100);
    setX(Number(minister[`${prefix}_position_x`]) || 50);
    setY(Number(minister[`${prefix}_position_y`]) || 50);
  }, [minister, slot]);

  const style = useMemo<React.CSSProperties>(() => ({
    width: '100%',
    height: '100%',
    objectFit: fit,
    objectPosition: `${x}% ${y}%`,
    transform: `scale(${zoom / 100})`,
    transformOrigin: 'center center',
    transition: 'transform 120ms ease, object-position 120ms ease',
  }), [fit, x, y, zoom]);

  const save = async () => {
    if (!minister?.id) {
      alert('Save the minister first, then adjust the photo.');
      return;
    }
    setSaving(true);
    const prefix = slot === 1 ? 'image' : `image_${slot}`;
    const payload = {
      [`${prefix}_fit`]: fit,
      [`${prefix}_zoom`]: zoom,
      [`${prefix}_position_x`]: x,
      [`${prefix}_position_y`]: y,
    };
    const { error } = await supabase.from('ministers').update(payload).eq('id', minister.id);
    setSaving(false);
    if (error) {
      alert(error.message);
      return;
    }
    await onSaved?.();
    alert(`Photo ${slot} display settings saved.`);
  };

  const reset = () => {
    setZoom(100);
    setX(50);
    setY(50);
    setFit('cover');
  };

  return (
    <section className="mt-6 p-5 rounded-2xl border border-[#c9a84c]/25 bg-[#c9a84c]/[.035]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div>
          <p className="text-[9px] tracking-[.18em] uppercase text-[#e4c76b]">Live photo preview</p>
          <h3 className="text-base font-semibold mt-1">Adjust how this minister appears</h3>
          <p className="text-[11px] text-neutral-500 mt-1">Move the sliders and the preview changes immediately.</p>
        </div>
        <button type="button" onClick={save} disabled={saving || !currentImage} className="h-10 px-5 rounded-full bg-[#d5aa49] text-[#09090b] text-[10px] font-bold uppercase tracking-[.12em] disabled:opacity-40">
          {saving ? 'Saving…' : 'Save adjustment'}
        </button>
      </div>

      <div className="grid lg:grid-cols-[minmax(260px,340px)_1fr] gap-6 items-start">
        <div>
          <div className="relative aspect-[4/5] w-full max-w-[340px] mx-auto rounded-2xl overflow-hidden border border-white/10 bg-[#09090e]">
            {currentImage ? <img src={currentImage} alt={`${minister?.name || 'Minister'} preview`} style={style} /> : <div className="absolute inset-0 flex items-center justify-center text-xs text-neutral-600 px-6 text-center">Upload a photo above, then select Photo 1, 2 or 3 to preview it here.</div>}
            <div className="absolute left-3 bottom-3 px-3 py-1.5 rounded-full bg-black/65 backdrop-blur text-[9px] uppercase tracking-wider text-white/80">Public card preview</div>
          </div>
          <div className="flex justify-center gap-2 mt-3">
            {[1, 2, 3].map(n => (
              <button key={n} type="button" onClick={() => setSlot(n)} className={`w-12 h-9 rounded-full border text-[9px] uppercase tracking-wider ${slot === n ? 'border-[#c9a84c] bg-[#c9a84c]/10 text-[#e4c76b]' : 'border-white/10 text-neutral-500'}`}>
                Photo {n}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-5 pt-1">
          <div>
            <p className="text-[9px] uppercase tracking-[.16em] text-neutral-500 mb-2">Selected image</p>
            <div className="flex items-center gap-2 flex-wrap">
              {[1, 2, 3].map(n => <span key={n} className={`px-3 py-1.5 rounded-full text-[9px] border ${slot === n ? 'border-[#c9a84c]/40 text-[#e4c76b]' : 'border-white/10 text-neutral-600'}`}>Photo {n}{images[n - 1] ? ' · Added' : ' · Empty'}</span>)}
            </div>
          </div>

          <label className="block text-[9px] font-bold tracking-[.16em] uppercase text-neutral-500">Zoom <span className="text-[#e4c76b]">{zoom}%</span><input type="range" min="70" max="200" step="1" value={zoom} onChange={e => setZoom(Number(e.target.value))} className="mt-3 w-full accent-[#c9a84c]" /></label>
          <label className="block text-[9px] font-bold tracking-[.16em] uppercase text-neutral-500">Horizontal position <span className="text-[#e4c76b]">{x}%</span><input type="range" min="0" max="100" step="1" value={x} onChange={e => setX(Number(e.target.value))} className="mt-3 w-full accent-[#c9a84c]" /></label>
          <label className="block text-[9px] font-bold tracking-[.16em] uppercase text-neutral-500">Vertical position <span className="text-[#e4c76b]">{y}%</span><input type="range" min="0" max="100" step="1" value={y} onChange={e => setY(Number(e.target.value))} className="mt-3 w-full accent-[#c9a84c]" /></label>

          <div>
            <p className="text-[9px] font-bold tracking-[.16em] uppercase text-neutral-500 mb-2">Image fit</p>
            <div className="flex gap-2">
              <button type="button" onClick={() => setFit('cover')} className={`h-10 px-5 rounded-full border text-[9px] uppercase tracking-wider ${fit === 'cover' ? 'border-[#c9a84c] text-[#e4c76b] bg-[#c9a84c]/10' : 'border-white/10 text-neutral-500'}`}>Cover</button>
              <button type="button" onClick={() => setFit('contain')} className={`h-10 px-5 rounded-full border text-[9px] uppercase tracking-wider ${fit === 'contain' ? 'border-[#c9a84c] text-[#e4c76b] bg-[#c9a84c]/10' : 'border-white/10 text-neutral-500'}`}>Contain</button>
              <button type="button" onClick={reset} className="h-10 px-5 rounded-full border border-white/10 text-[9px] uppercase tracking-wider text-neutral-500">Reset</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
