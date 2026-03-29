export interface FormData {
  // Personal Info (Step 1)
  fullName: string;
  passportNumber: string;
  nationality: string;
  dateOfBirth: string;
  sex: "Male" | "Female" | "";
  passportType: "Ordinary" | "Official" | "Diplomatic" | "";
  countryOfPassportIssuance: string;

  // Travel & Contact Info (Step 2)
  passportExpiry: string;
  email: string;
  phoneCountryCode: string;
  phoneNumber: string;
  arrivalDate: string;
  departureDate: string;
  modeOfTransport: "Air" | "Land" | "Sea" | "";
  flightNumber: string;
  departureCity: string;
  hotelName: string;
  addressInMalaysia: string;
  cityInMalaysia: string;
  stateInMalaysia: string;
  postalCode: string;

  // Meta
  saveProfile: boolean;
}

export const EMPTY_FORM: FormData = {
  fullName: "",
  passportNumber: "",
  nationality: "",
  dateOfBirth: "",
  sex: "",
  passportType: "",
  countryOfPassportIssuance: "",
  passportExpiry: "",
  email: "",
  phoneCountryCode: "+1",
  phoneNumber: "",
  arrivalDate: "",
  departureDate: "",
  modeOfTransport: "",
  flightNumber: "",
  departureCity: "",
  hotelName: "",
  addressInMalaysia: "",
  cityInMalaysia: "",
  stateInMalaysia: "",
  postalCode: "",
  saveProfile: true,
};

export const PROFILE_FIELDS: (keyof FormData)[] = [
  "fullName",
  "passportNumber",
  "nationality",
  "dateOfBirth",
  "sex",
  "passportType",
  "countryOfPassportIssuance",
  "passportExpiry",
  "email",
  "phoneCountryCode",
  "phoneNumber",
  "departureCity",
];

export const NATIONALITIES = [
  "Malaysian",
  "Singaporean",
  "American",
  "British",
  "Australian",
  "Chinese",
  "Japanese",
  "South Korean",
  "Indian",
  "Indonesian",
  "Thai",
  "Filipino",
  "German",
  "French",
  "Italian",
  "Spanish",
  "Dutch",
  "Swedish",
  "Norwegian",
  "Danish",
  "Swiss",
  "Canadian",
  "New Zealander",
  "Taiwanese",
  "Hong Konger",
  "Vietnamese",
  "Cambodian",
  "Burmese",
  "Sri Lankan",
  "Pakistani",
  "Bangladeshi",
  "Nepalese",
  "Russian",
  "Ukrainian",
  "Polish",
  "Turkish",
  "Saudi Arabian",
  "Emirati",
  "Qatari",
  "Egyptian",
  "South African",
  "Nigerian",
  "Kenyan",
  "Brazilian",
  "Argentine",
  "Mexican",
  "Colombian",
  "Portuguese",
  "Greek",
  "Czech",
  "Hungarian",
];


export const MODES_OF_TRANSPORT = ["Air", "Land", "Sea"] as const;

export const MALAYSIAN_STATES = [
  "Johor",
  "Kedah",
  "Kelantan",
  "Kuala Lumpur",
  "Labuan",
  "Melaka",
  "Negeri Sembilan",
  "Pahang",
  "Penang",
  "Perak",
  "Perlis",
  "Putrajaya",
  "Sabah",
  "Sarawak",
  "Selangor",
  "Terengganu",
];

export const PHONE_COUNTRY_CODES = [
  { code: "+60", country: "Malaysia" },
  { code: "+65", country: "Singapore" },
  { code: "+1", country: "USA/Canada" },
  { code: "+44", country: "UK" },
  { code: "+61", country: "Australia" },
  { code: "+86", country: "China" },
  { code: "+81", country: "Japan" },
  { code: "+82", country: "South Korea" },
  { code: "+91", country: "India" },
  { code: "+62", country: "Indonesia" },
  { code: "+66", country: "Thailand" },
  { code: "+63", country: "Philippines" },
  { code: "+49", country: "Germany" },
  { code: "+33", country: "France" },
  { code: "+39", country: "Italy" },
  { code: "+34", country: "Spain" },
  { code: "+31", country: "Netherlands" },
  { code: "+46", country: "Sweden" },
  { code: "+47", country: "Norway" },
  { code: "+45", country: "Denmark" },
  { code: "+41", country: "Switzerland" },
  { code: "+64", country: "New Zealand" },
  { code: "+886", country: "Taiwan" },
  { code: "+852", country: "Hong Kong" },
  { code: "+84", country: "Vietnam" },
  { code: "+92", country: "Pakistan" },
  { code: "+880", country: "Bangladesh" },
  { code: "+7", country: "Russia" },
  { code: "+90", country: "Turkey" },
  { code: "+55", country: "Brazil" },
  { code: "+52", country: "Mexico" },
];
