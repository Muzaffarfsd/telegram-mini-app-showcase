import {useEffect, useRef, useState} from 'react';
import {X} from 'lucide-react';
import {previewProps} from './imagePreview';
import {useGalleryPan} from './useGalleryPan';
import './GalleryInlineZoom.css';

type Props={src:string; alt:string; label:string; className:string; preview:ReturnType<typeof previewProps>; counter?:string; counterClass?:string};

/** Magnify inside the existing image frame; the gallery and page remain in place. */
export function GalleryInlineZoom({src,alt,label,className,preview,counter,counterClass}:Props){
 const [expanded,setExpanded]=useState(false);
 const trigger=useRef<HTMLButtonElement>(null);
 const close=useRef<HTMLButtonElement>(null);
 const pan=useGalleryPan(expanded,trigger,1.55,src);
 useEffect(()=>{
  if(!expanded)return;
  close.current?.focus({preventScroll:true});
  const key=(event:KeyboardEvent)=>{
   if(event.key==='Escape'){event.preventDefault();setExpanded(false)}
   else if((document.activeElement===close.current||document.activeElement===trigger.current||trigger.current?.closest('.lumi-v4-gallery,.medsvc-gallery,.lumi-artist-hero-grid')?.contains(document.activeElement))&&['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)){event.preventDefault();pan.onArrow(event.key)}
  };
  window.addEventListener('keydown',key);
  return()=>{window.removeEventListener('keydown',key);if(trigger.current?.isConnected)trigger.current.focus({preventScroll:true})};
 },[expanded]);
 return <div className={`${className} inline-zoom${expanded?' is-zoomed':''}`}>
  <button ref={trigger} type="button" className="inline-zoom-trigger" aria-label={`${expanded?'Уменьшить':'Увеличить'}: ${label}`} aria-pressed={expanded} onClick={()=>{if(!pan.consumeClick())setExpanded(value=>!value)}} onPointerDown={pan.onPointerDown} onPointerMove={pan.onPointerMove} onPointerUp={pan.onPointerUp} onPointerCancel={pan.onPointerCancel}><img draggable={false} src={src} {...preview} style={{...preview.style,...(expanded?{transform:`translate(${pan.offset.x}px, ${pan.offset.y}px) scale(1.55)`}:{})}} alt={alt}/>{counter&&<span className={counterClass}>{counter}</span>}</button>
  {expanded&&<button ref={close} type="button" className="inline-zoom-close" aria-label="Закрыть увеличение фотографии. Для перемещения используйте стрелки" onClick={()=>setExpanded(false)}><X size={22}/></button>}
 </div>;
}
