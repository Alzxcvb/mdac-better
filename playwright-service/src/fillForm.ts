import { Page } from "playwright";
import {
  FormData,
  STATE_TO_CODE,
  TRANSPORT_TO_CODE,
  SEX_TO_CODE,
  PASSPORT_TYPE_TO_CODE,
  COUNTRY_TO_ISO3,
  toMdacDate,
  phoneCodeToRegion,
} from "./types";

export async function fillPersonalInfo(page: Page, data: FormData): Promise<void> {
  // Full Name
  await page.fill('input[name="name"]', data.fullName.toUpperCase().slice(0, 60));

  // Passport Number
  await page.fill(
    'input[name="passNo"]',
    data.passportNumber.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12)
  );

  // Date of Birth
  await page.fill('input[name="dob"]', toMdacDate(data.dateOfBirth));

  // Nationality
  const natCode = COUNTRY_TO_ISO3[data.nationality] || "";
  if (natCode) {
    await page.selectOption('select[name="nationality"]', natCode);
  }

  // Place of Birth
  const pobCode = COUNTRY_TO_ISO3[data.placeOfBirth] || natCode;
  if (pobCode) {
    await page.selectOption('select[name="pob"]', pobCode);
  }

  // Sex
  const sexCode = SEX_TO_CODE[data.sex] || "";
  if (sexCode) {
    await page.selectOption('select[name="sex"]', sexCode);
  }

  // Passport Type
  const passportTypeCode = PASSPORT_TYPE_TO_CODE[data.passportType] || "";
  if (passportTypeCode) {
    try {
      await page.selectOption('select[name="passType"]', passportTypeCode);
    } catch {
      // Field may not exist or have a different name
    }
  }

  // Country of Passport Issuance
  const issueCode = COUNTRY_TO_ISO3[data.countryOfPassportIssuance] || "";
  if (issueCode) {
    try {
      await page.selectOption('select[name="passIssueCountry"]', issueCode);
    } catch {
      // Field may not exist
    }
  }

  // Passport Expiry
  await page.fill('input[name="passExpDte"]', toMdacDate(data.passportExpiry));
}

export async function fillContactAndTravel(page: Page, data: FormData): Promise<void> {
  // Email
  await page.fill('input[name="email"]', data.email);
  await page.fill('input[name="confirmEmail"]', data.email);

  // Phone
  const region = phoneCodeToRegion(data.phoneCountryCode);
  await page.fill('input[name="region"]', region);
  await page.fill('input[name="mobile"]', data.phoneNumber.replace(/\D/g, "").slice(0, 12));

  // Dates
  await page.fill('input[name="arrDt"]', toMdacDate(data.arrivalDate));
  await page.fill('input[name="depDt"]', toMdacDate(data.departureDate));

  // Mode of Transport
  const travelCode = TRANSPORT_TO_CODE[data.modeOfTransport] || "";
  if (travelCode) {
    await page.selectOption('select[name="trvlMode"]', travelCode);
  }

  // Flight/Vessel Number
  await page.fill('input[name="vesselNm"]', data.flightNumber.slice(0, 30));

  // Country of Departure (Embark)
  const embarkCode = COUNTRY_TO_ISO3[data.departureCountry] || "";
  if (embarkCode) {
    await page.selectOption('select[name="embark"]', embarkCode);
  }
}

export async function fillAccommodation(page: Page, data: FormData): Promise<void> {
  const stateCode = STATE_TO_CODE[data.stateInMalaysia] || "";

  // Select state
  if (stateCode) {
    await page.selectOption('select[name="accommodationState"]', stateCode);

    // Wait for city AJAX to populate
    await page.waitForFunction(
      () => {
        const sel = document.querySelector('select[name="accommodationCity"]') as HTMLSelectElement;
        return sel && sel.options.length > 1;
      },
      { timeout: 10000 }
    );

    // Select city via fuzzy match
    const cityCode = await page.evaluate((targetCity: string) => {
      const sel = document.querySelector('select[name="accommodationCity"]') as HTMLSelectElement;
      if (!sel) return "9999";

      const options = Array.from(sel.options);
      const target = targetCity.toLowerCase().trim();

      // Exact match
      const exact = options.find((o) => o.text.toLowerCase().trim() === target);
      if (exact) return exact.value;

      // Partial match
      const partial = options.find(
        (o) =>
          o.text.toLowerCase().includes(target) ||
          target.includes(o.text.toLowerCase().trim())
      );
      if (partial) return partial.value;

      // Fallback
      return "9999";
    }, data.cityInMalaysia);

    await page.selectOption('select[name="accommodationCity"]', cityCode);
  }

  // Accommodation type (default: Hotel)
  await page.selectOption('select[name="accommodationStay"]', "01");

  // Address fields
  await page.fill('input[name="accommodationAddress1"]', data.hotelName.slice(0, 100));
  await page.fill('input[name="accommodationAddress2"]', data.addressInMalaysia.slice(0, 100));
  await page.fill(
    'input[name="accommodationPostcode"]',
    data.postalCode.replace(/\D/g, "").slice(0, 5)
  );
}
