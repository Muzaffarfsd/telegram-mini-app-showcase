import {useEffect,useRef,useState} from 'react';
import type {PointerEvent, RefObject} from 'react';

/** Drag only inside an enlarged frame; page scrolling remains available elsewhere. */
export function useGalleryPan(expanded:boolean,frame:RefObject<HTMLButtonElement|null>,scale:number,source:string){
 const [offset,setOffset]=useState({x:0,y:0});
 const position=useRef({x:0,y:0});
 const drag=useRef<{x:number;y:number;startX:number;startY:number}|null>(null);
 const moved=useRef(false);
 useEffect(()=>{position.current={x:0,y:0};setOffset({x:0,y:0});},[expanded,source]);
 const move=(x:number,y:number)=>{const bounds=frame.current?.getBoundingClientRect();if(!bounds)return;const limitX=bounds.width*(scale-1)/2,limitY=bounds.height*(scale-1)/2;position.current={x:Math.max(-limitX,Math.min(limitX,x)),y:Math.max(-limitY,Math.min(limitY,y))};setOffset(position.current)};
 const onPointerDown=(event:PointerEvent<HTMLButtonElement>)=>{if(!expanded||event.button!==0)return;moved.current=false;drag.current={x:event.clientX,y:event.clientY,startX:position.current.x,startY:position.current.y};event.currentTarget.setPointerCapture(event.pointerId)};
 const onPointerMove=(event:PointerEvent<HTMLButtonElement>)=>{if(!drag.current)return;const dx=event.clientX-drag.current.x,dy=event.clientY-drag.current.y;if(Math.abs(dx)+Math.abs(dy)>5)moved.current=true;if(moved.current)move(drag.current.startX+dx,drag.current.startY+dy)};
 const onPointerEnd=()=>{drag.current=null};
 const consumeClick=()=>{const result=moved.current;moved.current=false;return result};
 const onArrow=(key:string)=>{const delta=28;if(key==='ArrowLeft')move(position.current.x+delta,position.current.y);else if(key==='ArrowRight')move(position.current.x-delta,position.current.y);else if(key==='ArrowUp')move(position.current.x,position.current.y+delta);else if(key==='ArrowDown')move(position.current.x,position.current.y-delta)};
 return {offset,onPointerDown,onPointerMove,onPointerUp:onPointerEnd,onPointerCancel:onPointerEnd,consumeClick,onArrow};
}
