import { useEffect, useRef } from "react";
import { useLocation } from "react-router";
import cls from "@/layers/AboutLayer/AboutLayer.module.css";
import M_BackButton from "@/components/molecules/M_BackButton/M_BackButton";
import W_ScrollFadeBox from "@/components/wrappers/W_ScrollFadeBox/W_ScrollFadeBox";
import { useObjects } from "@/features/objects/objects.store";

const AboutLayer = () => {
  const { pathname } = useLocation();
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);

  const rafIdRef = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);
  const directionRef = useRef<-1 | 1>(-1);
  const offsetRef = useRef(0);
  const boundsRef = useRef({ min: 0, max: 0 });

  const API_URL = __API_URL__;

  const images: string[] = useObjects((state) => state.objects).flatMap((obj) =>
    obj.images.map((img) =>
      img.url.startsWith("http") ? img.url : API_URL + img.url
    )
  );

  console.log(images);

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

  // разобраться с ассетами (переделать под внешние ссылки и запрос на все картинки)
  // возможно переделать логику движения (/разобратсья в существующей)

  return (
    <div
      className={`${cls.main} ${pathname === "/about" ? cls.aboutRoute : ""}`}
    >
      <M_BackButton isVisible={pathname === "/about"} />
      <div className={cls.imgs} ref={viewportRef} aria-hidden="true">
        <div className={cls.imgTrack} ref={trackRef}>
          {images.map((src) => (
            <img key={src} className={cls.img} src={src} alt="" />
          ))}
        </div>
      </div>
      <div className={cls.wrapper}>
        <div className={cls.dbHeader}> DB:</div>
        <div className={cls.textwrapper}>
          <div className={cls.p}>
            <p>
              Мне нравится создавать, и предметы, которые я создаю, получают
              какое-то одобрение от моего окружения. Устраиваться же на работу —
              просто самое отвратное для меня дело; это как школа, только еще
              хуже. И я подумал, что могу попробовать монетизировать свое
              увлечение.
            </p>
            <p>
              Почему мои предметы именно такие? Мне нравится окружать себя
              чем-то максимально веселым, максимально не-негативным, без
              ограничений. Подобные предметы мне больше всего нравится и
              создавать — максимально веселые.
            </p>
            <p>
              Также предметы, попадающие сюда, должны иметь какой-то
              практический смысл. Мои предметы не должны быть «дополнением», они
              должны как-бы заменять уже и так обязательные вещи на себя, на
              веселый вариант этих вещей.
            </p>
            <p>
              Ну и качество, это дефолт. Важно, чтобы их жизненный цикл был
              адекватным для подобных предметов. Хочу, чтобы эти предметы
              выполняли свою функцию и не страдали от этого.
            </p>
          </div>
          <div className={cls.p}>
            <p>
              Что касается технологии, мне интересно всё. Все пути, все варианты
              создания предмета. Но, очевидно, я использую те, которые мне
              сейчас доступнее всего. У меня нет завода или промышленных
              станков, я создаю те предметы, которые могу создать в рамках своих
              финансов и физических возможностей.
            </p>
            <p>
              Я начал осваивать кожу, как один из доступных вариантов создания
              предмета, и в этот момент создал мешочек. Поэтому мешочек стал
              кожаным. Если бы я осваивал фрезерный станок, то я бы сделал
              какой-то предмет, который создается с помощью фрезеровки.
            </p>

            <p>
              Так что, давайте я вам мешочки (и не только), а вы мне возможность
              не работать на кого-то?
            </p>
          </div>
        </div>

        {/* убрать все nbsp позже */}

        <W_ScrollFadeBox className={cls.mobileScroll} height="100%">
          <p className={cls.mobileText}>
            Мне нравится создавать, и предметы, которые я создаю, получают
            какое-то одобрение от моего окружения. Устраиваться же на работу —
            просто самое отвратное для меня дело; это как школа, только еще
            хуже. И я подумал, что могу попробовать монетизировать свое
            увлечение.
            <br />
            <br />
            Почему мои предметы именно такие? Мне нравится окружать себя чем-то
            максимально веселым, максимально не-негативным, без ограничений.
            Подобные предметы мне больше всего нравится и создавать —
            максимально веселые.
            <br />
            <br />
            Также предметы, попадающие сюда, должны иметь какой-то практический
            смысл. Мои предметы не должны быть «дополнением», они должны как-бы
            заменять уже и так обязательные вещи на себя, на веселый вариант
            этих вещей.
            <br />
            <br />
            Ну и качество, это дефолт. Важно, чтобы их жизненный цикл был
            адекватным для подобных предметов. Хочу, чтобы эти предметы
            выполняли свою функцию и не страдали от этого.
            <br />
            <br />
            Что касается технологии, мне интересно всё. Все пути, все варианты
            создания предмета. Но, очевидно, я использую те, которые мне сейчас
            доступнее всего. У меня нет завода или промышленных станков, я
            создаю те предметы, которые могу создать в рамках своих финансов и
            физических возможностей.
            <br />
            <br />
            Я начал осваивать кожу, как один из доступных вариантов создания
            предмета, и в этот момент создал мешочек. Поэтому мешочек стал
            кожаным. Если бы я осваивал фрезерный станок, то я бы сделал
            какой-то предмет, который создается с помощью фрезеровки.
            <br />
            <br />
            Так что, давайте я вам мешочки (и не только), а вы мне возможность
            не работать на кого-то?
          </p>
        </W_ScrollFadeBox>
      </div>
    </div>
  );
};

export default AboutLayer;
