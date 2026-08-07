/**
 * Protection path module registration.
 * Importing this file registers every path with the platform registry.
 * Only the patent path has a live readiness workflow today.
 */

import "./patent";
import "./trademark";
import "./copyright";
import "./trade-secret";
import "./unsure";

export { PATENT_PATH } from "./patent";
export { PATENT_EDUCATION_TOPICS, getPatentEducationTopic } from "./patent/education";
export {
  buildPatentProfessionalBrief,
  type PatentProfessionalBrief,
} from "./patent/handoff";
export {
  buildAiPreparationToolRecord,
  AI_PREP_TOOL_DISCLAIMER,
} from "./patent/preparationRecord";
export { TRADEMARK_PATH } from "./trademark";
export { COPYRIGHT_PATH } from "./copyright";
export { TRADE_SECRET_PATH } from "./trade-secret";
export { UNSURE_PATH } from "./unsure";
