"use client";

import {
  StaticImageData,
  type StaticImport,
} from "next/dist/shared/lib/get-img-props";
import Image from "next/image";
import { useState } from "react";
import { Button } from "./ui/button";
import { Gmail } from "./logos/gmail";
import {
  GithubIcon,
  InstagramIcon,
  PinterestIcon,
  SpotifyIcon,
  TelegramIcon,
  YoutubeIcon,
} from "./social-icons";

export interface HeroProps {
  img: StaticImport;
  profile: StaticImport;
}

export function Hero({ img, profile }: HeroProps) {
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  const image = img as StaticImageData;
  const profileImg = profile as StaticImageData;

  return (
    <div className="relative">
      <div className="relative w-full max-h-72 overflow-clip rounded-lg">
        <Image
          src={image}
          alt="Hero Image"
          height={1080}
          placeholder="blur"
          blurDataURL={image.blurDataURL}
          onLoad={() => setIsImageLoading(false)}
          className={`${
            isImageLoading ? "blur scale-150" : "remove-blur scale-100"
          } relative z-0 transition-all ease-[cubic-bezier(0.22,_1,_0.36,_1)] duration-500`}
        />
      </div>

      <div className="relative mx-auto -mt-18 size-28 aspect-square overflow-clip rounded-full border-6 border-background md:mx-0 md:ml-5 md:size-36">
        <Image
          src={profileImg}
          unoptimized={profileImg.src.includes("animated")}
          alt="Profile Picture"
          height={500}
          placeholder="blur"
          blurDataURL={profileImg.blurDataURL}
          onLoad={() => setIsProfileLoading(false)}
          className={`${
            isProfileLoading ? "blur scale-150" : "remove-blur scale-100"
          } transition-all ease-[cubic-bezier(0.22,_1,_0.36,_1)] duration-500`}
        />
      </div>

      <div className="relative flex w-full flex-col items-center justify-center gap-3 py-3 md:-mt-18 md:flex-row md:justify-between md:gap-5">
        <p className="w-full truncate text-center text-2xl font-bold text-foreground dark:font-semibold md:pl-46 md:text-start">
          Hazel
        </p>

        <div className="flex w-fit items-center justify-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <a
              href="https://github.com/HexVandal"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
            >
              <GithubIcon className="size-5" />
              <span className="sr-only">GitHub</span>
            </a>
          </Button>

          <Button variant="ghost" size="icon" asChild>
            <a
              href="https://instagram.com/yourhotgrandpaaa"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <InstagramIcon className="size-5" />
              <span className="sr-only">Instagram</span>
            </a>
          </Button>

          <Button variant="ghost" size="icon" asChild>
            <a
              href="https://pinterest.com/starlithazel"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Pinterest"
            >
              <PinterestIcon className="size-5" />
              <span className="sr-only">Pinterest</span>
            </a>
          </Button>

          <Button variant="ghost" size="icon" asChild>
            <a
              href="https://open.spotify.com/user/314zc4ljngbdiyhvi46ckaonorai"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Spotify"
            >
              <SpotifyIcon className="size-5" />
              <span className="sr-only">Spotify</span>
            </a>
          </Button>

          <Button variant="ghost" size="icon" asChild>
            <a
              href="https://t.me/HexVandal"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Telegram"
            >
              <TelegramIcon className="size-5" />
              <span className="sr-only">Telegram</span>
            </a>
          </Button>

          <Button variant="ghost" size="icon" asChild>
            <a
              href="https://youtube.com/@starlithazell"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
            >
              <YoutubeIcon className="size-5" />
              <span className="sr-only">YouTube</span>
            </a>
          </Button>

          <Button variant="ghost" size="icon" asChild>
            <a href="mailto:callmepriyansh@gmail.com" aria-label="Email">
              <Gmail className="size-5" />
              <span className="sr-only">Email</span>
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}