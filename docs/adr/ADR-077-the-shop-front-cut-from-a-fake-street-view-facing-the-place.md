# ADR-077 — The shop front cut from a fake street view, facing the place

**Date**: 2026-11-27
**Status**: proposed

## Context

Step 19 of the rebuild plan (#46, #121) brings back the shop front and the street view of a place. In the former app, a thumbnail of the front of the place sat on the map above its sheet; touching it showed the whole 360° picture of the street, opened facing the place. The picture came from Panoramax, chosen 4 to 18 m from the place, and the app kept the position and the heading of its camera. The app is sealed ([ADR-059](ADR-059-rebuilding-the-former-app-frame.md)): no picture service is called. The product owner chose, on 2026-11-27, fake pictures made by the session, the credit of a sample image alone, no « Panoramax » label and no link to it (#91, #121).

## Decision

- **The shop front and the street view are one image.** The thumbnail is cut from the 360° picture where the place stands; the viewer shows the whole picture, scrolled to face the place. No library: an `<img>` in a zone that scrolls sideways, as the former app did, with no pinch and no zoom.
- **The picture is named by the OpenStreetMap key `panoramax`**, as [ADR-043](ADR-043-standards-first-and-their-libraries-in-the-domain.md) asks: the key OpenStreetMap documents for a Panoramax picture of a place, in the details file of the places ([ADR-075](ADR-075-the-places-file-split-from-the-details-of-the-places.md)).
- **A picture is a STAC item**, the shape the Panoramax service gives: a GeoJSON point for the camera, its heading in the property `view:azimuth`, the image in the asset `hd`. A fake item is prerendered for each picture at `data/panoramax/<id>.json`, as the stations are ([ADR-066](ADR-066-the-passages-and-exits-of-a-station-after-siri-and-openstreetmap.md)), and read by the `prerendered` adapter of the port `LoadPicture` only when a sheet with a street view opens.
- **The domain works out where the place stands in the picture**: the bearing from the camera to the place, less the heading of the camera, as a share of the width of the picture, whose middle is the heading. A neighbour that shares the picture is faced again.
- **The fake images are SVG files prerendered by the site, one per family and shade**, at `street-views/<family>-<shade>.svg`, as the photos are ([ADR-076](ADR-076-fake-photos-prerendered-and-shown-in-a-strip-and-a-full-screen-viewer.md)): a street of flat colours, twice as wide as high, with the front of the place in the middle, in the colour of its family and with its pictogram. The fake camera stands 4 to 18 m from the place, on any side, and heads to it, so that the view opens on that front.
- **One eligible place in three gets a street view**, at random with a seed of its own, and 11 famous places by hand, in `landmark-street-views.json`. A place is eligible as in the former app: not a car park, a cash machine, a charging station, toilets, drinking water, a cemetery, a monument or a station, and inside the box `2.224,48.815,2.47,48.902`.
- **The thumbnail sits above the © notice** ([ADR-032](ADR-032-the-home-screen-layout-a-native-dialog-and-a-welcome-kept-on-the-device.md)), in the corner of the map that follows the sheet, and hides once the sheet reaches 60 % of the screen. That corner of the map is stacked at `z-index: 3`, after the marker of the opened place, which has the same value and comes earlier in the page: the thumbnail and the round buttons stay above it. It is a value of its own, not a step of a shared scale: there is none yet (#118).
- **The viewer takes the place of the photo viewer in the closing order**, as in the former app: one viewer at a time. Its frame (black background, close button, top line, credit) and the swipe down that closes it are shared with the photo viewer, in `viewer-frame.css` and `swipe-down.ts`.

## Consequences

- The details file grows from 52.1 to 55.0 of its 70 kB, for 630 pictures named by the id of their place; the places file read at start does not change.
- The build writes 168 more images, and one small file per picture, fetched only when a sheet with a street view opens.
- Real pictures, when a source exists, replace the fake items and images; the credit, the year, the licence and the link to Panoramax come back with them.
- Directions and guidance (lots I and J) will hide the thumbnail too; the rule that hides it is in `thumb-shown.ts`.

## Alternatives considered

- **One image per place**: the front could differ from place to place, but 630 files for what a family and a shade already show; set aside as ADR-076 set aside one photo per kind.
- **A 360° viewer library** (Photo Sphere Viewer, Pannellum): a sphere with tilt and zoom the former app never had, and one more weight in the 200 kB of the app.
- **The angle stored with the place**: lighter, but not a standard, and real pictures give a camera, not an angle.
- **One file for every picture**: one fetch per visit, but a budget of its own and the pictures of places never opened.
