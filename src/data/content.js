import { Scale, Gavel, Handshake } from 'lucide-react';

/**
 * Mapeo de fotografías exclusivas de la casa de arte y subastas
 * (Todas las imágenes son reales y no se repiten entre secciones)
 */
export const IMAGES = {
  // Fotos para el Hero de Inicio (3 exclusivas de alta definición)
  heroRecorrido: '/img/recorrido-muestra.jpg',
  heroSubasta: '/img/hero-subasta-en-vivo.jpg',
  heroConcurrencia: '/img/hero-gala-concurrencia.jpg',

  // Fotos para el bloque "Espacio de arte" de Inicio (3 exclusivas)
  homeSubasta: '/img/subasta-evento.jpg',
  homeVisitantes: '/img/visitantes-muestra.jpg',
  homeMuro: '/img/muro-exhibicion-general.jpg',

  // Fotos para la Galería (8 exclusivas)
  galeriaPublico: '/img/publico-evento.jpg',
  galeriaDisertante: '/img/disertante-podio.jpg',
  galeriaMuroCalido: '/img/galeria-muro-obras.jpg',
  galeriaApreciacion: '/img/apreciacion-obras.jpg',
  galeriaMarcoDorado: '/img/obra-marco-dorado.jpg',
  galeriaMontaje: '/img/obras-exhibicion-detalle.jpg',
  galeriaCaballete: '/img/obra-caballete.jpg',
  galeriaObrasMuro: '/img/obras-muro.jpg',

  // Fotos exclusivas para Nosotros (2 exclusivas)
  nosotrosMusica: '/img/nosotros-musica.jpg',
  nosotrosTango: '/img/nosotros-tango.jpg',
};

/**
 * Artistas consagrados de la colección
 */
export const ARTISTS = [
  {
    id: 'roux',
    name: 'Guillermo Roux',
    years: '1929 – 2021',
    discipline: 'Pintura, acuarela y dibujo',
    bio: 'Gran maestro de la pintura y la acuarela argentina de trascendencia internacional. Su obra transita una figuración poética y luminosa, con un virtuosismo técnico inconfundible que marcó la historia del arte nacional.',
    portrait: '/img/artista-roux.jpg',
    portraitPosition: 'center top',
    works: [
      {
        title: 'San Martín',
        technique: 'Acuarela',
        img: '/img/obra-roux.jpg',
        src: '/img/obra-roux.jpg',
        desc: 'Célebre retrato al temple y acuarela del prócer argentino, firmado Roux 2000.',
      },
    ],
    artwork: {
      src: '/img/obra-roux.jpg',
      title: 'San Martín (Acuarela)',
      desc: 'Célebre retrato al temple y acuarela del prócer argentino, firmado Roux 2000.',
    },
  },
  {
    id: 'otegui',
    name: 'Héctor Otegui',
    years: '1920 – 2019',
    discipline: 'Pintura, muralismo y escultura',
    bio: 'Pintor, muralista, escultor y poeta histórico de Río Cuarto. Referente central de las artes plásticas del sur cordobés, consagró su vida a plasmar la identidad, los paisajes serranos y la fuerza telúrica de la región.',
    portrait: '/img/artista-otegui.jpg',
    portraitPosition: '0% 15%',
    works: [
      {
        title: 'El rapto de Europa / Toro',
        technique: 'Tinta y grabado',
        img: '/img/obra-otegui.jpg',
        src: '/img/obra-otegui.jpg',
        desc: 'Expresiva composición mitológica donde la fuerza del toro dialoga con la figura humana.',
      },
    ],
    artwork: {
      src: '/img/obra-otegui.jpg',
      title: 'El rapto de Europa / Toro (Tinta y grabado)',
      desc: 'Expresiva composición mitológica donde la fuerza del toro dialoga con la figura humana.',
    },
  },
  {
    id: 'ponsone',
    name: 'Lara Ponsone',
    years: 'Contemporánea (1974)',
    discipline: 'Artes visuales y pintura',
    bio: 'Artista visual y licenciada en pintura egresada de la UNC. Premiada en el Salón de Artes Plásticas de Río Cuarto y fundadora de Lápiz Espacio Creativo. Investiga la atmósfera cromática y el expresionismo contemporáneo.',
    portrait: '/img/artista-ponsone.jpg',
    portraitPosition: 'center 10%',
    works: [
      {
        title: 'Carrusel',
        technique: 'Óleo sobre tela',
        img: '/img/obra-ponsone.jpg',
        src: '/img/obra-ponsone.jpg',
        desc: 'Composición lírica con figuras femeninas etéreas en torno a una calesita.',
      },
    ],
    artwork: {
      src: '/img/obra-ponsone.jpg',
      title: 'Carrusel (Óleo sobre tela)',
      desc: 'Composición lírica con figuras femeninas etéreas en torno a una calesita.',
    },
  },
  {
    id: 'sainz',
    name: 'Gabriel Sáenz',
    years: 'Contemporáneo',
    discipline: 'Pintura figurativa y óleo',
    bio: 'Pintor contemporáneo ampliamente premiado en el país. Sus obras se caracterizan por paisajes abiertos de gran escala, atmósferas silenciosas y personajes solitarios en diálogo con el horizonte y la modernidad.',
    portrait: '/img/artista-sainz.jpg',
    works: [
      {
        title: 'El hombre de la nube',
        technique: 'Óleo sobre tela',
        img: '/img/obra-sainz.jpg',
        src: '/img/obra-sainz.jpg',
        desc: 'Figura en la cima de un cerro interactuando con una imponente nube de tormenta.',
      },
    ],
    artwork: {
      src: '/img/obra-sainz.jpg',
      title: 'El hombre de la nube (Óleo sobre tela)',
      desc: 'Figura en la cima de un cerro interactuando con una imponente nube de tormenta.',
    },
  },
  {
    id: 'santander',
    name: 'Cristina Santander',
    years: '1942 · Contemporánea',
    discipline: 'Grabado, estampa y técnica mixta',
    bio: 'Nacida en Buenos Aires, estudió en el Atelier 17 de París con Stanley W. Hayter y fue becaria en la Casa de Velázquez en Madrid. Profesora de dibujo y grabado en la Escuela Prilidiano Pueyrredón y la Cárcova, y Gran Premio del Salón Municipal.',
    portrait: '/img/artista-santander.jpg',
    portraitPosition: 'center 15%',
    works: [
      {
        title: 'La Casa de Paco',
        technique: 'Estampa y grabado original',
        img: '/img/obra-santander.jpg',
        src: '/img/obra-santander.jpg',
        desc: 'Estampa y grabado original de gran formato (92 × 66 cm), serie 7/25, año 1997.',
      },
    ],
    artwork: {
      src: '/img/obra-santander.jpg',
      title: 'La Casa de Paco (Estampa y grabado original)',
      desc: 'Estampa y grabado original de gran formato (92 × 66 cm), serie 7/25, año 1997.',
    },
  },
  {
    id: 'bonati',
    name: 'Ricardo Bonati',
    years: '1940 · Contemporáneo',
    discipline: 'Pintura figurativa y óleo clásico',
    bio: 'Nacido en Buenos Aires en 1940, inició su formación artística desde muy joven con profesores de Bellas Artes. Su producción se destaca por el virtuosismo en el óleo clásico, la figura animal y la calidez en lienzos de colección.',
    portrait: '/img/artista-bonati.jpg',
    portraitPosition: 'center 38%',
    works: [
      {
        title: 'Compañeros',
        technique: 'Óleo sobre tela',
        img: '/img/obra-bonati.jpg',
        src: '/img/obra-bonati.jpg',
        desc: 'Composición clásica de tres caballos con marco dorado labrado (40 × 56 cm), año 1996.',
      },
    ],
    artwork: {
      src: '/img/obra-bonati.jpg',
      title: 'Compañeros (Óleo sobre tela)',
      desc: 'Composición clásica de tres caballos con marco dorado labrado (40 × 56 cm), año 1996.',
    },
  },
  {
    id: 'keipert',
    name: 'Carlos Keipert',
    years: 'Contemporáneo',
    discipline: 'Pintura figurativa y naturalezas muertas',
    bio: 'Su expresión transita entre el puntillismo y la pincelada suelta con densa carga matérica y paleta intensa. Formado junto a Luján Gallardo y César Novelletto, sus naturalezas muertas y marinas integran destacadas galerías de arte.',
    portrait: '/img/artista-keipert.jpg',
    portraitPosition: 'center top',
    works: [
      {
        title: 'Homenaje al Maestro',
        technique: 'Óleo sobre tela',
        img: '/img/obra-keipert.jpg',
        src: '/img/obra-keipert.jpg',
        desc: 'Naturaleza muerta con jarrón cerámico y cítricos (50 × 60 cm), juego de contrastes y luz.',
      },
    ],
    artwork: {
      src: '/img/obra-keipert.jpg',
      title: 'Homenaje al Maestro (Óleo sobre tela)',
      desc: 'Naturaleza muerta con jarrón cerámico y cítricos (50 × 60 cm), juego de contrastes y luz.',
    },
  },
  {
    id: 'diaz-rinaldi',
    name: 'Alicia Díaz Rinaldi',
    years: '1944 · Contemporánea',
    discipline: 'Grabado, aguafuerte y técnicas mixtas',
    bio: 'Nacida en 1944, estudió pintura con Víctor Chab y se especializó en gráfica y grabado en el país y el exterior. Galardonada en bienales internacionales, su obra combina aguafuerte, collage y stencil con notable sensibilidad textural.',
    portrait: '/img/artista-diaz-rinaldi.jpg',
    works: [
      {
        title: 'Reflejos',
        technique: 'Aguafuerte, collage y stencil',
        img: '/img/obra-diaz-rinaldi.jpg',
        src: '/img/obra-diaz-rinaldi.jpg',
        desc: 'Pieza de técnica mixta gráfica sobre papel (40 × 70 cm), año 2005.',
      },
    ],
    artwork: {
      src: '/img/obra-diaz-rinaldi.jpg',
      title: 'Reflejos (Aguafuerte, collage y stencil)',
      desc: 'Pieza de técnica mixta gráfica sobre papel (40 × 70 cm), año 2005.',
    },
  },
  {
    id: 'fernandez',
    name: 'Ricardo Fernández',
    years: 'Contemporáneo',
    discipline: 'Escultura en metal (Scrap Metal) y dibujo',
    bio: 'Radicado en Río Cuarto desde 1959. Se formó en la Escuela Municipal de Bellas Artes de Buenos Aires con Rogelio Polesello y Juan Zonatto. Escultor, ilustrador y docente en Río Cuarto, creador de reconocidas esculturas en bronce y chatarra metálica.',
    portrait: '/img/artista-fernandez.jpg',
    portraitPosition: 'center top',
    works: [
      {
        title: 'Caballo en carrera',
        technique: 'Scrap metal',
        img: '/img/obra-fernandez.jpg',
        src: '/img/obra-fernandez.jpg',
        desc: 'Escultura en chatarra metálica soldada (30 × 19 cm), año 2013.',
      },
    ],
    artwork: {
      src: '/img/obra-fernandez.jpg',
      title: 'Caballo en carrera (Scrap metal)',
      desc: 'Escultura en chatarra metálica soldada (30 × 19 cm), año 2013.',
    },
  },
];

/**
 * Servicios institucionales de la casa
 */
export const SERVICES = [
  {
    icon: Scale,
    title: 'Tasación',
    text: 'Valoración profesional de obras y antigüedades con respaldo documental y peritaje calificado.',
    image: '/img/servicios/tasacion.jpg',
    alt: 'Visitantes observando cuadros en la galería',
  },
  {
    icon: Gavel,
    title: 'Subastas',
    text: 'Subastas presenciales en sala con convocatoria a coleccionistas e inversores del país.',
    image: '/img/servicios/subastas.jpg',
    alt: 'Sala llena durante una subasta presencial',
  },
  {
    icon: Handshake,
    title: 'Consignaciones',
    text: 'Recepción de obras en consignación y vinculación directa con el mercado de arte.',
    image: '/img/servicios/consignaciones.jpg',
    alt: 'Dos personas conversando frente a una obra',
  },
];

/**
 * Diapositivas para la portada
 */
export const HERO_SLIDES = [
  { src: IMAGES.heroRecorrido, cap: 'Diálogo y apreciación de obras' },
  { src: IMAGES.heroSubasta, cap: 'Subasta en vivo bajo martillo' },
  { src: IMAGES.heroConcurrencia, cap: 'Gala inaugural y concurrencia' },
];

/**
 * Contenido por defecto de la página de Inicio (editable desde el panel)
 */
export const HOME_DEFAULTS = {
  heroTitle: 'Autenticidad que trasciende el tiempo',
  heroSlides: HERO_SLIDES.map((s) => s.src),
  artistsTitle: 'Artistas de la colección',
  artistsIntro:
    'Grandes maestros y creadores contemporáneos que forman parte de nuestro acervo y subastas. Pasá el mouse sobre cualquier artista para pausar y ver su obra, o hacé clic para abrir su ficha completa.',
  servicesTitle: 'Áreas Insignia',
  services: SERVICES.map((s) => ({ title: s.title, text: s.text, image: s.image, alt: s.alt })),
};
