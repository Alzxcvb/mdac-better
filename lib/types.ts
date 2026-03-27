export interface FormData {
  // Personal Info (Step 2a)
  fullName: string;
  passportNumber: string;
  nationality: string;
  dateOfBirth: string;
  sex: "Male" | "Female" | "";
  countryOfResidence: string;

  // Travel Info (Step 2b)
  passportExpiry: string;
  email: string;
  phoneCountryCode: string;
  phoneNumber: string;
  arrivalDate: string;
  portOfEntry: string;
  purposeOfVisit: string;
  addressInMalaysia: string;

  // Meta
  saveProfile: boolean;
}

export const EMPTY_FORM: FormData = {
  fullName: "",
  passportNumber: "",
  nationality: "",
  dateOfBirth: "",
  sex: "",
  countryOfResidence: "",
  passportExpiry: "",
  email: "",
  phoneCountryCode: "+1",
  phoneNumber: "",
  arrivalDate: "",
  portOfEntry: "",
  purposeOfVisit: "",
  addressInMalaysia: "",
  saveProfile: true,
};

export const PROFILE_FIELDS: (keyof FormData)[] = [
  "fullName",
  "passportNumber",
  "nationality",
  "dateOfBirth",
  "sex",
  "countryOfResidence",
  "passportExpiry",
  "email",
  "phoneCountryCode",
  "phoneNumber",
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

export const PORTS_OF_ENTRY = [
  "KLIA (Kuala Lumpur International Airport)",
  "KLIA2",
  "Penang International Airport",
  "Johor Bahru (Woodlands/Tuas Crossing)",
  "Langkawi International Airport",
  "Kota Kinabalu International Airport",
  "Kuching International Airport",
  "Senai International Airport (Johor)",
  "Subang Airport (Sultan Abdul Aziz Shah)",
  "Other",
];

export const PURPOSES_OF_VISIT = [
  "Tourism",
  "Business",
  "Transit",
  "Education",
  "Medical",
  "Visiting Family/Friends",
  "Conference/Event",
  "Other",
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
