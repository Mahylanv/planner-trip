export type TravelLink = {
  label: string;
  url: string;
};

export type TravelStatus = "planned" | "booked" | "done" | "option";

export type TravelTransport = "flight" | "bus" | "walk" | "boat" | "car" | "train" | "";

export type TravelNode = {
  id: string;
  title: string;
  emoji?: string;
  duration?: string;
  budget?: string;
  time?: string;
  provider?: string;
  notes?: string;
  status: TravelStatus;
  transport?: TravelTransport;
  links?: TravelLink[];
  children: TravelNode[];
};

export const initialItinerary: TravelNode[] = [
  {
    id: "bresil-nord",
    title: "Bresil",
    emoji: "🇧🇷",
    status: "planned",
    children: [
      {
        id: "fortaleza",
        title: "Fortaleza",
        transport: "flight",
        status: "planned",
        children: [{ id: "barro-branco-beach", title: "Barro Branco Beach", status: "planned", children: [] }],
      },
      {
        id: "sao-luis",
        title: "São Luís",
        transport: "flight",
        status: "planned",
        children: [
          {
            id: "barreirinhas",
            title: "Barreirinhas",
            transport: "bus",
            status: "planned",
            links: [
              {
                label: "Bus São Luís -> Barreirinhas",
                url: "https://www.bookaway.com/s/brazil/sao-luis-to-barreirinhas?departuredate=2026-09-02&adult=1",
              },
            ],
            children: [],
          },
          { id: "lencois-maranhenses", title: "Lençóis Maranhenses", status: "planned", children: [] },
        ],
      },
    ],
  },
  {
    id: "guyane",
    title: "Guyane",
    emoji: "🇬🇫",
    duration: "6j",
    status: "planned",
    children: [
      {
        id: "cayenne",
        title: "Cayenne",
        duration: "6j",
        transport: "flight",
        status: "planned",
        children: [
          { id: "rorota", title: "Sentier du Rorota", status: "planned", children: [] },
          { id: "kourou", title: "Kourou", status: "planned", children: [] },
          { id: "kaw", title: "Kaw", status: "planned", children: [] },
        ],
      },
    ],
  },
  {
    id: "suriname",
    title: "Suriname",
    emoji: "🇸🇷",
    duration: "6j",
    status: "planned",
    children: [
      {
        id: "paramaribo",
        title: "Paramaribo",
        duration: "6j",
        transport: "flight",
        status: "planned",
        children: [{ id: "brownsberg", title: "Brownsberg", status: "planned", children: [] }],
      },
    ],
  },
  {
    id: "guyana",
    title: "Guyana",
    emoji: "🇬🇾",
    duration: "4j",
    status: "planned",
    children: [
      {
        id: "georgetown",
        title: "Georgetown",
        duration: "4j",
        transport: "flight",
        status: "planned",
        children: [
          { id: "kaieteur-falls", title: "Kaieteur Falls", status: "planned", children: [] },
          { id: "rupununi-savane", title: "Rupununi Savane", status: "planned", children: [] },
        ],
      },
    ],
  },
  { id: "venezuela", title: "Venezuela", emoji: "🇻🇪", status: "planned", children: [] },
  {
    id: "colombie",
    title: "Colombie",
    emoji: "🇨🇴",
    duration: "25j",
    status: "done",
    children: [
      {
        id: "santa-marta",
        title: "Santa Marta",
        duration: "4j",
        transport: "flight",
        status: "planned",
        children: [
          { id: "minca", title: "Minca", budget: "45€", time: "7h", provider: "GYG", status: "planned", children: [] },
          { id: "tayrona", title: "Tayrona", budget: "60€", time: "8h", provider: "GYG", status: "planned", children: [] },
        ],
      },
      { id: "cartagena", title: "Cartagena", duration: "3j", transport: "bus", status: "planned", children: [] },
      {
        id: "palomino",
        title: "Palomino",
        duration: "3j",
        transport: "bus",
        status: "planned",
        children: [
          { id: "los-flamingos", title: "Los Flamingos", budget: "80€", time: "6h", provider: "GYG", status: "planned", children: [] },
          { id: "cascade-valencia", title: "Cascade Valencia", budget: "66€", time: "5h", provider: "GYG", status: "planned", children: [] },
        ],
      },
      {
        id: "bogota",
        title: "Bogotá",
        duration: "11j",
        transport: "flight",
        status: "planned",
        children: [
          { id: "sumapaz", title: "Sumapaz", budget: "110€", time: "8h", provider: "GYG", status: "planned", children: [] },
          { id: "cascade-chorrera", title: "Cascade Chorrera", budget: "90€", time: "8h", provider: "GYG", status: "planned", children: [] },
          { id: "lagoons-siecha", title: "Lagoons Siecha", budget: "150€", time: "6h", provider: "GYG", status: "planned", children: [] },
          { id: "chicaque-tequendama", title: "Chicaque Park & Salto de Tequendama", budget: "200€", time: "8h", provider: "GYG", status: "planned", children: [] },
          { id: "mongui-oceta", title: "Monguí -> Páramo de Ocetá", duration: "2 à 3j", transport: "bus", status: "option", children: [] },
        ],
      },
      {
        id: "salento",
        title: "Salento",
        duration: "3j",
        transport: "bus",
        status: "planned",
        children: [{ id: "cocora", title: "Vallée de Cocora", status: "planned", children: [] }],
      },
      {
        id: "neiva",
        title: "Neiva",
        duration: "2j",
        transport: "bus",
        status: "option",
        children: [{ id: "tatacoa", title: "Désert de la Tatacoa", budget: "75€", time: "4h", provider: "GYG", status: "planned", children: [] }],
      },
    ],
  },
  {
    id: "equateur",
    title: "Équateur",
    emoji: "🇪🇨",
    status: "planned",
    children: [
      {
        id: "quito",
        title: "Quito",
        duration: "10j",
        transport: "flight",
        status: "done",
        children: [
          { id: "mitad-del-mundo", title: "Mitad del Mundo", budget: "43€", time: "6h", provider: "GYG", status: "planned", children: [] },
          { id: "mindo", title: "Réserve de Mindo", budget: "103€", time: "8h", provider: "GYG", status: "planned", children: [] },
          { id: "cuicocha-peguche", title: "Cuicocha / Cascade Peguche", budget: "80€", time: "1j", provider: "GYG", status: "option", children: [] },
          { id: "antisana", title: "Antisana Volcan", budget: "150€", time: "9h", provider: "GYG", status: "option", children: [] },
        ],
      },
      {
        id: "bus-tour-quito-banos",
        title: "Bus tour - Quito -> Baños -> Quito",
        duration: "4j",
        budget: "285€",
        transport: "bus",
        status: "planned",
        links: [{ label: "Wanderbus Quito - Baños", url: "https://passes.wanderbusecuador.com/product/quito-banos-quito" }],
        children: [
          { id: "cotopaxi", title: "Cotopaxi", status: "planned", children: [] },
          { id: "quilotoa", title: "Laguna Quilotoa", status: "planned", children: [] },
          { id: "chimborazo", title: "Chimborazo", status: "planned", children: [] },
          { id: "amazonie", title: "Amazonie", status: "planned", children: [] },
          { id: "banos", title: "Baños", status: "planned", children: [] },
        ],
      },
      {
        id: "riobamba-sangay",
        title: "Riobamba -> Sangay",
        duration: "2j",
        budget: "240€",
        provider: "Partir.com",
        transport: "bus",
        status: "option",
        children: [],
      },
      {
        id: "cuenca",
        title: "Cuenca",
        duration: "4j",
        transport: "bus",
        status: "done",
        children: [
          { id: "cajas", title: "Cajas", budget: "30 à 50€", time: "4 à 8h", provider: "GYG", status: "planned", children: [] },
          { id: "ingapirca", title: "Ingapirca", budget: "50€", time: "8h", provider: "GYG", status: "planned", children: [] },
          { id: "chorro-giron", title: "El Chorro de Girón", budget: "50€", time: "8h", provider: "GYG", status: "option", children: [] },
        ],
      },
      {
        id: "guayaquil",
        title: "Guayaquil",
        duration: "3 à 4j",
        transport: "bus",
        status: "done",
        children: [
          { id: "cerro-blanco", title: "Cerro Blanco", status: "planned", children: [] },
          { id: "las-penas", title: "Las Peñas + Cerro Santa Ana", status: "planned", children: [] },
          { id: "parque-seminario", title: "Parque Seminario", emoji: "🦎", status: "planned", children: [] },
          { id: "malecon-2000", title: "Malecón 2000", status: "planned", children: [] },
          { id: "manglares-churute", title: "Manglares Churute", budget: "100€", time: "1j", provider: "Partir.com", status: "planned", children: [] },
          { id: "puerto-el-morro", title: "Puerto El Morro", emoji: "🐬", budget: "150€", status: "option", children: [] },
        ],
      },
      { id: "galapagos", title: "Îles Galápagos", transport: "flight", status: "planned", children: [] },
    ],
  },
  {
    id: "perou",
    title: "Pérou",
    emoji: "🇵🇪",
    duration: "environ 50j",
    status: "planned",
    children: [
      { id: "iquitos", title: "Iquitos", duration: "3 à 4j", transport: "flight", status: "done", children: [] },
      { id: "huaraz", title: "Huaraz", duration: "7 à 13j", transport: "flight", status: "planned", children: [] },
      { id: "lima", title: "Lima", duration: "5 à 7j", transport: "flight", status: "planned", children: [] },
      { id: "pisco", title: "Pisco", transport: "bus", status: "option", children: [] },
      { id: "puerto-maldonado", title: "Puerto Maldonado", status: "planned", children: [] },
      {
        id: "ayacucho",
        title: "Ayacucho",
        duration: "4j",
        status: "done",
        children: [
          { id: "qorihuillca", title: "Canyons de Qorihuillca", budget: "30€", time: "3h", provider: "GYG", status: "planned", children: [] },
          { id: "millpu", title: "Millpu", budget: "30€", time: "1j", provider: "GYG", status: "planned", children: [] },
          { id: "puncupata", title: "Puncupata", budget: "30€", time: "4h", provider: "GYG", status: "planned", children: [] },
          { id: "pachapupum", title: "Pachapupum", budget: "60€", time: "1j", provider: "GYG", status: "planned", children: [] },
        ],
      },
      { id: "cuzco", title: "Cuzco", duration: "15 à 16j", transport: "flight", status: "planned", children: [] },
      {
        id: "arequipa",
        title: "Arequipa",
        duration: "7j",
        status: "done",
        children: [
          { id: "pillones-puruna", title: "Pillones + Puruna", budget: "30€", time: "1j", provider: "GYG", status: "planned", children: [] },
          { id: "sillar", title: "Sillar", budget: "10€", time: "4h", provider: "GYG", status: "planned", children: [] },
          { id: "chachani", title: "Volcan Chachani", budget: "130€", time: "2j", provider: "GYG", status: "planned", children: [] },
          { id: "colca", title: "Canyon Colca", budget: "30€", time: "1j", provider: "GYG", status: "planned", children: [] },
          { id: "salinas", title: "Salinas", budget: "20€", time: "1j", provider: "GYG", status: "planned", children: [] },
        ],
      },
      { id: "lac-titicaca", title: "Lac Titicaca", duration: "3j", status: "planned", children: [] },
    ],
  },
  {
    id: "bolivie",
    title: "Bolivie",
    emoji: "🇧🇴",
    status: "planned",
    children: [
      { id: "la-paz", title: "La Paz", duration: "9j", status: "planned", children: [] },
      { id: "uyuni", title: "Uyuni", duration: "2j", status: "planned", children: [] },
      { id: "cochabamba", title: "Cochabamba", duration: "3j", status: "planned", children: [] },
      { id: "santa-cruz", title: "Santa Cruz", duration: "4j", status: "planned", children: [] },
    ],
  },
  { id: "rio-1", title: "Rio", emoji: "🇧🇷", status: "planned", children: [] },
  {
    id: "uruguay",
    title: "Uruguay",
    emoji: "🇺🇾",
    status: "planned",
    children: [
      { id: "montevideo", title: "Montevideo", duration: "4j", status: "planned", children: [] },
      { id: "buenos-aires", title: "Buenos Aires", status: "planned", children: [] },
    ],
  },
  {
    id: "paraguay",
    title: "Paraguay",
    emoji: "🇵🇾",
    status: "planned",
    children: [
      {
        id: "asuncion",
        title: "Asunción",
        duration: "4j",
        status: "planned",
        children: [
          { id: "tobati", title: "Tobatí", status: "planned", children: [] },
          { id: "cerro-vera", title: "Cerro Verá", status: "planned", children: [] },
          { id: "salto-cristal", title: "Salto Cristal", status: "planned", children: [] },
        ],
      },
      { id: "iguazu", title: "Chutes d'Iguazú", duration: "2j", status: "planned", children: [] },
    ],
  },
  { id: "rio-2", title: "Rio", emoji: "🇧🇷", status: "planned", children: [] },
  { id: "argentine", title: "Argentine", emoji: "🇦🇷", status: "planned", children: [] },
  {
    id: "chili",
    title: "Chili",
    emoji: "🇨🇱",
    status: "planned",
    children: [
      { id: "puerto-natales", title: "Puerto Natales", status: "planned", children: [] },
      { id: "coyhaique", title: "Coyhaique", status: "planned", children: [] },
      { id: "santiago", title: "Santiago", duration: "4 à 5j", status: "planned", children: [] },
      { id: "ile-de-paques", title: "Île de Pâques", duration: "3 à 4j", status: "planned", children: [] },
      { id: "antofagasta", title: "Antofagasta", duration: "0j", status: "planned", children: [] },
      { id: "san-pedro-atacama", title: "San Pedro de Atacama", duration: "10j", status: "planned", children: [] },
    ],
  },
];
