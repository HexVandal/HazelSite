import Image from "next/image";


interface PageHeroProps {
  image: string;
  alt: string;
  title: string;
}

export function PageHero({ image, alt, title }: PageHeroProps) {
  return (
    <section
      className="relative isolate h-56 w-full overflow-hidden rounded-lg sm:h-64 md:h-72"
      aria-label={`${title} page banner`}
    >
      <Image
        src={image}
        alt={alt}
        fill
        priority
        sizes="(max-width: 768px) 100vw, 768px"
        className="object-cover"
      />
      <div className="pointer-events-none absolute inset-0 z-[5] bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
      <h1 className="absolute bottom-3 left-1/2 z-10 w-max max-w-[90%] -translate-x-1/2 rounded-full bg-background/80 px-7 py-3 text-center font-doto text-xl font-bold text-foreground backdrop-blur-lg sm:text-2xl">
        {title}
      </h1>
    </section>
  );
}
