/**
 * Request status workflow.
 *
 *   Pending → Under Review → Assigned → In Progress → Resolved → Closed
 *
 * A request can also be Rejected while it is Pending or Under Review.
 * Closed and Rejected are final states — nothing can move out of them.
 *
 * The map below lists, for every status, the ONLY statuses it may move to.
 * Anything else (e.g. Pending → Closed) is an invalid jump and is rejected.
 */
const TRANSITIONS = {
  Pending: ["Under Review", "Rejected"],
  "Under Review": ["Assigned", "Rejected"],
  Assigned: ["In Progress"],
  "In Progress": ["Resolved"],
  Resolved: ["Closed"],
  Closed: [],
  Rejected: [],
};

function allowedNext(status) {
  return TRANSITIONS[status] || [];
}

function canTransition(from, to) {
  return allowedNext(from).includes(to);
}

module.exports = { TRANSITIONS, allowedNext, canTransition };
