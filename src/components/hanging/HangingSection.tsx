"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  location: string;
  image: string;
  localImage: string;
  about: string;
  email: string;
  accent: string;
  projectOne: string;
  projectOneURL?: string;
  projectTwo: string;
  projectTwoURL?: string;
  qrSvgPath: string;
  linkedin?: string;
  instagram?: string;
  dribbble?: string;
  website?: string;
  hangOffset?: number;
}

export const TEAM_MEMBERS: TeamMember[] = [
  {
    id: "maya-bennett",
    name: "Maya Bennett",
    role: "Creative Director",
    location: "London, UK",
    image:
      "https://framerusercontent.com/images/vE78EAwfpz30V8aNc6Ta4T4lQ.jpg?width=5000&height=3000",
    localImage: "/hanging/maya-bennett.jpg",
    about: "Turning interesting ideas into things people remember.",
    email: "maya@example.com",
    accent: "rgb(119, 101, 238)",
    projectOne: "Identity / Forma",
    projectTwo: "Campaign / Light",
    qrSvgPath:
      "M0 0h7v1H0zM10 0h1v1H10zM12 0h2v1H12zM16 0h1v1H16zM18,0 h7v1H18zM0 1h1v1H0zM6 1h1v1H6zM9 1h1v1H9zM14 1h2v1H14zM18 1h1v1H18zM24,1 h1v1H24zM0 2h1v1H0zM2 2h3v1H2zM6 2h1v1H6zM8 2h1v1H8zM10 2h1v1H10zM12 2h1v1H12zM15 2h1v1H15zM18 2h1v1H18zM20 2h3v1H20zM24,2 h1v1H24zM0 3h1v1H0zM2 3h3v1H2zM6 3h1v1H6zM8 3h2v1H8zM11 3h1v1H11zM13 3h4v1H13zM18 3h1v1H18zM20 3h3v1H20zM24,3 h1v1H24zM0 4h1v1H0zM2 4h3v1H2zM6 4h1v1H6zM8 4h2v1H8zM16 4h1v1H16zM18 4h1v1H18zM20 4h3v1H20zM24,4 h1v1H24zM0 5h1v1H0zM6 5h1v1H6zM8 5h1v1H8zM10 5h3v1H10zM14 5h3v1H14zM18 5h1v1H18zM24,5 h1v1H24zM0 6h7v1H0zM8 6h1v1H8zM10 6h1v1H10zM12 6h1v1H12zM14 6h1v1H14zM16 6h1v1H16zM18,6 h7v1H18zM8 7h3v1H8zM12 7h1v1H12zM14 7h3v1H14zM0 8h1v1H0zM2 8h5v1H2zM11 8h3v1H11zM18 8h5v1H18zM0 9h2v1H0zM7 9h1v1H7zM9 9h2v1H9zM12 9h2v1H12zM16 9h2v1H16zM19 9h1v1H19zM21 9h2v1H21zM2 10h2v1H2zM6 10h3v1H6zM12 10h5v1H12zM19 10h1v1H19zM23,10 h2v1H23zM0 11h1v1H0zM5 11h1v1H5zM9 11h1v1H9zM15 11h1v1H15zM17 11h2v1H17zM23,11 h2v1H23zM0 12h3v1H0zM4 12h3v1H4zM10 12h6v1H10zM17 12h2v1H17zM20 12h3v1H20zM24,12 h1v1H24zM0 13h2v1H0zM5 13h1v1H5zM7 13h1v1H7zM9 13h2v1H9zM16 13h1v1H16zM19 13h1v1H19zM22 13h1v1H22zM0 14h1v1H0zM3 14h5v1H3zM11 14h3v1H11zM15 14h1v1H15zM18 14h2v1H18zM21 14h1v1H21zM23,14 h2v1H23zM0 15h1v1H0zM3 15h3v1H3zM9 15h3v1H9zM14 15h2v1H14zM17 15h4v1H17zM23,15 h2v1H23zM0 16h1v1H0zM2 16h1v1H2zM6 16h1v1H6zM10 16h2v1H10zM13 16h2v1H13zM16 16h5v1H16zM22 16h2v1H22zM8 17h1v1H8zM12 17h2v1H12zM16 17h1v1H16zM20 17h1v1H20zM0 18h7v1H0zM13 18h2v1H13zM16 18h1v1H16zM18 18h1v1H18zM20 18h2v1H20zM23,18 h2v1H23zM0 19h1v1H0zM6 19h1v1H6zM8 19h3v1H8zM12 19h1v1H12zM14 19h1v1H14zM16 19h1v1H16zM20 19h1v1H20zM23 19h1v1H23zM0 20h1v1H0zM2 20h3v1H2zM6 20h1v1H6zM8 20h3v1H8zM12,20 h13v1H12zM0 21h1v1H0zM2 21h3v1H2zM6 21h1v1H6zM8 21h2v1H8zM13 21h1v1H13zM17 21h2v1H17zM20 21h1v1H20zM22,21 h3v1H22zM0 22h1v1H0zM2 22h3v1H2zM6 22h1v1H6zM8 22h2v1H8zM11 22h2v1H11zM14 22h1v1H14zM18 22h2v1H18zM22 22h1v1H22zM24,22 h1v1H24zM0 23h1v1H0zM6 23h1v1H6zM9 23h3v1H9zM14 23h3v1H14zM18 23h1v1H18zM20 23h2v1H20zM24,23 h1v1H24zM0 24h7v1H0zM8 24h5v1H8zM18 24h1v1H18zM20 24h1v1H20zM22,24 h3v1H22z",
  },
  {
    id: "leo-carter",
    name: "Leo Carter",
    role: "Motion Designer",
    location: "Berlin, DE",
    image:
      "https://framerusercontent.com/images/VZS1XttgOTu9VjvbvyaIlSSSeg.jpg?width=5000&height=3000",
    localImage: "/hanging/leo-carter.jpg",
    about: "Making everyday interactions feel a little more alive.",
    email: "leo@example.com",
    accent: "rgb(182, 120, 237)",
    projectOne: "Motion / Orbit",
    projectTwo: "Launch / Loop",
    qrSvgPath:
      "M0 0h7v1H0zM12 0h1v1H12zM16 0h1v1H16zM18,0 h7v1H18zM0 1h1v1H0zM6 1h1v1H6zM12 1h1v1H12zM14 1h2v1H14zM18 1h1v1H18zM24,1 h1v1H24zM0 2h1v1H0zM2 2h3v1H2zM6 2h1v1H6zM8 2h1v1H8zM11 2h2v1H11zM14 2h3v1H14zM18 2h1v1H18zM20 2h3v1H20zM24,2 h1v1H24zM0 3h1v1H0zM2 3h3v1H2zM6 3h1v1H6zM8 3h1v1H8zM11 3h3v1H11zM18 3h1v1H18zM20 3h3v1H20zM24,3 h1v1H24zM0 4h1v1H0zM2 4h3v1H2zM6 4h1v1H6zM8 4h6v1H8zM16 4h1v1H16zM18 4h1v1H18zM20 4h3v1H20zM24,4 h1v1H24zM0 5h1v1H0zM6 5h1v1H6zM8 5h1v1H8zM10 5h1v1H10zM12 5h4v1H12zM18 5h1v1H18zM24,5 h1v1H24zM0 6h7v1H0zM8 6h1v1H8zM10 6h1v1H10zM12 6h1v1H12zM14 6h1v1H14zM16 6h1v1H16zM18,6 h7v1H18zM8 7h1v1H8zM11 7h2v1H11zM15 7h1v1H15zM0 8h1v1H0zM2 8h5v1H2zM11 8h6v1H11zM18 8h5v1H18zM0 9h3v1H0zM4 9h1v1H4zM7 9h1v1H7zM11 9h1v1H11zM16 9h1v1H16zM19 9h1v1H19zM21 9h2v1H21zM2 10h1v1H2zM4 10h1v1H4zM6 10h1v1H6zM8 10h6v1H8zM15 10h3v1H15zM19 10h1v1H19zM23,10 h2v1H23zM0 11h1v1H0zM7 11h5v1H7zM14 11h4v1H14zM19 11h1v1H19zM23,11 h2v1H23zM0 12h1v1H0zM2 12h1v1H2zM4 12h1v1H4zM6 12h1v1H6zM10 12h1v1H10zM13 12h2v1H13zM17 12h2v1H17zM20 12h3v1H20zM24,12 h1v1H24zM0 13h2v1H0zM3 13h3v1H3zM12 13h2v1H12zM16 13h1v1H16zM18 13h2v1H18zM22 13h1v1H22zM0 14h1v1H0zM2 14h5v1H2zM9 14h1v1H9zM13 14h4v1H13zM18 14h1v1H18zM21 14h1v1H21zM23,14 h2v1H23zM0 15h1v1H0zM3 15h1v1H3zM7 15h2v1H7zM12 15h1v1H12zM14 15h2v1H14zM18 15h3v1H18zM23,15 h2v1H23zM0 16h1v1H0zM3 16h2v1H3zM6 16h1v1H6zM8 16h2v1H8zM12 16h9v1H12zM22 16h2v1H22zM8 17h1v1H8zM13 17h1v1H13zM15 17h2v1H15zM20 17h1v1H20zM0 18h7v1H0zM9 18h1v1H9zM11 18h2v1H11zM14 18h1v1H14zM16 18h1v1H16zM18 18h1v1H18zM20 18h2v1H20zM23,18 h2v1H23zM0 19h1v1H0zM6 19h1v1H6zM8 19h4v1H8zM14 19h1v1H14zM16 19h1v1H16zM20 19h1v1H20zM0 20h1v1H0zM2 20h3v1H2zM6 20h1v1H6zM8 20h2v1H8zM11 20h1v1H11zM15,20 h10v1H15zM0 21h1v1H0zM2 21h3v1H2zM6 21h1v1H6zM8 21h3v1H8zM12 21h2v1H12zM15 21h1v1H15zM17 21h2v1H17zM20 21h1v1H20zM22,21 h3v1H22zM0 22h1v1H0zM2 22h3v1H2zM6 22h1v1H6zM8 22h1v1H8zM10 22h1v1H10zM13 22h4v1H13zM19 22h1v1H19zM22 22h1v1H22zM24,22 h1v1H24zM0 23h1v1H0zM6 23h1v1H6zM9 23h2v1H9zM12 23h2v1H12zM16 23h3v1H16zM20 23h2v1H20zM24,23 h1v1H24zM0 24h7v1H0zM8 24h3v1H8zM12 24h1v1H12zM14 24h1v1H14zM17 24h2v1H17zM20 24h1v1H20zM22,24 h3v1H22z",
  },
  {
    id: "noah-williams",
    name: "Noah Williams",
    role: "Product Designer",
    location: "New York, US",
    image:
      "https://framerusercontent.com/images/UtprVAqL5DgMwVt13i6q23DII04.jpg?width=5000&height=3000",
    localImage: "/hanging/noah-williams.jpg",
    about: "Designing small details that make the big picture work.",
    email: "noah@example.com",
    accent: "rgb(230, 126, 94)",
    projectOne: "Product / Atlas",
    projectTwo: "System / Mono",
    qrSvgPath:
      "M0 0h7v1H0zM11 0h5v1H11zM18,0 h7v1H18zM0 1h1v1H0zM6 1h1v1H6zM8 1h1v1H8zM10 1h1v1H10zM12 1h4v1H12zM18 1h1v1H18zM24,1 h1v1H24zM0 2h1v1H0zM2 2h3v1H2zM6 2h1v1H6zM9 2h1v1H9zM14 2h1v1H14zM16 2h1v1H16zM18 2h1v1H18zM20 2h3v1H20zM24,2 h1v1H24zM0 3h1v1H0zM2 3h3v1H2zM6 3h1v1H6zM9 3h4v1H9zM14 3h3v1H14zM18 3h1v1H18zM20 3h3v1H20zM24,3 h1v1H24zM0 4h1v1H0zM2 4h3v1H2zM6 4h1v1H6zM8 4h5v1H8zM14 4h2v1H14zM18 4h1v1H18zM20 4h3v1H20zM24,4 h1v1H24zM0 5h1v1H0zM6 5h1v1H6zM9 5h1v1H9zM11 5h1v1H11zM13 5h4v1H13zM18 5h1v1H18zM24,5 h1v1H24zM0 6h7v1H0zM8 6h1v1H8zM10 6h1v1H10zM12 6h1v1H12zM14 6h1v1H14zM16 6h1v1H16zM18,6 h7v1H18zM10 7h2v1H10zM13 7h4v1H13zM0 8h1v1H0zM2 8h1v1H2zM4 8h1v1H4zM6 8h1v1H6zM9 8h1v1H9zM11 8h6v1H11zM20 8h1v1H20zM23 8h1v1H23zM4 9h1v1H4zM7 9h2v1H7zM10 9h1v1H10zM16 9h3v1H16zM21,9 h4v1H21zM0 10h3v1H0zM5 10h4v1H5zM12 10h2v1H12zM18 10h2v1H18zM21,10 h4v1H21zM2 11h1v1H2zM4 11h2v1H4zM8 11h2v1H8zM11 11h1v1H11zM13 11h1v1H13zM15 11h1v1H15zM20 11h1v1H20zM0 12h2v1H0zM3 12h4v1H3zM8 12h2v1H8zM12 12h2v1H12zM16 12h3v1H16zM24,12 h1v1H24zM4 13h1v1H4zM7 13h1v1H7zM10 13h4v1H10zM16 13h3v1H16zM22,13 h3v1H22zM0 14h1v1H0zM2 14h5v1H2zM10 14h5v1H10zM16 14h1v1H16zM22,14 h3v1H22zM1 15h2v1H1zM5 15h1v1H5zM8 15h3v1H8zM12 15h4v1H12zM17 15h1v1H17zM20 15h1v1H20zM0 16h1v1H0zM3 16h1v1H3zM5 16h5v1H5zM11 16h1v1H11zM13 16h1v1H13zM15 16h7v1H15zM23 16h1v1H23zM8 17h1v1H8zM10 17h2v1H10zM16 17h1v1H16zM20 17h1v1H20zM23,17 h2v1H23zM0 18h7v1H0zM13 18h1v1H13zM15 18h2v1H15zM18 18h1v1H18zM20 18h1v1H20zM22,18 h3v1H22zM0 19h1v1H0zM6 19h1v1H6zM9 19h3v1H9zM13 19h2v1H13zM16 19h1v1H16zM20 19h1v1H20zM24,19 h1v1H24zM0 20h1v1H0zM2 20h3v1H2zM6 20h1v1H6zM8 20h3v1H8zM12 20h2v1H12zM16 20h5v1H16zM23,20 h2v1H23zM0 21h1v1H0zM2 21h3v1H2zM6 21h1v1H6zM9 21h4v1H9zM19 21h2v1H19zM22 21h1v1H22zM0 22h1v1H0zM2 22h3v1H2zM6 22h1v1H6zM8 22h1v1H8zM10 22h3v1H10zM15 22h2v1H15zM18 22h4v1H18zM24,22 h1v1H24zM0 23h1v1H0zM6 23h1v1H6zM10 23h1v1H10zM12 23h6v1H12zM19 23h3v1H19zM23 23h1v1H23zM0 24h7v1H0zM8 24h1v1H8zM11 24h2v1H11zM14 24h3v1H14zM18 24h1v1H18zM21 24h1v1H21zM23,24 h2v1H23z",
  },
  {
    id: "amina-yusuf",
    name: "Amina Yusuf",
    role: "Brand Designer",
    location: "Amsterdam, NL",
    image:
      "https://framerusercontent.com/images/LTTC2lb67PKlweeezA9pB8F1hr4.jpg?width=5000&height=3000",
    localImage: "/hanging/amina-yusuf.jpg",
    about: "Building visual worlds with warmth and a point of view.",
    email: "amina@example.com",
    accent: "rgb(40, 184, 141)",
    projectOne: "Brand / Ordinary",
    projectTwo: "Editorial / Field",
    qrSvgPath:
      "M0 0h7v1H0zM9 0h3v1H9zM14 0h1v1H14zM16 0h1v1H16zM18,0 h7v1H18zM0 1h1v1H0zM6 1h1v1H6zM9 1h1v1H9zM11 1h2v1H11zM15 1h2v1H15zM18 1h1v1H18zM24,1 h1v1H24zM0 2h1v1H0zM2 2h3v1H2zM6 2h1v1H6zM8 2h2v1H8zM12 2h1v1H12zM15 2h2v1H15zM18 2h1v1H18zM20 2h3v1H20zM24,2 h1v1H24zM0 3h1v1H0zM2 3h3v1H2zM6 3h1v1H6zM8 3h2v1H8zM13 3h2v1H13zM18 3h1v1H18zM20 3h3v1H20zM24,3 h1v1H24zM0 4h1v1H0zM2 4h3v1H2zM6 4h1v1H6zM8 4h6v1H8zM16 4h1v1H16zM18 4h1v1H18zM20 4h3v1H20zM24,4 h1v1H24zM0 5h1v1H0zM6 5h1v1H6zM8 5h1v1H8zM10 5h1v1H10zM14 5h3v1H14zM18 5h1v1H18zM24,5 h1v1H24zM0 6h7v1H0zM8 6h1v1H8zM10 6h1v1H10zM12 6h1v1H12zM14 6h1v1H14zM16 6h1v1H16zM18,6 h7v1H18zM8 7h2v1H8zM15 7h1v1H15zM0 8h1v1H0zM2 8h5v1H2zM9 8h2v1H9zM13 8h3v1H13zM18 8h5v1H18zM0 9h2v1H0zM3 9h3v1H3zM7 9h1v1H7zM10 9h1v1H10zM16 9h1v1H16zM19 9h1v1H19zM21 9h2v1H21zM1 10h1v1H1zM3 10h4v1H3zM8 10h1v1H8zM12 10h1v1H12zM14 10h2v1H14zM19 10h1v1H19zM23,10 h2v1H23zM1 11h4v1H1zM7 11h1v1H7zM11 11h1v1H11zM14 11h2v1H14zM17 11h4v1H17zM23,11 h2v1H23zM2 12h5v1H2zM9 12h2v1H9zM13 12h1v1H13zM16 12h3v1H16zM20 12h3v1H20zM24,12 h1v1H24zM0 13h6v1H0zM7 13h1v1H7zM9 13h2v1H9zM12 13h2v1H12zM16 13h1v1H16zM19 13h1v1H19zM22 13h1v1H22zM0 14h1v1H0zM2 14h2v1H2zM5 14h2v1H5zM8 14h2v1H8zM13 14h5v1H13zM19 14h1v1H19zM21 14h1v1H21zM23,14 h2v1H23zM0 15h1v1H0zM7 15h2v1H7zM10 15h1v1H10zM12 15h1v1H12zM15 15h2v1H15zM23,15 h2v1H23zM0 16h1v1H0zM2 16h5v1H2zM12 16h9v1H12zM22 16h2v1H22zM8 17h1v1H8zM10 17h1v1H10zM15 17h2v1H15zM20 17h1v1H20zM0 18h7v1H0zM9 18h5v1H9zM16 18h1v1H16zM18 18h1v1H18zM20 18h2v1H20zM23,18 h2v1H23zM0 19h1v1H0zM6 19h1v1H6zM8 19h1v1H8zM10 19h2v1H10zM14 19h1v1H14zM16 19h1v1H16zM20 19h1v1H20zM24,19 h1v1H24zM0 20h1v1H0zM2 20h3v1H2zM6 20h1v1H6zM8 20h1v1H8zM11 20h12v1H11zM0 21h1v1H0zM2 21h3v1H2zM6 21h1v1H6zM8 21h3v1H8zM12 21h2v1H12zM15 21h1v1H15zM17 21h2v1H17zM20 21h1v1H20zM22,21 h3v1H22zM0 22h1v1H0zM2 22h3v1H2zM6 22h1v1H6zM8 22h1v1H8zM13 22h3v1H13zM19 22h1v1H19zM22 22h1v1H22zM24,22 h1v1H24zM0 23h1v1H0zM6 23h1v1H6zM9 23h1v1H9zM14 23h2v1H14zM18 23h1v1H18zM20 23h2v1H20zM24,23 h1v1H24zM0 24h7v1H0zM8 24h1v1H8zM10 24h5v1H10zM17 24h2v1H17zM20 24h1v1H20zM22,24 h3v1H22z",
  },
];

// Physical constants matching Framer spec exactly
const CARD_WIDTH = 268;
const CARD_HEIGHT = 376;
const CARD_GAP = 36;
const BASE_WIRE_LENGTH = 66;
const WIRE_HEIGHT_VARIATION = 72;
const ROPE_SAG = 22;
const HORIZONTAL_PAD = 12;

// Height multiplier curve for realistic staggered wire lengths
const HEIGHT_CURVE = [0, 0.8, 0.26, 1, 0.47, 0.67, 0.15, 0.91, 0.36];
// Natural rest tilt angles (degrees)
const REST_ANGLES = [-2.2, 1.5, -1.1, 2, -1.8, 1.2, -1.3];

interface HangingCardProps {
  member: TeamMember;
  index: number;
  flipMode?: "hover" | "click";
  tiltMax?: number;
  swingStrength?: number;
  holoStrength?: number;
  wireWidth?: number;
  wireLength: number;
}

function HangingCard({
  member,
  index,
  flipMode = "hover",
  tiltMax = 9,
  swingStrength = 100,
  holoStrength = 78,
  wireWidth = 1.15,
  wireLength,
}: HangingCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const cardHitRef = useRef<HTMLDivElement | null>(null);
  const pendulumRef = useRef<HTMLDivElement | null>(null);
  const lastClientXRef = useRef<number | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  const targetRef = useRef({ x: 0, y: 0, light: 0, sway: 0 });
  const currentRef = useRef({ x: 0, y: 0, light: 0, sway: 0 });
  const velocityRef = useRef({ x: 0, y: 0, light: 0, sway: 0 });

  const restAngle = REST_ANGLES[index % REST_ANGLES.length];
  const swingFactor = Math.max(0, Math.min(1.8, swingStrength / 100));
  const maxTilt = Math.max(0, Math.min(20, tiltMax));
  const holoIntensity = Math.max(0, Math.min(1, holoStrength / 100));

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener?.("change", handler);
    return () => mq.removeEventListener?.("change", handler);
  }, []);

  const updateDOM = useCallback(
    (x: number, y: number, light: number) => {
      const hit = cardHitRef.current;
      if (hit) {
        hit.style.setProperty("--ht-rx", `${-y * maxTilt}deg`);
        hit.style.setProperty("--ht-ry", `${x * maxTilt}deg`);
        hit.style.setProperty("--ht-px", `${(x + 1) * 50}%`);
        hit.style.setProperty("--ht-py", `${(y + 1) * 50}%`);
        hit.style.setProperty("--ht-illumination", String(light * holoIntensity));
      }
      const pendulum = pendulumRef.current;
      if (pendulum) {
        pendulum.style.setProperty("--ht-sway", `${currentRef.current.sway}deg`);
      }
    },
    [maxTilt, holoIntensity]
  );

  const requestSpringStep = useCallback(() => {
    if (rafIdRef.current !== null || reducedMotion) return;
    lastTimeRef.current = 0;

    const step = (now: number) => {
      const dt = lastTimeRef.current
        ? Math.min(2.5, (now - lastTimeRef.current) / 16.67)
        : 1;
      lastTimeRef.current = now;

      let active = false;
      const keys = ["x", "y", "light", "sway"] as const;

      for (const k of keys) {
        const diff = targetRef.current[k] - currentRef.current[k];
        const stiffness = k === "sway" ? 0.092 : 0.17;
        const damping = k === "sway" ? 0.835 : 0.74;

        velocityRef.current[k] =
          (velocityRef.current[k] + diff * stiffness * dt) * Math.pow(damping, dt);
        currentRef.current[k] += velocityRef.current[k] * dt;

        if (
          Math.abs(diff) > 0.002 ||
          Math.abs(velocityRef.current[k]) > 0.002
        ) {
          active = true;
        } else {
          currentRef.current[k] = targetRef.current[k];
          velocityRef.current[k] = 0;
        }
      }

      updateDOM(
        currentRef.current.x,
        currentRef.current.y,
        currentRef.current.light
      );

      if (active) {
        rafIdRef.current = requestAnimationFrame(step);
      } else {
        rafIdRef.current = null;
      }
    };

    rafIdRef.current = requestAnimationFrame(step);
  }, [reducedMotion, updateDOM]);

  useEffect(() => {
    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, []);

  const handlePointerEnter = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reducedMotion || e.pointerType !== "mouse") return;
    const rect = e.currentTarget.getBoundingClientRect();
    const fromLeft = e.clientX < rect.left + rect.width / 2;
    velocityRef.current.sway += (fromLeft ? -1.5 : 1.5) * swingFactor;

    handlePointerMove(e);

    if (flipMode === "hover") {
      setIsFlipped(true);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reducedMotion || e.pointerType === "touch") return;
    const rect = e.currentTarget.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const nx = Math.max(-1, Math.min(1, ((e.clientX - rect.left) / rect.width) * 2 - 1));
    const ny = Math.max(
      -1,
      Math.min(1, ((e.clientY - rect.top - wireLength) / CARD_HEIGHT) * 2 - 1)
    );

    const lastX = lastClientXRef.current;
    const deltaX =
      lastX === null ? 0 : Math.max(-35, Math.min(35, e.clientX - lastX));
    lastClientXRef.current = e.clientX;

    velocityRef.current.sway = Math.max(
      -3.8,
      Math.min(3.8, velocityRef.current.sway + deltaX * 0.048 * swingFactor)
    );

    targetRef.current = {
      x: nx,
      y: ny,
      light: 1,
      sway: nx * 1.15 * swingFactor,
    };

    requestSpringStep();
  };

  const handlePointerLeave = (e: React.PointerEvent<HTMLDivElement>) => {
    lastClientXRef.current = null;
    targetRef.current = { x: 0, y: 0, light: 0, sway: 0 };

    if (flipMode === "hover" && e.pointerType === "mouse") {
      setIsFlipped(false);
    }

    if (reducedMotion) {
      updateDOM(0, 0, 0);
    } else {
      requestSpringStep();
    }
  };

  const toggleFlip = (explicit?: boolean) => {
    const next = typeof explicit === "boolean" ? explicit : !isFlipped;
    setIsFlipped(next);

    if (!reducedMotion) {
      velocityRef.current.sway += (next ? -1.1 : 1.1) * swingFactor;
      requestSpringStep();
    }
  };

  const cardIndexStr = String(index + 1).padStart(2, "0");
  const wireHeight = Math.max(0, wireLength - 13);

  return (
    <div
      className="ht-item"
      style={{
        width: CARD_WIDTH,
        height: CARD_HEIGHT + wireLength + 12,
        flex: `0 0 ${CARD_WIDTH}px`,
      }}
      onPointerEnter={handlePointerEnter}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onPointerCancel={handlePointerLeave}
    >
      <div
        className="ht-pendulum"
        ref={pendulumRef}
        style={
          {
            "--ht-rest": `${restAngle}deg`,
            "--ht-sway": "0deg",
          } as React.CSSProperties
        }
      >
        {/* Ceiling anchor dot */}
        <div className="ht-ceiling-anchor" aria-hidden="true" />

        {/* Fine suspension wire */}
        <div
          className="ht-fine-wire"
          aria-hidden="true"
          style={{
            height: `${wireHeight}px`,
            background: "var(--ht-wire)",
            width: `${wireWidth}px`,
          }}
        />

        {/* Hit box with 3D tilt */}
        <div
          className="ht-card-hit"
          ref={cardHitRef}
          style={
            {
              width: CARD_WIDTH,
              height: CARD_HEIGHT,
              top: `${wireLength}px`,
              borderRadius: "24px",
              "--ht-illumination": "0",
              "--ht-px": "50%",
              "--ht-py": "50%",
              "--ht-rx": "0deg",
              "--ht-ry": "0deg",
            } as React.CSSProperties
          }
        >
          <div className="ht-tilt">
            {/* Top eyelet attachment */}
            <div className="ht-eyelet" aria-hidden="true">
              <span />
            </div>

            {/* Flipper container with 3D preserve */}
            <div
              className={`ht-flipper ${isFlipped ? "ht-flipped" : ""}`}
              style={{ borderRadius: "24px" }}
            >
              {/* FRONT FACE */}
              <button
                type="button"
                className="ht-face ht-front"
                onClick={() => toggleFlip()}
                style={
                  {
                    borderRadius: "24px",
                    "--ht-img-radius": "14px",
                    "--ht-img-height": "60%",
                  } as React.CSSProperties
                }
                aria-label={`View ${member.name}'s full profile`}
                tabIndex={isFlipped ? -1 : 0}
              >
                <div className="ht-card-topline">
                  <span>PEOPLE · STUDIO</span>
                  <span>#{cardIndexStr}</span>
                </div>

                <div className="ht-portrait">
                  <Image
                    src={member.localImage || member.image}
                    alt={member.name}
                    width={400}
                    height={480}
                    priority={index < 2}
                    className="w-full h-full object-cover"
                    draggable={false}
                  />
                </div>

                <div className="ht-person-info">
                  <strong
                    className="ht-person-name"
                    style={{ transform: "translate(-2px, -1px)" }}
                  >
                    {member.name}
                  </strong>
                  <span
                    className="ht-role"
                    style={{ transform: "translate(0px, -2px)" }}
                  >
                    {member.role}
                  </span>
                </div>

                <div className="ht-card-bottomline">
                  <span>VIEW PROFILE</span>
                  <span className="ht-circle-arrow" aria-hidden="true">
                    ↗
                  </span>
                </div>

                {/* Holographic shimmer layers */}
                <span className="ht-holo" aria-hidden="true" />
                <span className="ht-holo-gloss" aria-hidden="true" />
              </button>

              {/* BACK FACE */}
              <div
                className="ht-face ht-back"
                style={
                  {
                    borderRadius: "24px",
                    "--ht-img-radius": "14px",
                    "--ht-img-height": "60%",
                  } as React.CSSProperties
                }
                aria-hidden={!isFlipped}
                onClick={(e) => {
                  const target = e.target as HTMLElement;
                  if (!target.closest("a, button")) {
                    toggleFlip(false);
                  }
                }}
              >
                <div className="ht-back-heading">
                  <span>PROFILE / {cardIndexStr}</span>
                  <button
                    className="ht-back-close"
                    type="button"
                    tabIndex={isFlipped ? 0 : -1}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFlip(false);
                    }}
                    aria-label={`Flip ${member.name}'s card back`}
                  >
                    ↶
                  </button>
                </div>

                <div className="ht-back-main">
                  <div className="ht-back-identity">
                    <div
                      className="ht-back-avatar"
                      style={{ background: member.accent }}
                    >
                      <Image
                        src={member.localImage || member.image}
                        alt=""
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                        draggable={false}
                      />
                    </div>
                    <div className="ht-back-intro">
                      <strong>{member.name}</strong>
                      <span>{member.role}</span>
                    </div>
                  </div>

                  <div className="ht-back-location">
                    ⌖ &nbsp;{member.location}
                  </div>

                  <p className="ht-about">{member.about}</p>
                </div>

                <div className="ht-back-section">
                  <div className="ht-back-label">SELECTED PROJECTS</div>
                  <div className="ht-project-link ht-project-plain">
                    <span>{member.projectOne}</span>
                  </div>
                  <div className="ht-project-link ht-project-plain">
                    <span>{member.projectTwo}</span>
                  </div>
                </div>

                <div className="ht-back-footer">
                  <div className="ht-back-contact">
                    <div className="ht-back-label">LET&apos;S CONNECT</div>
                    <a
                      href={`mailto:${member.email}`}
                      className="ht-email"
                      tabIndex={isFlipped ? 0 : -1}
                    >
                      {member.email}
                    </a>
                    <div className="ht-social-links" />
                  </div>

                  <div className="ht-qr">
                    <svg
                      height="64"
                      width="64"
                      viewBox="0 0 25 25"
                      role="img"
                      aria-label={`QR link for ${member.name}`}
                    >
                      <path
                        fill="#FFFFFF"
                        d="M0,0 h25v25H0z"
                        shapeRendering="crispEdges"
                      />
                      <path
                        fill="#202126"
                        d={member.qrSvgPath}
                        shapeRendering="crispEdges"
                      />
                    </svg>
                    <span>SCAN ME</span>
                  </div>
                </div>

                {/* Holographic shimmer layers */}
                <span className="ht-holo" aria-hidden="true" />
                <span className="ht-holo-gloss" aria-hidden="true" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function HangingSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [hasEntered, setHasEntered] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    if (!("IntersectionObserver" in window)) {
      setHasEntered(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setHasEntered(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const members = TEAM_MEMBERS;
  const memberCount = members.length;
  const trackWidth = Math.max(
    64,
    64 + Math.max(0, memberCount - 1) * (CARD_WIDTH + CARD_GAP)
  ); // 976
  const cordOffset = HORIZONTAL_PAD + CARD_WIDTH / 2 - 32; // 114

  // Parabolic sag calculation matching exact Framer formula
  const getSagMargin = (index: number) => {
    const t = (32 + index * (CARD_WIDTH + CARD_GAP)) / trackWidth;
    return 4 * ROPE_SAG * t * (1 - t);
  };

  const getWireLength = (index: number, hangOffset = 0) => {
    const mult = HEIGHT_CURVE[index % HEIGHT_CURVE.length];
    return Math.max(30, BASE_WIRE_LENGTH + WIRE_HEIGHT_VARIATION * mult + hangOffset);
  };

  return (
    <div className="ht-responsive-root w-full">
      <section
        ref={sectionRef}
        className="ht-section w-full"
        aria-label="Our team"
        style={
          {
            paddingTop: "65px",
            paddingBottom: "160px",
            "--ht-mobile-pad": `${HORIZONTAL_PAD}px`,
            "--ht-tablet-pad": `${HORIZONTAL_PAD}px`,
            "--ht-cord-offset": `${cordOffset}px`,
            "--ht-section-top": "65px",
            "--ht-section-bottom": "160px",
            "--ht-card-gap": `${CARD_GAP}px`,
            "--ht-max-width": "1300px",
            "--ht-title-size": "50px",
            "--ht-accent-size": "54px",
            fontFamily: "var(--font-inter), Inter, sans-serif",
            fontSize: "14px",
          } as React.CSSProperties
        }
      >
        {/* Container for header */}
        <div
          className="ht-container"
          style={{
            maxWidth: "1300px",
            paddingLeft: `${HORIZONTAL_PAD}px`,
            paddingRight: `${HORIZONTAL_PAD}px`,
          }}
        >
          <header className="ht-heading">
            <div className="ht-heading-left">
              <span className="ht-eyebrow">
                <span className="ht-eyebrow-dot" />
                OUR STUDIO · THE PEOPLE
              </span>

              <h2 className="ht-title">
                <span
                  style={{
                    fontSize: "50px",
                    fontWeight: 400,
                    letterSpacing: "-0.055em",
                    lineHeight: "1.05em",
                  }}
                >
                  Meet the people
                </span>
                <em
                  style={{
                    fontSize: "54px",
                    fontWeight: 400,
                    fontStyle: "italic",
                    letterSpacing: "-0.045em",
                    lineHeight: "1.05em",
                  }}
                >
                  behind the work.
                </em>
              </h2>
            </div>

            <div className="ht-heading-right">
              <p>
                Different minds, shared curiosity. A small team making thoughtful
                things together.
              </p>
              <span className="ht-member-count">
                <span className="ht-count-dot" />
                {" 04 PEOPLE, ONE TEAM"}
              </span>
            </div>
          </header>
        </div>

        {/* Scrollable track for hanging cards */}
        <div className="ht-scroll-outer" style={{ maxWidth: "1300px" }}>
          <div className="ht-scroll" aria-label="Team member profile cards">
            <div
              className="ht-track"
              style={{
                gap: `${CARD_GAP}px`,
                paddingLeft: `${HORIZONTAL_PAD}px`,
                paddingRight: `${HORIZONTAL_PAD}px`,
              }}
            >
              {/* Parabolic top rail cord SVG */}
              <svg
                className="ht-rail-cord"
                aria-hidden="true"
                style={{
                  left: `${cordOffset}px`,
                  width: `${trackWidth}px`,
                  height: `${ROPE_SAG + 28}px`,
                }}
                viewBox={`0 0 ${trackWidth} ${ROPE_SAG + 28}`}
                preserveAspectRatio="none"
              >
                <path
                  d={`M 0 13 Q ${trackWidth / 2} ${13 + 2 * ROPE_SAG} ${trackWidth} 13`}
                  stroke="var(--ht-rail)"
                  strokeWidth="1.25"
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>

              {/* Cards */}
              {members.map((member, index) => {
                const wireLength = getWireLength(index, member.hangOffset);
                const marginTop = getSagMargin(index);

                return (
                  <div
                    key={member.id}
                    className={`ht-enter ${hasEntered ? "ht-enter-play" : ""}`}
                    style={{
                      animationDelay: `${index * 85}ms`,
                      marginTop: `${marginTop}px`,
                    }}
                  >
                    <HangingCard
                      member={member}
                      index={index}
                      wireLength={wireLength}
                      flipMode="hover"
                      tiltMax={9}
                      swingStrength={100}
                      holoStrength={78}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer note */}
        <div
          className="ht-container ht-footnote"
          style={{
            maxWidth: "1300px",
            paddingLeft: `${HORIZONTAL_PAD}px`,
            paddingRight: `${HORIZONTAL_PAD}px`,
          }}
        >
          <span>THE PEOPLE MAKE THE WORK.</span>
          <span>HOVER TO SHIMMER · CLICK / TAP TO FLIP</span>
        </div>
      </section>
    </div>
  );
}
