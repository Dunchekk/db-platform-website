import { useEffect, useRef } from "react";
import cls from "@/layers/AboutLayer/AboutLayer.module.css";

import frame28 from "@/assets/images/bg-items/Frame 28.png";
import frame29 from "@/assets/images/bg-items/Frame 29.png";
import frame30 from "@/assets/images/bg-items/Frame 30.png";
import frame31 from "@/assets/images/bg-items/Frame 31.png";
import frame32 from "@/assets/images/bg-items/Frame 32.png";

const AboutLayer = () => {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);

  const rafIdRef = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);
  const directionRef = useRef<-1 | 1>(-1);
  const offsetRef = useRef(0);
  const boundsRef = useRef({ min: 0, max: 0 });

  useEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;

    const reduceMotionQuery = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)"
    );
    if (reduceMotionQuery?.matches) return;

    const SPEED_PX_PER_S = 12;

    const applyTransform = () => {
      track.style.transform = `translate3d(0, ${offsetRef.current}px, 0)`;
    };

    function tick(ts: number) {
      if (lastTsRef.current === null) lastTsRef.current = ts;
      const dt = (ts - lastTsRef.current) / 1000;
      lastTsRef.current = ts;

      const { min, max } = boundsRef.current;
      if (min === max) {
        offsetRef.current = 0;
        applyTransform();
        rafIdRef.current = null;
        return;
      }

      let next = offsetRef.current + directionRef.current * SPEED_PX_PER_S * dt;

      if (next <= min) {
        next = min;
        directionRef.current = 1;
      } else if (next >= max) {
        next = max;
        directionRef.current = -1;
      }

      offsetRef.current = next;
      applyTransform();
      rafIdRef.current = window.requestAnimationFrame(tick);
    }

    const measure = () => {
      const viewportHeight = viewport.getBoundingClientRect().height;
      const trackHeight = track.getBoundingClientRect().height;

      const min = Math.min(0, viewportHeight - trackHeight);
      boundsRef.current = { min, max: 0 };

      offsetRef.current = Math.max(min, Math.min(0, offsetRef.current));
      applyTransform();

      if (rafIdRef.current === null && min !== 0) {
        lastTsRef.current = null;
        rafIdRef.current = window.requestAnimationFrame(tick);
      }
    };

    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(viewport);
    ro.observe(track);

    return () => {
      ro.disconnect();
      if (rafIdRef.current !== null) {
        window.cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  return (
    <div className={cls.main}>
      <div className={cls.imgs} ref={viewportRef} aria-hidden="true">
        <div className={cls.imgTrack} ref={trackRef}>
          {[frame28, frame29, frame30, frame31, frame32].map((src) => (
            <img key={src} className={cls.img} src={src} alt="" />
          ))}
        </div>
      </div>
      <div className={cls.wrapper}>
        <div>DB:</div>
        <div className={cls.textwrapper}>
          <div className={cls.p}>
            <p>
              Мне нравится создавать, и&nbsp;предметы, которые я&nbsp;создаю,
              получают какое-то одобрение от&nbsp;моего окружения. Устраиваться
              же&nbsp;на&nbsp;работу&nbsp;— просто самое отвратное для меня
              дело; это как школа, только еще хуже. И&nbsp;я&nbsp;подумал, что
              могу попробовать монетизировать свое увлечение.
            </p>
            <p>
              Почему мои предметы именно такие? Мне нравится окружать себя
              чем-то максимально веселым, максимально не-негативным, без
              ограничений. Подобные предметы мне больше всего нравится
              и&nbsp;создавать — максимально веселые.
            </p>
            <p>
              Также предметы, попадающие сюда, должны иметь какой-то
              практический смысл. Мои предметы не должны быть «дополнением», они
              должны как-бы заменять уже и&nbsp;так обязательные вещи
              на&nbsp;себя, на&nbsp;веселый вариант этих вещей.
            </p>
            <p>
              Ну и&nbsp;качество, это дефолт. Важно, чтобы их&nbsp;жизненный
              цикл был адекватным для подобных предметов. Хочу, чтобы эти
              предметы выполняли свою функцию и&nbsp;не&nbsp;страдали
              от&nbsp;этого.
            </p>
          </div>
          <div className={cls.p}>
            <p>
              Что касается технологии, мне интересно всё. Все&nbsp;пути,
              все&nbsp;варианты создания предмета. Но,&nbsp;очевидно,
              я&nbsp;использую те,&nbsp;которые мне сейчас доступнее всего.
              У&nbsp;меня нет завода или промышленных станков, я&nbsp;создаю
              те&nbsp;предметы, которые могу создать в&nbsp;рамках своих
              финансов и&nbsp;физических возможностей.
            </p>
            <p>
              Я начал осваивать кожу, как один из&nbsp;доступных вариантов
              создания предмета, и&nbsp;в&nbsp;этот момент создал мешочек.
              Поэтому мешочек стал кожаным. Если бы я&nbsp;осваивал фрезерный
              станок, то&nbsp;я&nbsp;бы&nbsp;сделал какой-то предмет, который
              создается с&nbsp;помощью фрезеровки.
            </p>

            <p>
              Так что, давайте я&nbsp;вам мешочки (и не только),
              а&nbsp;вы&nbsp;мне возможность не&nbsp;работать на&nbsp;кого-то?
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutLayer;
