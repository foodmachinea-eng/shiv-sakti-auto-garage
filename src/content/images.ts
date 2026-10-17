/**
 * Demo photography.
 *
 * Free photos from Unsplash (https://unsplash.com/license), loaded from the
 * Unsplash CDN. Replace them with real photos of the garage from
 * Admin → Gallery / Website content, or change the URLs below before the first
 * run. Any https image URL or an uploaded image (/media/...) works.
 */
const u = (id: string) => `https://images.unsplash.com/${id}`;

export const IMG = {
  // Hero + homepage
  hero: u("photo-1625047509168-a7026f36de04"), // black SUV in a service bay
  carService: u("photo-1625047509248-ec889cbff17f"), // mechanic inspecting a car engine
  bikeService: u("photo-1636761358757-0a616eb9e17e"), // mechanic working on a motorcycle
  autoRickshaw: u("photo-1626149637281-4e227308da18"), // yellow & black auto-rickshaw
  commercial: u("photo-1706741843463-11efe018ea1b"), // truck parked in a workshop

  // Workshop
  workshopFloor: u("photo-1727893119356-1702fe921cf9"), // mechanics working in a bright workshop
  carOnLift: u("photo-1723099971299-3789db53604c"), // car on a lift
  diagnostics: u("photo-1727893372771-b4ccae9b9f0b"), // technician with laptop in a car
  toolbox: u("photo-1637640125496-31852f042a60"), // wrenches in a tool box
  handTools: u("photo-1599256630445-67b5772b1204"), // metal hand tools
  partsShelf: u("photo-1702146713882-2579afb0bfba"), // engine parts on a shelf

  // Gallery
  exterior: u("photo-1773415356322-81d6fa7c4de9"), // building with garage doors
  carInBay: u("photo-1727893141025-35d62b3f4a03"), // car parked inside the garage
  carBeingWorked: u("photo-1727893304219-063d142ce6f3"), // car being worked on
  oilTopUp: u("photo-1487754180451-c456f719a1fc"), // refilling motor oil
  underVehicle: u("photo-1702146713858-8e7d1cc29fe8"), // mechanic working under a vehicle
  mechanicAtWork: u("photo-1643700973089-baa86a1ab9ee"), // mechanic working on a car
  engineRepair: u("photo-1615906655593-ad0386982a0f"), // mechanic working on car engine
  engineWrench: u("photo-1728474751252-9c085659f6ab"), // wrench on a car engine
  engineBay: u("photo-1632733711679-529326f6db12"), // working on a car's engine
  tyreWork: u("photo-1645445522156-9ac06bc7a767"), // mechanic working on a tyre
  tyreStack: u("photo-1675034743372-672c3c3f8377"), // workshop with tyres
  wheelWrench: u("photo-1702146713922-613313be011d"), // tyre with a wrench
  carWash: u("photo-1633014041037-f5446fb4ce99"), // car covered in foam at a car wash
  carWax: u("photo-1632823469850-2f77dd9c7f93"), // waxing the hood of a car
  bikeWrench: u("photo-1636761358954-cebc0e5dfebb"), // motorcycle repair with a wrench
  bikeGarage: u("photo-1636761358783-209512dccd98"), // working on a motorcycle in a garage
  bikeDetail: u("photo-1650569663338-f6921d483868"), // person working on a motorcycle
  carHandover: u("photo-1625047509252-ab38fb5c7343"), // customer beside a black car
} as const;

/** Build an Unsplash CDN URL at a given width (other URLs are returned unchanged). */
export function sizedImage(url: string, width: number, quality = 72): string {
  if (!url.startsWith("https://images.unsplash.com/")) return url;
  const base = url.split("?")[0];
  return `${base}?auto=format&fit=crop&w=${width}&q=${quality}`;
}
