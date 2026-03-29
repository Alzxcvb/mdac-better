/**
 * Mapping tables between our human-readable form values and the
 * official MDAC system's internal codes.
 *
 * Official form: https://imigresen-online.imi.gov.my/mdac/main?registerMain
 * Tech: Java/Stripes server, jQuery + Bootstrap 3, standard HTML POST
 */

import { type FormData } from "./types";

// ---- Nationality demonym → ISO 3166-1 alpha-3 ----

export const NATIONALITY_TO_ISO3: Record<string, string> = {
  Malaysian: "MYS",
  Singaporean: "SGP",
  American: "USA",
  British: "GBR",
  Australian: "AUS",
  Chinese: "CHN",
  Japanese: "JPN",
  "South Korean": "KOR",
  Indian: "IND",
  Indonesian: "IDN",
  Thai: "THA",
  Filipino: "PHL",
  German: "DEU",
  French: "FRA",
  Italian: "ITA",
  Spanish: "ESP",
  Dutch: "NLD",
  Swedish: "SWE",
  Norwegian: "NOR",
  Danish: "DNK",
  Swiss: "CHE",
  Canadian: "CAN",
  "New Zealander": "NZL",
  Taiwanese: "TWN",
  "Hong Konger": "HKG",
  Vietnamese: "VNM",
  Cambodian: "KHM",
  Burmese: "MMR",
  "Sri Lankan": "LKA",
  Pakistani: "PAK",
  Bangladeshi: "BGD",
  Nepalese: "NPL",
  Russian: "RUS",
  Ukrainian: "UKR",
  Polish: "POL",
  Turkish: "TUR",
  "Saudi Arabian": "SAU",
  Emirati: "ARE",
  Qatari: "QAT",
  Egyptian: "EGY",
  "South African": "ZAF",
  Nigerian: "NGA",
  Kenyan: "KEN",
  Brazilian: "BRA",
  Argentine: "ARG",
  Mexican: "MEX",
  Colombian: "COL",
  Portuguese: "PRT",
  Greek: "GRC",
  Czech: "CZE",
  Hungarian: "HUN",
};

// ---- Country name → ISO 3166-1 alpha-3 (for placeOfBirth, departureCountry) ----

export const COUNTRY_TO_ISO3: Record<string, string> = {
  Malaysia: "MYS",
  Singapore: "SGP",
  "United States": "USA",
  "United Kingdom": "GBR",
  Australia: "AUS",
  China: "CHN",
  Japan: "JPN",
  "South Korea": "KOR",
  India: "IND",
  Indonesia: "IDN",
  Thailand: "THA",
  Philippines: "PHL",
  Germany: "DEU",
  France: "FRA",
  Italy: "ITA",
  Spain: "ESP",
  Netherlands: "NLD",
  Sweden: "SWE",
  Norway: "NOR",
  Denmark: "DNK",
  Switzerland: "CHE",
  Canada: "CAN",
  "New Zealand": "NZL",
  Taiwan: "TWN",
  "Hong Kong": "HKG",
  Vietnam: "VNM",
  Cambodia: "KHM",
  Myanmar: "MMR",
  "Sri Lanka": "LKA",
  Pakistan: "PAK",
  Bangladesh: "BGD",
  Nepal: "NPL",
  Russia: "RUS",
  Ukraine: "UKR",
  Poland: "POL",
  Turkey: "TUR",
  "Saudi Arabia": "SAU",
  "United Arab Emirates": "ARE",
  Qatar: "QAT",
  Egypt: "EGY",
  "South Africa": "ZAF",
  Nigeria: "NGA",
  Kenya: "KEN",
  Brazil: "BRA",
  Argentina: "ARG",
  Mexico: "MEX",
  Colombia: "COL",
  Portugal: "PRT",
  Greece: "GRC",
  "Czech Republic": "CZE",
  Hungary: "HUN",
};

// Sortable country list for dropdowns
export const COUNTRIES = Object.keys(COUNTRY_TO_ISO3).sort();

// ---- Malaysian state → official code ----

export const STATE_TO_CODE: Record<string, string> = {
  Johor: "01",
  Kedah: "02",
  Kelantan: "03",
  "Kuala Lumpur": "04",
  Labuan: "05",
  Melaka: "06",
  "Negeri Sembilan": "07",
  Pahang: "08",
  Penang: "09",
  Perak: "10",
  Perlis: "11",
  Putrajaya: "12",
  Sabah: "13",
  Sarawak: "14",
  Selangor: "15",
  Terengganu: "16",
};

// ---- Simple code maps ----

export const TRANSPORT_TO_CODE: Record<string, string> = {
  Air: "1",
  Land: "2",
  Sea: "3",
};

export const SEX_TO_CODE: Record<string, string> = {
  Male: "1",
  Female: "2",
};

// ---- Date format conversion ----

/** Convert YYYY-MM-DD → DD/MM/YYYY (official MDAC format) */
export function toMdacDate(isoDate: string): string {
  if (!isoDate) return "";
  const [y, m, d] = isoDate.split("-");
  return `${d}/${m}/${y}`;
}

// ---- Phone code conversion ----

/** Strip "+" prefix: "+60" → "60" */
export function phoneCodeToRegion(code: string): string {
  return code.replace(/^\+/, "");
}

// ---- Main mapping function ----

export interface MdacPayload {
  name: string;
  passNo: string;
  dob: string;
  nationality: string;
  pob: string;
  sex: string;
  passExpDte: string;
  email: string;
  confirmEmail: string;
  region: string;
  mobile: string;
  arrDt: string;
  depDt: string;
  vesselNm: string;
  trvlMode: string;
  embark: string;
  accommodationStay: string;
  accommodationAddress1: string;
  accommodationAddress2: string;
  accommodationState: string;
  accommodationCity: string;
  accommodationPostcode: string;
  // Hidden mirror fields
  sNation: string;
  sRegion: string;
  sState: string;
  sCity: string;
  sStay: string;
  sMode: string;
  sEmbark: string;
  mdacVisaCountry: string;
}

/**
 * Transform our FormData into the official MDAC field names + codes.
 * cityCode must be resolved separately via AJAX.
 */
export function mapFormToMdac(data: FormData, cityCode: string): MdacPayload {
  const natCode = NATIONALITY_TO_ISO3[data.nationality] || "";
  const stateCode = STATE_TO_CODE[data.stateInMalaysia] || "";
  const transportCode = TRANSPORT_TO_CODE[data.modeOfTransport] || "";
  const embarkCode = COUNTRY_TO_ISO3[data.departureCountry] || "";
  const regionNum = phoneCodeToRegion(data.phoneCountryCode);

  return {
    name: data.fullName.toUpperCase().slice(0, 60),
    passNo: data.passportNumber.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12),
    dob: toMdacDate(data.dateOfBirth),
    nationality: natCode,
    pob: COUNTRY_TO_ISO3[data.placeOfBirth] || natCode, // fallback to nationality country
    sex: SEX_TO_CODE[data.sex] || "",
    passExpDte: toMdacDate(data.passportExpiry),
    email: data.email,
    confirmEmail: data.email,
    region: regionNum,
    mobile: data.phoneNumber.replace(/\D/g, "").slice(0, 12),
    arrDt: toMdacDate(data.arrivalDate),
    depDt: toMdacDate(data.departureDate),
    vesselNm: data.flightNumber.slice(0, 30),
    trvlMode: transportCode,
    embark: embarkCode,
    accommodationStay: "01", // default: Hotel
    accommodationAddress1: data.hotelName.slice(0, 100),
    accommodationAddress2: data.addressInMalaysia.slice(0, 100),
    accommodationState: stateCode,
    accommodationCity: cityCode,
    accommodationPostcode: data.postalCode.replace(/\D/g, "").slice(0, 5),
    // Mirror/display fields
    sNation: data.nationality,
    sRegion: regionNum,
    sState: data.stateInMalaysia,
    sCity: data.cityInMalaysia,
    sStay: "Hotel",
    sMode: data.modeOfTransport,
    sEmbark: data.departureCountry,
    mdacVisaCountry: "",
  };
}
