import medicalPreviews from './imagePreview-medical.json';
import { previewProps } from './imagePreview';
import React, { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Clock3, Film, Stethoscope } from 'lucide-react';
import type { MedicalDoctor } from './MedicalBooking';
import './MedicalDoctorProfile.css';

type Doctor = MedicalDoctor & { intro: string; focus: string[]; details: string };
type Props = { doctor: Doctor; onBack: () => void; onBook: (focusKey: string) => void; onService: () => void };
type Profile = { category: string; approach: string; interests: string[]; education: string[] };
const asset=(name:string)=>`/medical/generated/${name}.webp`;
const slug:Record<string,string>={anna:'therapy',cardio:'cardiology',neuro:'neurology',maria:'endocrinology'};
const doctorVideos=new Set(['anna','cardio','neuro','maria','ultrasound']);
const profiles: Record<string, Profile> = {
 anna:{category:'ТЕРАПИЯ',approach:'В центре внимания — ваше самочувствие и вопросы. На встрече специалист помогает собрать общую картину и понять, какие шаги обсудить дальше.',interests:['Первичная консультация','Профилактика','Разбор обследований'],education:['Высшее медицинское образование','Профильная подготовка по терапии']},
 cardio:{category:'КАРДИОЛОГИЯ',approach:'Консультация начинается с разговора о самочувствии и истории здоровья. Врач обсуждает имеющиеся результаты и объясняет возможные дальнейшие шаги.',interests:['Здоровье сердца и сосудов','Оценка факторов риска','Разбор обследований'],education:['Высшее медицинское образование','Профильная подготовка по кардиологии']},
 neuro:{category:'НЕВРОЛОГИЯ',approach:'Специалист внимательно выслушивает и уточняет, как симптомы влияют на повседневную жизнь, а затем обсуждает возможный план дальнейших действий.',interests:['Головная боль','Вопросы о сне','Обсуждение результатов обследований'],education:['Высшее медицинское образование','Профильная подготовка по неврологии']},
 maria:{category:'ЭНДОКРИНОЛОГИЯ',approach:'Врач рассматривает вопросы гормонального здоровья в контексте вашей истории, обсуждает результаты обследований и отвечает на вопросы.',interests:['Гормональное здоровье','Обмен веществ','Разбор анализов'],education:['Высшее медицинское образование','Профильная подготовка по эндокринологии']},
 ultrasound:{category:'УЛЬТРАЗВУКОВАЯ ДИАГНОСТИКА',approach:'Специалист объясняет, как проходит исследование, и помогает сориентироваться в его организационных деталях.',interests:['Ультразвуковые исследования','Подготовка к исследованию','Описание результатов'],education:['Высшее медицинское образование','Профильная подготовка по ультразвуковой диагностике']},
};
const money=(value:number)=>`${new Intl.NumberFormat('ru-RU').format(value)} ₽`;

export default function MedicalDoctorProfile({doctor,onBack,onBook,onService}:Props){
 const [selected,setSelected]=useState(0);
 const [videoUnavailable,setVideoUnavailable]=useState(false);
 useEffect(()=>{setSelected(0);setVideoUnavailable(false)},[doctor.id]);
 const path=slug[doctor.id];
 const photos=doctor.id==='ultrasound'
   ? [doctor.image,asset('med-v3-ultrasound-main'),asset('med-v3-ultrasound-1'),asset('med-v3-ultrasound-2')]
   : [doctor.image,asset(`med-v2-${path||'therapy'}-main`),asset(`med-v2-${path||'therapy'}-1`),asset(`med-v2-${path||'therapy'}-2`)];
 const profile=profiles[doctor.id] || {category:doctor.specialty.toUpperCase(),approach:doctor.details,interests:doctor.focus,education:['Высшее медицинское образование','Профильная подготовка по специальности']};
 return <article className="meddoc">
   <button type="button" className="meddoc-back" onClick={onBack}><ArrowLeft size={18}/> Назад</button>
   <div className="meddoc-eyebrow"><span>СПЕЦИАЛИСТ / {doctor.specialty.toUpperCase()}</span><span>БЛИЖЕ</span></div>
   <h1>{doctor.name}<span>.</span></h1>
   <p className="meddoc-intro">{doctor.intro}</p>
   <div className="meddoc-book"><div><span>{doctor.id==='ultrasound'?'ИССЛЕДОВАНИЕ':'КОНСУЛЬТАЦИЯ'} · {doctor.duration} МИН</span><strong>{money(doctor.price)}</strong></div><button type="button" data-med-book="doctor" onClick={()=>onBook('doctor')}>Записаться <ArrowRight size={18}/></button></div>
   <div className="meddoc-gallery"><div className="meddoc-gallery-rail">{photos.slice(1).map((src,index)=><button key={src} type="button" onClick={()=>setSelected(index+1)} aria-pressed={selected===index+1} aria-label={`Показать иллюстрацию приёма ${index+2}`}><img src={src} {...previewProps(src,medicalPreviews)} alt=""/></button>)}</div><div className="meddoc-main-image"><img src={photos[selected]} {...previewProps(photos[selected],medicalPreviews)} alt={selected===0?`Демонстрационный портрет специалиста ${doctor.name}`:`Иллюстрация консультации по направлению ${doctor.specialty}`}/><span>{String(selected+1).padStart(2,'0')} / 04</span></div></div>
   <div className="meddoc-gallery-note"><span>{selected===0?'ПОРТРЕТ СПЕЦИАЛИСТА':`ИЛЛЮСТРАЦИЯ ПРИЁМА ${selected+1} / 04`}</span>{selected!==0&&<button type="button" onClick={()=>setSelected(0)}>Вернуть портрет <ArrowRight size={14}/></button>}</div>
   <p className="meddoc-demo">Демонстрационный профиль. Имя, фотографии и квалификация — пример оформления, не сведения о действующем враче.</p>
   <section className="meddoc-section"><div className="meddoc-rule"><span>01 / ЗНАКОМСТВО</span><span>МЕДИЦИНА С ВНИМАНИЕМ</span></div><h2>ВРЕМЯ ВАС<br/>УСЛЫШАТЬ<span>.</span></h2><p>{profile.approach}</p><p>{doctor.details}</p></section>
   <section className="meddoc-section"><div className="meddoc-rule"><span>02 / СПЕЦИАЛИЗАЦИЯ</span><span>{profile.category}</span></div><h2>О ЧЁМ МОЖНО<br/>ПОГОВОРИТЬ<span>.</span></h2><div className="meddoc-list">{profile.interests.map((topic,index)=><div key={topic}><span>0{index+1}</span><p>{topic}</p><ArrowRight size={16}/></div>)}</div><button type="button" className="meddoc-link" onClick={onService}>Подробнее о направлении <ArrowRight size={17}/></button></section>
   <section className="meddoc-section meddoc-education"><div className="meddoc-rule"><span>03 / ОБРАЗОВАНИЕ</span><span>ПРИМЕР ПРОФИЛЯ</span></div><h2>ОПЫТ И<br/>ПОДГОТОВКА<span>.</span></h2><p>Так в профиле можно представить образование и профессиональную подготовку специалиста.</p><ol>{profile.education.map((item,index)=><li key={item}><span>0{index+1}</span><strong>{item}</strong><small>Пример заполнения</small></li>)}</ol><p className="meddoc-education-note">Данные вымышлены. В приложении действующего центра здесь указываются подтверждённые сведения о враче.</p></section>
   <section className="meddoc-video-section"><div className="meddoc-rule"><span>04 / ЗНАКОМСТВО СО СПЕЦИАЛИСТОМ</span><Film size={16}/></div><h2>БЛИЖЕ<br/>К ДОВЕРИЮ<span>.</span></h2><p>Посмотрите короткую визуальную историю специалиста и его направления.</p>{videoUnavailable?<div className="meddoc-video-fallback"><Film size={22}/><span>Демонстрационное видео временно недоступно.</span></div>:<video key={doctor.id} className="meddoc-video" controls playsInline preload="metadata" poster={doctorVideos.has(doctor.id)?asset(`med-v3-doctor-${doctor.id}-poster`):doctor.image} aria-label={`Демонстрационный видеоролик специалиста ${doctor.name}`} onError={()=>setVideoUnavailable(true)}><source src={doctorVideos.has(doctor.id)?`/medical/video/doctor-${doctor.id}.mp4`:'/medical/video/intro.mp4'} type="video/mp4" onError={()=>setVideoUnavailable(true)}/>Ваш браузер не поддерживает видео.</video>}<p className="meddoc-video-description">В ролике: имя и направление специалиста, фотографии центра и демонстрационного приёма.</p><small>Демонстрационный видеоряд без звука. Люди и пространство вымышлены.</small></section>
   <section className="meddoc-end"><span>ВАШ СЛЕДУЮЩИЙ ШАГ</span><h2>НАЙДЁМ<br/>ВРЕМЯ<span>.</span></h2><p>Выберите удобную дату для демонстрационной записи.</p><div className="meddoc-end-meta"><span><Clock3 size={16}/>{doctor.duration} мин</span><span><Stethoscope size={16}/>{doctor.specialty}</span></div><button type="button" data-med-book="doctor-end" onClick={()=>onBook('doctor-end')}>Выбрать время <ArrowRight size={19}/></button><small>Запись сохраняется только на этом устройстве.</small></section>
 </article>;
}
