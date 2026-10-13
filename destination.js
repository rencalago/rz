// Destination pages (/cebu-travel-guides and friends): the shared header,
// sidebar and footer. The story list itself is plain HTML written by
// _tools/build-site.mjs, so nothing else needs to run here.
import { registerLayout } from "./layout.js";

registerLayout();
