import * as functions from "firebase-functions";
// import {getUidByEmail} from './utils/getUidByEmail';
// exports.getUidByEmail = functions.https.onCall(getUidByEmail);

// import {installMarketplaceItem, uninstallMarketplaceItem} from './marketplace';
// exports.installMarketplaceItem = functions.https.onCall(installMarketplaceItem);
// exports.uninstallMarketplaceItem = functions.https.onCall(uninstallMarketplaceItem);

import {onProfileTxCreated, setProfileTag} from './transactions';
exports.onProfileTxCreated = onProfileTxCreated;
exports.setProfileTag = functions.https.onCall(setProfileTag);

import {google2FA} from './2fa/google2FA';
exports.google2FA = functions.https.onCall(google2FA);

import {cleanupMirrorTickets, onTicketCreated, onTicketUpdated, processMirrorTickets} from './tickets';
exports.onTicketCreated = onTicketCreated;
exports.onTicketUpdated = onTicketUpdated;
exports.processMirrorTickets = processMirrorTickets;
exports.cleanupMirrorTickets = cleanupMirrorTickets;

import {backup, restore} from './companies';
exports.backupCompanyData = functions.https.onCall(backup);
exports.restoreCompanyData = functions.https.onCall(restore);

import {schedulerDay1, schedulerDay2} from './notifications';
exports.scheduledEmailsDay1 = schedulerDay1;
exports.scheduledEmailsDay2 = schedulerDay2;

// ------------------------------------------ GenKit flows ---------------------------------------
export * from "./genkit";
export * from "./onboarding";
