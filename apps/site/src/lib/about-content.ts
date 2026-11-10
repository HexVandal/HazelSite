export const ABOUT_PROJECTS = [
  {
    name: "Nemesis",
    eyebrow: "SECURITY TOOLING · OPEN SOURCE",
    image: "/projects/nemesis.jpg",
    imageAlt: "Nemesis security tooling project banner",
    description:
      "An offensive-security scanner built around evidence: each check compares a baseline with a payload and reports what it can verify.",
    tags: ["Security", "Scanner", "Open source"],
    repoUrl: "https://github.com/HexVandal/nemesis",
  },
] as const;

type AboutInterest = {
  label: string;
  detail?: string;
  prefix?: string;
  emphasis?: string;
  suffix?: string;
};

export const ABOUT_INTERESTS: AboutInterest[] = [
  {
    label: "𝗕𝗼𝗼𝗸𝘀 𝗜 𝗹𝗼𝘃𝗲?",
    detail:
      "The kind that feel like secret manuals for taking over empires, seducing minds, or outwitting fate. If it’s dark, strategic, or slightly dangerous, it’s probably on my shelf.",
  },
  {
    label: "𝗙𝗮𝘃𝗼𝗿𝗶𝘁𝗲 𝗰𝗼𝗹𝗼𝗿𝘀?",
    detail:
      "Black for the drama, red for the passion, grey for the mystery, brown for the grounded elegance, and anything else that doesn’t scream, “Look at me, I’m neon!”",
  },
  {
    label: "𝗛𝗼𝗯𝗯𝗶𝗲𝘀?",
    detail:
      "Cooking like I’m feeding ancient gods, painting like I’m summoning old spirits, and reading like I’m decoding the universe one page at a time.",
  },
  {
    label: "𝗜𝗻𝘁𝗲𝗿𝗲𝘀𝘁𝘀?",
    detail:
      "I’m into all the deliciously dark and curious corners of the world: angels with questionable motives, demons with charm, forgotten mythologies, forbidden philosophies, psychology’s twisted tunnels, witchcraft, vampires, and the kind of history that makes you say, “Wait… did that really happen?”",
  },
  {
    label: "𝗠𝘆 𝗶𝗱𝗼𝗹𝘀?",
    detail:
      "A rather legendary bunch: Adolf Hitler—for raw, terrifying force (history, not morals); Cleopatra—for seductive strategy; Medusa—for weaponized silence; Napoleon—for ruthless ambition; Nikola Tesla—for beautiful madness; and Nyx—for being night itself.",
  },
  {
    label: "𝗠𝘆 𝗺𝘂𝘀𝗶𝗰 𝘁𝗮𝘀𝘁𝗲?",
    prefix:
      "A blend of alternative rock, dark pop, dreamy indie, slow-burning R&B, and a touch of vintage soul. I vibe with ",
    emphasis:
      "Lana Del Rey, Arctic Monkeys, The Weeknd, Avril Lavigne, Cigarettes After Sex, Elvis Presley and Frank Sinatra",
    suffix: ". It's probably on my playlist.",
  },
];

export const CONTACT_EMAIL = "callmepriyansh@gmail.com";
